// POS-F&B Mandatory Password Change Modal per BR-84

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Field } from '../../components/ui/Field';
import { Button } from '../../components/ui/Button';
import { Lock } from 'lucide-react';

export const ForcePasswordModal: React.FC = () => {
  const { session, forceChangePassword } = useAuth();
  const { showToast } = useToast();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
      setError('Mật khẩu xác nhận không khớp');
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
        style={{
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-sheet)',
          boxShadow: 'var(--shadow-overlay)',
          maxWidth: 440,
          width: '100%',
          padding: 32,
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 'var(--radius-control)',
              background: 'var(--color-warning-bg)',
              color: 'var(--color-warning)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Lock size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text)' }}>
              Đổi mật khẩu lần đầu
            </h2>
            <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 2 }}>
              Tài khoản mới được tạo cần đổi mật khẩu trước khi sử dụng (BR-84)
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Field
            label="Mật khẩu mới"
            type="password"
            placeholder="Nhập mật khẩu mới..."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Field
            label="Xác nhận mật khẩu mới"
            type="password"
            placeholder="Nhập lại mật khẩu mới..."
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          {error && (
            <div
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

          <Button type="submit" variant="primary" size="lg" fullWidth isLoading={loading}>
            Xác nhận đổi mật khẩu
          </Button>
        </form>
      </div>
    </div>
  );
};
