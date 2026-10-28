import assert from 'node:assert/strict';
import { test } from 'node:test';
import { validateAuthConfig } from '../auth-config';

test('PB-02 startup rejects absent or weak authentication configuration', () => {
  const original = { ...process.env };
  try {
    delete process.env.JWT_SECRET;
    process.env.CSRF_SECRET = 'c'.repeat(32);
    process.env.PUBLIC_ORIGIN = 'http://localhost:5173';
    assert.throws(validateAuthConfig);
    process.env.JWT_SECRET = 'short';
    assert.throws(validateAuthConfig);
    process.env.JWT_SECRET = 'j'.repeat(32);
    process.env.PUBLIC_ORIGIN = 'http://localhost:5173/path';
    assert.throws(validateAuthConfig);
    process.env.PUBLIC_ORIGIN = 'http://localhost:5173';
    assert.doesNotThrow(validateAuthConfig);
  } finally {
    process.env = original;
  }
});
