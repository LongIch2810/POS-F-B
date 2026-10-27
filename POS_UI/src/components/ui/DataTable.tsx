import { ReactNode } from 'react';

export interface Column<T> {
  key: string;
  header: string;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
  render: (row: T, index: number) => ReactNode;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  emptyAction?: ReactNode;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  onRowClick,
  emptyMessage = 'Không có dữ liệu',
  emptyAction,
}: DataTableProps<T>) {
  if (data.length === 0) {
    return (
      <div
        style={{
          padding: '48px 24px',
          textAlign: 'center',
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-control)',
          border: '1px solid var(--color-border)',
        }}
      >
        <p style={{ color: 'var(--color-text-muted)', fontSize: 15, marginBottom: 16 }}>{emptyMessage}</p>
        {emptyAction}
      </div>
    );
  }

  return (
    <div
      style={{
        width: '100%',
        overflowX: 'auto',
        background: 'var(--color-surface)',
        borderRadius: 'var(--radius-control)',
        border: '1px solid var(--color-border)',
      }}
    >
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: 14,
          textAlign: 'left',
        }}
      >
        <thead>
          <tr
            style={{
              height: 48,
              borderBottom: '1px solid var(--color-border)',
              background: 'var(--color-surface-sunken)',
            }}
          >
            {columns.map((col) => (
              <th
                key={col.key}
                style={{
                  padding: '0 16px',
                  fontWeight: 600,
                  color: 'var(--color-text-muted)',
                  textAlign: col.align || 'left',
                  width: col.width,
                  whiteSpace: 'nowrap',
                }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr
              key={keyExtractor(row)}
              onClick={() => onRowClick?.(row)}
              style={{
                height: 48,
                borderBottom: idx < data.length - 1 ? '1px solid var(--color-border)' : 'none',
                cursor: onRowClick ? 'pointer' : 'default',
                transition: 'background-color 100ms ease',
              }}
              onMouseEnter={(e) => {
                if (onRowClick) (e.currentTarget as HTMLTableRowElement).style.backgroundColor = 'var(--color-brand-50)';
              }}
              onMouseLeave={(e) => {
                if (onRowClick) (e.currentTarget as HTMLTableRowElement).style.backgroundColor = 'transparent';
              }}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  style={{
                    padding: '0 16px',
                    color: 'var(--color-text)',
                    textAlign: col.align || 'left',
                    fontVariantNumeric: col.align === 'right' ? 'tabular-nums' : undefined,
                  }}
                >
                  {col.render(row, idx)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
