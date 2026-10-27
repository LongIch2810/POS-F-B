import { InputHTMLAttributes, SelectHTMLAttributes, forwardRef, ReactNode, useId } from 'react';

export interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  suffix?: ReactNode;
  isNumericMoney?: boolean;
}

export const Field = forwardRef<HTMLInputElement, FieldProps>(
  ({ label, error, hint, suffix, isNumericMoney = false, style, disabled, id, ...props }, ref) => {
    const autoId = useId();
    const inputId = id || autoId;
    const errorId = error ? `${inputId}-error` : undefined;
    const hintId = hint && !error ? `${inputId}-hint` : undefined;
    const describedBy = errorId || hintId || props['aria-describedby'];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%' }}>
        {label && (
          <label
            htmlFor={inputId}
            style={{
              fontSize: 14,
              fontWeight: 500,
              color: 'var(--color-text-muted)',
              display: 'block',
              cursor: disabled ? 'not-allowed' : 'pointer',
            }}
          >
            {label}
          </label>
        )}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            inputMode={isNumericMoney ? 'numeric' : props.inputMode}
            aria-invalid={Boolean(error)}
            aria-describedby={describedBy}
            style={{
              height: 48,
              width: '100%',
              padding: suffix ? '0 40px 0 16px' : '0 16px',
              fontSize: 16,
              color: 'var(--color-text)',
              background: disabled ? 'var(--color-surface-sunken)' : 'var(--color-surface)',
              border: `1px solid ${error ? 'var(--color-danger)' : 'var(--color-border-control)'}`,
              borderRadius: 'var(--radius-control)',
              textAlign: isNumericMoney ? 'right' : 'left',
              fontVariantNumeric: isNumericMoney ? 'tabular-nums' : undefined,
              ...style,
            }}
            {...props}
          />
          {suffix && (
            <div
              style={{
                position: 'absolute',
                right: 14,
                color: 'var(--color-text-muted)',
                pointerEvents: 'none',
                fontWeight: 600,
              }}
            >
              {suffix}
            </div>
          )}
        </div>
        {error && (
          <span id={errorId} role="alert" style={{ fontSize: 13, color: 'var(--color-danger)', fontWeight: 500 }}>
            {error}
          </span>
        )}
        {hint && !error && (
          <span id={hintId} style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
            {hint}
          </span>
        )}
      </div>
    );
  }
);

Field.displayName = 'Field';

export interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(
  ({ label, error, hint, children, style, disabled, id, ...props }, ref) => {
    const autoId = useId();
    const selectId = id || autoId;
    const errorId = error ? `${selectId}-error` : undefined;
    const hintId = hint && !error ? `${selectId}-hint` : undefined;
    const describedBy = errorId || hintId || props['aria-describedby'];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%' }}>
        {label && (
          <label
            htmlFor={selectId}
            style={{
              fontSize: 14,
              fontWeight: 500,
              color: 'var(--color-text-muted)',
              cursor: disabled ? 'not-allowed' : 'pointer',
            }}
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          style={{
            height: 48,
            width: '100%',
            padding: '0 16px',
            fontSize: 16,
            color: 'var(--color-text)',
            background: disabled ? 'var(--color-surface-sunken)' : 'var(--color-surface)',
            border: `1px solid ${error ? 'var(--color-danger)' : 'var(--color-border-control)'}`,
            borderRadius: 'var(--radius-control)',
            cursor: disabled ? 'not-allowed' : 'pointer',
            ...style,
          }}
          {...props}
        >
          {children}
        </select>
        {error && (
          <span id={errorId} role="alert" style={{ fontSize: 13, color: 'var(--color-danger)', fontWeight: 500 }}>
            {error}
          </span>
        )}
        {hint && !error && (
          <span id={hintId} style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
            {hint}
          </span>
        )}
      </div>
    );
  }
);

SelectField.displayName = 'SelectField';
