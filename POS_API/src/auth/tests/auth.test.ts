import assert from 'node:assert/strict';
import { test } from 'node:test';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { setupDevelopmentDocs } from '../../swagger-docs';

test('PB-02 login rejects a missing Origin before reading credentials', { timeout: 60_000 }, async () => {
  const app = await NestFactory.create(AppModule, { logger: false });
  try {
    await app.listen(0, '127.0.0.1');
    const address = app.getHttpServer().address();
    const response = await fetch(`http://127.0.0.1:${address.port}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'someone', password: 'anything' }),
      signal: AbortSignal.timeout(5000),
    });
    assert.equal(response.status, 403);
    assert.equal((await response.json()).error.code, 'CSRF_INVALID');
    process.env.PUBLIC_ORIGIN = 'http://localhost:5173';
    const loginUrl = `http://127.0.0.1:${address.port}/api/v1/auth/login`;
    for (const body of [{ username: 'admin' }, { username: ' ', password: 'x' },
      { username: 'admin', password: 1 }, { username: 'admin', password: 'x', extra: true }]) {
      const invalid: Response = await fetch(loginUrl, { method: 'POST',
        headers: { Origin: process.env.PUBLIC_ORIGIN, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      assert.equal(invalid.status, 422);
      const error = (await invalid.json()).error;
      assert.equal(error.code, 'VALIDATION_ERROR');
      assert.ok(error.details.length > 0);
    }
    const unreadable = await fetch(loginUrl, { method: 'POST',
      headers: { Origin: process.env.PUBLIC_ORIGIN, 'Content-Type': 'text/plain' }, body: 'invalid' });
    assert.equal(unreadable.status, 400);
    const invalidChange = await fetch(`http://127.0.0.1:${address.port}/api/v1/auth/change-password`, {
      method: 'POST', headers: { Origin: process.env.PUBLIC_ORIGIN, 'Content-Type': 'application/json' },
      body: JSON.stringify({ newPassword: 'short' }),
    });
    assert.equal(invalidChange.status, 422);
    assert.equal((await invalidChange.json()).error.code, 'VALIDATION_ERROR');
    const malformedCookie = await fetch(`http://127.0.0.1:${address.port}/api/v1/auth/me`, {
      headers: { Cookie: '__Host-pos_access=j:%7B%7D' },
    });
    assert.equal(malformedCookie.status, 401);
  } finally {
    await app.close();
  }
});

test('PB-02 Swagger schemas are available only in development', async () => {
  const prior = process.env.NODE_ENV;
  const app = await NestFactory.create(AppModule, { logger: false });
  try {
    process.env.NODE_ENV = 'development';
    setupDevelopmentDocs(app);
    await app.listen(0, '127.0.0.1');
    const address = app.getHttpServer().address();
    const base = `http://127.0.0.1:${address.port}`;
    assert.equal((await fetch(`${base}/api/docs`)).status, 200);
    const openapi = await fetch(`${base}/api/docs-json`);
    assert.equal(openapi.status, 200);
    const document = await openapi.json();
    assert.ok(document.paths['/api/v1/auth/login'].post.requestBody);
    assert.ok(document.paths['/api/v1/auth/login'].post.responses['200']);
    assert.ok(document.paths['/api/v1/auth/change-password'].post.requestBody);
    assert.ok(document.paths['/api/v1/auth/logout'].post.responses['204']);
    assert.ok(document.paths['/api/v1/auth/me'].get.responses['200']);
    assert.ok(document.paths['/api/v1/auth/csrf'].get.responses['200']);
    assert.ok(document.paths['/api/v1/auth/refresh'].post.responses['200']);
    assert.ok(document.components.schemas.LoginRequestDto);
    assert.ok(document.components.schemas.ChangePasswordRequestDto);
    assert.ok(document.components.schemas.UserSummaryDto);
    assert.ok(document.components.schemas.ErrorResponseDto);
  } finally {
    await app.close();
    if (prior === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = prior;
  }
  const production = await NestFactory.create(AppModule, { logger: false });
  try {
    process.env.NODE_ENV = 'production';
    setupDevelopmentDocs(production);
    await production.listen(0, '127.0.0.1');
    const address = production.getHttpServer().address();
    assert.equal((await fetch(`http://127.0.0.1:${address.port}/api/docs-json`)).status, 404);
  } finally {
    await production.close();
    if (prior === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = prior;
  }
});
