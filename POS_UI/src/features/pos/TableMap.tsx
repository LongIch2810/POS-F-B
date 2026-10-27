// POS-F&B Table Map per DESIGN.md §5.3

import React, { useState } from 'react';
import { DiningTable, Invoice } from '../../types/entities';
import { formatVND, formatDuration } from '../../utils/formatters';
import { Button } from '../../components/ui/Button';
import { ShoppingBag } from 'lucide-react';

export interface TableItemWithInvoice {
  table: DiningTable;
  activeInvoice?: Invoice;
}

export interface TableMapProps {
  tablesWithInvoices: TableItemWithInvoice[];
  selectedTableId?: string;
  onSelectTable: (table: DiningTable, invoice?: Invoice) => void;
  onCreateTakeaway: () => void;
}

export const TableMap: React.FC<TableMapProps> = ({
  tablesWithInvoices,
  selectedTableId,
  onSelectTable,
  onCreateTakeaway,
}) => {
  const areas = ['Tất cả', ...Array.from(new Set(tablesWithInvoices.map((ti) => ti.table.area)))];
  const [selectedArea, setSelectedArea] = useState<string>('Tất cả');

  const filtered = tablesWithInvoices.filter((ti) => {
    if (selectedArea === 'Tất cả') return true;
    return ti.table.area === selectedArea;
  });

  const emptyCount = tablesWithInvoices.filter((ti) => !ti.activeInvoice && ti.table.is_active).length;
  const activeCount = tablesWithInvoices.filter((ti) => !!ti.activeInvoice).length;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 16 }}>
      {/* Thanh trên: Tabs khu vực & Tóm tắt & Nút mang đi */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          marginBottom: 16,
          flexShrink: 0,
        }}
      >
        {/* Tabs khu vực */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto' }}>
          {areas.map((area) => {
            const isSelected = area === selectedArea;
            return (
              <button
                key={area}
                type="button"
                onClick={() => setSelectedArea(area)}
                style={{
                  height: 40,
                  padding: '0 16px',
                  borderRadius: 'var(--radius-pill)',
                  border: `1px solid ${isSelected ? 'var(--color-brand-600)' : 'var(--color-border-control)'}`,
                  background: isSelected ? 'var(--color-brand-100)' : 'var(--color-surface)',
                  color: isSelected ? 'var(--color-brand-800)' : 'var(--color-text)',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {area}
              </button>
            );
          })}
        </div>

        {/* Tóm tắt & Nút mang đi */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ fontSize: 13, color: 'var(--color-text-muted)', fontWeight: 500 }}>
            Trống: <strong style={{ color: 'var(--color-text)' }}>{emptyCount}</strong> &bull; Có khách:{' '}
            <strong style={{ color: 'var(--color-brand-600)' }}>{activeCount}</strong>
          </div>

          <Button variant="secondary" size="md" onClick={onCreateTakeaway} icon={<ShoppingBag size={18} />}>
            Đơn mang đi
          </Button>
        </div>
      </div>

      {/* Lưới các thẻ bàn (Grid bàn cao tối thiểu 96px per DESIGN.md §5.3) */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
          gap: 12,
          alignContent: 'start',
        }}
      >
        {filtered.map(({ table, activeInvoice }) => {
          const isOccupied = !!activeInvoice;
          const isSelected = table.id === selectedTableId;
          const isInactive = !table.is_active;

          let bg = 'var(--color-surface)';
          let borderColor = 'var(--color-border-control)';
          let borderWidth = '1px';

          if (isInactive) {
            bg = 'var(--color-surface-sunken)';
            borderColor = 'transparent';
          } else if (isOccupied) {
            bg = 'var(--color-brand-100)';
            borderColor = 'var(--color-brand-600)';
            borderWidth = '2px';
          }

          if (isSelected) {
            borderColor = 'var(--color-brand-600)';
            borderWidth = '3px';
          }

          return (
            <div
              key={table.id}
              onClick={() => {
                if (!isInactive) onSelectTable(table, activeInvoice);
              }}
              style={{
                minHeight: 96,
                padding: '12px 14px',
                background: bg,
                border: `${borderWidth} solid ${borderColor}`,
                borderRadius: 'var(--radius-tile)',
                cursor: isInactive ? 'not-allowed' : 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                userSelect: 'none',
                transition: 'all 100ms ease',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: isInactive ? 'var(--color-text-disabled)' : 'var(--color-text)',
                  }}
                >
                  {table.name}
                </span>
                <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                  {table.seat_count} chỗ
                </span>
              </div>

              {isInactive ? (
                <div style={{ fontSize: 13, color: 'var(--color-text-disabled)' }}>Ngưng dùng</div>
              ) : isOccupied ? (
                <div>
                  <div
                    className="money"
                    style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-brand-800)' }}
                  >
                    {formatVND(activeInvoice.total_amount)}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>
                    {formatDuration(activeInvoice.created_at)}
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: 13, color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span>Trống</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
