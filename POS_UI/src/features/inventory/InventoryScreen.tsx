// POS-F&B Inventory, Stock Movements & Ingredient Catalog per BR-42..BR-49

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { inventoryService, IngredientStockItem } from '../../services/inventoryService';
import { MockEngine } from '../../mock/mockEngine';
import { mockStorage } from '../../mock/mockStorage';
import { Ingredient } from '../../types/entities';
import { DataTable, Column } from '../../components/ui/DataTable';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Dialog } from '../../components/ui/Dialog';
import { Field } from '../../components/ui/Field';
import { StockMovementsTab } from './StockMovementsTab';
import { Boxes, History, ListOrdered, Plus, Edit2, Power, AlertTriangle } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const InventoryScreen: React.FC = () => {
  const { session } = useAuth();
  const { showToast } = useToast();
  const canViewInventory = session.permissions.includes('inventory.view');
  const effectiveBranchId = MockEngine.getEffectiveBranchId();

  const [activeTab, setActiveTab] = useState<'stocks' | 'movements' | 'catalog'>('stocks');
  const [stocks, setStocks] = useState<IngredientStockItem[]>(() =>
    inventoryService.getStocksByBranch(effectiveBranchId)
  );
  const [movements, setMovements] = useState(() =>
    inventoryService.getStockMovements(effectiveBranchId)
  );
  const [ingredients, setIngredients] = useState<Ingredient[]>(() =>
    inventoryService.getIngredientCatalog()
  );
  const [lackingRecipes, setLackingRecipes] = useState(() =>
    inventoryService.getProductsLackingRecipe()
  );

  // Ingredient Modal
  const [ingredientModalOpen, setIngredientModalOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);
  const [ingredientName, setIngredientName] = useState('');
  const [ingredientUnit, setIngredientUnit] = useState('g');

  const [onlyNegative, setOnlyNegative] = useState(false);

  const refresh = () => {
    setStocks(inventoryService.getStocksByBranch(effectiveBranchId));
    setMovements(inventoryService.getStockMovements(effectiveBranchId));
    setIngredients(inventoryService.getIngredientCatalog());
    setLackingRecipes(inventoryService.getProductsLackingRecipe());
  };

  useEffect(() => {
    refresh();
    const unsubscribe = mockStorage.subscribe(refresh);
    return () => unsubscribe();
  }, [effectiveBranchId]);

  // --- INGREDIENT CATALOG ACTIONS ---
  const handleOpenCreateIngredient = () => {
    setEditingIngredient(null);
    setIngredientName('');
    setIngredientUnit('g');
    setIngredientModalOpen(true);
  };

  const handleOpenEditIngredient = (ing: Ingredient) => {
    setEditingIngredient(ing);
    setIngredientName(ing.name);
    setIngredientUnit(ing.unit);
    setIngredientModalOpen(true);
  };

  const handleSaveIngredient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingIngredient) {
        await inventoryService.updateIngredient(editingIngredient.id, {
          name: ingredientName,
          unit: ingredientUnit,
        });
        showToast({ type: 'success', message: 'Cập nhật nguyên liệu thành công' });
      } else {
        await inventoryService.createIngredient(ingredientName, ingredientUnit);
        showToast({ type: 'success', message: 'Thêm nguyên liệu mới thành công' });
      }
      setIngredientModalOpen(false);
      refresh();
    } catch (err: any) {
      showToast({ type: 'error', message: err?.message || 'Lỗi lưu nguyên liệu' });
    }
  };

  const handleToggleIngredientActive = async (ing: Ingredient) => {
    try {
      await inventoryService.toggleIngredientActive(ing.id);
      showToast({
        type: 'info',
        message: `Đã ${ing.is_active ? 'ngưng sử dụng' : 'kích hoạt lại'} nguyên liệu ${ing.name}`,
      });
      refresh();
    } catch (err: any) {
      showToast({ type: 'error', message: err?.message || 'Không thể đổi trạng thái nguyên liệu' });
    }
  };

  const stockColumns: Column<IngredientStockItem>[] = [
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

  const catalogColumns: Column<Ingredient>[] = [
    { key: 'name', header: 'Tên nguyên liệu', render: (i) => <strong>{i.name}</strong> },
    { key: 'unit', header: 'Đơn vị tính', align: 'center', render: (i) => <span className="num" style={{ fontWeight: 600 }}>{i.unit}</span> },
    {
      key: 'status',
      header: 'Trạng thái',
      render: (i) => (
        <Badge variant={i.is_active ? 'success' : 'neutral'} size="sm">
          {i.is_active ? 'Đang dùng' : 'Ngưng dùng'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Thao tác',
      align: 'right',
      render: (i) => (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
          <Button
            variant="text"
            size="sm"
            style={{ height: 32, padding: '0 8px' }}
            icon={<Edit2 size={14} />}
            onClick={() => handleOpenEditIngredient(i)}
          >
            Sửa
          </Button>
          <Button
            variant="text"
            size="sm"
            style={{ height: 32, padding: '0 8px', color: i.is_active ? 'var(--color-danger)' : 'var(--color-success)' }}
            icon={<Power size={14} />}
            onClick={() => handleToggleIngredientActive(i)}
          >
            {i.is_active ? 'Ngưng' : 'Dùng lại'}
          </Button>
        </div>
      ),
    },
  ];

  const displayedStocks = onlyNegative
    ? stocks.filter((s) => s.stock.current_stock < 0)
    : stocks;

  if (!canViewInventory) {
    return (
      <div style={{ flex: 1, padding: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', maxWidth: 420 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-danger)', marginBottom: 8 }}>
            Không có quyền truy cập
          </div>
          <p style={{ fontSize: 14, color: 'var(--color-text-muted)' }}>
            Bạn không có quyền xem kho hàng (cần quyền inventory.view).
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, padding: 'clamp(14px, 2.5vw, 24px)', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-text)' }}>
            Quản lý Kho & Danh mục Nguyên liệu
          </h1>
          <p style={{ fontSize: 14, color: 'var(--color-text-muted)', marginTop: 4 }}>
            Tồn kho phân tách theo từng chi nhánh. Hệ thống tự động trừ kho nguyên tử theo công thức định lượng (BR-43, BR-48).
          </p>
        </div>

        {activeTab === 'catalog' && (
          <Button variant="primary" icon={<Plus size={16} />} onClick={handleOpenCreateIngredient}>
            Thêm nguyên liệu
          </Button>
        )}
      </div>

      {/* Cảnh báo món thiếu công thức (BR-49) */}
      {lackingRecipes.length > 0 && (
        <div
          style={{
            background: 'var(--color-warning-bg, #FFFBEB)',
            border: '1px solid var(--color-warning-border, #FDE68A)',
            borderRadius: 'var(--radius-tile, 10px)',
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12,
            color: 'var(--color-warning, #B45309)',
          }}
        >
          <AlertTriangle size={20} style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>
              Cảnh báo định lượng (BR-49): Có {lackingRecipes.length} món chưa cài đặt công thức
            </div>
            <div style={{ fontSize: 13, marginTop: 4, color: '#92400E' }}>
              Các món này vẫn bán được tại quầy POS nhưng hệ thống sẽ không thể tự động trừ kho nguyên liệu: {' '}
              <strong>{lackingRecipes.map((l) => `${l.productName} (${l.sizeName})`).join(', ')}</strong>.
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: 8, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
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

          <button
            type="button"
            onClick={() => setActiveTab('catalog')}
            className="touch-press"
            style={{
              height: 40,
              padding: '0 18px',
              borderRadius: 'var(--radius-pill)',
              border: 'none',
              background: activeTab === 'catalog' ? 'var(--color-brand-100)' : 'transparent',
              color: activeTab === 'catalog' ? 'var(--color-brand-800)' : 'var(--color-text-muted)',
              fontSize: 14,
              fontWeight: activeTab === 'catalog' ? 700 : 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <ListOrdered size={18} />
            <span>Danh mục nguyên liệu ({ingredients.length})</span>
          </button>
        </div>

        {activeTab === 'stocks' && (
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <button
              type="button"
              onClick={() => setOnlyNegative(!onlyNegative)}
              className="touch-press"
              style={{
                height: 44,
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
      {activeTab === 'stocks' && (
        <DataTable
          columns={stockColumns}
          data={displayedStocks}
          keyExtractor={(item) => item.ingredient.id}
          emptyMessage="Không có nguyên liệu nào thỏa mãn điều kiện"
        />
      )}

      {activeTab === 'movements' && (
        <StockMovementsTab movements={movements} />
      )}

      {activeTab === 'catalog' && (
        <DataTable
          columns={catalogColumns}
          data={ingredients}
          keyExtractor={(i) => i.id}
          emptyMessage="Chưa có nguyên liệu nào trong danh mục"
        />
      )}

      {/* Dialog Thêm/Sửa Nguyên liệu */}
      <Dialog
        isOpen={ingredientModalOpen}
        onClose={() => setIngredientModalOpen(false)}
        title={editingIngredient ? 'Chỉnh sửa nguyên liệu' : 'Thêm nguyên liệu mới'}
        maxWidth={420}
      >
        <form onSubmit={handleSaveIngredient} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Field
            label="Tên nguyên liệu"
            placeholder="VD: Cà phê Arabica Cầu Đất"
            value={ingredientName}
            onChange={(e) => setIngredientName(e.target.value)}
            required
          />
          <div>
            <label
              htmlFor="ingredient-unit-select"
              style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-muted)', display: 'block', marginBottom: 6, cursor: 'pointer' }}
            >
              Đơn vị tính gốc (unit)
            </label>
            <select
              id="ingredient-unit-select"
              value={ingredientUnit}
              onChange={(e) => setIngredientUnit(e.target.value)}
              style={{
                height: 48,
                width: '100%',
                padding: '0 14px',
                borderRadius: 'var(--radius-control)',
                border: '1px solid var(--color-border-control)',
                background: 'var(--color-surface)',
                color: 'var(--color-text)',
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              <option value="g">Gram (g) - Khối lượng</option>
              <option value="ml">Mililít (ml) - Thể tích</option>
              <option value="quả">Quả / Trái - Đếm số lượng</option>
              <option value="lon">Lon / Hộp</option>
              <option value="túi">Túi / Gói</option>
            </select>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 6 }}>
            <Button variant="secondary" onClick={() => setIngredientModalOpen(false)}>
              Hủy
            </Button>
            <Button variant="primary" type="submit">
              {editingIngredient ? 'Lưu thay đổi' : 'Tạo nguyên liệu'}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
};
