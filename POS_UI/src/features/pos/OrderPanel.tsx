// POS-F&B Order Panel (400px cố định trên tablet ngang) per DESIGN.md §5.2

import React, { useState } from 'react';
import { Invoice } from '../../types/entities';
import { Button } from '../../components/ui/Button';
import { formatVND } from '../../utils/formatters';
import { useToast } from '../../context/ToastContext';
import { Trash2, Tag, UtensilsCrossed, ShoppingBag, X } from 'lucide-react';

export interface OrderPanelProps {
  invoice: Invoice | null;
  tableName?: string;
  onUpdateQuantity: (itemId: string, newQty: number) => void;
  onRemoveItem: (itemId: string) => void;
  onApplyPromotion: (code: string) => Promise<void>;
  onRemovePromotion: () => Promise<void>;
  onOpenPayment: () => void;
  onChangeTable?: () => void;
  onAddMoreItems?: () => void;
  isTablesMode?: boolean;
  onCreateTakeaway?: () => void;
  onCloseMobileDrawer?: () => void;
}

export const OrderPanel: React.FC<OrderPanelProps> = ({
  invoice,
  tableName,
  onUpdateQuantity,
  onRemoveItem,
  onApplyPromotion,
  onRemovePromotion,
  onOpenPayment,
  onChangeTable,
  onAddMoreItems,
  isTablesMode,
  onCreateTakeaway,
  onCloseMobileDrawer,
}) => {
  const { showToast } = useToast();
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState('');

  if (!invoice) {
    return (
      <div
        style={{
          width: '100%',
          maxWidth: 400,
          background: 'var(--color-surface)',
          borderLeft: '1px solid var(--color-border)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 32,
          textAlign: 'center',
          color: 'var(--color-text-muted)',
          height: '100%',
        }}
      >
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: 'var(--color-brand-50)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
          }}
        >
          <UtensilsCrossed size={36} color="var(--color-brand-600)" />
        </div>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text)', marginBottom: 8 }}>
          Chưa chọn bàn hoặc đơn
        </h3>
        <p style={{ fontSize: 14, lineHeight: '22px', maxWidth: 280, marginBottom: 16 }}>
          Chọn một bàn còn trống từ sơ đồ phòng bàn hoặc bấm tạo đơn mang đi để bắt đầu phục vụ.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%', maxWidth: 220 }}>
          {onCreateTakeaway && (
            <Button
              variant="primary"
              size="md"
              icon={<ShoppingBag size={18} />}
              onClick={onCreateTakeaway}
            >
              Tạo đơn mang đi
            </Button>
          )}
          {onChangeTable && (
            <Button
              variant="secondary"
              size="sm"
              icon={<UtensilsCrossed size={16} />}
              onClick={onChangeTable}
            >
              Xem sơ đồ bàn
            </Button>
          )}
        </div>
      </div>
    );
  }

  const handleApplyPromo = async () => {
    if (!promoCodeInput.trim()) return;
    setPromoLoading(true);
    setPromoError('');
    try {
      await onApplyPromotion(promoCodeInput.trim());
      setPromoCodeInput('');
      showToast({ type: 'success', message: `Đã áp dụng mã giảm giá thành công!` });
    } catch (err: any) {
      setPromoError(err?.message || 'Mã giảm giá không hợp lệ');
    } finally {
      setPromoLoading(false);
    }
  };

  const handleRemoveItemWithUndo = (item: Invoice['items'][0]) => {
    onRemoveItem(item.id);
    showToast({
      type: 'info',
      message: `Đã bỏ ${item.product_name_snapshot}.`,
      undoLabel: 'Hoàn tác',
      onUndo: () => {
        // Hoàn tác: thêm lại món
        onUpdateQuantity(item.id, item.quantity);
      },
    });
  };

  const isDineIn = invoice.order_type === 'DINE_IN';

  return (
    <div
      style={{
        width: 400,
        height: '100%',
        background: 'var(--color-surface)',
        borderLeft: '1px solid var(--color-border)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
      }}
    >
      {/* Header Panel */}
      <div
        style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {isDineIn ? <UtensilsCrossed size={20} color="var(--color-brand-600)" /> : <ShoppingBag size={20} color="var(--color-info)" />}
          <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text)' }}>
            {isDineIn ? (tableName || 'Bàn chưa đặt tên') : 'Mang đi (Takeaway)'}
          </span>
          {isDineIn && onChangeTable && (
            <button
              type="button"
              onClick={onChangeTable}
              style={{
                marginLeft: 4,
                padding: '2px 8px',
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--color-brand-700)',
                background: 'var(--color-brand-50)',
                border: '1px solid var(--color-brand-200)',
                borderRadius: 'var(--radius-pill)',
                cursor: 'pointer',
              }}
              title="Đổi hoặc chọn bàn khác"
            >
              Đổi bàn
            </button>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              padding: '4px 8px',
              borderRadius: 'var(--radius-pill)',
              background: isDineIn ? 'var(--color-brand-100)' : 'var(--color-info-bg)',
              color: isDineIn ? 'var(--color-brand-800)' : 'var(--color-info)',
            }}
          >
            {isDineIn ? 'Tại chỗ' : 'Mang đi'} &bull; #{invoice.invoice_code.split('-').pop()}
          </span>
          {onCloseMobileDrawer && (
            <button
              type="button"
              onClick={onCloseMobileDrawer}
              aria-label="Đóng giỏ hàng"
              className="touch-press"
              style={{
                width: 44,
                height: 44,
                borderRadius: 'var(--radius-control)',
                border: '1px solid var(--color-border)',
                background: 'var(--color-surface)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--color-text)',
              }}
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Danh sách các dòng món cuộn được */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
        {invoice.items.length === 0 ? (
          <div
            style={{
              padding: '48px 16px',
              textAlign: 'center',
              color: 'var(--color-text-muted)',
              fontSize: 14,
            }}
          >
            Chưa có món nào trong đơn.
            <br />
            Chạm vào món trong menu để thêm.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {invoice.items.map((item) => (
              <div
                key={item.id}
                style={{
                  padding: '12px 14px',
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-control)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                {/* Dòng 1: Tên món, Size và Nút xoá */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text)' }}>
                      {item.product_name_snapshot}{' '}
                      <span style={{ fontSize: 13, color: 'var(--color-brand-600)' }}>
                        ({item.size_name_snapshot})
                      </span>
                    </div>
                    {/* Dòng 2: Toppings */}
                    {item.toppings.length > 0 && (
                      <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 2 }}>
                        + {item.toppings.map((t) => t.topping_name_snapshot).join(', ')}
                      </div>
                    )}
                    {item.notes && (
                      <div style={{ fontSize: 12, color: 'var(--color-warning)', marginTop: 2 }}>
                        Ghi chú: {item.notes}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveItemWithUndo(item)}
                    aria-label="Xóa dòng món"
                    className="touch-press"
                    style={{
                      height: 48,
                      width: 40,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'transparent',
                      border: 'none',
                      borderRadius: 'var(--radius-control)',
                      color: 'var(--color-text-muted)',
                      cursor: 'pointer',
                    }}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                {/* Dòng 3: Bộ tăng giảm số lượng 48px và Thành tiền dòng */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <button
                      type="button"
                      onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                      aria-label="Giảm số lượng"
                      className="touch-press"
                      style={{
                        height: 48,
                        width: 48,
                        borderRadius: 'var(--radius-control)',
                        border: '1px solid var(--color-border-control)',
                        background: 'var(--color-surface)',
                        fontSize: 20,
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--color-text)',
                      }}
                    >
                      &minus;
                    </button>
                    <span
                      className="num"
                      style={{
                        minWidth: 32,
                        textAlign: 'center',
                        fontSize: 17,
                        fontWeight: 700,
                        color: 'var(--color-text)',
                      }}
                    >
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                      aria-label="Tăng số lượng"
                      className="touch-press"
                      style={{
                        height: 48,
                        width: 48,
                        borderRadius: 'var(--radius-control)',
                        border: '1px solid var(--color-border-control)',
                        background: 'var(--color-surface)',
                        fontSize: 20,
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--color-text)',
                      }}
                    >
                      +
                    </button>
                  </div>

                  <div className="money" style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text)' }}>
                    {formatVND(item.line_total)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Mục áp mã giảm giá */}
      <div
        style={{
          padding: '12px 16px',
          borderTop: '1px solid var(--color-border)',
          background: 'var(--color-surface)',
          flexShrink: 0,
        }}
      >
        {invoice.applied_promotion ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 12px',
              borderRadius: 'var(--radius-control)',
              background: 'var(--color-success-bg)',
              color: 'var(--color-success)',
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Tag size={16} />
              <span>Mã: {invoice.applied_promotion.code_snapshot}</span>
              <span>(-{formatVND(invoice.applied_promotion.discount_amount)})</span>
            </div>
            <button
              type="button"
              onClick={onRemovePromotion}
              aria-label="Bỏ mã giảm giá"
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--color-success)',
                cursor: 'pointer',
                display: 'flex',
              }}
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="text"
              placeholder="Nhập mã giảm giá..."
              value={promoCodeInput}
              onChange={(e) => setPromoCodeInput(e.target.value)}
              style={{
                height: 48,
                flex: 1,
                padding: '0 12px',
                border: '1px solid var(--color-border-control)',
                borderRadius: 'var(--radius-control)',
                fontSize: 13,
                textTransform: 'uppercase',
              }}
            />
            <Button
              variant="secondary"
              size="md"
              style={{ height: 48 }}
              onClick={handleApplyPromo}
              isLoading={promoLoading}
              disabled={!promoCodeInput.trim() || invoice.items.length === 0}
            >
              Áp mã
            </Button>
          </div>
        )}
        {promoError && (
          <div style={{ fontSize: 12, color: 'var(--color-danger)', marginTop: 4 }}>
            {promoError}
          </div>
        )}
      </div>

      {/* Footer cố định: Tạm tính, Giảm giá, Tổng cộng, Nút thanh toán 56px */}
      <div
        style={{
          padding: '16px 20px',
          borderTop: '1px solid var(--color-border)',
          background: 'var(--color-surface)',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: 'var(--color-text-muted)' }}>
            <span>Tạm tính</span>
            <span className="money">{formatVND(invoice.subtotal)}</span>
          </div>

          {invoice.discount_amount > 0n && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: 'var(--color-success)' }}>
              <span>Giảm giá</span>
              <span className="money">&minus;{formatVND(invoice.discount_amount)}</span>
            </div>
          )}

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              paddingTop: 6,
              borderTop: '1px dashed var(--color-border)',
            }}
          >
            <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text)' }}>
              Tổng cộng
            </span>
            <span className="money" style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-brand-600)' }}>
              {formatVND(invoice.total_amount)}
            </span>
          </div>
        </div>

        {/* Nút hành động chính 56px per DESIGN.md §4.3 */}
        {isTablesMode ? (
          <div style={{ display: 'flex', gap: 10 }}>
            {onAddMoreItems && (
              <Button
                variant="secondary"
                size="lg"
                style={{ flex: 1 }}
                onClick={onAddMoreItems}
                icon={<UtensilsCrossed size={18} />}
              >
                Gọi thêm món
              </Button>
            )}
            <Button
              variant="primary"
              size="lg"
              style={{ flex: 1 }}
              disabled={invoice.items.length === 0}
              onClick={onOpenPayment}
            >
              Thanh toán {formatVND(invoice.total_amount)}
            </Button>
          </div>
        ) : (
          <Button
            variant="primary"
            size="lg"
            fullWidth
            disabled={invoice.items.length === 0}
            onClick={onOpenPayment}
          >
            Thanh toán {formatVND(invoice.total_amount)}
          </Button>
        )}
      </div>
    </div>
  );
};
