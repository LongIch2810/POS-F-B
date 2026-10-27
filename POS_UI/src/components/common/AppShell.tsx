// POS-F&B AppShell per DESIGN.md §5.1

import React, { ReactNode, useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { MockEngine } from '../../mock/mockEngine';
import { shiftService } from '../../services/shiftService';
import { formatDuration } from '../../utils/formatters';
import { Badge } from '../ui/Badge';
import {
  ShoppingBag,
  LayoutGrid,
  Receipt,
  Clock,
  Boxes,
  BarChart3,
  Settings,
  Building2,
  Users2,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react';

export type NavTab =
  | 'pos'
  | 'tables'
  | 'invoices'
  | 'shifts'
  | 'inventory'
  | 'reports'
  | 'products'
  | 'settings'
  | 'platform_stores'
  | 'platform_permissions';

interface AppShellProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  children: ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ currentTab, onSelectTab, children }) => {
  const { session } = useAuth();
  const user = session.user;
  const isPlatformAdmin = user.role_code === 'PLATFORM_ADMIN';
  const isOwner = user.role_code === 'OWNER';

  const [activeShiftDuration, setActiveShiftDuration] = useState<string>('');
  const [accessibleBranches, setAccessibleBranches] = useState(() => MockEngine.getAccessibleBranches());
  const [selectedBranchId, setSelectedBranchId] = useState(() => MockEngine.getEffectiveBranchId());
  const [branchDropdownOpen, setBranchDropdownOpen] = useState(false);

  // Cập nhật thông tin ca làm việc
  useEffect(() => {
    const updateShiftTime = () => {
      const shift = shiftService.getMyActiveShift();
      if (shift && shift.status === 'OPEN') {
        setActiveShiftDuration(formatDuration(shift.started_at));
      } else {
        setActiveShiftDuration('');
      }
      setAccessibleBranches(MockEngine.getAccessibleBranches());
      setSelectedBranchId(MockEngine.getEffectiveBranchId());
    };

    updateShiftTime();
    const timer = setInterval(updateShiftTime, 30000); // 30s update
    return () => clearInterval(timer);
  }, [user]);

  const myShift = shiftService.getMyActiveShift();
  const hasOpenShift = myShift && myShift.status === 'OPEN';

  // Danh sách Navigation Items theo quyền
  const navItems = isPlatformAdmin
    ? [
        { id: 'platform_stores' as NavTab, label: 'Cửa hàng', icon: <Building2 size={24} /> },
        { id: 'platform_permissions' as NavTab, label: 'Quyền', icon: <ShieldCheck size={24} /> },
      ]
    : [
        { id: 'pos' as NavTab, label: 'Bán hàng', icon: <ShoppingBag size={24} /> },
        { id: 'tables' as NavTab, label: 'Bàn', icon: <LayoutGrid size={24} /> },
        { id: 'invoices' as NavTab, label: 'Hóa đơn', icon: <Receipt size={24} /> },
        { id: 'shifts' as NavTab, label: 'Ca làm', icon: <Clock size={24} /> },
        { id: 'products' as NavTab, label: 'Thực đơn', icon: <Users2 size={24} /> },
        { id: 'inventory' as NavTab, label: 'Kho', icon: <Boxes size={24} /> },
        { id: 'reports' as NavTab, label: 'Báo cáo', icon: <BarChart3 size={24} /> },
        ...(isOwner || user.role_code === 'MANAGER'
          ? [{ id: 'settings' as NavTab, label: 'Cài đặt', icon: <Settings size={24} /> }]
          : []),
      ];

  const currentBranchName =
    accessibleBranches.find((b) => b.id === selectedBranchId)?.name || session.branch_name || 'Chi nhánh';

  return (
    <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
      {/* Rail bên trái (80px) per DESIGN.md §5.1 */}
      <nav
        aria-label="Điều hướng chính"
        style={{
          width: 80,
          background: 'var(--color-brand-800)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '16px 0',
          gap: 8,
          flexShrink: 0,
          userSelect: 'none',
        }}
      >
        {/* Logo / Biểu tượng thương hiệu Phin Cà Phê Việt Nam */}
        <div
          title={isPlatformAdmin ? 'Quản trị Nền tảng' : 'Hệ thống Cà phê F&B'}
          style={{
            height: 52,
            width: 52,
            borderRadius: 'var(--radius-tile)',
            background: 'var(--color-brand-700)',
            border: '1px solid var(--color-brand-500)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 12,
            boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
          }}
        >
          {isPlatformAdmin ? (
            <ShieldCheck size={28} color="#f8f0e9" />
          ) : (
            <svg
              width="30"
              height="30"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-label="Logo Phin Cà Phê"
            >
              {/* Núm nắp phin */}
              <circle cx="16" cy="5" r="1.8" fill="#f1e4d9" />
              {/* Nắp phin */}
              <path d="M9 8.5C9 7.8 10 7.2 16 7.2C22 7.2 23 7.8 23 8.5L22 10.5H10L9 8.5Z" fill="#f1e4d9" />
              {/* Thân phin */}
              <path d="M10 11H22L20.8 19.5H11.2L10 11Z" fill="#f8f0e9" opacity="0.95" />
              {/* Đĩa lọc / đĩa đáy phin */}
              <rect x="7" y="19.5" width="18" height="2" rx="1" fill="#f1e4d9" />
              {/* Cốc hứng cà phê */}
              <path d="M11.5 22.5H20.5L19.5 28C19.5 29 18.5 29.5 16 29.5C13.5 29.5 12.5 29 12.5 28L11.5 22.5Z" stroke="#f1e4d9" strokeWidth="1.5" strokeLinecap="round" />
              {/* Giọt cà phê */}
              <circle cx="16" cy="25" r="1.2" fill="#e2cbbe" />
            </svg>
          )}
        </div>

        {/* Các mục điều hướng */}
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              className="touch-press"
              style={{
                width: 68,
                height: 64,
                borderRadius: 'var(--radius-control)',
                background: isActive ? 'var(--color-brand-600)' : 'transparent',
                color: isActive ? '#FFFFFF' : 'var(--color-brand-100)',
                border: isActive ? '1px solid var(--color-brand-500)' : '1px solid transparent',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
                cursor: 'pointer',
                position: 'relative',
              }}
            >
              <div>{item.icon}</div>
              <span style={{ fontSize: 11, fontWeight: isActive ? 600 : 500, letterSpacing: '0.2px' }}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Main Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Topbar (56px) per DESIGN.md §5.1 */}
        <header
          style={{
            height: 56,
            background: 'var(--color-surface)',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 24px',
            flexShrink: 0,
            zIndex: 10,
          }}
        >
          {/* Bên trái: Chi nhánh */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {isPlatformAdmin ? (
              <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text)' }}>
                Nền tảng Quản trị Hệ thống
              </span>
            ) : isOwner ? (
              /* Chủ cửa hàng có dropdown đổi chi nhánh */
              <div style={{ position: 'relative' }}>
                <button
                  type="button"
                  onClick={() => setBranchDropdownOpen(!branchDropdownOpen)}
                  style={{
                    height: 40,
                    padding: '0 12px',
                    borderRadius: 'var(--radius-control)',
                    border: '1px solid var(--color-border-control)',
                    background: 'var(--color-surface)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    cursor: 'pointer',
                    fontSize: 15,
                    fontWeight: 600,
                    color: 'var(--color-text)',
                  }}
                >
                  <span>{currentBranchName}</span>
                  <ChevronDown size={16} />
                </button>

                {branchDropdownOpen && (
                  <>
                    <div
                      onClick={() => setBranchDropdownOpen(false)}
                      style={{ position: 'fixed', inset: 0, zIndex: 100 }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        top: 46,
                        left: 0,
                        width: 240,
                        background: 'var(--color-surface)',
                        borderRadius: 'var(--radius-control)',
                        boxShadow: 'var(--shadow-overlay)',
                        border: '1px solid var(--color-border)',
                        padding: '6px 0',
                        zIndex: 101,
                      }}
                    >
                      <div style={{ padding: '6px 12px', fontSize: 11, color: 'var(--color-text-muted)', fontWeight: 600 }}>
                        CHỌN CHI NHÁNH LÀM VIỆC
                      </div>
                      {accessibleBranches.map((b) => (
                        <div
                          key={b.id}
                          onClick={() => {
                            MockEngine.setSelectedBranch(b.id);
                            setSelectedBranchId(b.id);
                            setBranchDropdownOpen(false);
                          }}
                          style={{
                            padding: '10px 16px',
                            cursor: 'pointer',
                            fontSize: 14,
                            fontWeight: b.id === selectedBranchId ? 600 : 400,
                            color: b.id === selectedBranchId ? 'var(--color-brand-600)' : 'var(--color-text)',
                            background: b.id === selectedBranchId ? 'var(--color-brand-50)' : 'transparent',
                          }}
                        >
                          {b.name}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ) : (
              /* Nhân viên/Quản lý chỉ xem tên chi nhánh của mình */
              <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text)' }}>
                {currentBranchName}
              </span>
            )}

            {session.store_name && !isPlatformAdmin && (
              <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
                &bull; {session.store_name}
              </span>
            )}
          </div>

          {/* Ở giữa: Chip trạng thái ca làm việc */}
          {!isPlatformAdmin && (
            <div>
              {hasOpenShift ? (
                <Badge variant="success" size="md">
                  <span
                    className="pulse-dot"
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: 'var(--color-success)',
                      display: 'inline-block',
                      marginRight: 6,
                    }}
                  />
                  Ca thu ngân đang mở ({activeShiftDuration})
                </Badge>
              ) : (
                <Badge variant="warning" size="md">
                  Chưa mở ca thu ngân
                </Badge>
              )}
            </div>
          )}

          {/* Bên phải: Tên người dùng & vai trò */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)' }}>
                {user.full_name}
              </div>
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                {user.role_code}
              </div>
            </div>
          </div>
        </header>

        {/* Nội dung trang */}
        <main style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
          {children}
        </main>
      </div>
    </div>
  );
};
