// POS-F&B Touch Numpad per DESIGN.md §4.3 & §5.4

import React from 'react';
import { Delete } from 'lucide-react';

export interface NumpadProps {
  onDigit: (char: string) => void;
  onClear?: () => void;
  onBackspace: () => void;
}

export const Numpad: React.FC<NumpadProps> = ({ onDigit, onClear, onBackspace }) => {
  const keys = [
    ['7', '8', '9'],
    ['4', '5', '6'],
    ['1', '2', '3'],
    ['0', '000', 'backspace'],
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
      {onClear && (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={onClear}
            className="touch-press"
            style={{
              padding: '4px 12px',
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--color-danger)',
              background: 'var(--color-danger-bg)',
              border: 'none',
              borderRadius: 'var(--radius-control)',
              cursor: 'pointer',
            }}
          >
            Xóa nhập lại (C)
          </button>
        </div>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 8,
          width: '100%',
        }}
      >
        {keys.flat().map((k) => {
          const isBackspace = k === 'backspace';

          return (
            <button
              key={k}
              type="button"
              onClick={() => {
                if (isBackspace) onBackspace();
                else onDigit(k);
              }}
              className="touch-press"
              style={{
                height: 64, // DESIGN.md: Phím số trên bàn phím nhập tiền 64px
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: isBackspace ? 'var(--color-surface-sunken)' : 'var(--color-surface)',
                border: '1px solid var(--color-border-control)',
                borderRadius: 'var(--radius-control)',
                fontSize: 22,
                fontWeight: 600,
                color: isBackspace ? 'var(--color-text-muted)' : 'var(--color-text)',
                cursor: 'pointer',
                userSelect: 'none',
                fontVariantNumeric: 'tabular-nums',
                boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
              }}
            >
              {isBackspace ? <Delete size={24} /> : k}
            </button>
          );
        })}
      </div>
    </div>
  );
};
