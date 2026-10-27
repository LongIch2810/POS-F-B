import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { productService, ProductDetailItem } from '../../services/productService';
import { formatVND } from '../../utils/formatters';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { RecipeModal } from './RecipeModal';
import { BookOpen } from 'lucide-react';

export const ProductsScreen: React.FC = () => {
  const { session } = useAuth();
  const storeId = session.user.store_id || 'store-1';

  const [productsWithDetails, setProductsWithDetails] = useState<ProductDetailItem[]>(() =>
    productService.getProductsWithDetails(storeId)
  );

  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [editingRecipe, setEditingRecipe] = useState<{
    productName: string;
    sizeName: string;
    productSizeId: string;
  } | null>(null);

  const categories = productService.getCategories(storeId);

  const refresh = () => {
    setProductsWithDetails(productService.getProductsWithDetails(storeId));
  };

  const filtered = productsWithDetails.filter((item) => {
    if (activeCategory === 'ALL') return true;
    return item.category.id === activeCategory;
  });

  return (
    <div style={{ flex: 1, padding: 24, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-text)' }}>
          Thực đơn & Công thức pha chế
        </h1>
        <p style={{ fontSize: 14, color: 'var(--color-text-muted)', marginTop: 4 }}>
          Menu dùng chung toàn cửa hàng. Đổi giá chỉ áp dụng cho món thêm vào đơn sau thời điểm đổi (BR-12).
        </p>
      </div>

      {/* Tabs danh mục */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', borderBottom: '1px solid var(--color-border)', paddingBottom: 4 }}>
        <button
          type="button"
          onClick={() => setActiveCategory('ALL')}
          style={{
            height: 38,
            padding: '0 16px',
            borderRadius: 'var(--radius-pill)',
            border: 'none',
            background: activeCategory === 'ALL' ? 'var(--color-brand-100)' : 'transparent',
            color: activeCategory === 'ALL' ? 'var(--color-brand-800)' : 'var(--color-text-muted)',
            fontWeight: activeCategory === 'ALL' ? 700 : 500,
            cursor: 'pointer',
          }}
        >
          Tất cả danh mục ({productsWithDetails.length})
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setActiveCategory(cat.id)}
            style={{
              height: 38,
              padding: '0 16px',
              borderRadius: 'var(--radius-pill)',
              border: 'none',
              background: activeCategory === cat.id ? 'var(--color-brand-100)' : 'transparent',
              color: activeCategory === cat.id ? 'var(--color-brand-800)' : 'var(--color-text-muted)',
              fontWeight: activeCategory === cat.id ? 700 : 500,
              cursor: 'pointer',
            }}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Danh sách món */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
        {filtered.map(({ product, category, sizes }) => {
          const hasMissingRecipe = sizes.some((s) => !s.hasRecipe);

          return (
            <div
              key={product.id}
              style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-tile)',
                padding: 18,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: 12,
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--color-text)' }}>
                      {product.name}
                    </h3>
                    <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>
                      Danh mục: {category.name}
                    </div>
                  </div>
                  {hasMissingRecipe ? (
                    <Badge variant="warning" size="sm">
                      Chưa có công thức (BR-49)
                    </Badge>
                  ) : (
                    <Badge variant="success" size="sm">
                      Đủ công thức
                    </Badge>
                  )}
                </div>

                {product.description && (
                  <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 8 }}>
                    {product.description}
                  </p>
                )}
              </div>

              {/* Các kích cỡ & giá bán */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 12, borderTop: '1px solid var(--color-border)' }}>
                {sizes.map((s) => (
                  <div
                    key={s.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: 14,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontWeight: 600 }}>Size {s.sizeName}:</span>
                      <span className="money" style={{ color: 'var(--color-brand-600)', fontWeight: 700 }}>
                        {formatVND(s.price)}
                      </span>
                    </div>

                    <Button
                      variant="text"
                      size="md"
                      style={{ height: 32, padding: '0 8px', fontSize: 13 }}
                      icon={<BookOpen size={14} />}
                      onClick={() =>
                        setEditingRecipe({
                          productName: product.name,
                          sizeName: s.sizeName,
                          productSizeId: s.id,
                        })
                      }
                    >
                      {s.hasRecipe ? 'Xem công thức' : 'Cài công thức'}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Recipe Modal */}
      {editingRecipe && (
        <RecipeModal
          isOpen={!!editingRecipe}
          onClose={() => setEditingRecipe(null)}
          productName={editingRecipe.productName}
          sizeName={editingRecipe.sizeName}
          productSizeId={editingRecipe.productSizeId}
          storeId={storeId}
          onSuccess={refresh}
        />
      )}
    </div>
  );
};
