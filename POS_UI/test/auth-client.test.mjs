import { test, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { login, restoreSession, changePassword } from '../src/auth/client.ts';

afterEach(() => { delete globalThis.document; delete globalThis.navigator; });
test('BR-03: proxy errors without JSON show a Vietnamese error', async () => {
  globalThis.fetch = async () => new Response('', { status: 500 });
  await assert.rejects(restoreSession(), error => error.code === 'UNKNOWN' && error.message === 'Có lỗi xảy ra. Vui lòng thử lại.');
});
test('locked account and suspended store errors stop session restore without refresh', async () => {
  for (const code of ['ACCOUNT_DISABLED', 'STORE_SUSPENDED']) {
    let calls = 0;
    globalThis.fetch = async () => { calls++; return Response.json({ error: { code, message: 'Phiên không còn hiệu lực.' } }, { status: 403 }); };
    await assert.rejects(restoreSession(), error => error.code === code);
    assert.equal(calls, 1);
  }
});
test('login sends credentials to same-origin API without bearer', async () => {
  let request;
  globalThis.fetch = async (url, options) => { request = { url, ...options }; return Response.json({ data: { user: { fullName: 'An' } } }); };
  assert.equal((await login('an', 'secret')).fullName, 'An');
  assert.equal(request.url, '/api/v1/auth/login');
  assert.deepEqual(JSON.parse(request.body), { username: 'an', password: 'secret' });
  assert.equal(request.headers.Authorization, undefined);
});
test('expired access restores csrf and refreshes before fetching identity', async () => {
  globalThis.document = { cookie: '' };
  Object.defineProperty(globalThis, 'navigator', { configurable: true, value: { locks: { request: async (_name, fn) => fn() } } });
  const calls = [];
  globalThis.fetch = async (url, options = {}) => {
    calls.push(url);
    if (url.endsWith('/me') && calls.filter(x => x === url).length <= 2) return Response.json({ error: { code: 'TOKEN_EXPIRED' } }, { status: 401 });
    if (url.endsWith('/csrf')) { document.cookie = '__Host-pos_csrf=csrf'; return Response.json({ data: {} }); }
    if (url.endsWith('/refresh')) { assert.equal(options.headers['X-CSRF-Token'], 'csrf'); return Response.json({ data: {} }); }
    return Response.json({ data: { user: { fullName: 'An' } } });
  };
  assert.equal((await restoreSession()).fullName, 'An');
  assert.deepEqual(calls, ['/api/v1/auth/me', '/api/v1/auth/me', '/api/v1/auth/csrf', '/api/v1/auth/refresh', '/api/v1/auth/me']);
});
test('password change sends csrf and no current password for first change', async () => {
  globalThis.document = { cookie: '__Host-pos_csrf=abc' };
  globalThis.fetch = async (_url, options) => { assert.equal(options.headers['X-CSRF-Token'], 'abc'); assert.deepEqual(JSON.parse(options.body), { newPassword: 'long password' }); return new Response(null, { status: 204 }); };
  await changePassword('long password');
});

test('real session preserves identity and permissions for existing UI', async () => {
  const { toUiSession } = await import('../src/auth/session.ts');
  const user = { id: 'real-id', username: 'user', fullName: 'Tên thật', role: 'CASHIER', storeId: 'store-real', branchId: 'branch-real', permissions: ['pos.sell'], mustChangePassword: false };
  const session = toUiSession(user);
  assert.equal(session.user.id, 'real-id');
  assert.equal(session.user.branch_id, 'branch-real');
  assert.deepEqual(session.permissions, ['pos.sell']);
});

test('session logout publishes a notification', async () => {
  const { notifySessionChange } = await import('../src/auth/session-events.ts');
  let sent;
  globalThis.BroadcastChannel = class { postMessage(value) { sent = value; } close() {} };
  notifySessionChange('logout');
  assert.equal(sent, 'logout');
  notifySessionChange('revoked');
  assert.equal(sent, 'revoked');
  delete globalThis.BroadcastChannel;
});
