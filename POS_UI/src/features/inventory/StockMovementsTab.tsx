// POS-F&B Stock Movements Tab per DESIGN.md §5.6 & BR-44

import React from 'react';
import { StockMovement } from '../../types/entities';
import { formatDateTimeVN } from '../../utils/formatters';
import { Badge } from '../../components/ui/Badge';
import { DataTable, Column } from '../../components/ui/DataTable';
import { mockStorage } from '../../mock/mockStorage';

export interface StockMovementsTabProps {
  movements: StockMovement[];
}

export const StockMovementsTab: React.FC<StockMovementsTabProps> = ({ movements }) => {
  const state = mockStorage.getState();

  const columns: Column<StockMovement>[] = [
    {
      key: 'time',
      header: 'Thời gian',
      render: (m) => (
        <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
          {formatDateTimeVN(m.created_at)}
        </span>
      ),
    },
    {
      key: 'type',
      header: 'Loại bút toán',
      render: (m) => (
        <Badge variant={m.movement_type === 'SALE' ? 'danger' : 'success'} size="sm">
          {m.movement_type === 'SALE' ? 'Xuất bán' : 'Hoàn trả kho'}
        </Badge>
      ),
    },
    {
      key: 'ingredient',
      header: 'Nguyên liệu',
      render: (m) => {
        const ing = state.ingredients.find((i) => i.id === m.ingredient_id);
        return <strong style={{ color: 'var(--color-text)' }}>{ing?.name || 'Nguyên liệu'}</strong>;
      },
    },
    {
      key: 'quantity',
      header: 'Lượng thay đổi',
      align: 'right',
      render: (m) => {
        const ing = state.ingredients.find((i) => i.id === m.ingredient_id);
        const isNegative = m.quantity < 0;
        return (
          <span
            className="num"
            style={{
              fontWeight: 700,
              color: isNegative ? 'var(--color-danger)' : 'var(--color-success)',
            }}
          >
            {isNegative ? `\u2212${Math.abs(m.quantity)}` : `+${m.quantity}`} {ing?.unit}
          </span>
        );
      },
    },
    {
      key: 'balance',
      header: 'Tồn sau giao dịch',
      align: 'right',
      render: (m) => {
        const ing = state.ingredients.find((i) => i.id === m.ingredient_id);
        return (
          <span
            className="num"
            style={{
              fontWeight: 600,
              color: m.balance_after < 0 ? 'var(--color-danger)' : 'var(--color-text)',
            }}
          >
            {m.balance_after} {ing?.unit}
          </span>
        );
      },
    },
    {
      key: 'note',
      header: 'Chứng từ / Ghi chú',
      render: (m) => (
        <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
          {m.note || m.invoice_id || '-'}
        </span>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <DataTable
        columns={columns}
        data={movements}
        keyExtractor={(m) => m.id}
        emptyMessage="Chưa có bút toán xuất nhập kho nào"
      />
    </div>
  );
};
