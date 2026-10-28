// POS-F&B Authentication Login Screen per DESIGN.md §1, §4, §5.7 & Impeccable craft-floor
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { DEMO_ACCOUNTS } from '../../services/authService';
import {
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  AlertCircle,
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
        minHeight: '100vh',
        width: '100vw',
        overflowY: 'auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-bg)',
        padding: '24px 20px',
        boxSizing: 'border-box',
      }}
    >
      <div
        className="login-stage-grid"
        style={{
          width: '100%',
          maxWidth: 1180,
          display: 'grid',
          gridTemplateColumns: 'minmax(280px, 1fr) minmax(360px, 1.15fr) minmax(300px, 1fr)',
          gap: 20,
          alignItems: 'stretch',
        }}
      >
        {/* ===================== CỘT TRÁI: THƯƠNG HIỆU & GIỚI THIỆU HỆ THỐNG ===================== */}
        <div
          className="login-brand-panel"
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-sheet)',
            padding: '28px 24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            {/* Logo phin cà phê thương hiệu */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 'var(--radius-tile)',
                  background: 'var(--color-brand-800)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 32 32"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-label="Logo Phin Cà Phê"
                >
                  <circle cx="16" cy="5" r="1.8" fill="#f1e4d9" />
                  <path d="M9 8.5C9 7.8 10 7.2 16 7.2C22 7.2 23 7.8 23 8.5L22 10.5H10L9 8.5Z" fill="#f1e4d9" />
                  <path d="M10 11H22L20.8 19.5H11.2L10 11Z" fill="#f8f0e9" opacity="0.95" />
                  <rect x="7" y="19.5" width="18" height="2" rx="1" fill="#f1e4d9" />
                  <path d="M11.5 22.5H20.5L19.5 28C19.5 29 18.5 29.5 16 29.5C13.5 29.5 12.5 29 12.5 28L11.5 22.5Z" stroke="#f1e4d9" strokeWidth="1.5" strokeLinecap="round" />
                  <circle cx="16" cy="25" r="1.2" fill="#e2cbbe" />
                </svg>
              </div>
              <div>
                <h1 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text)', margin: 0, lineHeight: '24px' }}>
                  POS & Quản lý Kho F&B
                </h1>
                <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: '2px 0 0 0' }}>
                  Cà phê • Trà sữa • Quán ăn
                </p>
              </div>
            </div>

            <p style={{ fontSize: 14, color: 'var(--color-text-muted)', lineHeight: '21px', margin: '0 0 20px 0' }}>
              Hệ thống bán hàng quầy cảm ứng và quản trị tồn kho đa chi nhánh theo thời gian thực.
            </p>

            {/* Danh sách 3 trụ cột nghiệp vụ */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                  padding: '12px 14px',
                  background: 'var(--color-surface-sunken)',
                  borderRadius: 'var(--radius-control)',
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 'var(--radius-control)',
                    background: 'var(--color-brand-100)',
                    color: 'var(--color-brand-700)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Store size={18} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)' }}>
                    Bán hàng cảm ứng tại quầy
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2, lineHeight: '17px' }}>
                    Tối ưu tablet ngang, chọn món dưới 2 chạm, sơ đồ bàn trực quan.
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                  padding: '12px 14px',
                  background: 'var(--color-surface-sunken)',
                  borderRadius: 'var(--radius-control)',
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 'var(--radius-control)',
                    background: 'var(--color-info-bg)',
                    color: 'var(--color-info)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Clock size={18} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)' }}>
                    Đối soát ca đếm mù
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2, lineHeight: '17px' }}>
                    Mỗi chi nhánh 1 ca mở, bàn giao tiền mặt đếm mù chống thất thoát.
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                  padding: '12px 14px',
                  background: 'var(--color-surface-sunken)',
                  borderRadius: 'var(--radius-control)',
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 'var(--radius-control)',
                    background: 'var(--color-success-bg)',
                    color: 'var(--color-success)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Boxes size={18} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)' }}>
                    Định mức trừ kho tự động
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2, lineHeight: '17px' }}>
                    Trừ nguyên vật liệu theo công thức từng ly nước, cảnh báo tồn kho an toàn.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Chân trang thông tin */}
          <div
            style={{
              paddingTop: 16,
              borderTop: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: 12,
              color: 'var(--color-text-muted)',
            }}
          >
            <span>Bản quyền © Hệ thống F&B</span>
            <span>Múi giờ Asia/Ho_Chi_Minh</span>
          </div>
        </div>

        {/* ===================== CỘT GIỮA: FORM ĐĂNG NHẬP CHÍNH ===================== */}
        <div
          style={{
            background: 'var(--color-surface)',
            borderRadius: 'var(--radius-sheet)',
            boxShadow: 'var(--shadow-overlay)',
            border: '1px solid var(--color-border)',
            padding: '32px 28px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          {/* Header biểu mẫu */}
          <div style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>
              Đăng nhập tài khoản
            </h2>
            <p style={{ fontSize: 14, color: 'var(--color-text-muted)', margin: '6px 0 0 0' }}>
              Nhập tên đăng nhập và mật khẩu được cấp bởi cửa hàng
            </p>
          </div>

          {/* Thông báo lỗi chung */}
          {generalError && (
            <div
              role="alert"
              style={{
                background: 'var(--color-danger-bg)',
                border: '1px solid var(--color-danger)',
                borderRadius: 'var(--radius-control)',
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 8,
                marginBottom: 16,
                fontSize: 13,
                color: 'var(--color-danger)',
              }}
            >
              <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 1 }} />
              <span>{generalError}</span>
            </div>
          )}

          {/* Biểu mẫu */}
          <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label
                htmlFor="login-username"
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: 'var(--color-text)',
                  display: 'block',
                  marginBottom: 6,
                }}
              >
                Tên đăng nhập
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <UserIcon
                  size={18}
                  style={{
                    position: 'absolute',
                    left: 14,
                    color: fieldErrors.username ? 'var(--color-danger)' : 'var(--color-text-muted)',
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
                    height: 48,
                    width: '100%',
                    paddingLeft: 42,
                    paddingRight: 14,
                    borderRadius: 'var(--radius-control)',
                    border: `1px solid ${fieldErrors.username ? 'var(--color-danger)' : 'var(--color-border-control)'}`,
                    fontSize: 15,
                    color: 'var(--color-text)',
                    background: fieldErrors.username ? 'var(--color-danger-bg)' : 'var(--color-surface)',
                    outline: 'none',
                  }}
                />
              </div>
              {fieldErrors.username && (
                <div
                  id="username-error"
                  role="alert"
                  style={{ fontSize: 12, color: 'var(--color-danger)', marginTop: 4, fontWeight: 500 }}
                >
                  {fieldErrors.username}
                </div>
              )}
            </div>

            <div>
              <label
                htmlFor="login-password"
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: 'var(--color-text)',
                  display: 'block',
                  marginBottom: 6,
                }}
              >
                Mật khẩu
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Lock
                  size={18}
                  style={{
                    position: 'absolute',
                    left: 14,
                    color: fieldErrors.password ? 'var(--color-danger)' : 'var(--color-text-muted)',
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
                    height: 48,
                    width: '100%',
                    paddingLeft: 42,
                    paddingRight: 48,
                    borderRadius: 'var(--radius-control)',
                    border: `1px solid ${fieldErrors.password ? 'var(--color-danger)' : 'var(--color-border-control)'}`,
                    fontSize: 15,
                    color: 'var(--color-text)',
                    background: fieldErrors.password ? 'var(--color-danger-bg)' : 'var(--color-surface)',
                    outline: 'none',
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
                    width: 48,
                    height: 48,
                    background: 'transparent',
                    border: 'none',
                    borderRadius: '0 var(--radius-control) var(--radius-control) 0',
                    color: 'var(--color-text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {fieldErrors.password && (
                <div
                  id="password-error"
                  role="alert"
                  style={{ fontSize: 12, color: 'var(--color-danger)', marginTop: 4, fontWeight: 500 }}
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
                height: 56,
                borderRadius: 'var(--radius-control)',
                background: 'var(--color-brand-600)',
                color: '#FFFFFF',
                fontSize: 16,
                fontWeight: 600,
                border: 'none',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                marginTop: 6,
              }}
            >
              <span>{isLoading ? 'Đang xác thực...' : 'Đăng nhập hệ thống'}</span>
            </button>
          </form>

          {/* Chú thích bảo mật BR-02 */}
          <div
            style={{
              marginTop: 20,
              paddingTop: 14,
              borderTop: '1px solid var(--color-border)',
              fontSize: 12,
              color: 'var(--color-text-muted)',
              lineHeight: '18px',
            }}
          >
            Mật khẩu mã hóa an toàn. Tài khoản mới tạo bắt buộc đổi mật khẩu ở lần đăng nhập đầu tiên.
          </div>
        </div>

        {/* ===================== CỘT PHẢI: TRUY CẬP NHANH TÀI KHOẢN MẪU (DEMO) ===================== */}
        <div
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-sheet)',
            padding: '24px 20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>
              Tài khoản mẫu kiểm thử
            </h3>
            <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: '4px 0 16px 0', lineHeight: '18px' }}>
              Chọn nhanh để kiểm tra phân quyền và luồng nghiệp vụ:
            </p>

            {/* Danh sách 5 tài khoản mẫu */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {DEMO_ACCOUNTS.map((acc) => {
                const isPlatform = acc.role_code === 'PLATFORM_ADMIN';
                const isOwner = acc.role_code === 'OWNER';
                const isManager = acc.role_code === 'MANAGER';
                const isCashierOpen = acc.id === 'user-cashier-nl';

                const badgeBg = isPlatform
                  ? 'var(--color-surface-sunken)'
                  : isOwner
                  ? 'var(--color-brand-100)'
                  : isManager
                  ? 'var(--color-info-bg)'
                  : isCashierOpen
                  ? 'var(--color-success-bg)'
                  : 'var(--color-surface-sunken)';

                const badgeColor = isPlatform
                  ? 'var(--color-text-muted)'
                  : isOwner
                  ? 'var(--color-brand-700)'
                  : isManager
                  ? 'var(--color-info)'
                  : isCashierOpen
                  ? 'var(--color-success)'
                  : 'var(--color-text-muted)';

                const roleLabel = isPlatform
                  ? 'Quản trị nền tảng'
                  : isOwner
                  ? 'Chủ chuỗi'
                  : isManager
                  ? 'Quản lý chi nhánh'
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
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-control)',
                      border: '1px solid var(--color-border)',
                      background: 'var(--color-surface)',
                      textAlign: 'left',
                      cursor: isLoading ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 8,
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: 'var(--color-text)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {acc.full_name.split('(')[0].trim()}
                        </span>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            padding: '1px 6px',
                            borderRadius: 'var(--radius-pill)',
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
                          fontSize: 12,
                          color: 'var(--color-text-muted)',
                          marginTop: 2,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {acc.branch_name || (isOwner ? 'Toàn bộ chi nhánh' : 'Quản trị hệ thống')}
                      </div>
                    </div>
                    <ArrowRight size={16} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Ghi chú footer */}
          <div
            style={{
              paddingTop: 12,
              borderTop: '1px solid var(--color-border)',
              fontSize: 12,
              color: 'var(--color-text-muted)',
            }}
          >
            Dữ liệu mẫu lưu trên LocalStorage của máy
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
            max-width: 440px !important;
          }
        }
      `}</style>
    </div>
  );
};
