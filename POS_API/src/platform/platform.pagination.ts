import { httpError } from '../http/http-error';

export interface PlatformPage {
  limit: number;
  after?: { createdAt: string; id: string };
}

const invalid = () => httpError(422, 'VALIDATION_ERROR', 'Tham số danh sách không hợp lệ.');

export function platformPage(query: Record<string, unknown>, scope: 'stores' | 'owners'): PlatformPage {
  if (Object.keys(query).some(key => !['limit', 'cursor', 'sort', ...(scope === 'owners' ? ['role'] : [])].includes(key))
    || (scope === 'owners' && query.role !== 'OWNER')
    || (query.sort !== undefined && query.sort !== '-createdAt')) throw invalid();
  const rawLimit = query.limit ?? '20';
  if (typeof rawLimit !== 'string' || !/^[1-9][0-9]{0,8}$/.test(rawLimit)) throw invalid();
  const limit = Math.min(Number(rawLimit), 100);
  if (query.cursor === undefined) return { limit };
  if (typeof query.cursor !== 'string' || !/^[A-Za-z0-9_-]{1,512}$/.test(query.cursor)) throw invalid();
  try {
    const value = JSON.parse(Buffer.from(query.cursor, 'base64url').toString('utf8'));
    if (value.scope !== scope || typeof value.createdAt !== 'string'
      || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{6}Z$/.test(value.createdAt)
      || !Number.isFinite(Date.parse(value.createdAt))
      || new Date(value.createdAt).toISOString().slice(0, 19) !== value.createdAt.slice(0, 19)
      || typeof value.id !== 'string' || !/^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(value.id)) throw invalid();
    return { limit, after: { createdAt: value.createdAt, id: value.id } };
  } catch { throw invalid(); }
}

export function platformPageResponse<T extends { id: string; cursorCreatedAt: string }>(
  rows: T[], page: PlatformPage, scope: 'stores' | 'owners', total: number,
) {
  const selected = rows.slice(0, page.limit);
  const last = selected.at(-1);
  const nextCursor = rows.length > page.limit && last
    ? Buffer.from(JSON.stringify({ scope, createdAt: last.cursorCreatedAt, id: last.id })).toString('base64url') : null;
  return { data: selected.map(({ cursorCreatedAt: _, ...row }) => row),
    meta: { limit: page.limit, nextCursor, total } };
}
