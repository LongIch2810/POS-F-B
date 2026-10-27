// POS-F&B Store & Branch Settings Screen per DESIGN.md §5.6 & BR-07, BR-10, BR-70, BR-84, BR-85, BR-95, BR-99

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { adminService } from '../../services/adminService';
import { mockStorage } from '../../mock/mockStorage';
import { Branch, DiningTable } from '../../types/entities';
import { User, RoleCode } from '../../types/auth';
import { formatVND } from '../../utils/formatters';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { DataTable, Column } from '../../components/ui/DataTable';
import { Dialog } from '../../components/ui/Dialog';
import { Field } from '../../components/ui/Field';
import {
  Building,
  LayoutGrid,
  Users,
  Lock,
  KeyRound,
  Plus,
  Edit2,
  Power,
  RotateCcw,
  CheckCircle2,
  Copy,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const SettingsScreen: React.FC = () => {
  const { session } = useAuth();
  const { showToast } = useToast();
  const currentUser = session.user;
  const storeId = currentUser.store_id || 'store-1';

  const [activeTab, setActiveTab] = useState<'branches' | 'tables' | 'staff'>('branches');

  const [branches, setBranches] = useState<Branch[]>(() => adminService.getBranches(storeId));
  const [selectedBranchId, setSelectedBranchId] = useState<string>(branches[0]?.id || '');
  const [tables, setTables] = useState<DiningTable[]>(() =>
    adminService.getDiningTables(selectedBranchId)
  );
  const [staff, setStaff] = useState<User[]>(() => adminService.getUsersByStore(storeId));

  // Branch Modals
  const [branchModalOpen, setBranchModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [branchName, setBranchName] = useState('');
  const [branchCode, setBranchCode] = useState('');
  const [branchAddress, setBranchAddress] = useState('');
  const [branchInitialCash, setBranchInitialCash] = useState('1500000');

  // Table Modals
  const [tableModalOpen, setTableModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<DiningTable | null>(null);
  const [tableName, setTableName] = useState('');
  const [tableArea, setTableArea] = useState('Tầng 1');
  const [tableSeats, setTableSeats] = useState('4');

  // Staff Modals
  const [staffModalOpen, setStaffModalOpen] = useState(false);
  const [staffUsername, setStaffUsername] = useState('');
  const [staffFullName, setStaffFullName] = useState('');
  const [staffRole, setStaffRole] = useState<'MANAGER' | 'CASHIER'>('CASHIER');
  const [staffBranchId, setStaffBranchId] = useState(branches[0]?.id || '');
  const [tempPasswordModal, setTempPasswordModal] = useState<{ username: string; pass: string } | null>(null);

  // Role Edit Modal
  const [roleModalUser, setRoleModalUser] = useState<User | null>(null);
  const [selectedNewRole, setSelectedNewRole] = useState<RoleCode>('CASHIER');

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

  // --- BRANCH ACTIONS ---
  const handleOpenCreateBranch = () => {
    setEditingBranch(null);
    setBranchName('');
    setBranchCode('');
    setBranchAddress('');
    setBranchInitialCash('1500000');
    setBranchModalOpen(true);
  };

  const handleOpenEditBranch = (b: Branch) => {
    setEditingBranch(b);
    setBranchName(b.name);
    setBranchCode(b.code);
    setBranchAddress(b.address);
    setBranchInitialCash(b.initial_cash.toString());
    setBranchModalOpen(true);
  };

  const handleSaveBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const cash = BigInt(branchInitialCash.replace(/\D/g, '') || '0');
      if (editingBranch) {
        await adminService.updateBranch(editingBranch.id, {
          name: branchName,
          address: branchAddress,
          initial_cash: cash,
        });
        showToast({ type: 'success', message: 'Cập nhật chi nhánh thành công!' });
      } else {
        await adminService.createBranch(branchName, branchCode, branchAddress, cash);
        showToast({ type: 'success', message: 'Tạo chi nhánh mới thành công!' });
      }
      setBranchModalOpen(false);
    } catch (err: any) {
      showToast({ type: 'error', message: err?.message || 'Lỗi thao tác chi nhánh' });
    }
  };

  const handleToggleBranchActive = async (b: Branch) => {
    try {
      await adminService.toggleBranchActive(b.id);
      showToast({
        type: 'info',
        message: `Đã ${b.is_active ? 'ngưng hoạt động' : 'kích hoạt lại'} chi nhánh ${b.name}`,
      });
    } catch (err: any) {
      showToast({ type: 'error', message: err?.message || 'Không thể đổi trạng thái chi nhánh' });
    }
  };

  // --- TABLE ACTIONS ---
  const handleOpenCreateTable = () => {
    setEditingTable(null);
    setTableName(`Bàn ${tables.length + 1}`);
    setTableArea('Tầng 1');
    setTableSeats('4');
    setTableModalOpen(true);
  };

  const handleOpenEditTable = (t: DiningTable) => {
    setEditingTable(t);
    setTableName(t.name);
    setTableArea(t.area);
    setTableSeats(t.seat_count.toString());
    setTableModalOpen(true);
  };

  const handleSaveTable = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const seats = parseInt(tableSeats, 10) || 4;
      if (editingTable) {
        await adminService.updateTable(editingTable.id, {
          name: tableName,
          area: tableArea,
          seat_count: seats,
        });
        showToast({ type: 'success', message: 'Cập nhật thông tin bàn thành công!' });
      } else {
        await adminService.createTable(selectedBranchId, tableName, tableArea, seats);
        showToast({ type: 'success', message: 'Thêm bàn mới thành công!' });
      }
      setTableModalOpen(false);
    } catch (err: any) {
      showToast({ type: 'error', message: err?.message || 'Lỗi thao tác bàn' });
    }
  };

  const handleToggleTableActive = async (t: DiningTable) => {
    try {
      await adminService.toggleTableActive(t.id);
      showToast({
        type: 'info',
        message: `Đã ${t.is_active ? 'ngưng sử dụng' : 'mở dùng lại'} bàn ${t.name}`,
      });
    } catch (err: any) {
      showToast({ type: 'error', message: err?.message || 'Không thể đổi trạng thái bàn' });
    }
  };

  // --- STAFF ACTIONS ---
  const handleOpenCreateStaff = () => {
    setStaffUsername('');
    setStaffFullName('');
    setStaffRole('CASHIER');
    setStaffBranchId(selectedBranchId || branches[0]?.id || '');
    setStaffModalOpen(true);
  };

  const handleSaveStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await adminService.createStaffUser(
        staffBranchId,
        staffUsername,
        staffFullName,
        staffRole
      );
      setStaffModalOpen(false);
      setTempPasswordModal({
        username: result.user.username,
        pass: result.tempPassword,
      });
      showToast({ type: 'success', message: 'Tạo tài khoản nhân viên thành công!' });
    } catch (err: any) {
      showToast({ type: 'error', message: err?.message || 'Lỗi tạo nhân viên' });
    }
  };

  const handleToggleStaffActive = async (userToToggle: User) => {
    try {
      await adminService.toggleUserActive(userToToggle.id);
      showToast({
        type: 'info',
        message: `Đã ${userToToggle.is_active ? 'khóa' : 'mở khóa'} tài khoản ${userToToggle.full_name}`,
      });
    } catch (err: any) {
      showToast({ type: 'error', message: err?.message || 'Không thể đổi trạng thái tài khoản' });
    }
  };

  const handleResetPassword = async (targetUser: User) => {
    try {
      const result = await adminService.resetUserPassword(targetUser.id);
      setTempPasswordModal({
        username: result.user.username,
        pass: result.tempPassword,
      });
      showToast({ type: 'success', message: `Đã tạo mật khẩu tạm cho ${targetUser.full_name}` });
    } catch (err: any) {
      showToast({ type: 'error', message: err?.message || 'Lỗi đặt lại mật khẩu' });
    }
  };

  const handleSaveRoleChange = async () => {
    if (!roleModalUser) return;
    try {
      await adminService.updateUserRole(roleModalUser.id, selectedNewRole);
      showToast({ type: 'success', message: `Đã đổi vai trò của ${roleModalUser.full_name}` });
      setRoleModalUser(null);
    } catch (err: any) {
      showToast({ type: 'error', message: err?.message || 'Lỗi đổi vai trò' });
    }
  };

  // --- TABLE COLUMNS ---
  const branchColumns: Column<Branch>[] = [
    { key: 'code', header: 'Mã', render: (b) => <strong>{b.code}</strong> },
    { key: 'name', header: 'Tên chi nhánh', render: (b) => <span style={{ fontWeight: 600 }}>{b.name}</span> },
    { key: 'address', header: 'Địa chỉ', render: (b) => <span>{b.address || '—'}</span> },
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
    {
      key: 'actions',
      header: 'Thao tác',
      align: 'right',
      render: (b) => (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
          <Button
            variant="text"
            size="sm"
            style={{ height: 32, padding: '0 8px' }}
            icon={<Edit2 size={14} />}
            onClick={() => handleOpenEditBranch(b)}
          >
            Sửa
          </Button>
          <Button
            variant="text"
            size="sm"
            style={{ height: 32, padding: '0 8px', color: b.is_active ? 'var(--color-danger)' : 'var(--color-success)' }}
            icon={<Power size={14} />}
            onClick={() => handleToggleBranchActive(b)}
          >
            {b.is_active ? 'Ngưng' : 'Mở lại'}
          </Button>
        </div>
      ),
    },
  ];

  const tableColumns: Column<DiningTable>[] = [
    { key: 'name', header: 'Tên bàn', render: (t) => <strong>{t.name}</strong> },
    { key: 'area', header: 'Khu vực', render: (t) => <span>{t.area}</span> },
    { key: 'seats', header: 'Số chỗ', align: 'center', render: (t) => <span>{t.seat_count} chỗ</span> },
    {
      key: 'occupancy',
      header: 'Tình trạng phục vụ',
      render: (t) => {
        const occupied = adminService.isTableOccupied(t.id);
        return (
          <Badge variant={occupied ? 'danger' : 'success'} size="sm">
            {occupied ? 'Có khách' : 'Trống'}
          </Badge>
        );
      },
    },
    {
      key: 'status',
      header: 'Trạng thái sử dụng',
      render: (t) => (
        <Badge variant={t.is_active ? 'neutral' : 'warning'} size="sm">
          {t.is_active ? 'Còn dùng' : 'Ngưng dùng'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Thao tác',
      align: 'right',
      render: (t) => (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
          <Button
            variant="text"
            size="sm"
            style={{ height: 32, padding: '0 8px' }}
            icon={<Edit2 size={14} />}
            onClick={() => handleOpenEditTable(t)}
          >
            Sửa
          </Button>
          <Button
            variant="text"
            size="sm"
            style={{ height: 32, padding: '0 8px', color: t.is_active ? 'var(--color-danger)' : 'var(--color-success)' }}
            icon={<Power size={14} />}
            onClick={() => handleToggleTableActive(t)}
          >
            {t.is_active ? 'Ngưng dùng' : 'Dùng lại'}
          </Button>
        </div>
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
        <Badge
          variant={
            u.role_code === 'OWNER'
              ? 'warning'
              : u.role_code === 'MANAGER'
              ? 'info'
              : 'neutral'
          }
          size="sm"
        >
          {u.role_code === 'OWNER'
            ? 'Chủ cửa hàng'
            : u.role_code === 'MANAGER'
            ? 'Quản lý'
            : 'Thu ngân'}
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
        const isSelf = u.id === currentUser.id;
        const isOwnerAccount = u.role_code === 'OWNER';

        return (
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
            {!isOwnerAccount && (
              <Button
                variant="text"
                size="sm"
                style={{ height: 32, padding: '0 8px' }}
                icon={<Edit2 size={13} />}
                onClick={() => {
                  setRoleModalUser(u);
                  setSelectedNewRole(u.role_code);
                }}
              >
                Đổi vai trò
              </Button>
            )}
            <Button
              variant="text"
              size="sm"
              style={{ height: 32, padding: '0 8px' }}
              icon={<RotateCcw size={13} />}
              onClick={() => handleResetPassword(u)}
            >
              Mật khẩu tạm
            </Button>
            {!isOwnerAccount && !isSelf && (
              <Button
                variant="text"
                size="sm"
                style={{
                  height: 32,
                  padding: '0 8px',
                  color: u.is_active ? 'var(--color-danger)' : 'var(--color-success)',
                }}
                icon={u.is_active ? <Lock size={13} /> : <KeyRound size={13} />}
                onClick={() => handleToggleStaffActive(u)}
              >
                {u.is_active ? 'Khóa' : 'Mở khóa'}
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div style={{ flex: 1, padding: 24, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-text)' }}>
            Cài đặt Cửa hàng & Chi nhánh
          </h1>
          <p style={{ fontSize: 14, color: 'var(--color-text-muted)', marginTop: 4 }}>
            Quản lý chi nhánh, danh sách bàn ăn và phân quyền nhân sự
          </p>
        </div>

        {/* Action Button based on Tab */}
        <div>
          {activeTab === 'branches' && (
            <Button variant="primary" icon={<Plus size={16} />} onClick={handleOpenCreateBranch}>
              Thêm chi nhánh
            </Button>
          )}
          {activeTab === 'tables' && (
            <Button variant="primary" icon={<Plus size={16} />} onClick={handleOpenCreateTable}>
              Thêm bàn ăn
            </Button>
          )}
          {activeTab === 'staff' && (
            <Button variant="primary" icon={<Plus size={16} />} onClick={handleOpenCreateStaff}>
              Thêm nhân viên
            </Button>
          )}
        </div>
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
                fontSize: 14,
                fontWeight: 600,
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
            Nhân viên nghỉ việc thì khóa tài khoản, không xóa để bảo toàn dữ liệu ca và hóa đơn tham chiếu.
          </div>
          <DataTable columns={staffColumns} data={staff} keyExtractor={(u) => u.id} />
        </div>
      )}

      {/* Dialog Thêm/Sửa Chi nhánh */}
      <Dialog
        isOpen={branchModalOpen}
        onClose={() => setBranchModalOpen(false)}
        title={editingBranch ? 'Chỉnh sửa thông tin chi nhánh' : 'Thêm chi nhánh mới'}
        maxWidth={460}
      >
        <form onSubmit={handleSaveBranch} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Field
            label="Tên chi nhánh"
            placeholder="VD: Chi nhánh Nam Lý"
            value={branchName}
            onChange={(e) => setBranchName(e.target.value)}
            required
          />
          {!editingBranch && (
            <Field
              label="Mã chi nhánh (viết hoa không dấu, ví dụ: NL, DH)"
              placeholder="VD: NL"
              value={branchCode}
              onChange={(e) => setBranchCode(e.target.value.toUpperCase())}
              required
            />
          )}
          <Field
            label="Địa chỉ chi nhánh"
            placeholder="VD: 123 Lý Thường Kiệt, Đồng Hới"
            value={branchAddress}
            onChange={(e) => setBranchAddress(e.target.value)}
          />
          <Field
            label="Quỹ két ban đầu (VND)"
            placeholder="1500000"
            value={branchInitialCash}
            onChange={(e) => setBranchInitialCash(e.target.value)}
            required
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 6 }}>
            <Button variant="secondary" onClick={() => setBranchModalOpen(false)}>
              Hủy
            </Button>
            <Button variant="primary" type="submit">
              {editingBranch ? 'Lưu thay đổi' : 'Tạo chi nhánh'}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Dialog Thêm/Sửa Bàn */}
      <Dialog
        isOpen={tableModalOpen}
        onClose={() => setTableModalOpen(false)}
        title={editingTable ? 'Chỉnh sửa bàn ăn' : 'Thêm bàn ăn mới'}
        maxWidth={420}
      >
        <form onSubmit={handleSaveTable} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Field
            label="Tên bàn"
            placeholder="VD: Bàn 5"
            value={tableName}
            onChange={(e) => setTableName(e.target.value)}
            required
          />
          <Field
            label="Khu vực / Tầng"
            placeholder="VD: Tầng 1, Sân vườn, Ban công"
            value={tableArea}
            onChange={(e) => setTableArea(e.target.value)}
            required
          />
          <Field
            label="Số chỗ ngồi"
            type="number"
            min={1}
            max={50}
            value={tableSeats}
            onChange={(e) => setTableSeats(e.target.value)}
            required
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 6 }}>
            <Button variant="secondary" onClick={() => setTableModalOpen(false)}>
              Hủy
            </Button>
            <Button variant="primary" type="submit">
              {editingTable ? 'Lưu thay đổi' : 'Tạo bàn'}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Dialog Thêm Nhân viên */}
      <Dialog
        isOpen={staffModalOpen}
        onClose={() => setStaffModalOpen(false)}
        title="Thêm tài khoản nhân viên"
        maxWidth={460}
      >
        <form onSubmit={handleSaveStaff} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label
              htmlFor="staff-branch-select"
              style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-muted)', display: 'block', marginBottom: 6, cursor: 'pointer' }}
            >
              Thuộc chi nhánh
            </label>
            <select
              id="staff-branch-select"
              value={staffBranchId}
              onChange={(e) => setStaffBranchId(e.target.value)}
              style={{
                height: 48,
                width: '100%',
                padding: '0 14px',
                borderRadius: 'var(--radius-control)',
                border: '1px solid var(--color-border-control)',
                background: 'var(--color-surface)',
                color: 'var(--color-text)',
                fontSize: 14,
              }}
            >
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <Field
            label="Tên đăng nhập (username duy nhất)"
            placeholder="VD: hoa_cashier"
            value={staffUsername}
            onChange={(e) => setStaffUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
            required
          />

          <Field
            label="Họ và tên nhân viên"
            placeholder="VD: Nguyễn Thị Hoa"
            value={staffFullName}
            onChange={(e) => setStaffFullName(e.target.value)}
            required
          />

          <div>
            <label
              htmlFor="staff-role-select"
              style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-muted)', display: 'block', marginBottom: 6, cursor: 'pointer' }}
            >
              Vai trò (Role)
            </label>
            <select
              id="staff-role-select"
              value={staffRole}
              onChange={(e) => setStaffRole(e.target.value as 'MANAGER' | 'CASHIER')}
              style={{
                height: 48,
                width: '100%',
                padding: '0 14px',
                borderRadius: 'var(--radius-control)',
                border: '1px solid var(--color-border-control)',
                background: 'var(--color-surface)',
                color: 'var(--color-text)',
                fontSize: 14,
              }}
            >
              <option value="CASHIER">Thu ngân (CASHIER)</option>
              <option value="MANAGER">Quản lý chi nhánh (MANAGER)</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 6 }}>
            <Button variant="secondary" onClick={() => setStaffModalOpen(false)}>
              Hủy
            </Button>
            <Button variant="primary" type="submit">
              Xác nhận tạo
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Dialog Đổi Vai Trò */}
      <Dialog
        isOpen={!!roleModalUser}
        onClose={() => setRoleModalUser(null)}
        title={`Đổi vai trò: ${roleModalUser?.full_name}`}
        maxWidth={420}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <label
            htmlFor="role-change-select"
            style={{ fontSize: 14, color: 'var(--color-text-muted)', display: 'block', cursor: 'pointer' }}
          >
            Chọn vai trò mới cho tài khoản <strong>{roleModalUser?.username}</strong>:
          </label>
          <select
            id="role-change-select"
            value={selectedNewRole}
            onChange={(e) => setSelectedNewRole(e.target.value as RoleCode)}
            style={{
              height: 48,
              padding: '0 14px',
              borderRadius: 'var(--radius-control)',
              border: '1px solid var(--color-border-control)',
              background: 'var(--color-surface)',
              color: 'var(--color-text)',
              fontSize: 15,
              fontWeight: 600,
            }}
          >
            <option value="CASHIER">Thu ngân (CASHIER)</option>
            <option value="MANAGER">Quản lý chi nhánh (MANAGER)</option>
            <option value="OWNER">Chủ cửa hàng (OWNER)</option>
          </select>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <Button variant="secondary" onClick={() => setRoleModalUser(null)}>
              Hủy
            </Button>
            <Button variant="primary" onClick={handleSaveRoleChange}>
              Lưu vai trò
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Modal Mật khẩu tạm 1 lần (BR-84) */}
      <Dialog
        isOpen={!!tempPasswordModal}
        onClose={() => setTempPasswordModal(null)}
        title="Mật khẩu khởi tạo tạm thời"
        maxWidth={440}
        footer={
          <Button variant="primary" onClick={() => setTempPasswordModal(null)}>
            Đã lưu lại thông tin
          </Button>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center', textAlign: 'center' }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              background: 'var(--color-success-bg, #ECFDF5)',
              color: 'var(--color-success, #059669)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CheckCircle2 size={28} />
          </div>

          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text)' }}>
              Cấp mật khẩu thành công
            </h3>
            <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 4 }}>
              Nhân viên <strong>{tempPasswordModal?.username}</strong> bắt buộc phải đổi mật khẩu ở lần đăng nhập đầu tiên.
            </p>
          </div>

          <div
            style={{
              width: '100%',
              padding: 16,
              background: 'var(--color-bg)',
              borderRadius: 'var(--radius-control)',
              border: '1px dashed var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 11, color: 'var(--color-text-muted)', fontWeight: 600 }}>MẬT KHẨU TẠM THỜI</div>
              <div className="num" style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-brand-600)', letterSpacing: '0.05em' }}>
                {tempPasswordModal?.pass}
              </div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              icon={<Copy size={14} />}
              onClick={() => {
                navigator.clipboard?.writeText(tempPasswordModal?.pass || '');
                showToast({ type: 'success', message: 'Đã sao chép mật khẩu vào bộ nhớ tạm' });
              }}
            >
              Sao chép
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};
