// POS-F&B Mandatory Password Change Modal per WCAG 2.1 AA & Product Overview

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Field } from '../../components/ui/Field';
import { Button } from '../../components/ui/Button';
import { Lock, LogOut } from 'lucide-react';

export const ForcePasswordModal: React.FC = () => {
  const { session, forceChangePassword, logout } = useAuth();
  const { showToast } = useToast();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Focus trap bên trong modal
  useEffect(() => {
    if (!session.user.must_change_password) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (!modalRef.current) return;
        const focusables = Array.from(
          modalRef.current.querySelectorAll<HTMLElement>(
            'button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [session.user.must_change_password]);

  // Chỉ hiện khi must_change_password là true
  if (!session.user.must_change_password) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không trùng khớp');
      return;
    }

    setLoading(true);
    try {
      await forceChangePassword(password);
      showToast({
        type: 'success',
        message: 'Đổi mật khẩu lần đầu thành công! Bạn có thể sử dụng hệ thống.',
      });
    } catch (err: any) {
      setError(err?.message || 'Có lỗi xảy ra khi đổi mật khẩu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(26, 34, 38, 0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="force-password-title"
        tabIndex={-1}
        className="animate-modal-pop"
        style={{
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-sheet)',
          boxShadow: 'var(--shadow-overlay)',
          maxWidth: 460,
          width: '100%',
          padding: 32,
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
          outline: 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 'var(--radius-control)',
              background: 'var(--color-warning-bg)',
              color: 'var(--color-warning)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Lock size={26} />
          </div>
          <div>
            <h2 id="force-password-title" style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>
              Đổi mật khẩu lần đầu
            </h2>
            <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 4, margin: 0 }}>
              Vì lý do an toàn bảo mật, tài khoản mới khởi tạo cần thiết lập mật khẩu cá nhân trước khi bắt đầu làm việc.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Field
            label="Mật khẩu mới (tối thiểu 6 ký tự)"
            type="password"
            autoComplete="new-password"
            placeholder="Nhập mật khẩu mới..."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoFocus
          />

          <Field
            label="Xác nhận mật khẩu mới"
            type="password"
            autoComplete="new-password"
            placeholder="Nhập lại mật khẩu mới..."
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          {error && (
            <div
              role="alert"
              style={{
                padding: '10px 12px',
                background: 'var(--color-danger-bg)',
                color: 'var(--color-danger)',
                borderRadius: 'var(--radius-control)',
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
            <Button
              type="button"
              variant="secondary"
              size="lg"
              onClick={logout}
              disabled={loading}
              icon={<LogOut size={16} />}
              style={{ minWidth: 120 }}
            >
              Đăng xuất
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={loading}
              disabled={loading}
            >
              Xác nhận đổi mật khẩu
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

