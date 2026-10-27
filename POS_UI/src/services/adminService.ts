// Platform Admin & Settings Service Layer (API Ready)

import { MockEngine } from '../mock/mockEngine';
import { mockStorage } from '../mock/mockStorage';
import { Store, Branch, DiningTable } from '../types/entities';
import { User, PermissionCode } from '../types/auth';

export const adminService = {
  getStores(): Store[] {
    return mockStorage.getState().stores;
  },

  createStore(name: string, code: string): Promise<Store> {
    return Promise.resolve(MockEngine.createStore(name, code));
  },

  setStoreStatus(storeId: string, status: 'ACTIVE' | 'SUSPENDED', reason?: string): Promise<Store> {
    return Promise.resolve(MockEngine.setStoreStatus(storeId, status, reason));
  },

  createOwnerAccount(storeId: string, username: string, fullName: string): Promise<{ user: User; tempPassword: string }> {
    return Promise.resolve(MockEngine.createOwnerAccount(storeId, username, fullName));
  },

  getOwnerAccounts(): { user: User; storeName: string }[] {
    const state = mockStorage.getState();
    const owners = state.users.filter((u) => u.role_code === 'OWNER');
    return owners.map((user) => {
      const store = state.stores.find((s) => s.id === user.store_id);
      return { user, storeName: store ? store.name : 'Chưa gán' };
    });
  },

  resetOwnerPassword(userId: string): Promise<{ username: string; tempPass: string }> {
    const state = mockStorage.getState();
    const user = state.users.find((u) => u.id === userId);
    if (!user) throw new Error('Không tìm thấy tài khoản');
    const tempPass = 'Reset@' + Math.floor(100000 + Math.random() * 900000);
    mockStorage.setState((prev) => ({
      users: prev.users.map((u) =>
        u.id === userId ? { ...u, force_password_change: true } : u
      ),
    }));
    return Promise.resolve({ username: user.username, tempPass });
  },

  getRolePermissions(): Record<string, PermissionCode[]> {
    return mockStorage.getState().rolePermissions;
  },

  updateRolePermissions(roleCode: string, permissions: PermissionCode[]): Promise<void> {
    MockEngine.updateRolePermissions(roleCode, permissions);
    return Promise.resolve();
  },

  // Quản lý chi nhánh, bàn, nhân viên cho OWNER
  getBranches(storeId: string): Branch[] {
    return mockStorage.getState().branches.filter((b) => b.store_id === storeId);
  },

  getDiningTables(branchId: string): DiningTable[] {
    return mockStorage.getState().tables.filter((t) => t.branch_id === branchId);
  },

  getUsersByStore(storeId: string): User[] {
    return mockStorage.getState().users.filter((u) => u.store_id === storeId);
  },

  toggleUserActive(userId: string): Promise<void> {
    mockStorage.setState((prev) => ({
      users: prev.users.map((u) => (u.id === userId ? { ...u, is_active: !u.is_active } : u)),
    }));
    return Promise.resolve();
  },
};
