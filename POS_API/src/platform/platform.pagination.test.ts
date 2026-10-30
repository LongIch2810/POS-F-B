import assert from 'node:assert/strict';
import { test } from 'node:test';
import { platformPage, platformPageResponse } from './platform.pagination';

test('PB-03 cursor preserves microseconds and validates list scope and query', () => {
  const rows = [
    { id: '00000000-0000-4000-8000-000000000002', cursorCreatedAt: '2026-10-30T01:00:00.123456Z' },
    { id: '00000000-0000-4000-8000-000000000001', cursorCreatedAt: '2026-10-30T01:00:00.123455Z' },
  ];
  const response = platformPageResponse(rows, { limit: 1 }, 'stores', 2);
  assert.equal(response.data.length, 1);
  assert.equal('cursorCreatedAt' in response.data[0], false);
  assert.equal(platformPage({ cursor: response.meta.nextCursor }, 'stores').after?.createdAt, rows[0].cursorCreatedAt);
  assert.throws(() => platformPage({ role: 'OWNER', cursor: response.meta.nextCursor }, 'owners'));
  for (const query of [{ page: '1' }, { limit: ['1', '2'] }, { limit: '0' }, { cursor: '' }, { sort: 'name' }]) {
    assert.throws(() => platformPage(query, 'stores'));
  }
  assert.equal(platformPage({ limit: '101' }, 'stores').limit, 100);
  assert.equal(platformPageResponse([], { limit: 20 }, 'stores', 0).meta.nextCursor, null);
});
