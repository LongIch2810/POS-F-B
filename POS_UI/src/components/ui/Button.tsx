import { ButtonHTMLAttributes, forwardRef, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'text';
export type ButtonSize = 'md' | 'lg'; // md: 48px (min touch), lg: 56px (main actions)

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  disabledReason?: string; // Chú thích lý do khi thiếu quyền hoặc vô hiệu
  children: ReactNode;
  icon?: ReactNode;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabledReason,
      children,
      icon,
      fullWidth = false,
      disabled,
      style,
      className,
      ...props
    },
    ref
  ) => {
    const height = size === 'lg' ? 56 : 48;
    const isDisabled = disabled || isLoading || !!disabledReason;

    // Màu sắc theo token
    let bg = 'var(--color-brand-600)';
    let color = '#FFFFFF';
    let border = 'none';

    if (variant === 'secondary') {
      bg = 'var(--color-surface)';
      color = 'var(--color-text)';
      border = '1px solid var(--color-border-control)';
    } else if (variant === 'danger') {
      bg = 'var(--color-danger)';
      color = '#FFFFFF';
      border = 'none';
    } else if (variant === 'text') {
      bg = 'transparent';
      color = 'var(--color-brand-600)';
      border = 'none';
    }

    if (isDisabled) {
      bg = 'var(--color-surface-sunken)';
      color = 'var(--color-text-disabled)';
      border = variant === 'secondary' ? '1px solid var(--color-border)' : 'none';
    }

    const buttonElement = (
      <button
        ref={ref}
        disabled={isDisabled}
        title={disabledReason}
        className={`touch-press ${className || ''}`}
        style={{
          height,
          padding: '0 20px',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          fontSize: size === 'lg' ? 17 : 15,
          fontWeight: 600,
          borderRadius: 'var(--radius-control)',
          background: bg,
          color,
          border,
          cursor: isDisabled ? 'not-allowed' : 'pointer',
          width: fullWidth ? '100%' : 'auto',
          userSelect: 'none',
          whiteSpace: 'nowrap',
          position: 'relative',
          ...style,
        }}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="animate-spin" size={20} style={{ animation: 'spin 1s linear infinite' }} />
        ) : (
          icon
        )}
        <span>{children}</span>
      </button>
    );

    if (disabledReason) {
      return (
        <div style={{ display: fullWidth ? 'block' : 'inline-block', position: 'relative' }}>
          {buttonElement}
          <div
            style={{
              fontSize: 12,
              color: 'var(--color-danger)',
              marginTop: 4,
              textAlign: 'center',
            }}
          >
            {disabledReason}
          </div>
        </div>
      );
    }

    return buttonElement;
  }
);

Button.displayName = 'Button';
