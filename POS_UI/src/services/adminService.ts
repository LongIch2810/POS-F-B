// Platform Admin & Settings Service Layer (API Ready)

import { MockEngine } from '../mock/mockEngine';
import { mockStorage } from '../mock/mockStorage';
import { Store, Branch, DiningTable } from '../types/entities';
import { User, PermissionCode, RoleCode } from '../types/auth';

export const adminService = {
  getStores(): Store[] {
    return mockStorage.getState().stores;
  },

  createStore(name: string, phone?: string, address?: string, email?: string): Promise<Store> {
    return Promise.resolve(MockEngine.createStore(name, phone, address, email));
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

  // Quản lý chi nhánh, bàn, nhân viên cho OWNER & MANAGER
  getBranches(storeId: string): Branch[] {
    return mockStorage.getState().branches.filter((b) => b.store_id === storeId);
  },

  createBranch(name: string, code: string, address?: string, initialCash?: bigint): Promise<Branch> {
    return Promise.resolve(MockEngine.createBranch(name, code, address, initialCash));
  },

  updateBranch(branchId: string, updates: { name?: string; address?: string; initial_cash?: bigint }): Promise<Branch> {
    return Promise.resolve(MockEngine.updateBranch(branchId, updates));
  },

  toggleBranchActive(branchId: string): Promise<Branch> {
    return Promise.resolve(MockEngine.toggleBranchActive(branchId));
  },

  getDiningTables(branchId: string): DiningTable[] {
    return mockStorage.getState().tables.filter((t) => t.branch_id === branchId);
  },

  isTableOccupied(tableId: string): boolean {
    return MockEngine.isTableOccupied(tableId);
  },

  createTable(branchId: string, name: string, area: string, seatCount?: number): Promise<DiningTable> {
    return Promise.resolve(MockEngine.createTable(branchId, name, area, seatCount));
  },

  updateTable(tableId: string, updates: { name?: string; area?: string; seat_count?: number }): Promise<DiningTable> {
    return Promise.resolve(MockEngine.updateTable(tableId, updates));
  },

  toggleTableActive(tableId: string): Promise<DiningTable> {
    return Promise.resolve(MockEngine.toggleTableActive(tableId));
  },

  getUsersByStore(storeId: string): User[] {
    return mockStorage.getState().users.filter((u) => u.store_id === storeId);
  },

  createStaffUser(
    branchId: string,
    username: string,
    fullName: string,
    roleCode: 'MANAGER' | 'CASHIER'
  ): Promise<{ user: User; tempPassword: string }> {
    return Promise.resolve(MockEngine.createStaffUser(branchId, username, fullName, roleCode));
  },

  toggleUserActive(userId: string): Promise<User> {
    return Promise.resolve(MockEngine.toggleUserActive(userId));
  },

  updateUserRole(userId: string, newRole: RoleCode): Promise<User> {
    return Promise.resolve(MockEngine.updateUserRole(userId, newRole));
  },

  resetUserPassword(userId: string): Promise<{ user: User; tempPassword: string }> {
    return Promise.resolve(MockEngine.resetUserPassword(userId));
  },
};
