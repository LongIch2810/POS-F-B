// POS-F&B Authentication Login Screen per DESIGN.md & taste-skill app screens
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { DEMO_ACCOUNTS } from '../../services/authService';
import { Coffee, ShieldCheck, Lock, User as UserIcon, Eye, EyeOff, AlertCircle } from 'lucide-react';

export const LoginScreen: React.FC = () => {
  const { login, switchUser } = useAuth();
  const [username, setUsername] = useState('an_cashier');
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!username.trim()) {
      setErrorMsg('Vui lòng nhập tên đăng nhập');
      return;
    }
    setIsLoading(true);
    try {
      await login(username.trim(), password);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Đăng nhập không thành công');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectDemo = async (userId: string) => {
    setErrorMsg('');
    setIsLoading(true);
    try {
      await switchUser(userId);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Lỗi đăng nhập tài khoản mẫu');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#24140D',
        padding: 20,
        position: 'relative',
        overflowY: 'auto',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 440,
          background: '#FFFFFF',
          borderRadius: 'var(--radius-modal, 16px)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          padding: 32,
          position: 'relative',
          zIndex: 1,
          margin: 'auto',
        }}
      >
        {/* Brand header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: 'var(--color-brand-600, #C76B22)',
              color: '#FFFFFF',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 16px rgba(199, 107, 34, 0.3)',
              marginBottom: 14,
            }}
          >
            <Coffee size={28} />
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1F2937', margin: 0 }}>
            Hệ thống POS & Kho F&B
          </h1>
          <p style={{ fontSize: 13, color: '#6B7280', marginTop: 6, margin: 0 }}>
            Phần mềm bán hàng & quản lý chuyên biệt cho F&B
          </p>
        </div>

        {/* Error notification */}
        {errorMsg && (
          <div
            style={{
              background: 'var(--color-danger-bg, #FEF2F2)',
              border: '1px solid var(--color-danger-border, #FCA5A5)',
              borderRadius: 8,
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 10,
              marginBottom: 20,
              fontSize: 13,
              color: 'var(--color-danger, #DC2626)',
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 1 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Login form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <label
              htmlFor="login-username"
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: '#374151',
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
                  color: '#9CA3AF',
                  pointerEvents: 'none',
                }}
              />
              <input
                id="login-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Nhập tên tài khoản..."
                style={{
                  height: 48,
                  width: '100%',
                  paddingLeft: 42,
                  paddingRight: 14,
                  borderRadius: 10,
                  border: '1px solid #D1D5DB',
                  fontSize: 15,
                  color: '#111827',
                  background: '#F9FAFB',
                  outline: 'none',
                  transition: 'border-color 150ms ease',
                }}
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="login-password"
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: '#374151',
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
                  color: '#9CA3AF',
                  pointerEvents: 'none',
                }}
              />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu..."
                style={{
                  height: 48,
                  width: '100%',
                  paddingLeft: 42,
                  paddingRight: 44,
                  borderRadius: 10,
                  border: '1px solid #D1D5DB',
                  fontSize: 15,
                  color: '#111827',
                  background: '#F9FAFB',
                  outline: 'none',
                  transition: 'border-color 150ms ease',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: 12,
                  background: 'none',
                  border: 'none',
                  color: '#9CA3AF',
                  cursor: 'pointer',
                  padding: 4,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              height: 52,
              borderRadius: 10,
              background: 'var(--color-brand-600, #C76B22)',
              color: '#FFFFFF',
              fontSize: 15,
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

        {/* Quick Demo switcher for Pair Programming review */}
        <div style={{ marginTop: 28, paddingTop: 20, borderTop: '1px dashed #E5E7EB' }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#6B7280', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Đăng nhập nhanh tài khoản mẫu:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {DEMO_ACCOUNTS.slice(0, 4).map((acc) => (
              <button
                key={acc.id}
                type="button"
                onClick={() => handleSelectDemo(acc.id)}
                style={{
                  padding: '10px 12px',
                  borderRadius: 8,
                  border: '1px solid #E5E7EB',
                  background: '#F9FAFB',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 150ms ease',
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 700, color: '#111827' }}>
                  {acc.full_name.split('(')[0].trim()}
                </div>
                <div style={{ fontSize: 11, color: '#6B7280' }}>
                  {acc.role_code === 'PLATFORM_ADMIN'
                    ? 'Quản trị viên'
                    : acc.role_code === 'OWNER'
                    ? 'Chủ chuỗi'
                    : acc.role_code === 'MANAGER'
                    ? 'Quản lý'
                    : 'Thu ngân'}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
