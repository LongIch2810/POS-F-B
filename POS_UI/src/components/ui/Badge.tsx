// POS-F&B Badge Component per DESIGN.md §6.4

import React, { ReactNode } from 'react';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  CircleDot,
} from 'lucide-react';

export type BadgeVariant = 'success' | 'danger' | 'warning' | 'info' | 'neutral';

export interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  icon?: ReactNode;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ variant = 'neutral', children, icon, size = 'md' }) => {
  let bg = 'var(--color-surface-sunken)';
  let color = 'var(--color-text-muted)';
  let defaultIcon = <CircleDot size={size === 'sm' ? 12 : 14} />;

  if (variant === 'success') {
    bg = 'var(--color-success-bg)';
    color = 'var(--color-success)';
    defaultIcon = <CheckCircle2 size={size === 'sm' ? 12 : 14} />;
  } else if (variant === 'danger') {
    bg = 'var(--color-danger-bg)';
    color = 'var(--color-danger)';
    defaultIcon = <XCircle size={size === 'sm' ? 12 : 14} />;
  } else if (variant === 'warning') {
    bg = 'var(--color-warning-bg)';
    color = 'var(--color-warning)';
    defaultIcon = <AlertTriangle size={size === 'sm' ? 12 : 14} />;
  } else if (variant === 'info') {
    bg = 'var(--color-info-bg)';
    color = 'var(--color-info)';
    defaultIcon = <Info size={size === 'sm' ? 12 : 14} />;
  }

  const height = size === 'sm' ? 24 : 28;
  const padding = size === 'sm' ? '0 8px' : '0 10px';
  const fontSize = size === 'sm' ? 12 : 13;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        height,
        padding,
        borderRadius: 'var(--radius-pill)',
        background: bg,
        color,
        fontSize,
        fontWeight: 600,
        whiteSpace: 'nowrap',
        userSelect: 'none',
      }}
    >
      <span style={{ display: 'flex', alignItems: 'center' }}>{icon || defaultIcon}</span>
      <span>{children}</span>
    </span>
  );
};
