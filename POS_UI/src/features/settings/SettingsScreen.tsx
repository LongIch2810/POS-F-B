// POS-F&B Store & Branch Settings Screen per DESIGN.md §5.6 & BR-07, BR-76

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { adminService } from '../../services/adminService';
import { mockStorage } from '../../mock/mockStorage';
import { Branch, DiningTable } from '../../types/entities';
import { User } from '../../types/auth';
import { formatVND } from '../../utils/formatters';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { DataTable, Column } from '../../components/ui/DataTable';
import { Building, LayoutGrid, Users, Lock, Unlock } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const SettingsScreen: React.FC = () => {
  const { session } = useAuth();
  const { showToast } = useToast();
  const storeId = session.user.store_id || 'store-1';

  const [activeTab, setActiveTab] = useState<'branches' | 'tables' | 'staff'>('branches');

  const [branches, setBranches] = useState<Branch[]>(() => adminService.getBranches(storeId));
  const [selectedBranchId, setSelectedBranchId] = useState<string>(branches[0]?.id || '');
  const [tables, setTables] = useState<DiningTable[]>(() =>
    adminService.getDiningTables(selectedBranchId)
  );
  const [staff, setStaff] = useState<User[]>(() => adminService.getUsersByStore(storeId));

  useEffect(() => {
    const update = () => {
      const bList = adminService.getBranches(storeId);
      setBranches(bList);
      if (!selectedBranchId && bList.length > 0) {
        setSelectedBranchId(bList[0].id);
      }
      setTables(adminService.getDiningTables(selectedBranchId || bList[0]?.id || ''));
      setStaff(adminService.getUsersByStore(storeId));
    };
    update();
    const unsubscribe = mockStorage.subscribe(update);
    return () => unsubscribe();
  }, [storeId, selectedBranchId]);

  const handleToggleStaffActive = async (userToToggle: User) => {
    if (userToToggle.role_code === 'OWNER') {
      showToast({ type: 'error', message: 'Không thể khóa tài khoản Chủ cửa hàng (BR-85)' });
      return;
    }
    await adminService.toggleUserActive(userToToggle.id);
    showToast({
      type: 'info',
      message: `Đã ${userToToggle.is_active ? 'khóa' : 'mở khóa'} tài khoản ${userToToggle.full_name} (BR-07: khóa không xóa)`,
    });
  };

  const branchColumns: Column<Branch>[] = [
    { key: 'code', header: 'Mã', render: (b) => <strong>{b.code}</strong> },
    { key: 'name', header: 'Tên chi nhánh', render: (b) => <span style={{ fontWeight: 600 }}>{b.name}</span> },
    { key: 'address', header: 'Địa chỉ', render: (b) => <span>{b.address}</span> },
    {
      key: 'initial_cash',
      header: 'Quỹ két ban đầu',
      align: 'right',
      render: (b) => <span className="money">{formatVND(b.initial_cash)}</span>,
    },
    {
      key: 'status',
      header: 'Trạng thái',
      render: (b) => (
        <Badge variant={b.is_active ? 'success' : 'neutral'} size="sm">
          {b.is_active ? 'Hoạt động' : 'Ngưng hoạt động'}
        </Badge>
      ),
    },
  ];

  const tableColumns: Column<DiningTable>[] = [
    { key: 'name', header: 'Tên bàn', render: (t) => <strong>{t.name}</strong> },
    { key: 'area', header: 'Khu vực', render: (t) => <span>{t.area}</span> },
    { key: 'seats', header: 'Số chỗ ngồi', align: 'center', render: (t) => <span>{t.seat_count} chỗ</span> },
    {
      key: 'status',
      header: 'Trạng thái',
      render: (t) => (
        <Badge variant={t.is_active ? 'success' : 'neutral'} size="sm">
          {t.is_active ? 'Đang phục vụ' : 'Ngưng dùng (BR-95)'}
        </Badge>
      ),
    },
  ];

  const staffColumns: Column<User>[] = [
    { key: 'username', header: 'Tên đăng nhập', render: (u) => <strong>{u.username}</strong> },
    { key: 'fullname', header: 'Họ và tên', render: (u) => <span>{u.full_name}</span> },
    {
      key: 'role',
      header: 'Vai trò',
      render: (u) => (
        <Badge variant={u.role_code === 'OWNER' ? 'warning' : 'info'} size="sm">
          {u.role_code}
        </Badge>
      ),
    },
    {
      key: 'branch',
      header: 'Chi nhánh',
      render: (u) => {
        const b = branches.find((branch) => branch.id === u.branch_id);
        return <span>{b?.name || 'Tất cả chi nhánh'}</span>;
      },
    },
    {
      key: 'status',
      header: 'Trạng thái',
      render: (u) => (
        <Badge variant={u.is_active ? 'success' : 'danger'} size="sm">
          {u.is_active ? 'Hoạt động' : 'Đã khóa'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Thao tác',
      align: 'right',
      render: (u) => {
        if (u.role_code === 'OWNER') return <span>—</span>;
        return (
          <Button
            variant="text"
            size="md"
            style={{ height: 32, padding: '0 8px' }}
            icon={u.is_active ? <Lock size={14} /> : <Unlock size={14} />}
            onClick={() => handleToggleStaffActive(u)}
          >
            {u.is_active ? 'Khóa tài khoản' : 'Mở khóa'}
          </Button>
        );
      },
    },
  ];

  return (
    <div style={{ flex: 1, padding: 24, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-text)' }}>
          Cài đặt Cửa hàng & Chi nhánh
        </h1>
        <p style={{ fontSize: 14, color: 'var(--color-text-muted)', marginTop: 4 }}>
          Quản lý danh sách chi nhánh, bàn ăn và tài khoản nhân viên trực thuộc
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 12, borderBottom: '1px solid var(--color-border)', paddingBottom: 4 }}>
        <button
          type="button"
          onClick={() => setActiveTab('branches')}
          style={{
            height: 40,
            padding: '0 16px',
            borderRadius: 'var(--radius-pill)',
            border: 'none',
            background: activeTab === 'branches' ? 'var(--color-brand-100)' : 'transparent',
            color: activeTab === 'branches' ? 'var(--color-brand-800)' : 'var(--color-text-muted)',
            fontWeight: activeTab === 'branches' ? 700 : 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <Building size={16} />
          <span>Chi nhánh ({branches.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('tables')}
          style={{
            height: 40,
            padding: '0 16px',
            borderRadius: 'var(--radius-pill)',
            border: 'none',
            background: activeTab === 'tables' ? 'var(--color-brand-100)' : 'transparent',
            color: activeTab === 'tables' ? 'var(--color-brand-800)' : 'var(--color-text-muted)',
            fontWeight: activeTab === 'tables' ? 700 : 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <LayoutGrid size={16} />
          <span>Bàn ăn</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('staff')}
          style={{
            height: 40,
            padding: '0 16px',
            borderRadius: 'var(--radius-pill)',
            border: 'none',
            background: activeTab === 'staff' ? 'var(--color-brand-100)' : 'transparent',
            color: activeTab === 'staff' ? 'var(--color-brand-800)' : 'var(--color-text-muted)',
            fontWeight: activeTab === 'staff' ? 700 : 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <Users size={16} />
          <span>Nhân viên ({staff.length})</span>
        </button>
      </div>

      {/* Tab Chi nhánh */}
      {activeTab === 'branches' && (
        <DataTable columns={branchColumns} data={branches} keyExtractor={(b) => b.id} />
      )}

      {/* Tab Bàn ăn */}
      {activeTab === 'tables' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 14, fontWeight: 600 }}>Xem bàn thuộc chi nhánh:</span>
            <select
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value)}
              style={{
                height: 38,
                padding: '0 12px',
                borderRadius: 'var(--radius-control)',
                border: '1px solid var(--color-border-control)',
                background: 'var(--color-surface)',
              }}
            >
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
          <DataTable columns={tableColumns} data={tables} keyExtractor={(t) => t.id} />
        </div>
      )}

      {/* Tab Nhân viên */}
      {activeTab === 'staff' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
            Nhân viên nghỉ việc thì khóa tài khoản, không xóa để bảo toàn dữ liệu ca và hóa đơn tham chiếu (BR-07).
          </div>
          <DataTable columns={staffColumns} data={staff} keyExtractor={(u) => u.id} />
        </div>
      )}
    </div>
  );
};
