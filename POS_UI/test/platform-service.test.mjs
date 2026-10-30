import { afterEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { platformService } from '../src/services/platformService.ts';

afterEach(() => {
  delete globalThis.document;
  delete globalThis.navigator;
  delete globalThis.fetch;
  delete globalThis.BroadcastChannel;
});

test('PB-03 platform request refreshes expired access once and retries', async () => {
  globalThis.document = { cookie: '__Host-pos_csrf=csrf' };
  Object.defineProperty(globalThis, 'navigator', { configurable: true,
    value: { locks: { request: async (_name, action) => action() } } });
  const calls = [];
  globalThis.fetch = async (url) => {
    calls.push(url);
    if (url.includes('/platform/stores') && calls.filter(call => call === url).length === 1) {
      return Response.json({ error: { code: 'TOKEN_EXPIRED' } }, { status: 401 });
    }
    if (url.endsWith('/auth/me') && calls.filter(call => call === url).length <= 2) {
      return Response.json({ error: { code: 'TOKEN_EXPIRED' } }, { status: 401 });
    }
    if (url.endsWith('/auth/refresh')) return Response.json({ data: {} });
    if (url.endsWith('/auth/me')) return Response.json({ data: { user: { role: 'PLATFORM_ADMIN' } } });
    return Response.json({ data: [], meta: { limit: 20, nextCursor: null, total: 0 } });
  };

  assert.deepEqual(await platformService.getStores(), { data: [], meta: { limit: 20, nextCursor: null, total: 0 } });
  assert.deepEqual(calls, [
    '/api/v1/platform/stores?limit=20', '/api/v1/auth/me', '/api/v1/auth/me',
    '/api/v1/auth/refresh', '/api/v1/auth/me', '/api/v1/platform/stores?limit=20',
  ]);
});

test('PB-03 platform request clears revoked session', async () => {
  globalThis.document = { cookie: '__Host-pos_csrf=csrf' };
  Object.defineProperty(globalThis, 'navigator', { configurable: true,
    value: { locks: { request: async (_name, action) => action() } } });
  let event;
  globalThis.BroadcastChannel = class { postMessage(value) { event = value; } close() {} };
  globalThis.fetch = async () => Response.json({ error: { code: 'UNAUTHENTICATED' } }, { status: 401 });

  await assert.rejects(platformService.getStores(), error => error.code === 'UNAUTHENTICATED');
  assert.equal(event, 'revoked');
});
