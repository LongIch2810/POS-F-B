// POS-F&B Platform Admin Screen per DESIGN.md §5.1, §5.6 & BR-78, BR-81, BR-82, BR-83, BR-84, BR-96, BR-103

import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { mockStorage } from '../../mock/mockStorage';
import { Store } from '../../types/entities';
import { User, PermissionCode } from '../../types/auth';
import { formatDateTimeVN } from '../../utils/formatters';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Dialog } from '../../components/ui/Dialog';
import { Field } from '../../components/ui/Field';
import { DataTable, Column } from '../../components/ui/DataTable';
import { useToast } from '../../context/ToastContext';
import {
  Building2,
  UserPlus,
  ShieldAlert,
  KeyRound,
  Lock,
  CheckCircle2,
  Plus,
  UserCheck,
  ShieldCheck,
} from 'lucide-react';

const ALL_AVAILABLE_PERMISSIONS: { code: PermissionCode; label: string; isOperational?: boolean }[] = [
  { code: 'store.manage', label: 'Quản lý tạo và khóa cửa hàng' },
  { code: 'role.manage_permissions', label: 'Chỉnh sửa quyền vai trò toàn hệ thống' },
  { code: 'branch.access_all', label: 'Xem toàn bộ chi nhánh của cửa hàng (branch.access_all)' },
  { code: 'branch.manage', label: 'Quản lý chi nhánh & nhân viên' },
  { code: 'table.manage', label: 'Quản lý bàn ăn' },
  { code: 'product.manage', label: 'Quản lý menu, công thức và mã giảm giá' },
  { code: 'shift.open_close', label: 'Mở và đóng ca làm của mình', isOperational: true },
  { code: 'shift.force_close', label: 'Đóng cưỡng chế ca bị quên', isOperational: true },
  { code: 'pos.sell', label: 'Bán hàng, tạo đơn và thanh toán', isOperational: true },
  { code: 'invoice.cancel_open', label: 'Hủy đơn chưa thanh toán (OPEN)', isOperational: true },
  { code: 'invoice.cancel_paid', label: 'Hủy đơn đã thanh toán (PAID)', isOperational: true },
  { code: 'inventory.view', label: 'Xem tồn kho và sổ kho chi nhánh', isOperational: true },
  { code: 'report.view_shift', label: 'Xem báo cáo ca của mình', isOperational: true },
  { code: 'report.view_branch', label: 'Xem báo cáo chi nhánh của mình', isOperational: true },
  { code: 'report.view_all', label: 'Xem báo cáo tổng hợp toàn cửa hàng', isOperational: true },
];

export interface PlatformAdminScreenProps {
  activeTab?: 'stores' | 'owners' | 'permissions';
  onTabChange?: (tab: 'stores' | 'owners' | 'permissions') => void;
}

export const PlatformAdminScreen: React.FC<PlatformAdminScreenProps> = ({
  activeTab: controlledTab = 'stores',
  onTabChange,
}) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'stores' | 'owners' | 'permissions'>(controlledTab);

  useEffect(() => {
    setActiveTab(controlledTab);
  }, [controlledTab]);

  const handleSelectTab = (tab: 'stores' | 'owners' | 'permissions') => {
    setActiveTab(tab);
    onTabChange?.(tab);
  };

  const [stores, setStores] = useState<Store[]>(() => adminService.getStores());
  const [owners, setOwners] = useState(() => adminService.getOwnerAccounts());
  const [rolePermissions, setRolePermissions] = useState(() => adminService.getRolePermissions());

  // Modal tạo store
  const [createStoreOpen, setCreateStoreOpen] = useState(false);
  const [newStoreName, setNewStoreName] = useState('');
  const [newStorePhone, setNewStorePhone] = useState('');
  const [newStoreAddress, setNewStoreAddress] = useState('');

  // Modal khóa store
  const [suspendModalStore, setSuspendModalStore] = useState<Store | null>(null);
  const [suspendReason, setSuspendReason] = useState('');

  // Modal cấp tài khoản OWNER
  const [createOwnerOpen, setCreateOwnerOpen] = useState(false);
  const [ownerStoreId, setOwnerStoreId] = useState(stores[0]?.id || '');
  const [ownerUsername, setOwnerUsername] = useState('');
  const [ownerFullName, setOwnerFullName] = useState('');
  const [tempPasswordModal, setTempPasswordModal] = useState<{ username: string; pass: string } | null>(null);

  useEffect(() => {
    const update = () => {
      setStores(adminService.getStores());
      setOwners(adminService.getOwnerAccounts());
      setRolePermissions(adminService.getRolePermissions());
    };
    update();
    const unsubscribe = mockStorage.subscribe(update);
    return () => unsubscribe();
  }, []);

  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminService.createStore(newStoreName, newStorePhone, newStoreAddress);
      showToast({ type: 'success', message: 'Tạo cửa hàng mới thành công!' });
      setCreateStoreOpen(false);
      setNewStoreName('');
      setNewStorePhone('');
      setNewStoreAddress('');
    } catch (err: any) {
      showToast({ type: 'error', message: err?.message || 'Lỗi tạo cửa hàng' });
    }
  };

  const handleSuspendStore = async () => {
    if (!suspendModalStore) return;
    if (!suspendReason.trim()) {
      showToast({ type: 'error', message: 'Bắt buộc phải nhập lý do tạm khóa cửa hàng' });
      return;
    }

    try {
      await adminService.setStoreStatus(suspendModalStore.id, 'SUSPENDED', suspendReason);
      showToast({
        type: 'warning',
        message: `Đã tạm khóa cửa hàng ${suspendModalStore.name}. Toàn bộ người dùng thuộc cửa hàng bị chặn truy cập.`,
      });
      setSuspendModalStore(null);
      setSuspendReason('');
    } catch (err: any) {
      showToast({ type: 'error', message: err?.message || 'Lỗi khóa cửa hàng' });
    }
  };

  const handleReactivateStore = async (store: Store) => {
    try {
      await adminService.setStoreStatus(store.id, 'ACTIVE');
      showToast({ type: 'success', message: `Đã mở lại hoạt động cho cửa hàng ${store.name}.` });
    } catch (err: any) {
      showToast({ type: 'error', message: err?.message || 'Lỗi mở lại cửa hàng' });
    }
  };

  const handleCreateOwner = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await adminService.createOwnerAccount(ownerStoreId, ownerUsername, ownerFullName);
      setCreateOwnerOpen(false);
      setOwnerUsername('');
      setOwnerFullName('');
      setTempPasswordModal({
        username: res.user.username,
        pass: res.tempPassword,
      });
    } catch (err: any) {
      showToast({ type: 'error', message: err?.message || 'Lỗi cấp tài khoản' });
    }
  };

  const handleTogglePermission = async (role: string, perm: PermissionCode) => {
    const currentPerms = rolePermissions[role] || [];
    const nextPerms = currentPerms.includes(perm)
      ? currentPerms.filter((p) => p !== perm)
      : [...currentPerms, perm];

    try {
      await adminService.updateRolePermissions(role, nextPerms);
      showToast({ type: 'success', message: `Đã cập nhật quyền cho vai trò ${role}` });
    } catch (err: any) {
      showToast({ type: 'error', message: err?.message || 'Không thể cập nhật quyền' });
    }
  };

  const storeColumns: Column<Store>[] = [
    { key: 'name', header: 'Tên cửa hàng', render: (s) => <span style={{ fontWeight: 600 }}>{s.name}</span> },
    { key: 'phone', header: 'Điện thoại', render: (s) => <span className="num">{s.phone || '—'}</span> },
    { key: 'address', header: 'Địa chỉ', render: (s) => <span style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>{s.address || '—'}</span> },
    {
      key: 'status',
      header: 'Trạng thái',
      render: (s) => (
        <Badge variant={s.status === 'ACTIVE' ? 'success' : 'danger'} size="sm">
          {s.status === 'ACTIVE' ? 'Hoạt động' : 'Tạm khóa'}
        </Badge>
      ),
    },
    {
      key: 'reason',
      header: 'Lý do khóa / Ngày tạo',
      render: (s) => (
        <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
          {s.status === 'SUSPENDED' ? s.suspended_reason : `Tạo lúc ${formatDateTimeVN(s.created_at)}`}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Thao tác',
      align: 'right',
      render: (s) => (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          {s.status === 'ACTIVE' ? (
            <Button
              variant="text"
              size="md"
              style={{ height: 32, padding: '0 8px', color: 'var(--color-danger)' }}
              icon={<Lock size={14} />}
              onClick={() => {
                setSuspendModalStore(s);
                setSuspendReason('');
              }}
            >
              Tạm khóa
            </Button>
          ) : (
            <Button
              variant="text"
              size="md"
              style={{ height: 32, padding: '0 8px', color: 'var(--color-success)' }}
              icon={<CheckCircle2 size={14} />}
              onClick={() => handleReactivateStore(s)}
            >
              Mở lại
            </Button>
          )}
        </div>
      ),
    },
  ];

  const ownerColumns: Column<{ user: User; storeName: string }>[] = [
    {
      key: 'username',
      header: 'Tài khoản (Username)',
      render: (o) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <UserCheck size={16} color="var(--color-brand-600)" />
          <strong>{o.user.username}</strong>
        </div>
      ),
    },
    {
      key: 'full_name',
      header: 'Họ và tên',
      render: (o) => <span style={{ fontWeight: 600 }}>{o.user.full_name}</span>,
    },
    {
      key: 'storeName',
      header: 'Cửa hàng trực thuộc',
      render: (o) => (
        <span style={{ color: 'var(--color-brand-800)', fontWeight: 500 }}>
          {o.storeName}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Trạng thái',
      render: (o) => (
        <Badge variant={o.user.is_active ? 'success' : 'danger'} size="sm">
          {o.user.is_active ? 'Hoạt động' : 'Đã khóa'}
        </Badge>
      ),
    },
    {
      key: 'created_at',
      header: 'Ngày tạo',
      render: (o) => (
        <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
          {formatDateTimeVN(o.user.created_at)}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Thao tác',
      align: 'right',
      render: (o) => (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <Button
            variant="text"
            size="md"
            style={{ height: 32, padding: '0 8px', color: 'var(--color-brand-600)' }}
            icon={<KeyRound size={14} />}
            onClick={async () => {
              try {
                const res = await adminService.resetOwnerPassword(o.user.id);
                setTempPasswordModal({ username: res.username, pass: res.tempPass });
              } catch (err: any) {
                showToast({ type: 'error', message: err?.message || 'Lỗi đặt lại mật khẩu' });
              }
            }}
          >
            Đặt lại MK
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div style={{ flex: 1, padding: 24, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-text)' }}>
            Quản trị Nền tảng (Platform Admin)
          </h1>
          <p style={{ fontSize: 14, color: 'var(--color-text-muted)', marginTop: 4 }}>
            Quản lý danh sách cửa hàng, cấp tài khoản Chủ và cấu hình ma trận quyền. Tuyệt đối không xem dữ liệu vận hành (BR-81).
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          {activeTab === 'stores' && (
            <Button variant="primary" icon={<Plus size={18} />} onClick={() => setCreateStoreOpen(true)}>
              Tạo cửa hàng mới
            </Button>
          )}
          {activeTab === 'owners' && (
            <Button variant="primary" icon={<UserPlus size={18} />} onClick={() => setCreateOwnerOpen(true)}>
              Cấp tài khoản Chủ (OWNER)
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 12, borderBottom: '1px solid var(--color-border)', paddingBottom: 4 }}>
        <button
          type="button"
          onClick={() => handleSelectTab('stores')}
          style={{
            height: 40,
            padding: '0 16px',
            borderRadius: 'var(--radius-pill)',
            border: 'none',
            background: activeTab === 'stores' ? 'var(--color-brand-100)' : 'transparent',
            color: activeTab === 'stores' ? 'var(--color-brand-800)' : 'var(--color-text-muted)',
            fontWeight: activeTab === 'stores' ? 700 : 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <Building2 size={16} />
          <span>Danh sách cửa hàng ({stores.length})</span>
        </button>

        <button
          type="button"
          onClick={() => handleSelectTab('owners')}
          style={{
            height: 40,
            padding: '0 16px',
            borderRadius: 'var(--radius-pill)',
            border: 'none',
            background: activeTab === 'owners' ? 'var(--color-brand-100)' : 'transparent',
            color: activeTab === 'owners' ? 'var(--color-brand-800)' : 'var(--color-text-muted)',
            fontWeight: activeTab === 'owners' ? 700 : 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <UserCheck size={16} />
          <span>Tài khoản chủ quán ({owners.length})</span>
        </button>

        <button
          type="button"
          onClick={() => handleSelectTab('permissions')}
          style={{
            height: 40,
            padding: '0 16px',
            borderRadius: 'var(--radius-pill)',
            border: 'none',
            background: activeTab === 'permissions' ? 'var(--color-brand-100)' : 'transparent',
            color: activeTab === 'permissions' ? 'var(--color-brand-800)' : 'var(--color-text-muted)',
            fontWeight: activeTab === 'permissions' ? 700 : 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <ShieldAlert size={16} />
          <span>Ma trận Quyền vai trò (BR-103)</span>
        </button>
      </div>

      {/* Tab 1: Cửa hàng */}
      {activeTab === 'stores' && (
        <DataTable columns={storeColumns} data={stores} keyExtractor={(s) => s.id} />
      )}

      {/* Tab 2: Tài khoản chủ quán (DESIGN.md §5.1, §5.6) */}
      {activeTab === 'owners' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div
            style={{
              padding: 14,
              borderRadius: 'var(--radius-control)',
              background: 'var(--color-brand-50)',
              color: 'var(--color-brand-800)',
              fontSize: 14,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <ShieldCheck size={18} color="var(--color-brand-600)" />
            <span>
              <strong>Quản lý chủ sở hữu:</strong> Mỗi cửa hàng có ít nhất một tài khoản OWNER. Mật khẩu khởi tạo được cấp một lần duy nhất và người dùng bắt buộc phải đổi mật khẩu khi đăng nhập lần đầu (BR-84).
            </span>
          </div>

          <DataTable columns={ownerColumns} data={owners} keyExtractor={(o) => o.user.id} />
        </div>
      )}

      {/* Tab 3: Ma trận quyền (BR-103) */}
      {activeTab === 'permissions' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div
            style={{
              padding: 14,
              borderRadius: 'var(--radius-control)',
              background: 'var(--color-info-bg)',
              color: 'var(--color-info)',
              fontSize: 14,
            }}
          >
            <strong>Quy tắc BR-103:</strong> Chỉ Quản trị nền tảng được chỉnh sửa ma trận quyền.
            Không thể cấp quyền xem dữ liệu vận hành cho PLATFORM_ADMIN và không thể cấp quyền branch.access_all cho vai trò khác OWNER.
          </div>

          <div
            style={{
              overflowX: 'auto',
              background: 'var(--color-surface)',
              borderRadius: 'var(--radius-control)',
              border: '1px solid var(--color-border)',
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ height: 48, background: 'var(--color-surface-sunken)', borderBottom: '1px solid var(--color-border)' }}>
                  <th style={{ padding: '0 16px', textAlign: 'left', fontWeight: 600 }}>Tên quyền</th>
                  <th style={{ padding: '0 16px', textAlign: 'center', fontWeight: 600 }}>Mã code</th>
                  {['OWNER', 'MANAGER', 'CASHIER'].map((role) => (
                    <th key={role} style={{ padding: '0 16px', textAlign: 'center', fontWeight: 700 }}>
                      {role}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ALL_AVAILABLE_PERMISSIONS.map((perm, idx) => (
                  <tr
                    key={perm.code}
                    style={{
                      height: 48,
                      borderBottom: idx < ALL_AVAILABLE_PERMISSIONS.length - 1 ? '1px solid var(--color-border)' : 'none',
                    }}
                  >
                    <td style={{ padding: '0 16px', fontWeight: 600 }}>{perm.label}</td>
                    <td style={{ padding: '0 16px', textAlign: 'center', color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>
                      {perm.code}
                    </td>
                    {['OWNER', 'MANAGER', 'CASHIER'].map((role) => {
                      const hasPerm = rolePermissions[role]?.includes(perm.code);
                      const isBranchAccessAll = perm.code === 'branch.access_all';
                      const isDisabled = isBranchAccessAll && role !== 'OWNER'; // BR-103

                      return (
                        <td key={role} style={{ padding: '0 16px', textAlign: 'center' }}>
                          <input
                            type="checkbox"
                            checked={hasPerm}
                            disabled={isDisabled}
                            onChange={() => handleTogglePermission(role, perm.code)}
                            title={isDisabled ? 'Chỉ vai trò OWNER mới được cấp quyền này (BR-103)' : ''}
                            style={{ width: 18, height: 18, cursor: isDisabled ? 'not-allowed' : 'pointer', accentColor: 'var(--color-brand-600)' }}
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal tạo Store */}
      <Dialog
        isOpen={createStoreOpen}
        onClose={() => setCreateStoreOpen(false)}
        title="Tạo cửa hàng mới"
        maxWidth={460}
      >
        <form onSubmit={handleCreateStore} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Field
            label="Tên cửa hàng"
            placeholder="VD: Cà phê Sài Gòn Phố"
            value={newStoreName}
            onChange={(e) => setNewStoreName(e.target.value)}
            required
          />
          <Field
            label="Số điện thoại liên hệ"
            placeholder="VD: 0905123456"
            value={newStorePhone}
            onChange={(e) => setNewStorePhone(e.target.value)}
          />
          <Field
            label="Địa chỉ trụ sở"
            placeholder="VD: 123 Lê Lợi, TP. Huế"
            value={newStoreAddress}
            onChange={(e) => setNewStoreAddress(e.target.value)}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <Button variant="secondary" onClick={() => setCreateStoreOpen(false)}>
              Hủy
            </Button>
            <Button variant="primary" type="submit">
              Xác nhận tạo
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Modal tạm khóa cửa hàng */}
      <Dialog
        isOpen={!!suspendModalStore}
        onClose={() => setSuspendModalStore(null)}
        title={`Tạm khóa hoạt động: ${suspendModalStore?.name}`}
        maxWidth={460}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <Button variant="secondary" onClick={() => setSuspendModalStore(null)}>
              Hủy
            </Button>
            <Button variant="danger" onClick={handleSuspendStore}>
              Xác nhận tạm khóa
            </Button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <p style={{ fontSize: 14, color: 'var(--color-text-muted)' }}>
            Khi bị tạm khóa, tất cả tài khoản thuộc cửa hàng này sẽ bị tạm ngưng truy cập ngay lập tức. Toàn bộ dữ liệu vận hành vẫn được bảo lưu an toàn.
          </p>
          <Field
            label="Lý do tạm khóa (bắt buộc)"
            placeholder="Chưa gia hạn dịch vụ, vi phạm điều khoản..."
            value={suspendReason}
            onChange={(e) => setSuspendReason(e.target.value)}
            required
            autoFocus
          />
        </div>
      </Dialog>

      {/* Modal Cấp tài khoản OWNER */}
      <Dialog
        isOpen={createOwnerOpen}
        onClose={() => setCreateOwnerOpen(false)}
        title="Cấp tài khoản Chủ cửa hàng (OWNER)"
        maxWidth={480}
      >
        <form onSubmit={handleCreateOwner} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label
              htmlFor="owner-store-select"
              style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-muted)', display: 'block', marginBottom: 6, cursor: 'pointer' }}
            >
              Thuộc cửa hàng
            </label>
            <select
              id="owner-store-select"
              value={ownerStoreId}
              onChange={(e) => setOwnerStoreId(e.target.value)}
              style={{
                height: 48,
                width: '100%',
                padding: '0 16px',
                borderRadius: 'var(--radius-control)',
                border: '1px solid var(--color-border-control)',
                background: 'var(--color-surface)',
                color: 'var(--color-text)',
                fontSize: 15,
              }}
            >
              {stores.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <Field
            label="Tên đăng nhập (username duy nhất)"
            placeholder="VD: owner_long"
            value={ownerUsername}
            onChange={(e) => setOwnerUsername(e.target.value)}
            required
          />

          <Field
            label="Họ và tên người đại diện"
            placeholder="VD: Nguyễn Văn Long"
            value={ownerFullName}
            onChange={(e) => setOwnerFullName(e.target.value)}
            required
          />

          <p style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
            Hệ thống sẽ tự động tạo mật khẩu tạm thời hiển thị 1 lần duy nhất. Tài khoản sẽ được yêu cầu đổi mật khẩu ngay trong lần đăng nhập đầu tiên.
          </p>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <Button variant="secondary" onClick={() => setCreateOwnerOpen(false)}>
              Hủy
            </Button>
            <Button variant="primary" type="submit">
              Cấp tài khoản
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Modal hiển thị mật khẩu tạm 1 lần duy nhất */}
      <Dialog
        isOpen={!!tempPasswordModal}
        onClose={() => setTempPasswordModal(null)}
        title="Mật khẩu tạm thời đã được tạo"
        maxWidth={460}
        footer={
          <Button variant="primary" onClick={() => setTempPasswordModal(null)}>
            Tôi đã lưu mật khẩu
          </Button>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, textAlign: 'center', padding: '10px 0' }}>
          <KeyRound size={40} color="var(--color-warning)" style={{ margin: '0 auto' }} />
          <p style={{ fontSize: 14, color: 'var(--color-text-muted)' }}>
            Mật khẩu tạm thời chỉ hiển thị đúng <strong>MỘT LẦN DUY NHẤT</strong> cho người cấp. Hãy sao chép và gửi an toàn cho chủ cửa hàng:
          </p>

          <div
            style={{
              padding: '16px',
              background: 'var(--color-surface-sunken)',
              borderRadius: 'var(--radius-control)',
              border: '1px solid var(--color-border)',
            }}
          >
            <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Tên đăng nhập:</div>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{tempPasswordModal?.username}</div>
            <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Mật khẩu tạm thời:</div>
            <div
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: 'var(--color-brand-600)',
                letterSpacing: '1px',
                fontFamily: 'monospace',
              }}
            >
              {tempPasswordModal?.pass}
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
};
