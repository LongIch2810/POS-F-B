// POS-F&B Offline Bar per DESIGN.md §7

import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { WifiOff } from 'lucide-react';

export const OfflineBar: React.FC = () => {
  const { isOffline } = useAuth();

  if (!isOffline) return null;

  return (
    <div
      role="alert"
      style={{
        background: 'var(--color-danger)',
        color: '#FFFFFF',
        padding: '10px 16px',
        fontSize: 14,
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        zIndex: 9000,
        flexShrink: 0,
      }}
    >
      <WifiOff size={18} />
      <span>Mất kết nối. Thao tác mới sẽ không được lưu cho đến khi có mạng.</span>
    </div>
  );
};
