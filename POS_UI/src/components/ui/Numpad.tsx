// POS-F&B Touch Numpad per DESIGN.md §4.3 & §5.4

import React from 'react';
import { Delete } from 'lucide-react';

export interface NumpadProps {
  onDigit: (char: string) => void;
  onClear?: () => void;
  onBackspace: () => void;
}

export const Numpad: React.FC<NumpadProps> = ({ onDigit, onBackspace }) => {
  const keys = [
    ['7', '8', '9'],
    ['4', '5', '6'],
    ['1', '2', '3'],
    ['0', '000', 'backspace'],
  ];

  return (
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
            style={{
              height: 64, // DESIGN.md: Phím số trên bàn phím nhập tiền 64px
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border-control)',
              borderRadius: 'var(--radius-control)',
              fontSize: 22,
              fontWeight: 600,
              color: 'var(--color-text)',
              cursor: 'pointer',
              userSelect: 'none',
              fontVariantNumeric: 'tabular-nums',
              transition: 'background-color 100ms ease',
            }}
            onMouseDown={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--color-brand-50)';
            }}
            onMouseUp={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--color-surface)';
            }}
            onTouchStart={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--color-brand-50)';
            }}
            onTouchEnd={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--color-surface)';
            }}
          >
            {isBackspace ? <Delete size={24} /> : k}
          </button>
        );
      })}
    </div>
  );
};
