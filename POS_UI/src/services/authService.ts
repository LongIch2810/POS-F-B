// Auth Service Layer (API Ready)

import { mockStorage } from '../mock/mockStorage';
import { MockEngine } from '../mock/mockEngine';
import { AuthSession, DemoAccount } from '../types/auth';

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    id: 'user-admin',
    username: 'admin',
    full_name: 'Quản trị Nền tảng',
    role_code: 'PLATFORM_ADMIN',
    role_title: 'Quản trị nền tảng',
    store_id: null,
    branch_id: null,
    note: 'Chỉ xem Cửa hàng, cấp Owner, ma trận quyền; tuyệt đối không thấy vận hành',
  },
  {
    id: 'user-owner',
    username: 'long_owner',
    full_name: 'Ông Long (Chủ chuỗi)',
    role_code: 'OWNER',
    role_title: 'Chủ cửa hàng',
    store_id: 'store-1',
    store_name: 'Cà phê Ông Long',
    branch_id: null,
    note: 'Xem được mọi chi nhánh (branch.access_all), quản lý menu, kho và báo cáo tổng hợp',
  },
  {
    id: 'user-mgr-nl',
    username: 'thao_mgr',
    full_name: 'Nguyễn Văn Thảo',
    role_code: 'MANAGER',
    role_title: 'Quản lý Nam Lý',
    store_id: 'store-1',
    store_name: 'Cà phê Ông Long',
    branch_id: 'branch-nl',
    branch_name: 'Chi nhánh Nam Lý',
    note: 'Vận hành Nam Lý: kho, duyệt hủy đơn PAID, đóng cưỡng chế ca',
  },
  {
    id: 'user-cashier-nl',
    username: 'an_cashier',
    full_name: 'Lê Thúy An',
    role_code: 'CASHIER',
    role_title: 'Thu ngân Nam Lý (Đang mở ca)',
    store_id: 'store-1',
    store_name: 'Cà phê Ông Long',
    branch_id: 'branch-nl',
    branch_name: 'Chi nhánh Nam Lý',
    note: 'Có ca thu ngân đang mở, thực hiện bán hàng và thanh toán trực tiếp',
  },
  {
    id: 'user-cashier-dh',
    username: 'binh_cashier',
    full_name: 'Trần Thanh Bình',
    role_code: 'CASHIER',
    role_title: 'Thu ngân Đồng Hới (Chưa mở ca)',
    store_id: 'store-1',
    store_name: 'Cà phê Ông Long',
    branch_id: 'branch-dh',
    branch_name: 'Chi nhánh Đồng Hới',
    note: 'Chưa mở ca thu ngân để test màn hình cổng mở ca chỉ đọc',
  },
  {
    id: 'user-new-cashier',
    username: 'new_cashier',
    full_name: 'Phạm Minh Tuấn',
    role_code: 'CASHIER',
    role_title: 'Thu ngân mới nhận việc',
    store_id: 'store-1',
    store_name: 'Cà phê Ông Long',
    branch_id: 'branch-nl',
    branch_name: 'Chi nhánh Nam Lý',
    note: 'Tài khoản có must_change_password: true để test luồng bắt buộc đổi mật khẩu',
  },
];

export const authService = {
  getCurrentSession(): AuthSession {
    return MockEngine.getAuthSession();
  },

  switchDemoUser(userId: string): Promise<AuthSession> {
    const user = mockStorage.getState().users.find((u) => u.id === userId);
    if (!user) throw new Error('Tài khoản demo không tồn tại');

    // Cập nhật currentUserId & selectedBranchId thích hợp
    mockStorage.setState((prev) => ({
      currentUserId: userId,
      selectedBranchId: user.branch_id || prev.selectedBranchId,
    }));

    return Promise.resolve(MockEngine.getAuthSession());
  },

  forceChangePassword(newPassword: string): Promise<void> {
    if (newPassword.length < 6) {
      throw new Error('Mật khẩu mới phải có ít nhất 6 ký tự');
    }
    const current = MockEngine.getCurrentUser();
    mockStorage.setState((prev) => ({
      users: prev.users.map((u) => (u.id === current.id ? { ...u, must_change_password: false } : u)),
    }));
    return Promise.resolve();
  },

  toggleOfflineMode(): boolean {
    const nextVal = !mockStorage.getState().isOfflineSimulated;
    mockStorage.setState(() => ({ isOfflineSimulated: nextVal }));
    return nextVal;
  },

  isOffline(): boolean {
    return mockStorage.getState().isOfflineSimulated;
  },

  resetAllData() {
    mockStorage.resetToSeed();
  },
};
