// POS-F&B Products, Toppings, Categories, and Promotions Screen per DESIGN.md & BR-11, BR-12, BR-36..BR-41, BR-48, BR-49

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { productService, ProductDetailItem } from '../../services/productService';
import { mockStorage } from '../../mock/mockStorage';
import { Category, Topping, PromotionCode } from '../../types/entities';
import { formatVND } from '../../utils/formatters';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Dialog } from '../../components/ui/Dialog';
import { Field } from '../../components/ui/Field';
import { DataTable, Column } from '../../components/ui/DataTable';
import { RecipeModal } from './RecipeModal';
import {
  UtensilsCrossed,
  Layers,
  Sparkles,
  Ticket,
  Plus,
  BookOpen,
  Edit2,
  Power,
  Check,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const ProductsScreen: React.FC = () => {
  const { session } = useAuth();
  const { showToast } = useToast();
  const storeId = session.user.store_id || 'store-1';

  const [activeMainTab, setActiveMainTab] = useState<'products' | 'toppings' | 'categories' | 'promotions'>('products');

  // Products state
  const [productsWithDetails, setProductsWithDetails] = useState<ProductDetailItem[]>(() =>
    productService.getProductsWithDetails(storeId)
  );
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('ALL');
  const [categories, setCategories] = useState<Category[]>(() => productService.getCategories(storeId));
  const [toppings, setToppings] = useState<Topping[]>(() => productService.getToppings(storeId));
  const [promotions, setPromotions] = useState<PromotionCode[]>(() => productService.getPromotions(storeId));

  // Modals state
  const [editingRecipe, setEditingRecipe] = useState<{
    productName?: string;
    sizeName?: string;
    productSizeId?: string;
    toppingName?: string;
    toppingId?: string;
  } | null>(null);

  // Category Modal
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [categorySortOrder, setCategorySortOrder] = useState('1');

  // Product Modal
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductDetailItem['product'] | null>(null);
  const [productCategoryId, setProductCategoryId] = useState('');
  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');

  // Price Edit Modal
  const [priceModalOpen, setPriceModalOpen] = useState(false);
  const [editingProductSize, setEditingProductSize] = useState<{ id: string; name: string; size: string; price: string } | null>(null);

  // Topping Modal
  const [toppingModalOpen, setToppingModalOpen] = useState(false);
  const [editingTopping, setEditingTopping] = useState<Topping | null>(null);
  const [toppingName, setToppingName] = useState('');
  const [toppingPrice, setToppingPrice] = useState('5000');

  // Category-Topping Mapping Modal
  const [mappingTopping, setMappingTopping] = useState<Topping | null>(null);

  // Promotion Modal
  const [promoModalOpen, setPromoModalOpen] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoType, setPromoType] = useState<'PERCENT' | 'FIXED'>('PERCENT');
  const [promoValue, setPromoValue] = useState('10');
  const [promoMinOrder, setPromoMinOrder] = useState('50000');
  const [promoMaxDiscount, setPromoMaxDiscount] = useState('30000');
  const [promoUsageLimit, setPromoUsageLimit] = useState('100');

  const refresh = () => {
    setProductsWithDetails(productService.getProductsWithDetails(storeId));
    setCategories(productService.getCategories(storeId));
    setToppings(productService.getToppings(storeId));
    setPromotions(productService.getPromotions(storeId));
  };

  useEffect(() => {
    const unsubscribe = mockStorage.subscribe(refresh);
    return () => unsubscribe();
  }, [storeId]);

  // --- CATEGORY ACTIONS ---
  const handleOpenCreateCategory = () => {
    setEditingCategory(null);
    setCategoryName('');
    setCategorySortOrder((categories.length + 1).toString());
    setCategoryModalOpen(true);
  };

  const handleOpenEditCategory = (cat: Category) => {
    setEditingCategory(cat);
    setCategoryName(cat.name);
    setCategorySortOrder(cat.sort_order.toString());
    setCategoryModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const order = parseInt(categorySortOrder, 10) || 1;
      if (editingCategory) {
        await productService.updateCategory(editingCategory.id, { name: categoryName, sort_order: order });
        showToast({ type: 'success', message: 'Cập nhật danh mục thành công' });
      } else {
        await productService.createCategory(categoryName, order);
        showToast({ type: 'success', message: 'Tạo danh mục mới thành công' });
      }
      setCategoryModalOpen(false);
      refresh();
    } catch (err: any) {
      showToast({ type: 'error', message: err?.message || 'Lỗi lưu danh mục' });
    }
  };

  const handleToggleCategoryActive = async (cat: Category) => {
    try {
      await productService.toggleCategoryActive(cat.id);
      showToast({ type: 'info', message: `Đã ${cat.is_active ? 'ngưng dùng' : 'mở lại'} danh mục ${cat.name}` });
      refresh();
    } catch (err: any) {
      showToast({ type: 'error', message: err?.message || 'Không thể đổi trạng thái danh mục' });
    }
  };

  // --- PRODUCT ACTIONS ---
  const handleOpenCreateProduct = () => {
    setEditingProduct(null);
    setProductCategoryId(categories[0]?.id || '');
    setProductName('');
    setProductDescription('');
    setProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod: ProductDetailItem['product']) => {
    setEditingProduct(prod);
    setProductCategoryId(prod.category_id);
    setProductName(prod.name);
    setProductDescription(prod.description || '');
    setProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await productService.updateProduct(editingProduct.id, {
          category_id: productCategoryId,
          name: productName,
          description: productDescription,
        });
        showToast({ type: 'success', message: 'Cập nhật thông tin món thành công' });
      } else {
        await productService.createProduct(productCategoryId, productName, productDescription);
        showToast({ type: 'success', message: 'Thêm món mới thành công' });
      }
      setProductModalOpen(false);
      refresh();
    } catch (err: any) {
      showToast({ type: 'error', message: err?.message || 'Lỗi lưu món' });
    }
  };

  const handleToggleProductActive = async (prod: ProductDetailItem['product']) => {
    try {
      await productService.toggleProductActive(prod.id);
      showToast({ type: 'info', message: `Đã ${prod.is_active ? 'ngưng bán' : 'mở bán lại'} món ${prod.name}` });
      refresh();
    } catch (err: any) {
      showToast({ type: 'error', message: err?.message || 'Không thể đổi trạng thái món' });
    }
  };

  // --- PRICE EDIT ACTIONS ---
  const handleOpenPriceModal = (prodName: string, sizeName: string, sizeId: string, currentPrice: bigint) => {
    setEditingProductSize({
      id: sizeId,
      name: prodName,
      size: sizeName,
      price: currentPrice.toString(),
    });
    setPriceModalOpen(true);
  };

  const handleSavePrice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProductSize) return;
    try {
      const price = BigInt(editingProductSize.price.replace(/\D/g, '') || '0');
      await productService.updateProductSizePrice(editingProductSize.id, price);
      showToast({
        type: 'success',
        message: `Đã cập nhật giá bán. Đơn đã lập trước đó vẫn giữ nguyên snapshot giá cũ.`,
      });
      setPriceModalOpen(false);
      refresh();
    } catch (err: any) {
      showToast({ type: 'error', message: err?.message || 'Lỗi cập nhật giá' });
    }
  };

  // --- TOPPING ACTIONS ---
  const handleOpenCreateTopping = () => {
    setEditingTopping(null);
    setToppingName('');
    setToppingPrice('5000');
    setToppingModalOpen(true);
  };

  const handleOpenEditTopping = (top: Topping) => {
    setEditingTopping(top);
    setToppingName(top.name);
    setToppingPrice(top.price.toString());
    setToppingModalOpen(true);
  };

  const handleSaveTopping = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const price = BigInt(toppingPrice.replace(/\D/g, '') || '0');
      if (editingTopping) {
        await productService.updateTopping(editingTopping.id, { name: toppingName, price });
        showToast({ type: 'success', message: 'Cập nhật topping thành công' });
      } else {
        await productService.createTopping(toppingName, price);
        showToast({ type: 'success', message: 'Tạo topping mới thành công' });
      }
      setToppingModalOpen(false);
      refresh();
    } catch (err: any) {
      showToast({ type: 'error', message: err?.message || 'Lỗi lưu topping' });
    }
  };

  const handleToggleToppingActive = async (top: Topping) => {
    try {
      await productService.toggleToppingActive(top.id);
      showToast({ type: 'info', message: `Đã ${top.is_active ? 'ngưng bán' : 'mở bán lại'} topping ${top.name}` });
      refresh();
    } catch (err: any) {
      showToast({ type: 'error', message: err?.message || 'Không thể đổi trạng thái topping' });
    }
  };

  // --- PROMOTION ACTIONS ---
  const handleOpenCreatePromo = () => {
    setPromoCode('');
    setPromoType('PERCENT');
    setPromoValue('10');
    setPromoMinOrder('50000');
    setPromoMaxDiscount('30000');
    setPromoUsageLimit('100');
    setPromoModalOpen(true);
  };

  const handleSavePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const val = BigInt(promoValue.replace(/\D/g, '') || '0');
      const minOrder = BigInt(promoMinOrder.replace(/\D/g, '') || '0');
      const maxDisc = BigInt(promoMaxDiscount.replace(/\D/g, '') || '0');
      const limit = parseInt(promoUsageLimit, 10) || 100;

      await productService.createPromotion({
        store_id: storeId,
        code: promoCode,
        discount_type: promoType,
        discount_value: val,
        min_order_amount: minOrder,
        max_discount_amount: maxDisc,
        usage_limit: limit,
        start_at: new Date().toISOString(),
        end_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        is_active: true,
      });
      showToast({ type: 'success', message: 'Tạo mã khuyến mãi thành công!' });
      setPromoModalOpen(false);
      refresh();
    } catch (err: any) {
      showToast({ type: 'error', message: err?.message || 'Lỗi tạo mã khuyến mãi' });
    }
  };

  const handleTogglePromoActive = async (promo: PromotionCode) => {
    try {
      await productService.togglePromotionActive(promo.id);
      showToast({ type: 'info', message: `Đã ${promo.is_active ? 'ngưng áp dụng' : 'kích hoạt lại'} mã ${promo.code}` });
      refresh();
    } catch (err: any) {
      showToast({ type: 'error', message: err?.message || 'Không thể đổi trạng thái mã' });
    }
  };

  const filteredProducts = productsWithDetails.filter((item) => {
    if (activeCategoryFilter === 'ALL') return true;
    return item.category.id === activeCategoryFilter;
  });

  const categoryToppings = productService.getCategoryToppings();

  // Columns for Toppings DataTable
  const toppingColumns: Column<Topping>[] = [
    { key: 'name', header: 'Tên Topping', render: (t) => <strong>{t.name}</strong> },
    { key: 'price', header: 'Giá bán', align: 'right', render: (t) => <span className="money">{formatVND(t.price)}</span> },
    {
      key: 'categories',
      header: 'Áp dụng cho Danh mục',
      render: (t) => {
        const linkedCats = categoryToppings
          .filter((ct) => ct.topping_id === t.id)
          .map((ct) => categories.find((c) => c.id === ct.category_id)?.name)
          .filter(Boolean);
        return (
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {linkedCats.length > 0 ? (
              linkedCats.map((name) => (
                <Badge key={name} variant="neutral" size="sm">
                  {name}
                </Badge>
              ))
            ) : (
              <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Chưa gán</span>
            )}
          </div>
        );
      },
    },
    {
      key: 'status',
      header: 'Trạng thái',
      render: (t) => (
        <Badge variant={t.is_active ? 'success' : 'neutral'} size="sm">
          {t.is_active ? 'Đang bán' : 'Ngưng bán'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Thao tác',
      align: 'right',
      render: (t) => (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
          <Button
            variant="text"
            size="sm"
            style={{ height: 32, padding: '0 8px' }}
            icon={<BookOpen size={14} />}
            onClick={() => setEditingRecipe({ toppingName: t.name, toppingId: t.id })}
          >
            Định lượng
          </Button>
          <Button
            variant="text"
            size="sm"
            style={{ height: 32, padding: '0 8px' }}
            icon={<Layers size={14} />}
            onClick={() => setMappingTopping(t)}
          >
            Gán danh mục
          </Button>
          <Button
            variant="text"
            size="sm"
            style={{ height: 32, padding: '0 8px' }}
            icon={<Edit2 size={14} />}
            onClick={() => handleOpenEditTopping(t)}
          >
            Sửa
          </Button>
          <Button
            variant="text"
            size="sm"
            style={{ height: 32, padding: '0 8px', color: t.is_active ? 'var(--color-danger)' : 'var(--color-success)' }}
            icon={<Power size={14} />}
            onClick={() => handleToggleToppingActive(t)}
          >
            {t.is_active ? 'Ngưng' : 'Bán lại'}
          </Button>
        </div>
      ),
    },
  ];

  // Columns for Categories DataTable
  const categoryColumns: Column<Category>[] = [
    { key: 'name', header: 'Tên danh mục', render: (c) => <strong>{c.name}</strong> },
    { key: 'sort', header: 'Thứ tự hiển thị', align: 'center', render: (c) => <span>{c.sort_order}</span> },
    {
      key: 'count',
      header: 'Số món trong nhóm',
      align: 'center',
      render: (c) => {
        const count = productsWithDetails.filter((p) => p.category.id === c.id).length;
        return <span>{count} món</span>;
      },
    },
    {
      key: 'status',
      header: 'Trạng thái',
      render: (c) => (
        <Badge variant={c.is_active ? 'success' : 'neutral'} size="sm">
          {c.is_active ? 'Hiển thị' : 'Ẩn'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Thao tác',
      align: 'right',
      render: (c) => (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
          <Button
            variant="text"
            size="sm"
            style={{ height: 32, padding: '0 8px' }}
            icon={<Edit2 size={14} />}
            onClick={() => handleOpenEditCategory(c)}
          >
            Sửa
          </Button>
          <Button
            variant="text"
            size="sm"
            style={{ height: 32, padding: '0 8px', color: c.is_active ? 'var(--color-danger)' : 'var(--color-success)' }}
            icon={<Power size={14} />}
            onClick={() => handleToggleCategoryActive(c)}
          >
            {c.is_active ? 'Ẩn' : 'Hiện'}
          </Button>
        </div>
      ),
    },
  ];

  // Columns for Promotions DataTable
  const promoColumns: Column<PromotionCode>[] = [
    { key: 'code', header: 'Mã giảm giá', render: (p) => <strong style={{ color: 'var(--color-brand-700)', letterSpacing: '0.05em' }}>{p.code}</strong> },
    {
      key: 'discount',
      header: 'Mức giảm',
      render: (p) => (
        <span>
          {p.discount_type === 'PERCENT' ? `${p.discount_value}% (Tối đa ${formatVND(p.max_discount_amount)})` : formatVND(p.discount_value)}
        </span>
      ),
    },
    {
      key: 'min',
      header: 'Đơn tối thiểu',
      align: 'right',
      render: (p) => <span className="money">{formatVND(p.min_order_amount)}</span>,
    },
    {
      key: 'usage',
      header: 'Lượt dùng',
      align: 'center',
      render: (p) => (
        <span>
          {p.used_count} / {p.usage_limit}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Trạng thái',
      render: (p) => (
        <Badge variant={p.is_active ? 'success' : 'neutral'} size="sm">
          {p.is_active ? 'Đang áp dụng' : 'Tạm dừng'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Thao tác',
      align: 'right',
      render: (p) => (
        <Button
          variant="text"
          size="sm"
          style={{ height: 32, padding: '0 8px', color: p.is_active ? 'var(--color-danger)' : 'var(--color-success)' }}
          icon={<Power size={14} />}
          onClick={() => handleTogglePromoActive(p)}
        >
          {p.is_active ? 'Tắt' : 'Bật'}
        </Button>
      ),
    },
  ];

  return (
    <div style={{ flex: 1, padding: 24, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-text)' }}>
            Quản lý Thực đơn & Khuyến mãi
          </h1>
          <p style={{ fontSize: 14, color: 'var(--color-text-muted)', marginTop: 4 }}>
            Menu, giá bán, công thức pha chế và chương trình giảm giá toàn cửa hàng
          </p>
        </div>

        <div>
          {activeMainTab === 'products' && (
            <Button variant="primary" icon={<Plus size={16} />} onClick={handleOpenCreateProduct}>
              Thêm món mới
            </Button>
          )}
          {activeMainTab === 'toppings' && (
            <Button variant="primary" icon={<Plus size={16} />} onClick={handleOpenCreateTopping}>
              Thêm topping
            </Button>
          )}
          {activeMainTab === 'categories' && (
            <Button variant="primary" icon={<Plus size={16} />} onClick={handleOpenCreateCategory}>
              Thêm danh mục
            </Button>
          )}
          {activeMainTab === 'promotions' && (
            <Button variant="primary" icon={<Plus size={16} />} onClick={handleOpenCreatePromo}>
              Tạo mã giảm giá
            </Button>
          )}
        </div>
      </div>

      {/* Main Tabs */}
      <div style={{ display: 'flex', gap: 12, borderBottom: '1px solid var(--color-border)', paddingBottom: 4 }}>
        <button
          type="button"
          onClick={() => setActiveMainTab('products')}
          style={{
            height: 40,
            padding: '0 16px',
            borderRadius: 'var(--radius-pill)',
            border: 'none',
            background: activeMainTab === 'products' ? 'var(--color-brand-100)' : 'transparent',
            color: activeMainTab === 'products' ? 'var(--color-brand-800)' : 'var(--color-text-muted)',
            fontWeight: activeMainTab === 'products' ? 700 : 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <UtensilsCrossed size={16} />
          <span>Món & Định lượng ({productsWithDetails.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMainTab('toppings')}
          style={{
            height: 40,
            padding: '0 16px',
            borderRadius: 'var(--radius-pill)',
            border: 'none',
            background: activeMainTab === 'toppings' ? 'var(--color-brand-100)' : 'transparent',
            color: activeMainTab === 'toppings' ? 'var(--color-brand-800)' : 'var(--color-text-muted)',
            fontWeight: activeMainTab === 'toppings' ? 700 : 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <Sparkles size={16} />
          <span>Topping & Áp dụng ({toppings.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMainTab('categories')}
          style={{
            height: 40,
            padding: '0 16px',
            borderRadius: 'var(--radius-pill)',
            border: 'none',
            background: activeMainTab === 'categories' ? 'var(--color-brand-100)' : 'transparent',
            color: activeMainTab === 'categories' ? 'var(--color-brand-800)' : 'var(--color-text-muted)',
            fontWeight: activeMainTab === 'categories' ? 700 : 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <Layers size={16} />
          <span>Danh mục món ({categories.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMainTab('promotions')}
          style={{
            height: 40,
            padding: '0 16px',
            borderRadius: 'var(--radius-pill)',
            border: 'none',
            background: activeMainTab === 'promotions' ? 'var(--color-brand-100)' : 'transparent',
            color: activeMainTab === 'promotions' ? 'var(--color-brand-800)' : 'var(--color-text-muted)',
            fontWeight: activeMainTab === 'promotions' ? 700 : 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <Ticket size={16} />
          <span>Mã khuyến mãi ({promotions.length})</span>
        </button>
      </div>

      {/* --- TAB 1: MÓN & ĐỊNH LƯỢNG --- */}
      {activeMainTab === 'products' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Lọc theo danh mục */}
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
            <button
              type="button"
              onClick={() => setActiveCategoryFilter('ALL')}
              style={{
                height: 36,
                padding: '0 14px',
                borderRadius: 'var(--radius-pill)',
                border: 'none',
                background: activeCategoryFilter === 'ALL' ? 'var(--color-brand-100)' : 'var(--color-surface)',
                color: activeCategoryFilter === 'ALL' ? 'var(--color-brand-800)' : 'var(--color-text-muted)',
                fontWeight: activeCategoryFilter === 'ALL' ? 700 : 500,
                cursor: 'pointer',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              Tất cả ({productsWithDetails.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategoryFilter(cat.id)}
                style={{
                  height: 36,
                  padding: '0 14px',
                  borderRadius: 'var(--radius-pill)',
                  border: 'none',
                  background: activeCategoryFilter === cat.id ? 'var(--color-brand-100)' : 'var(--color-surface)',
                  color: activeCategoryFilter === cat.id ? 'var(--color-brand-800)' : 'var(--color-text-muted)',
                  fontWeight: activeCategoryFilter === cat.id ? 700 : 500,
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-card)',
                }}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Grid món */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
            {filteredProducts.map(({ product, category, sizes }) => {
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
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        {hasMissingRecipe ? (
                          <Badge variant="warning" size="sm">
                            Thiếu công thức
                          </Badge>
                        ) : (
                          <Badge variant="success" size="sm">
                            Đủ công thức
                          </Badge>
                        )}
                        <Button
                          variant="text"
                          size="sm"
                          style={{ height: 28, padding: '0 4px' }}
                          onClick={() => handleOpenEditProduct(product)}
                          title="Sửa thông tin món"
                        >
                          <Edit2 size={14} />
                        </Button>
                        <Button
                          variant="text"
                          size="sm"
                          style={{ height: 28, padding: '0 4px', color: product.is_active ? 'var(--color-text-muted)' : 'var(--color-danger)' }}
                          onClick={() => handleToggleProductActive(product)}
                          title={product.is_active ? 'Ngưng kinh doanh' : 'Mở bán lại'}
                        >
                          <Power size={14} />
                        </Button>
                      </div>
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
                          <button
                            type="button"
                            onClick={() => handleOpenPriceModal(product.name, s.sizeName, s.id, s.price)}
                            title="Sửa giá bán"
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'var(--color-text-muted)',
                              cursor: 'pointer',
                              padding: 2,
                              display: 'inline-flex',
                            }}
                          >
                            <Edit2 size={12} />
                          </button>
                        </div>

                        <Button
                          variant="text"
                          size="sm"
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
                          {s.hasRecipe ? 'Công thức' : 'Cài công thức'}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* --- TAB 2: TOPPING & ÁP DỤNG --- */}
      {activeMainTab === 'toppings' && (
        <DataTable columns={toppingColumns} data={toppings} keyExtractor={(t) => t.id} />
      )}

      {/* --- TAB 3: DANH MỤC MÓN --- */}
      {activeMainTab === 'categories' && (
        <DataTable columns={categoryColumns} data={categories} keyExtractor={(c) => c.id} />
      )}

      {/* --- TAB 4: MÃ KHUYẾN MÃI --- */}
      {activeMainTab === 'promotions' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
            Mã giảm giá được kiểm tra theo điều kiện đơn tối thiểu và giới hạn số lượt sử dụng khi áp dụng tại quầy thu ngân.
          </div>
          <DataTable columns={promoColumns} data={promotions} keyExtractor={(p) => p.id} />
        </div>
      )}

      {/* Dialog Thêm/Sửa Món */}
      <Dialog
        isOpen={productModalOpen}
        onClose={() => setProductModalOpen(false)}
        title={editingProduct ? 'Chỉnh sửa món' : 'Thêm món mới'}
        maxWidth={460}
      >
        <form onSubmit={handleSaveProduct} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label
              htmlFor="product-category-select"
              style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-muted)', display: 'block', marginBottom: 6, cursor: 'pointer' }}
            >
              Danh mục
            </label>
            <select
              id="product-category-select"
              value={productCategoryId}
              onChange={(e) => setProductCategoryId(e.target.value)}
              style={{
                height: 48,
                width: '100%',
                padding: '0 14px',
                borderRadius: 'var(--radius-control)',
                border: '1px solid var(--color-border-control)',
                background: 'var(--color-surface)',
                color: 'var(--color-text)',
                fontSize: 14,
              }}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <Field
            label="Tên món"
            placeholder="VD: Trà sen vàng"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            required
          />

          <Field
            label="Mô tả món (tùy chọn)"
            placeholder="VD: Vị trà ô long thơm bùi hạt sen..."
            value={productDescription}
            onChange={(e) => setProductDescription(e.target.value)}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 6 }}>
            <Button variant="secondary" onClick={() => setProductModalOpen(false)}>
              Hủy
            </Button>
            <Button variant="primary" type="submit">
              {editingProduct ? 'Lưu thay đổi' : 'Tạo món'}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Dialog Sửa Giá Bán (BR-12) */}
      <Dialog
        isOpen={priceModalOpen}
        onClose={() => setPriceModalOpen(false)}
        title={`Cập nhật giá bán: ${editingProductSize?.name} (${editingProductSize?.size})`}
        maxWidth={420}
      >
        <form onSubmit={handleSavePrice} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
            Lưu ý: Thay đổi giá tại đây chỉ áp dụng cho những đơn hàng được thêm sau thời điểm đổi. Đơn cũ giữ nguyên giá snapshot.
          </p>
          <Field
            label="Giá bán mới (VND)"
            placeholder="35000"
            value={editingProductSize?.price || ''}
            onChange={(e) =>
              setEditingProductSize((prev) => (prev ? { ...prev, price: e.target.value } : null))
            }
            required
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <Button variant="secondary" onClick={() => setPriceModalOpen(false)}>
              Hủy
            </Button>
            <Button variant="primary" type="submit">
              Xác nhận đổi giá
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Dialog Thêm/Sửa Topping */}
      <Dialog
        isOpen={toppingModalOpen}
        onClose={() => setToppingModalOpen(false)}
        title={editingTopping ? 'Chỉnh sửa topping' : 'Thêm topping mới'}
        maxWidth={420}
      >
        <form onSubmit={handleSaveTopping} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Field
            label="Tên topping"
            placeholder="VD: Trân châu đường đen"
            value={toppingName}
            onChange={(e) => setToppingName(e.target.value)}
            required
          />
          <Field
            label="Giá bán cộng thêm (VND)"
            placeholder="7000"
            value={toppingPrice}
            onChange={(e) => setToppingPrice(e.target.value)}
            required
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <Button variant="secondary" onClick={() => setToppingModalOpen(false)}>
              Hủy
            </Button>
            <Button variant="primary" type="submit">
              {editingTopping ? 'Lưu thay đổi' : 'Tạo topping'}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Dialog Gán Topping vào Danh mục (BR-11) */}
      <Dialog
        isOpen={!!mappingTopping}
        onClose={() => setMappingTopping(null)}
        title={`Áp dụng Topping "${mappingTopping?.name}" cho Danh mục`}
        maxWidth={460}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
            Chọn những danh mục đồ uống có thể gọi thêm topping này tại màn hình POS:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {categories.map((cat) => {
              const isLinked = categoryToppings.some(
                (ct) => ct.category_id === cat.id && ct.topping_id === mappingTopping?.id
              );
              return (
                <div
                  key={cat.id}
                  role="checkbox"
                  aria-checked={isLinked}
                  tabIndex={0}
                  onClick={async () => {
                    if (!mappingTopping) return;
                    if (isLinked) {
                      await productService.unlinkToppingFromCategory(cat.id, mappingTopping.id);
                    } else {
                      await productService.linkToppingToCategory(cat.id, mappingTopping.id);
                    }
                    refresh();
                  }}
                  onKeyDown={async (e) => {
                    if (e.key === ' ' || e.key === 'Enter') {
                      e.preventDefault();
                      if (!mappingTopping) return;
                      if (isLinked) {
                        await productService.unlinkToppingFromCategory(cat.id, mappingTopping.id);
                      } else {
                        await productService.linkToppingToCategory(cat.id, mappingTopping.id);
                      }
                      refresh();
                    }
                  }}
                  style={{
                    height: 48,
                    padding: '0 14px',
                    borderRadius: 'var(--radius-control)',
                    border: isLinked ? '1.5px solid var(--color-brand-600)' : '1px solid var(--color-border)',
                    background: isLinked ? 'var(--color-brand-50)' : 'var(--color-surface)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'all 150ms ease',
                  }}
                >
                  <span style={{ fontSize: 14, fontWeight: isLinked ? 600 : 400, color: isLinked ? 'var(--color-brand-800)' : 'var(--color-text)' }}>
                    {cat.name}
                  </span>
                  {isLinked && <Check size={18} style={{ color: 'var(--color-brand-600)' }} />}
                </div>
              );
            })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
            <Button variant="primary" onClick={() => setMappingTopping(null)}>
              Xong
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Dialog Thêm/Sửa Danh mục */}
      <Dialog
        isOpen={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        title={editingCategory ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
        maxWidth={420}
      >
        <form onSubmit={handleSaveCategory} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Field
            label="Tên danh mục"
            placeholder="VD: Trà hoa quả tươi"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            required
          />
          <Field
            label="Thứ tự hiển thị"
            type="number"
            value={categorySortOrder}
            onChange={(e) => setCategorySortOrder(e.target.value)}
            required
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <Button variant="secondary" onClick={() => setCategoryModalOpen(false)}>
              Hủy
            </Button>
            <Button variant="primary" type="submit">
              {editingCategory ? 'Lưu thay đổi' : 'Tạo danh mục'}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Dialog Tạo Mã Giảm Giá (BR-36..BR-41) */}
      <Dialog
        isOpen={promoModalOpen}
        onClose={() => setPromoModalOpen(false)}
        title="Tạo mã khuyến mãi mới"
        maxWidth={480}
      >
        <form onSubmit={handleSavePromo} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Field
            label="Mã code (viết hoa không dấu)"
            placeholder="VD: CHAOHAY2026"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value.toUpperCase().replace(/\s+/g, ''))}
            required
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label
                htmlFor="promo-type-select"
                style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-muted)', display: 'block', marginBottom: 6, cursor: 'pointer' }}
              >
                Loại giảm giá
              </label>
              <select
                id="promo-type-select"
                value={promoType}
                onChange={(e) => setPromoType(e.target.value as 'PERCENT' | 'FIXED')}
                style={{
                  height: 48,
                  width: '100%',
                  padding: '0 12px',
                  borderRadius: 'var(--radius-control)',
                  border: '1px solid var(--color-border-control)',
                  background: 'var(--color-surface)',
                  color: 'var(--color-text)',
                  fontSize: 14,
                }}
              >
                <option value="PERCENT">Theo phần trăm (%)</option>
                <option value="FIXED">Số tiền cố định (VND)</option>
              </select>
            </div>

            <Field
              label={promoType === 'PERCENT' ? 'Tỷ lệ giảm (%)' : 'Số tiền giảm (VND)'}
              placeholder={promoType === 'PERCENT' ? '10' : '20000'}
              value={promoValue}
              onChange={(e) => setPromoValue(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field
              label="Đơn tối thiểu (VND)"
              placeholder="50000"
              value={promoMinOrder}
              onChange={(e) => setPromoMinOrder(e.target.value)}
              required
            />
            <Field
              label="Giảm tối đa (VND)"
              placeholder="30000"
              value={promoMaxDiscount}
              onChange={(e) => setPromoMaxDiscount(e.target.value)}
              required
            />
          </div>

          <Field
            label="Giới hạn tổng lượt sử dụng"
            type="number"
            min={1}
            placeholder="100"
            value={promoUsageLimit}
            onChange={(e) => setPromoUsageLimit(e.target.value)}
            required
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 6 }}>
            <Button variant="secondary" onClick={() => setPromoModalOpen(false)}>
              Hủy
            </Button>
            <Button variant="primary" type="submit">
              Xác nhận tạo mã
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Recipe Modal */}
      {editingRecipe && (
        <RecipeModal
          isOpen={!!editingRecipe}
          onClose={() => setEditingRecipe(null)}
          productName={editingRecipe.productName}
          sizeName={editingRecipe.sizeName}
          productSizeId={editingRecipe.productSizeId}
          toppingName={editingRecipe.toppingName}
          toppingId={editingRecipe.toppingId}
          storeId={storeId}
          onSuccess={refresh}
        />
      )}
    </div>
  );
};
