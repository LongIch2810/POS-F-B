// POS-F&B Recipe Modal per BR-48, BR-49 (Supports Product Sizes & Toppings)

import React, { useState, useEffect } from 'react';
import { productService } from '../../services/productService';
import { Dialog } from '../../components/ui/Dialog';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../context/ToastContext';
import { Plus, Trash2, AlertCircle } from 'lucide-react';

export interface RecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName?: string;
  sizeName?: string;
  productSizeId?: string;
  toppingName?: string;
  toppingId?: string;
  storeId: string;
  onSuccess: () => void;
}

export const RecipeModal: React.FC<RecipeModalProps> = ({
  isOpen,
  onClose,
  productName,
  sizeName,
  productSizeId,
  toppingName,
  toppingId,
  storeId,
  onSuccess,
}) => {
  const { showToast } = useToast();
  const [recipes, setRecipes] = useState<{ ingredient_id: string; ingredientName: string; unit: string; quantity: number }[]>([]);
  const [availableIngredients] = useState(() => productService.getAllIngredients(storeId));

  const [selectedIngredientId, setSelectedIngredientId] = useState(availableIngredients[0]?.id || '');
  const [quantityInput, setQuantityInput] = useState('20');

  const loadRecipes = () => {
    if (productSizeId) {
      setRecipes(productService.getRecipesForProductSize(productSizeId));
    } else if (toppingId) {
      setRecipes(productService.getToppingRecipes(toppingId));
    }
  };

  useEffect(() => {
    loadRecipes();
  }, [productSizeId, toppingId]);

  if (!isOpen) return null;

  const currentIngredient = availableIngredients.find((i) => i.id === selectedIngredientId);

  const handleAddOrUpdate = async () => {
    const qty = parseFloat(quantityInput);
    if (isNaN(qty) || qty <= 0) {
      showToast({ type: 'error', message: 'Định lượng nguyên liệu phải lớn hơn 0' });
      return;
    }

    const updated = recipes.filter((r) => r.ingredient_id !== selectedIngredientId);
    updated.push({
      ingredient_id: selectedIngredientId,
      ingredientName: currentIngredient?.name || '',
      unit: currentIngredient?.unit || '',
      quantity: qty,
    });

    if (productSizeId) {
      await productService.saveProductSizeRecipe(productSizeId, updated);
    } else if (toppingId) {
      await productService.saveToppingRecipe(toppingId, updated);
    }

    loadRecipes();
    showToast({ type: 'success', message: 'Đã cập nhật công thức định lượng!' });
    onSuccess();
  };

  const handleRemove = async (ingId: string) => {
    const updated = recipes.filter((r) => r.ingredient_id !== ingId);
    if (productSizeId) {
      await productService.saveProductSizeRecipe(productSizeId, updated);
    } else if (toppingId) {
      await productService.saveToppingRecipe(toppingId, updated);
    }
    loadRecipes();
    showToast({ type: 'info', message: 'Đã xóa nguyên liệu khỏi công thức' });
    onSuccess();
  };

  const modalTitle = productSizeId
    ? `Công thức: ${productName} (Size ${sizeName})`
    : `Công thức: Topping ${toppingName}`;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={modalTitle}
      maxWidth={520}
      footer={
        <Button variant="secondary" onClick={onClose}>
          Đóng
        </Button>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
          Công thức nguyên liệu dùng chung cho toàn bộ chi nhánh. Khi đơn hàng chuyển trạng thái
          Đã thanh toán, kho chi nhánh sẽ tự động trừ lượng nguyên liệu này.
        </p>

        {/* Danh sách nguyên liệu trong công thức */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)' }}>
            Định lượng cho 1 khẩu phần:
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
              <span>Chưa có công thức. Món/Topping vẫn bán được nhưng chưa liên kết trừ tồn kho.</span>
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
                    aria-label={`Xóa nguyên liệu ${r.ingredientName} khỏi công thức`}
                    style={{
                      minWidth: 44,
                      minHeight: 44,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'transparent',
                      border: 'none',
                      borderRadius: 'var(--radius-control)',
                      color: 'var(--color-danger)',
                      cursor: 'pointer',
                    }}
                  >
                    <Trash2 size={18} />
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
              aria-label="Chọn nguyên liệu"
              value={selectedIngredientId}
              onChange={(e) => setSelectedIngredientId(e.target.value)}
              style={{
                height: 44,
                padding: '0 12px',
                borderRadius: 'var(--radius-control)',
                border: '1px solid var(--color-border-control)',
                background: 'var(--color-surface)',
                color: 'var(--color-text)',
                fontSize: 14,
              }}
            >
              {availableIngredients.map((ing) => (
                <option key={ing.id} value={ing.id}>
                  {ing.name} ({ing.unit})
                </option>
              ))}
            </select>

            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                type="number"
                aria-label="Nhập định lượng nguyên liệu"
                placeholder="Định lượng"
                value={quantityInput}
                onChange={(e) => setQuantityInput(e.target.value)}
                style={{
                  height: 44,
                  width: '100%',
                  padding: '0 32px 0 12px',
                  borderRadius: 'var(--radius-control)',
                  border: '1px solid var(--color-border-control)',
                  background: 'var(--color-surface)',
                  color: 'var(--color-text)',
                  fontSize: 14,
                  textAlign: 'right',
                }}
              />
              <span
                style={{
                  position: 'absolute',
                  right: 10,
                  fontSize: 12,
                  color: 'var(--color-text-muted)',
                  pointerEvents: 'none',
                }}
              >
                {currentIngredient?.unit || 'g'}
              </span>
            </div>

            <Button variant="primary" size="md" style={{ minHeight: 44 }} icon={<Plus size={16} />} onClick={handleAddOrUpdate}>
              Thêm
            </Button>
          </div>
        </div>
      </div>
    </Dialog>
  );
};
