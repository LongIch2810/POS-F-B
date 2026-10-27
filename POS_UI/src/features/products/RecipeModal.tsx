// POS-F&B Recipe Modal per BR-48, BR-49

import React, { useState, useEffect } from 'react';
import { productService } from '../../services/productService';
import { Dialog } from '../../components/ui/Dialog';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../context/ToastContext';
import { Plus, Trash2, AlertCircle } from 'lucide-react';

export interface RecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  sizeName: string;
  productSizeId: string;
  storeId: string;
  onSuccess: () => void;
}

export const RecipeModal: React.FC<RecipeModalProps> = ({
  isOpen,
  onClose,
  productName,
  sizeName,
  productSizeId,
  storeId,
  onSuccess,
}) => {
  const { showToast } = useToast();
  const [recipes, setRecipes] = useState(() => productService.getRecipesForProductSize(productSizeId));
  const [availableIngredients] = useState(() => productService.getAllIngredients(storeId));

  const [selectedIngredientId, setSelectedIngredientId] = useState(availableIngredients[0]?.id || '');
  const [quantityInput, setQuantityInput] = useState('20');

  useEffect(() => {
    setRecipes(productService.getRecipesForProductSize(productSizeId));
  }, [productSizeId]);

  if (!isOpen) return null;

  const handleAddOrUpdate = async () => {
    const qty = parseFloat(quantityInput);
    if (isNaN(qty) || qty <= 0) {
      showToast({ type: 'error', message: 'Định lượng nguyên liệu phải lớn hơn 0' });
      return;
    }

    await productService.saveRecipe(productSizeId, selectedIngredientId, qty);
    setRecipes(productService.getRecipesForProductSize(productSizeId));
    showToast({ type: 'success', message: 'Đã cập nhật công thức nguyên liệu!' });
    onSuccess();
  };

  const handleRemove = async (ingId: string) => {
    await productService.saveRecipe(productSizeId, ingId, 0);
    setRecipes(productService.getRecipesForProductSize(productSizeId));
    showToast({ type: 'info', message: 'Đã xóa nguyên liệu khỏi công thức' });
    onSuccess();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={`Công thức: ${productName} (Size ${sizeName})`}
      maxWidth={520}
      footer={
        <Button variant="secondary" onClick={onClose}>
          Đóng
        </Button>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
          Công thức nguyên liệu dùng chung cho toàn bộ chi nhánh của cửa hàng. Khi đơn hàng thành
          PAID, kho của chi nhánh sẽ tự động trừ lượng nguyên liệu này (BR-43, BR-72).
        </p>

        {/* Danh sách nguyên liệu trong công thức */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)' }}>
            Định lượng cho 1 ly món:
          </label>
          {recipes.length === 0 ? (
            <div
              style={{
                padding: 16,
                background: 'var(--color-warning-bg)',
                color: 'var(--color-warning)',
                borderRadius: 'var(--radius-control)',
                fontSize: 13,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <AlertCircle size={18} />
              <span>Chưa có công thức. Món vẫn bán được nhưng không trừ kho (BR-49).</span>
            </div>
          ) : (
            recipes.map((r) => (
              <div
                key={r.ingredient_id}
                style={{
                  height: 48,
                  padding: '0 14px',
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-control)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span style={{ fontWeight: 600 }}>{r.ingredientName}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span className="num" style={{ fontWeight: 700, color: 'var(--color-brand-800)' }}>
                    {r.quantity} {r.unit}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemove(r.ingredient_id)}
                    aria-label="Xóa nguyên liệu"
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--color-danger)',
                      cursor: 'pointer',
                      display: 'flex',
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Thêm / Cập nhật nguyên liệu */}
        <div
          style={{
            padding: 14,
            background: 'var(--color-surface-sunken)',
            borderRadius: 'var(--radius-control)',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-muted)' }}>
            THÊM NGUYÊN LIỆU VÀO CÔNG THỨC
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: 10, alignItems: 'center' }}>
            <select
              value={selectedIngredientId}
              onChange={(e) => setSelectedIngredientId(e.target.value)}
              style={{
                height: 44,
                padding: '0 12px',
                borderRadius: 'var(--radius-control)',
                border: '1px solid var(--color-border-control)',
                background: 'var(--color-surface)',
                fontSize: 14,
              }}
            >
              {availableIngredients.map((ing) => (
                <option key={ing.id} value={ing.id}>
                  {ing.name} ({ing.unit})
                </option>
              ))}
            </select>

            <input
              type="number"
              placeholder="Định lượng"
              value={quantityInput}
              onChange={(e) => setQuantityInput(e.target.value)}
              style={{
                height: 44,
                padding: '0 12px',
                borderRadius: 'var(--radius-control)',
                border: '1px solid var(--color-border-control)',
                background: 'var(--color-surface)',
                fontSize: 14,
                textAlign: 'right',
              }}
            />

            <Button variant="primary" size="md" style={{ height: 44 }} icon={<Plus size={16} />} onClick={handleAddOrUpdate}>
              Thêm
            </Button>
          </div>
        </div>
      </div>
    </Dialog>
  );
};
