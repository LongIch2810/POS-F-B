import React, { useState, useEffect } from 'react';
import { inventoryService, IngredientStockItem } from '../../services/inventoryService';
import { MockEngine } from '../../mock/mockEngine';
import { mockStorage } from '../../mock/mockStorage';
import { DataTable, Column } from '../../components/ui/DataTable';
import { Badge } from '../../components/ui/Badge';
import { StockMovementsTab } from './StockMovementsTab';
import { Boxes, History } from 'lucide-react';

export const InventoryScreen: React.FC = () => {
  const effectiveBranchId = MockEngine.getEffectiveBranchId();

  const [activeTab, setActiveTab] = useState<'stocks' | 'movements'>('stocks');
  const [stocks, setStocks] = useState<IngredientStockItem[]>(() =>
    inventoryService.getStocksByBranch(effectiveBranchId)
  );
  const [movements, setMovements] = useState(() =>
    inventoryService.getStockMovements(effectiveBranchId)
  );

  useEffect(() => {
    const update = () => {
      setStocks(inventoryService.getStocksByBranch(effectiveBranchId));
      setMovements(inventoryService.getStockMovements(effectiveBranchId));
    };

    update();
    const unsubscribe = mockStorage.subscribe(update);
    return () => unsubscribe();
  }, [effectiveBranchId]);

  const columns: Column<IngredientStockItem>[] = [
    {
      key: 'name',
      header: 'Tên nguyên liệu',
      render: ({ ingredient }) => (
        <span style={{ fontWeight: 600, color: 'var(--color-text)', fontSize: 15 }}>
          {ingredient.name}
        </span>
      ),
    },
    {
      key: 'stock',
      header: 'Tồn thực tế',
      align: 'right',
      render: ({ stock, ingredient }) => {
        const isNegative = stock.current_stock < 0;
        return (
          <span
            className="num"
            style={{
              fontWeight: 700,
              fontSize: 16,
              color: isNegative ? 'var(--color-danger)' : 'var(--color-text)',
            }}
          >
            {isNegative ? `\u2212${Math.abs(stock.current_stock)}` : stock.current_stock} {ingredient.unit}
          </span>
        );
      },
    },
    {
      key: 'status',
      header: 'Tình trạng',
      align: 'center',
      render: ({ stock }) => {
        if (stock.current_stock < 0) {
          return (
            <Badge variant="danger" size="sm">
              Tồn âm (Bán vượt kho - BR-46)
            </Badge>
          );
        }
        return (
          <Badge variant="success" size="sm">
            Còn hàng
          </Badge>
        );
      },
    },
    {
      key: 'unit',
      header: 'Đơn vị gốc',
      render: ({ ingredient }) => (
        <span style={{ color: 'var(--color-text-muted)' }}>{ingredient.unit}</span>
      ),
    },
  ];

  const [onlyNegative, setOnlyNegative] = useState(false);

  const displayedStocks = onlyNegative
    ? stocks.filter((s) => s.stock.current_stock < 0)
    : stocks;

  return (
    <div style={{ flex: 1, padding: 24, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-text)' }}>
          Quản lý Tồn kho & Sổ kho
        </h1>
        <p style={{ fontSize: 14, color: 'var(--color-text-muted)', marginTop: 4 }}>
          Tồn kho tách theo từng chi nhánh. Hệ thống tự động trừ kho nguyên tử theo công thức khi thanh toán đơn (BR-43).
        </p>
      </div>

      {/* Tabs chuyển đổi giữa Tồn kho & Sổ kho */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: 8, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            onClick={() => setActiveTab('stocks')}
            className="touch-press"
            style={{
              height: 40,
              padding: '0 18px',
              borderRadius: 'var(--radius-pill)',
              border: 'none',
              background: activeTab === 'stocks' ? 'var(--color-brand-100)' : 'transparent',
              color: activeTab === 'stocks' ? 'var(--color-brand-800)' : 'var(--color-text-muted)',
              fontSize: 14,
              fontWeight: activeTab === 'stocks' ? 700 : 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Boxes size={18} />
            <span>Tồn kho chi nhánh ({stocks.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('movements')}
            className="touch-press"
            style={{
              height: 40,
              padding: '0 18px',
              borderRadius: 'var(--radius-pill)',
              border: 'none',
              background: activeTab === 'movements' ? 'var(--color-brand-100)' : 'transparent',
              color: activeTab === 'movements' ? 'var(--color-brand-800)' : 'var(--color-text-muted)',
              fontSize: 14,
              fontWeight: activeTab === 'movements' ? 700 : 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <History size={18} />
            <span>Sổ kho ({movements.length} bút toán)</span>
          </button>
        </div>

        {activeTab === 'stocks' && (
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              onClick={() => setOnlyNegative(!onlyNegative)}
              className="touch-press"
              style={{
                height: 36,
                padding: '0 14px',
                borderRadius: 'var(--radius-pill)',
                border: onlyNegative ? '1px solid var(--color-danger)' : '1px solid var(--color-border)',
                background: onlyNegative ? 'var(--color-danger-bg)' : 'var(--color-surface)',
                color: onlyNegative ? 'var(--color-danger)' : 'var(--color-text-muted)',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {onlyNegative ? 'Đang lọc: Chỉ món tồn âm' : 'Lọc món tồn âm / bán vượt kho'}
            </button>
          </div>
        )}
      </div>

      {/* Nội dung theo Tab */}
      {activeTab === 'stocks' ? (
        <DataTable
          columns={columns}
          data={displayedStocks}
          keyExtractor={(item) => item.ingredient.id}
          emptyMessage="Không có nguyên liệu nào thỏa mãn điều kiện"
        />
      ) : (
        <StockMovementsTab movements={movements} />
      )}
    </div>
  );
};
