// POS-F&B Authentication Login Screen per DESIGN.md, WCAG 2.1 AA & taste-skill app screens
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { DEMO_ACCOUNTS } from '../../services/authService';
import {
  Coffee,
  ShieldCheck,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  AlertCircle,
  Info,
  Store,
  Boxes,
  Clock,
  ArrowRight,
} from 'lucide-react';

export const LoginScreen: React.FC = () => {
  const { login, switchUser } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ username?: string; password?: string }>({});
  const [generalError, setGeneralError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError('');
    const errors: { username?: string; password?: string } = {};

    if (!username.trim()) {
      errors.username = 'Vui lòng nhập tên đăng nhập';
    }
    if (!password.trim()) {
      errors.password = 'Vui lòng nhập mật khẩu';
    }

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }

    setIsLoading(true);
    try {
      await login(username.trim(), password);
    } catch (err: any) {
      setGeneralError(err?.message || 'Tên đăng nhập hoặc mật khẩu không chính xác');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectDemo = async (userId: string) => {
    setGeneralError('');
    setFieldErrors({});
    setIsLoading(true);
    try {
      await switchUser(userId);
    } catch (err: any) {
      setGeneralError(err?.message || 'Lỗi đăng nhập tài khoản mẫu');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        height: '100vh',
        maxHeight: '100vh',
        width: '100vw',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(ellipse at 50% 25%, #2E1A11 0%, #170C07 100%)',
        padding: '16px 24px',
        boxSizing: 'border-box',
        position: 'relative',
      }}
    >
      {/* Decorative ambient coffee steam ring */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          width: 600,
          height: 600,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(199, 107, 34, 0.08) 0%, rgba(0, 0, 0, 0) 70%)',
          pointerEvents: 'none',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      />

      <div
        className="login-stage-grid"
        style={{
          width: '100%',
          maxWidth: 1240,
          display: 'grid',
          gridTemplateColumns: 'minmax(280px, 1fr) minmax(360px, 1.15fr) minmax(310px, 1.05fr)',
          gap: 20,
          alignItems: 'stretch',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* ===================== CỘT TRÁI: THƯƠNG HIỆU & GIỚI THIỆU POS F&B ===================== */}
        <div
          className="login-brand-panel"
          style={{
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.09)',
            borderRadius: 16,
            padding: '24px 22px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            backdropFilter: 'blur(10px)',
            color: '#FFFFFF',
          }}
        >
          {/* Brand header */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 12,
                  background: 'var(--color-brand-600, #C76B22)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 18px rgba(199, 107, 34, 0.35)',
                  flexShrink: 0,
                }}
              >
                <Coffee size={24} />
              </div>
              <div>
                <h1 style={{ fontSize: 18, fontWeight: 700, color: '#FFFFFF', margin: 0, lineHeight: '22px' }}>
                  POS & Kho F&B
                </h1>
                <p style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.65)', margin: '2px 0 0 0' }}>
                  Cà phê • Trà sữa • Quán ăn
                </p>
              </div>
            </div>

            <p style={{ fontSize: 13, color: 'rgba(255, 255, 255, 0.8)', lineHeight: '19px', margin: '0 0 18px 0' }}>
              Hệ thống bán hàng tại quầy và quản trị tồn kho đa chi nhánh theo thời gian thực.
            </p>

            {/* 3 Core Highlights */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                  padding: '10px 12px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: 10,
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: 'rgba(199, 107, 34, 0.2)',
                    color: '#FDBA74',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Store size={17} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#F3F4F6' }}>Bán hàng cảm ứng tại quầy</div>
                  <div style={{ fontSize: 11, color: 'rgba(255, 255, 255, 0.6)', marginTop: 2, lineHeight: '15px' }}>
                    Tối ưu tablet ngang, thêm món & ghi đơn dưới 2 chạm, sơ đồ bàn trực quan.
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                  padding: '10px 12px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: 10,
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: 'rgba(59, 130, 246, 0.2)',
                    color: '#93C5FD',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Clock size={17} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#F3F4F6' }}>Đối soát ca đếm mù</div>
                  <div style={{ fontSize: 11, color: 'rgba(255, 255, 255, 0.6)', marginTop: 2, lineHeight: '15px' }}>
                    Mỗi chi nhánh 1 ca mở, bàn giao tiền mặt đếm mù (Blind drop) chống thất thoát.
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                  padding: '10px 12px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: 10,
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: 'rgba(34, 197, 94, 0.2)',
                    color: '#86EFAC',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Boxes size={17} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#F3F4F6' }}>Định mức trừ kho tự động</div>
                  <div style={{ fontSize: 11, color: 'rgba(255, 255, 255, 0.6)', marginTop: 2, lineHeight: '15px' }}>
                    Trừ nguyên vật liệu theo công thức từng ly nước, cảnh báo tồn ngưỡng an toàn.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer badge */}
          <div
            style={{
              paddingTop: 14,
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: 11,
              color: 'rgba(255, 255, 255, 0.5)',
            }}
          >
            <span>Bản quyền © Chuỗi F&B</span>
            <span>Múi giờ Asia/Ho_Chi_Minh</span>
          </div>
        </div>

        {/* ===================== CỘT GIỮA: FORM ĐĂNG NHẬP CHÍNH ===================== */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: 16,
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            padding: '28px 28px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          {/* Header of Form */}
          <div style={{ marginBottom: 20 }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                background: 'var(--color-brand-50, #F8F0E9)',
                color: 'var(--color-brand-600, #7A4A2B)',
                padding: '3px 9px',
                borderRadius: 9999,
                fontSize: 11,
                fontWeight: 700,
                marginBottom: 8,
              }}
            >
              <ShieldCheck size={13} />
              <span>Cổng đăng nhập an toàn</span>
            </div>
            <h2 style={{ fontSize: 21, fontWeight: 700, color: '#111827', margin: 0 }}>
              Đăng nhập tài khoản
            </h2>
            <p style={{ fontSize: 13, color: '#6B7280', margin: '4px 0 0 0' }}>
              Nhập tên đăng nhập và mật khẩu được cấp bởi cửa hàng
            </p>
          </div>

          {/* General Error notification */}
          {generalError && (
            <div
              role="alert"
              style={{
                background: 'var(--color-danger-bg, #FEF2F2)',
                border: '1px solid var(--color-danger-border, #FCA5A5)',
                borderRadius: 8,
                padding: '10px 12px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 8,
                marginBottom: 16,
                fontSize: 12,
                color: 'var(--color-danger, #DC2626)',
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
              <span>{generalError}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label
                htmlFor="login-username"
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#374151',
                  display: 'block',
                  marginBottom: 5,
                }}
              >
                Tên đăng nhập <span style={{ color: 'var(--color-danger)' }}>*</span>
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <UserIcon
                  size={18}
                  style={{
                    position: 'absolute',
                    left: 14,
                    color: fieldErrors.username ? 'var(--color-danger)' : '#9CA3AF',
                    pointerEvents: 'none',
                  }}
                />
                <input
                  id="login-username"
                  type="text"
                  autoComplete="username"
                  value={username}
                  aria-invalid={!!fieldErrors.username}
                  aria-describedby={fieldErrors.username ? 'username-error' : undefined}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (fieldErrors.username) setFieldErrors((prev) => ({ ...prev, username: undefined }));
                  }}
                  placeholder="Nhập tên đăng nhập..."
                  style={{
                    height: 46,
                    width: '100%',
                    paddingLeft: 42,
                    paddingRight: 14,
                    borderRadius: 10,
                    border: `1.5px solid ${fieldErrors.username ? 'var(--color-danger)' : '#D1D5DB'}`,
                    fontSize: 14,
                    color: '#111827',
                    background: fieldErrors.username ? 'var(--color-danger-bg, #FEF2F2)' : '#F9FAFB',
                    outline: 'none',
                    transition: 'border-color 150ms ease',
                  }}
                />
              </div>
              {fieldErrors.username && (
                <div
                  id="username-error"
                  role="alert"
                  style={{ fontSize: 11, color: 'var(--color-danger)', marginTop: 4, fontWeight: 500 }}
                >
                  {fieldErrors.username}
                </div>
              )}
            </div>

            <div>
              <label
                htmlFor="login-password"
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#374151',
                  display: 'block',
                  marginBottom: 5,
                }}
              >
                Mật khẩu <span style={{ color: 'var(--color-danger)' }}>*</span>
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Lock
                  size={18}
                  style={{
                    position: 'absolute',
                    left: 14,
                    color: fieldErrors.password ? 'var(--color-danger)' : '#9CA3AF',
                    pointerEvents: 'none',
                  }}
                />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  aria-invalid={!!fieldErrors.password}
                  aria-describedby={fieldErrors.password ? 'password-error' : undefined}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: undefined }));
                  }}
                  placeholder="Nhập mật khẩu..."
                  style={{
                    height: 46,
                    width: '100%',
                    paddingLeft: 42,
                    paddingRight: 46,
                    borderRadius: 10,
                    border: `1.5px solid ${fieldErrors.password ? 'var(--color-danger)' : '#D1D5DB'}`,
                    fontSize: 14,
                    color: '#111827',
                    background: fieldErrors.password ? 'var(--color-danger-bg, #FEF2F2)' : '#F9FAFB',
                    outline: 'none',
                    transition: 'border-color 150ms ease',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  className="touch-press"
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: 0,
                    bottom: 0,
                    width: 46,
                    height: 46,
                    background: 'transparent',
                    border: 'none',
                    borderRadius: '0 10px 10px 0',
                    color: '#6B7280',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    outline: 'none',
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {fieldErrors.password && (
                <div
                  id="password-error"
                  role="alert"
                  style={{ fontSize: 11, color: 'var(--color-danger)', marginTop: 4, fontWeight: 500 }}
                >
                  {fieldErrors.password}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="touch-press"
              style={{
                height: 48,
                borderRadius: 10,
                background: 'var(--color-brand-600, #C76B22)',
                color: '#FFFFFF',
                fontSize: 14,
                fontWeight: 700,
                border: 'none',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                boxShadow: '0 4px 12px rgba(199, 107, 34, 0.25)',
                transition: 'background-color 150ms ease',
                marginTop: 6,
              }}
            >
              <ShieldCheck size={18} />
              <span>{isLoading ? 'Đang xác thực...' : 'Đăng nhập hệ thống'}</span>
            </button>
          </form>

          {/* Security note per BR-02 */}
          <div
            style={{
              marginTop: 18,
              paddingTop: 12,
              borderTop: '1px solid #F3F4F6',
              fontSize: 11,
              color: '#9CA3AF',
              lineHeight: '16px',
            }}
          >
            Mật khẩu mã hóa bảo mật. Tài khoản mới bắt buộc đổi mật khẩu ở lần đăng nhập đầu tiên (BR-02).
          </div>
        </div>

        {/* ===================== CỘT PHẢI: TRUY CẬP NHANH TÀI KHOẢN MẪU (DEMO) ===================== */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.09)',
            borderRadius: 16,
            padding: '20px 18px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            backdropFilter: 'blur(10px)',
            color: '#FFFFFF',
          }}
        >
          {/* Header */}
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                background: 'rgba(251, 191, 36, 0.15)',
                border: '1px solid rgba(251, 191, 36, 0.3)',
                color: '#FCD34D',
                padding: '3px 8px',
                borderRadius: 9999,
                fontSize: 11,
                fontWeight: 700,
                marginBottom: 8,
              }}
            >
              <Info size={13} />
              <span>Trải nghiệm thử nghiệm (DEMO)</span>
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
              Chọn nhanh tài khoản mẫu
            </h3>
            <p style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.65)', margin: '4px 0 12px 0', lineHeight: '16px' }}>
              1 chạm để kiểm thử ngay theo đúng phân quyền vai trò:
            </p>

            {/* List of 5 demo accounts */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {DEMO_ACCOUNTS.map((acc) => {
                const isPlatform = acc.role_code === 'PLATFORM_ADMIN';
                const isOwner = acc.role_code === 'OWNER';
                const isManager = acc.role_code === 'MANAGER';
                const isCashierOpen = acc.id === 'user-cashier-nl';

                const badgeBg = isPlatform
                  ? 'rgba(168, 85, 247, 0.2)'
                  : isOwner
                  ? 'rgba(249, 115, 22, 0.2)'
                  : isManager
                  ? 'rgba(59, 130, 246, 0.2)'
                  : isCashierOpen
                  ? 'rgba(34, 197, 94, 0.2)'
                  : 'rgba(156, 163, 175, 0.2)';

                const badgeColor = isPlatform
                  ? '#C084FC'
                  : isOwner
                  ? '#FB923C'
                  : isManager
                  ? '#93C5FD'
                  : isCashierOpen
                  ? '#86EFAC'
                  : '#D1D5DB';

                const roleLabel = isPlatform
                  ? 'Admin Nền tảng'
                  : isOwner
                  ? 'Chủ chuỗi'
                  : isManager
                  ? 'Quản lý'
                  : isCashierOpen
                  ? 'Thu ngân (Đang mở ca)'
                  : 'Thu ngân (Chưa ca)';

                return (
                  <button
                    key={acc.id}
                    type="button"
                    disabled={isLoading}
                    onClick={() => handleSelectDemo(acc.id)}
                    aria-label={`Đăng nhập nhanh với vai trò ${acc.role_title} (${acc.full_name})`}
                    className="touch-press"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 10,
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      background: 'rgba(255, 255, 255, 0.05)',
                      textAlign: 'left',
                      cursor: isLoading ? 'not-allowed' : 'pointer',
                      transition: 'all 150ms ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 8,
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: '#FFFFFF',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {acc.full_name.split('(')[0].trim()}
                        </span>
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            padding: '1px 6px',
                            borderRadius: 4,
                            background: badgeBg,
                            color: badgeColor,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {roleLabel}
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: 'rgba(255, 255, 255, 0.55)',
                          marginTop: 2,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {acc.branch_name || (isOwner ? 'Toàn bộ chi nhánh' : 'Quản lý chuỗi')}
                      </div>
                    </div>
                    <ArrowRight size={14} style={{ color: 'rgba(255, 255, 255, 0.4)', flexShrink: 0 }} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick info note */}
          <div
            style={{
              paddingTop: 10,
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              fontSize: 11,
              color: 'rgba(255, 255, 255, 0.5)',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <span>Dữ liệu mẫu lưu trên LocalStorage của máy</span>
          </div>
        </div>
      </div>

      {/* Embedded CSS for responsive layout */}
      <style>{`
        @media (max-width: 1023px) {
          .login-stage-grid {
            grid-template-columns: 1fr 1fr !important;
            max-width: 860px !important;
          }
          .login-brand-panel {
            display: none !important;
          }
        }
        @media (max-width: 767px) {
          .login-stage-grid {
            grid-template-columns: 1fr !important;
            max-width: 460px !important;
            overflow-y: auto !important;
            max-height: 96vh !important;
          }
        }
      `}</style>
    </div>
  );
};
