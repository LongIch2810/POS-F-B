import assert from 'node:assert/strict';
import { createHash, randomBytes } from 'node:crypto';
import { test } from 'node:test';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { Test } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { AppModule } from '../../app.module';
import { assertSchemaCurrent } from '../auth-config';
import { AuthService } from '../auth.service';
import { dataSource } from '../../data-source';
import { Foundation20261028000000 } from '../../migrations/20261028000000-Foundation';

test('PB-02 login creates a hashed refresh session and cookie-only tokens', { timeout: 60_000 }, async () => {
  const name = `pos_pb02_test_${randomBytes(6).toString('hex')}`;
  const url = new URL(process.env.DATABASE_URL!);
  const testUrl = new URL(url);
  testUrl.pathname = `/${name}`;
  const db = new DataSource({
    type: 'postgres',
    url: testUrl.toString(),
    entities: dataSource.options.entities,
    migrations: dataSource.options.migrations,
  });
  process.env.PUBLIC_ORIGIN = 'http://localhost:5173';
  process.env.JWT_SECRET = 'j'.repeat(32);
  process.env.CSRF_SECRET = 'c'.repeat(32);
  await dataSource.initialize();
  let created = false;
  try {
    await dataSource.query(`CREATE DATABASE "${name}"`);
    created = true;
    const foundationDb = new DataSource({ type: 'postgres', url: testUrl.toString(), migrations: [Foundation20261028000000] });
    await foundationDb.initialize();
    try { await foundationDb.runMigrations(); } finally { await foundationDb.destroy(); }
    await db.initialize();
    await assert.rejects(assertSchemaCurrent(db), /pending migrations/);
    await db.runMigrations();
    await assert.doesNotReject(assertSchemaCurrent(db));
    await db.query(`INSERT INTO roles (id, name) VALUES (gen_random_uuid(), 'PLATFORM_ADMIN')`);
    const passwordHash = await bcrypt.hash('temporary-password-12', 12);
    await db.query(`INSERT INTO users (id, role_id, full_name, username, password_hash, must_change_password)
      SELECT gen_random_uuid(), id, 'Quản trị', 'admin', $1, true FROM roles WHERE name = 'PLATFORM_ADMIN'`, [passwordHash]);
    const module = await Test.createTestingModule({ imports: [AppModule] }).overrideProvider(DataSource).useValue(db).compile();
    const app = module.createNestApplication();
    try {
      await app.listen(0, '127.0.0.1');
      const port = app.getHttpServer().address().port;
      const raceOldHash = await bcrypt.hash('race-old-password-123', 12);
      await db.query(`INSERT INTO users (id, role_id, full_name, username, password_hash)
        SELECT gen_random_uuid(), id, 'Race', 'raceuser', $1 FROM roles WHERE name = 'PLATFORM_ADMIN'`, [raceOldHash]);
      const raceLock = db.createQueryRunner();
      await raceLock.connect();
      await raceLock.startTransaction();
      try {
        await raceLock.query("SELECT id FROM users WHERE username = 'raceuser' FOR UPDATE");
        const oldPasswordLogin = app.get(AuthService).login('raceuser', 'race-old-password-123', 'race-ip');
        let waiting = false;
        for (let attempt = 0; attempt < 100; attempt++) {
          const rows = await db.query(`SELECT 1 FROM pg_stat_activity WHERE datname = current_database()
            AND wait_event_type = 'Lock' AND query LIKE '%users%'`);
          if (rows.length) { waiting = true; break; }
          await new Promise((resolve) => setTimeout(resolve, 20));
        }
        assert.equal(waiting, true, 'login must wait for the current user row');
        await raceLock.query("UPDATE users SET password_hash = $1 WHERE username = 'raceuser'", [await bcrypt.hash('race-new-password-123', 12)]);
        await raceLock.commitTransaction();
        await assert.rejects(oldPasswordLogin, (error: any) => error.getStatus() === 401);
      } finally {
        if (raceLock.isTransactionActive) await raceLock.rollbackTransaction();
        await raceLock.release();
      }
      const response = await fetch(`http://127.0.0.1:${port}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Origin: process.env.PUBLIC_ORIGIN },
        body: JSON.stringify({ username: ' ADMIN ', password: 'temporary-password-12' }),
      });
      assert.equal(response.status, 200);
      const body = await response.json();
      assert.equal(body.data.user.username, 'admin');
      assert.equal(body.data.user.mustChangePassword, true);
      assert.equal('accessToken' in body.data, false);
      const cookies = response.headers.getSetCookie();
      assert.equal(cookies.length, 3);
      assert.ok(cookies.every((cookie) => cookie.includes('Secure') && cookie.includes('SameSite=Strict')));
      assert.equal((await db.query('SELECT count(*)::int AS count FROM refresh_tokens'))[0].count, 1);
      assert.match((await db.query('SELECT token_hash FROM refresh_tokens'))[0].token_hash, /^[a-f0-9]{64}$/);
      await db.query(`INSERT INTO users (id, role_id, full_name, username, password_hash)
        SELECT gen_random_uuid(), id, 'Legacy', E'\\tlegacy', $1 FROM roles WHERE name = 'PLATFORM_ADMIN'`, [passwordHash]);
      const legacyLogin = await fetch(`http://127.0.0.1:${port}/api/v1/auth/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Origin: process.env.PUBLIC_ORIGIN! },
        body: JSON.stringify({ username: '\tlegacy', password: 'temporary-password-12' }),
      });
      assert.equal(legacyLogin.status, 200);
      assert.equal((await legacyLogin.json()).data.user.username, '\tlegacy');
      await db.query(`INSERT INTO users (id, role_id, full_name, username, password_hash)
        SELECT gen_random_uuid(), id, 'Tab only', E'\\t', $1 FROM roles WHERE name = 'PLATFORM_ADMIN'`, [passwordHash]);
      const tabLogin = await fetch(`http://127.0.0.1:${port}/api/v1/auth/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Origin: process.env.PUBLIC_ORIGIN! },
        body: JSON.stringify({ username: '\t', password: 'temporary-password-12' }),
      });
      assert.equal(tabLogin.status, 200);
      assert.equal((await tabLogin.json()).data.user.username, '\t');
      const cookieHeader = cookies.map((cookie) => cookie.split(';')[0]).join('; ');
      const firstAccess = cookies.find((cookie) => cookie.startsWith('__Host-pos_access='))!.split(';')[0].split('=')[1];
      await assert.rejects(app.get(AuthService).authorizeAccess(firstAccess, 'platform.store.create'),
        (error: any) => error.getResponse().code === 'PASSWORD_CHANGE_REQUIRED');
      const me = await fetch(`http://127.0.0.1:${port}/api/v1/auth/me`, { headers: { Cookie: cookieHeader } });
      assert.equal(me.status, 200);
      assert.equal((await me.json()).data.user.username, 'admin');
      await db.query("UPDATE users SET is_active = false WHERE username = 'admin'");
      const disabled = await fetch(`http://127.0.0.1:${port}/api/v1/auth/me`, { headers: { Cookie: cookieHeader } });
      assert.equal(disabled.status, 403);
      assert.equal((await disabled.json()).error.code, 'ACCOUNT_DISABLED');
      await db.query("UPDATE users SET is_active = true WHERE username = 'admin'");
      const [{ id: storeId }] = await db.query("INSERT INTO stores (id, name) VALUES (gen_random_uuid(), 'Test Store') RETURNING id");
      await db.query("INSERT INTO roles (id, name) VALUES (gen_random_uuid(), 'OWNER')");
      const ownerHash = await bcrypt.hash('owner-password-123', 12);
      await db.query(`INSERT INTO users (id, role_id, store_id, full_name, username, password_hash)
        SELECT gen_random_uuid(), id, $1, 'Chủ cửa hàng', 'owner', $2 FROM roles WHERE name = 'OWNER'`, [storeId, ownerHash]);
      const ownerLogin = await fetch(`http://127.0.0.1:${port}/api/v1/auth/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Origin: process.env.PUBLIC_ORIGIN! },
        body: JSON.stringify({ username: 'owner', password: 'owner-password-123' }),
      });
      assert.equal(ownerLogin.status, 200);
      const ownerHeader = ownerLogin.headers.getSetCookie().map((cookie) => cookie.split(';')[0]).join('; ');
      await db.query("UPDATE stores SET status = 'SUSPENDED' WHERE id = $1", [storeId]);
      const suspended = await fetch(`http://127.0.0.1:${port}/api/v1/auth/me`, { headers: { Cookie: ownerHeader } });
      assert.equal(suspended.status, 403);
      assert.equal((await suspended.json()).error.code, 'STORE_SUSPENDED');
      await assert.rejects(app.get(AuthService).login('owner', 'owner-password-123', 'owner-ip'),
        (error: any) => error.getResponse().code === 'UNAUTHENTICATED');
      await db.query("UPDATE stores SET status = 'ACTIVE' WHERE id = $1", [storeId]);
      const malformedAccess = jwt.sign({ sid: '-'.repeat(36), role: 'PLATFORM_ADMIN', storeId: null, branchId: null }, process.env.JWT_SECRET!, {
        algorithm: 'HS256', expiresIn: 1800, subject: body.data.user.id,
      });
      const malformedMe = await fetch(`http://127.0.0.1:${port}/api/v1/auth/me`, {
        headers: { Cookie: `__Host-pos_access=${malformedAccess}` },
      });
      assert.equal(malformedMe.status, 401);
      const csrf = cookies.find((cookie) => cookie.startsWith('__Host-pos_csrf='))!.split(';')[0].split('=')[1];
      const csrfResponse = await fetch(`http://127.0.0.1:${port}/api/v1/auth/csrf`, { headers: { Cookie: cookieHeader } });
      assert.equal(csrfResponse.status, 200);
      assert.equal(csrfResponse.headers.getSetCookie().length, 1);
      const unexpectedRefreshBody = await fetch(`http://127.0.0.1:${port}/api/v1/auth/refresh`, {
        method: 'POST', headers: { Cookie: cookieHeader, Origin: process.env.PUBLIC_ORIGIN!, 'X-CSRF-Token': csrf, 'Content-Type': 'application/json' },
        body: JSON.stringify({ unused: true }),
      });
      assert.equal(unexpectedRefreshBody.status, 422);
      const plainRefreshBody = await fetch(`http://127.0.0.1:${port}/api/v1/auth/refresh`, {
        method: 'POST', headers: { Cookie: cookieHeader, Origin: process.env.PUBLIC_ORIGIN!, 'X-CSRF-Token': csrf, 'Content-Type': 'text/plain' },
        body: 'unexpected',
      });
      assert.equal(plainRefreshBody.status, 422);
      const refreshed = await fetch(`http://127.0.0.1:${port}/api/v1/auth/refresh`, {
        method: 'POST', headers: { Cookie: cookieHeader, Origin: process.env.PUBLIC_ORIGIN!, 'X-CSRF-Token': csrf },
      });
      assert.equal(refreshed.status, 200);
      assert.equal(refreshed.headers.getSetCookie().length, 2);
      const oldRows = await db.query('SELECT revoked_at, replaced_at FROM refresh_tokens ORDER BY created_at LIMIT 1');
      assert.ok(oldRows[0].revoked_at && oldRows[0].replaced_at);
      const liveSessionLogout = await fetch(`http://127.0.0.1:${port}/api/v1/auth/logout`, {
        method: 'POST', headers: { Cookie: cookieHeader, Origin: process.env.PUBLIC_ORIGIN! },
      });
      assert.equal(liveSessionLogout.status, 403);
      assert.equal((await liveSessionLogout.json()).error.code, 'CSRF_INVALID');
      const replay = await fetch(`http://127.0.0.1:${port}/api/v1/auth/refresh`, {
        method: 'POST', headers: { Cookie: cookieHeader, Origin: process.env.PUBLIC_ORIGIN!, 'X-CSRF-Token': csrf },
      });
      assert.equal(replay.status, 401);
      assert.equal(replay.headers.getSetCookie().length, 3);
      const deadSessionLogout = await fetch(`http://127.0.0.1:${port}/api/v1/auth/logout`, {
        method: 'POST', headers: { Cookie: cookieHeader, Origin: process.env.PUBLIC_ORIGIN! },
      });
      assert.equal(deadSessionLogout.status, 204);
      assert.equal(deadSessionLogout.headers.getSetCookie().length, 3);
      const revokedMe = await fetch(`http://127.0.0.1:${port}/api/v1/auth/me`, { headers: { Cookie: cookieHeader } });
      assert.equal(revokedMe.status, 401);
      const logout = await fetch(`http://127.0.0.1:${port}/api/v1/auth/logout`, {
        method: 'POST', headers: { Origin: process.env.PUBLIC_ORIGIN! },
      });
      assert.equal(logout.status, 204);
      assert.equal(logout.headers.getSetCookie().length, 3);
      const concurrentLogin = await fetch(`http://127.0.0.1:${port}/api/v1/auth/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Origin: process.env.PUBLIC_ORIGIN! },
        body: JSON.stringify({ username: 'admin', password: 'temporary-password-12' }),
      });
      const concurrentCookies = concurrentLogin.headers.getSetCookie();
      const concurrentCookieHeader = concurrentCookies.map((cookie) => cookie.split(';')[0]).join('; ');
      const concurrentCsrf = concurrentCookies.find((cookie) => cookie.startsWith('__Host-pos_csrf='))!.split(';')[0].split('=')[1];
      const refreshHeaders = { Cookie: concurrentCookieHeader, Origin: process.env.PUBLIC_ORIGIN!, 'X-CSRF-Token': concurrentCsrf };
      const concurrent = await Promise.all([0, 1].map(() => fetch(`http://127.0.0.1:${port}/api/v1/auth/refresh`, {
        method: 'POST', headers: refreshHeaders,
      })));
      assert.deepEqual(concurrent.map((item) => item.status).sort(), [200, 401]);
      assert.equal((await db.query(`SELECT count(*)::int AS count FROM refresh_tokens
        WHERE session_id = (SELECT session_id FROM refresh_tokens WHERE token_hash = $1) AND revoked_at IS NULL`,
      [createHash('sha256').update(concurrentCookies.find((cookie) => cookie.startsWith('__Host-pos_refresh='))!.split(';')[0].split('=')[1]).digest('hex')]))[0].count, 0);
      const logoutLogin = await fetch(`http://127.0.0.1:${port}/api/v1/auth/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Origin: process.env.PUBLIC_ORIGIN! },
        body: JSON.stringify({ username: 'admin', password: 'temporary-password-12' }),
      });
      const logoutCookies = logoutLogin.headers.getSetCookie();
      const logoutCookieHeader = logoutCookies.map((cookie) => cookie.split(';')[0]).join('; ');
      const logoutCsrf = logoutCookies.find((cookie) => cookie.startsWith('__Host-pos_csrf='))!.split(';')[0].split('=')[1];
      const validLogout = await fetch(`http://127.0.0.1:${port}/api/v1/auth/logout`, {
        method: 'POST', headers: { Cookie: logoutCookieHeader, Origin: process.env.PUBLIC_ORIGIN!, 'X-CSRF-Token': logoutCsrf },
      });
      assert.equal(validLogout.status, 204);
      assert.equal((await fetch(`http://127.0.0.1:${port}/api/v1/auth/me`, { headers: { Cookie: logoutCookieHeader } })).status, 401);
      const raceLogin = await fetch(`http://127.0.0.1:${port}/api/v1/auth/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Origin: process.env.PUBLIC_ORIGIN! },
        body: JSON.stringify({ username: 'admin', password: 'temporary-password-12' }),
      });
      const raceCookies = raceLogin.headers.getSetCookie();
      const raceCookieHeader = raceCookies.map((cookie) => cookie.split(';')[0]).join('; ');
      const raceCsrf = raceCookies.find((cookie) => cookie.startsWith('__Host-pos_csrf='))!.split(';')[0].split('=')[1];
      const firstRaceRefresh = await fetch(`http://127.0.0.1:${port}/api/v1/auth/refresh`, {
        method: 'POST', headers: { Cookie: raceCookieHeader, Origin: process.env.PUBLIC_ORIGIN!, 'X-CSRF-Token': raceCsrf },
      });
      assert.equal(firstRaceRefresh.status, 200);
      const raceNextCookies = firstRaceRefresh.headers.getSetCookie();
      const raceNextHeader = [
        ...raceNextCookies.map((cookie) => cookie.split(';')[0]),
        raceCookies.find((cookie) => cookie.startsWith('__Host-pos_csrf='))!.split(';')[0],
      ].join('; ');
      const [nextRefresh, oldLogout] = await Promise.all([
        fetch(`http://127.0.0.1:${port}/api/v1/auth/refresh`, {
          method: 'POST', headers: { Cookie: raceNextHeader, Origin: process.env.PUBLIC_ORIGIN!, 'X-CSRF-Token': raceCsrf },
        }),
        fetch(`http://127.0.0.1:${port}/api/v1/auth/logout`, {
          method: 'POST', headers: { Cookie: raceCookieHeader, Origin: process.env.PUBLIC_ORIGIN!, 'X-CSRF-Token': raceCsrf },
        }),
      ]);
      assert.ok([200, 401].includes(nextRefresh.status));
      assert.equal(oldLogout.status, 204);
      const raceHash = createHash('sha256').update(raceCookies.find((cookie) => cookie.startsWith('__Host-pos_refresh='))!.split(';')[0].split('=')[1]).digest('hex');
      assert.equal((await db.query(`SELECT count(*)::int AS count FROM refresh_tokens WHERE revoked_at IS NULL
        AND session_id = (SELECT session_id FROM refresh_tokens WHERE token_hash = $1)`, [raceHash]))[0].count, 0);
      const secondLogin = await fetch(`http://127.0.0.1:${port}/api/v1/auth/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Origin: process.env.PUBLIC_ORIGIN! },
        body: JSON.stringify({ username: 'admin', password: 'temporary-password-12' }),
      });
      const secondCookies = secondLogin.headers.getSetCookie();
      const secondCookieHeader = secondCookies.map((cookie) => cookie.split(';')[0]).join('; ');
      const secondCsrf = secondCookies.find((cookie) => cookie.startsWith('__Host-pos_csrf='))!.split(';')[0].split('=')[1];
      const badCsrf = await fetch(`http://127.0.0.1:${port}/api/v1/auth/change-password`, {
        method: 'POST', headers: { Cookie: secondCookieHeader, Origin: process.env.PUBLIC_ORIGIN!, 'X-CSRF-Token': 'wrong', 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword: 'new-password-12345' }),
      });
      assert.equal(badCsrf.status, 403);
      const changed = await fetch(`http://127.0.0.1:${port}/api/v1/auth/change-password`, {
        method: 'POST', headers: { Cookie: secondCookieHeader, Origin: process.env.PUBLIC_ORIGIN!, 'X-CSRF-Token': secondCsrf, 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword: 'new-password-12345' }),
      });
      assert.equal(changed.status, 204);
      const userAfter = (await db.query('SELECT password_hash, must_change_password FROM users WHERE username = $1', ['admin']))[0];
      assert.equal(userAfter.must_change_password, false);
      assert.equal(await bcrypt.compare('new-password-12345', userAfter.password_hash), true);
      const revokedAfterChange = await fetch(`http://127.0.0.1:${port}/api/v1/auth/me`, { headers: { Cookie: secondCookieHeader } });
      assert.equal(revokedAfterChange.status, 401);
      const thirdLogin = await fetch(`http://127.0.0.1:${port}/api/v1/auth/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Origin: process.env.PUBLIC_ORIGIN! },
        body: JSON.stringify({ username: 'admin', password: 'new-password-12345' }),
      });
      assert.equal(thirdLogin.status, 200);
      const thirdCookies = thirdLogin.headers.getSetCookie();
      const thirdCookieHeader = thirdCookies.map((cookie) => cookie.split(';')[0]).join('; ');
      const thirdCsrf = thirdCookies.find((cookie) => cookie.startsWith('__Host-pos_csrf='))!.split(';')[0].split('=')[1];
      const access = thirdCookies.find((cookie) => cookie.startsWith('__Host-pos_access='))!.split(';')[0].split('=')[1];
      const auth = app.get(AuthService);
      const racePasswordLogin = await fetch(`http://127.0.0.1:${port}/api/v1/auth/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Origin: process.env.PUBLIC_ORIGIN! },
        body: JSON.stringify({ username: 'admin', password: 'new-password-12345' }),
      });
      const racePasswordCookies = racePasswordLogin.headers.getSetCookie();
      const racePasswordHeader = racePasswordCookies.map((cookie) => cookie.split(';')[0]).join('; ');
      const racePasswordCsrf = racePasswordCookies.find((cookie) => cookie.startsWith('__Host-pos_csrf='))!.split(';')[0].split('=')[1];
      const racePasswordAccess = racePasswordCookies.find((cookie) => cookie.startsWith('__Host-pos_access='))!.split(';')[0].split('=')[1];
      const raceSessionId = (jwt.verify(racePasswordAccess, process.env.JWT_SECRET!) as jwt.JwtPayload).sid;
      const lock = db.createQueryRunner();
      await lock.connect();
      await lock.startTransaction();
      try {
        await lock.query("SELECT id FROM users WHERE username = 'admin' FOR UPDATE");
        const pendingChange = fetch(`http://127.0.0.1:${port}/api/v1/auth/change-password`, {
          method: 'POST', headers: { Cookie: racePasswordHeader, Origin: process.env.PUBLIC_ORIGIN!, 'X-CSRF-Token': racePasswordCsrf, 'Content-Type': 'application/json' },
          body: JSON.stringify({ newPassword: 'race-password-12345', currentPassword: 'new-password-12345' }),
        });
        let waiting = false;
        for (let attempt = 0; attempt < 100; attempt++) {
          const rows = await db.query(`SELECT 1 FROM pg_stat_activity WHERE datname = current_database()
            AND wait_event_type = 'Lock' AND (query LIKE '%SELECT u.password_hash%' OR query LIKE '%users%')`);
          if (rows.length) { waiting = true; break; }
          await new Promise((resolve) => setTimeout(resolve, 20));
        }
        assert.equal(waiting, true, 'change-password must wait on the user lock');
        await lock.query('UPDATE refresh_tokens SET revoked_at = now() WHERE session_id = $1 AND revoked_at IS NULL', [raceSessionId]);
        await lock.commitTransaction();
        assert.equal((await pendingChange).status, 401);
        assert.equal(await bcrypt.compare('new-password-12345', (await db.query("SELECT password_hash FROM users WHERE username = 'admin'"))[0].password_hash), true);
      } finally {
        if (lock.isTransactionActive) await lock.rollbackTransaction();
        await lock.release();
      }
      await assert.rejects(auth.authorizeAccess(access, 'platform.store.create'), (error: any) => error.getResponse().code === 'PERMISSION_DENIED');
      await db.query("INSERT INTO permissions (id, code) VALUES (gen_random_uuid(), 'platform.store.create')");
      await db.query(`INSERT INTO role_permissions (role_id, permission_id)
        SELECT r.id, p.id FROM roles r, permissions p WHERE r.name = 'PLATFORM_ADMIN' AND p.code = 'platform.store.create'`);
      assert.equal((await auth.authorizeAccess(access, 'platform.store.create')).username, 'admin');
      const wrongCurrent = await fetch(`http://127.0.0.1:${port}/api/v1/auth/change-password`, {
        method: 'POST', headers: { Cookie: thirdCookieHeader, Origin: process.env.PUBLIC_ORIGIN!, 'X-CSRF-Token': thirdCsrf, 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword: 'another-password-123', currentPassword: 'wrong-password' }),
      });
      assert.equal(wrongCurrent.status, 401);
      assert.equal((await wrongCurrent.json()).error.code, 'CURRENT_PASSWORD_INVALID');
      assert.equal((await fetch(`http://127.0.0.1:${port}/api/v1/auth/me`, { headers: { Cookie: thirdCookieHeader } })).status, 200);
      const missingUser = await fetch(`http://127.0.0.1:${port}/api/v1/auth/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Origin: process.env.PUBLIC_ORIGIN! },
        body: JSON.stringify({ username: 'unknown', password: 'wrong-password' }),
      });
      assert.equal(missingUser.status, 401);
      for (let attempt = 0; attempt < 4; attempt++) {
        const failed: Response = await fetch(`http://127.0.0.1:${port}/api/v1/auth/login`, {
          method: 'POST', headers: { 'Content-Type': 'application/json', Origin: process.env.PUBLIC_ORIGIN! },
          body: JSON.stringify({ username: 'admin', password: 'wrong-password' }),
        });
        assert.equal(failed.status, 401);
      }
      const limited = await fetch(`http://127.0.0.1:${port}/api/v1/auth/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Origin: process.env.PUBLIC_ORIGIN! },
        body: JSON.stringify({ username: 'admin', password: 'new-password-12345' }),
      });
      assert.equal(limited.status, 429);
      assert.ok(Number(limited.headers.get('Retry-After')) > 0);
      await assert.rejects(auth.login('admin', 'wrong-password', 'other-ip'), (error: any) => error.getStatus() === 401);
      await assert.rejects(auth.login('admin', 'new-password-12345', 'third-ip'), (error: any) => error.getStatus() === 429);
      for (let attempt = 0; attempt < 24; attempt++) {
        const invalidRefresh: Response = await fetch(`http://127.0.0.1:${port}/api/v1/auth/refresh`, {
          method: 'POST', headers: { Origin: process.env.PUBLIC_ORIGIN! },
        });
        assert.equal(invalidRefresh.status, 401);
      }
      const limitedRefresh = await fetch(`http://127.0.0.1:${port}/api/v1/auth/refresh`, {
        method: 'POST', headers: { Origin: process.env.PUBLIC_ORIGIN! },
      });
      assert.equal(limitedRefresh.status, 429);
    } finally {
      await app.close();
    }
  } finally {
    if (db.isInitialized) await db.destroy();
    if (created) await dataSource.query(`DROP DATABASE "${name}" WITH (FORCE)`);
    await dataSource.destroy();
  }
});
