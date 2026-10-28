// POS-F&B Product Grid & Category Tabs per DESIGN.md §5.2 & §6.2

import React, { useState } from 'react';
import { Category, Product, ProductSize, Topping, CategoryTopping } from '../../types/entities';
import { ProductCustomizeModal } from './ProductCustomizeModal';
import { formatVND } from '../../utils/formatters';
import { Search } from 'lucide-react';

export interface ProductGridProps {
  categories: Category[];
  products: Product[];
  productSizes: ProductSize[];
  toppings: Topping[];
  categoryToppings: CategoryTopping[];
  onAddItem: (productSizeId: string, quantity: number, selectedToppingIds: string[]) => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  categories,
  products,
  productSizes,
  toppings,
  categoryToppings,
  onAddItem,
}) => {
  const [activeCategoryId, setActiveCategoryId] = useState<string>(categories[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [customizingProduct, setCustomizingProduct] = useState<Product | null>(null);

  // Lọc sản phẩm
  const filteredProducts = products.filter((p) => {
    if (searchQuery.trim()) {
      return p.name.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return p.category_id === activeCategoryId;
  });

  const handleTileClick = (product: Product) => {
    const sizes = productSizes.filter((ps) => ps.product_id === product.id);
    const validToppingIds = categoryToppings
      .filter((ct) => ct.category_id === product.category_id)
      .map((ct) => ct.topping_id);

    // Nếu món chỉ có đúng 1 size và danh mục không có topping nào -> thêm ngay 1 chạm (DESIGN.md §2)
    if (sizes.length === 1 && validToppingIds.length === 0) {
      onAddItem(sizes[0].id, 1, []);
    } else {
      setCustomizingProduct(product);
    }
  };

  const currentProductSizes = customizingProduct
    ? productSizes
        .filter((ps) => ps.product_id === customizingProduct.id)
        .map((ps) => ({
          ...ps,
          sizeName: ps.size_id.includes('sz-m') ? 'M' : ps.size_id.includes('sz-l') ? 'L' : 'Tiêu chuẩn',
        }))
    : [];

  const currentProductToppings = customizingProduct
    ? toppings.filter((t) =>
        categoryToppings.some(
          (ct) => ct.category_id === customizingProduct.category_id && ct.topping_id === t.id
        )
      )
    : [];

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 'clamp(12px, 2.5vw, 16px)' }}>
      {/* Tìm kiếm & Category Tabs */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16, flexShrink: 0 }}>
        {/* Search */}
        <div style={{ position: 'relative' }}>
          <Search
            size={18}
            style={{ position: 'absolute', left: 14, top: 15, color: 'var(--color-text-muted)' }}
          />
          <input
            type="text"
            placeholder="Tìm món nhanh..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              height: 48,
              width: '100%',
              paddingLeft: 42,
              paddingRight: 16,
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border-control)',
              borderRadius: 'var(--radius-control)',
              fontSize: 15,
              color: 'var(--color-text)',
            }}
          />
        </div>

        {/* Tab danh mục (gạch chân nâu phin 3px) */}
        {!searchQuery && (
          <div
            style={{
              display: 'flex',
              gap: 8,
              overflowX: 'auto',
              WebkitOverflowScrolling: 'touch',
              borderBottom: '1px solid var(--color-border)',
              paddingBottom: 2,
            }}
          >
            {categories.map((cat) => {
              const isActive = cat.id === activeCategoryId;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategoryId(cat.id)}
                  className="touch-press"
                  style={{
                    height: 48,
                    padding: '0 16px',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: isActive ? '3px solid var(--color-brand-600)' : '3px solid transparent',
                    color: isActive ? 'var(--color-brand-600)' : 'var(--color-text-muted)',
                    fontSize: 15,
                    fontWeight: isActive ? 700 : 500,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                  }}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Lưới các ô món (Product Tiles cao >= 96px) */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
          gap: 12,
          alignContent: 'start',
        }}
      >
        {filteredProducts.map((prod) => {
          const sizes = productSizes.filter((ps) => ps.product_id === prod.id);
          const minPrice = sizes.reduce(
            (min, s) => (s.price < min ? s.price : min),
            sizes[0]?.price || 0n
          );

          return (
            <button
              key={prod.id}
              type="button"
              onClick={() => handleTileClick(prod)}
              className="touch-press"
              style={{
                minHeight: 104,
                padding: '14px 14px',
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-tile)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                textAlign: 'left',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                userSelect: 'none',
              }}
            >
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: 'var(--color-text)',
                  lineHeight: '20px',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {prod.name}
              </div>

              <div
                className="money"
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: 'var(--color-brand-600)',
                  marginTop: 8,
                }}
              >
                {sizes.length > 1 ? `từ ${formatVND(minPrice)}` : formatVND(minPrice)}
              </div>
            </button>
          );
        })}
      </div>

      {/* Modal tùy chỉnh size & topping */}
      {customizingProduct && (
        <ProductCustomizeModal
          isOpen={!!customizingProduct}
          onClose={() => setCustomizingProduct(null)}
          product={customizingProduct}
          availableSizes={currentProductSizes}
          availableToppings={currentProductToppings}
          onConfirm={onAddItem}
        />
      )}
    </div>
  );
};
