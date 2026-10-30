import { AuthError, restoreSession } from '../auth/client.ts';
import { notifySessionChange } from '../auth/session-events.ts';

export interface PlatformStore {
  id: string; name: string; phone: string | null; email: string | null; address: string | null;
  status: 'ACTIVE' | 'SUSPENDED'; suspendedAt: string | null; suspendedReason: string | null;
  createdAt: string; updatedAt: string;
}

export interface PlatformOwner {
  id: string; storeId: string; storeName?: string; username: string; fullName: string;
  isActive: boolean; mustChangePassword: boolean; createdAt: string;
}

export interface PlatformList<T> { data: T[]; meta: { limit: number; nextCursor: string | null; total: number } }

async function request<T>(path: string, method = 'GET', body?: object, retry = true, list = false): Promise<T> {
  const headers: Record<string, string> = {};
  if (method !== 'GET') {
    if (!document.cookie.split('; ').some(item => item.startsWith('__Host-pos_csrf='))) {
      await request('auth/csrf');
    }
    const csrf = document.cookie.split('; ').find(item => item.startsWith('__Host-pos_csrf='))?.slice('__Host-pos_csrf='.length);
    if (csrf) headers['X-CSRF-Token'] = decodeURIComponent(csrf);
  }
  if (body) headers['Content-Type'] = 'application/json';
  let response: Response;
  try {
    response = await fetch(`/api/v1/${path}`, { method, headers, credentials: 'same-origin',
      ...(body ? { body: JSON.stringify(body) } : {}) });
  } catch {
    throw new AuthError('NETWORK_ERROR', 'Không thể kết nối máy chủ. Vui lòng thử lại.');
  }
  if (response.status === 401 && retry) {
    try {
      if (await restoreSession()) return request<T>(path, method, body, false, list);
    } catch (error) {
      if (error instanceof AuthError && ['ACCOUNT_DISABLED', 'STORE_SUSPENDED'].includes(error.code)) {
        notifySessionChange('revoked');
      }
      throw error;
    }
    notifySessionChange('revoked');
    throw new AuthError('UNAUTHENTICATED', 'Phiên đã hết hiệu lực. Vui lòng đăng nhập lại.');
  }
  let json;
  try { json = await response.json(); } catch { throw new AuthError('UNKNOWN', 'Có lỗi xảy ra. Vui lòng thử lại.'); }
  if (!response.ok) {
    const error = new AuthError(json.error?.code ?? 'UNKNOWN', json.error?.message ?? 'Có lỗi xảy ra. Vui lòng thử lại.');
    if (response.status === 401 || ['ACCOUNT_DISABLED', 'STORE_SUSPENDED'].includes(error.code)) {
      notifySessionChange('revoked');
    }
    throw error;
  }
  return (list ? json : json.data) as T;
}

export const platformService = {
  getStores(cursor?: string): Promise<PlatformList<PlatformStore>> {
    return request(`platform/stores?limit=20${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ''}`, 'GET', undefined, true, true);
  },
  getOwners(cursor?: string): Promise<PlatformList<PlatformOwner>> {
    return request(`users?role=OWNER&limit=20${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ''}`, 'GET', undefined, true, true);
  },
  createStore(input: { name: string; phone?: string; email?: string; address?: string;
    owner: { username: string; fullName: string } }) {
    return request<{ store: PlatformStore; owner: PlatformOwner; temporaryPassword: string }>('platform/stores', 'POST', input);
  },
  addOwner(input: { storeId: string; username: string; fullName: string }) {
    return request<{ owner: PlatformOwner; temporaryPassword: string }>('users', 'POST', input);
  },
  suspendStore(id: string, reason: string) {
    return request<{ store: PlatformStore }>(`platform/stores/${encodeURIComponent(id)}/suspend`, 'POST', { reason });
  },
  reactivateStore(id: string) {
    return request<{ store: PlatformStore }>(`platform/stores/${encodeURIComponent(id)}/reactivate`, 'POST');
  },
  resetOwnerPassword(id: string) {
    return request<{ owner: PlatformOwner; temporaryPassword: string }>(`users/${encodeURIComponent(id)}/reset-password`, 'POST');
  },
};
