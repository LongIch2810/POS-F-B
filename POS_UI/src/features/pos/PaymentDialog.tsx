// POS-F&B Payment Dialog per DESIGN.md §5.4 (Điểm nhấn giao diện)

import React, { useState } from 'react';
import { Invoice, PaymentMethod } from '../../types/entities';
import { Dialog } from '../../components/ui/Dialog';
import { Button } from '../../components/ui/Button';
import { Numpad } from '../../components/ui/Numpad';
import { formatVND } from '../../utils/formatters';
import { Banknote, QrCode } from 'lucide-react';

export interface PaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice;
  onSuccess: () => void;
  onConfirmPayment: (
    method: PaymentMethod,
    tenderedAmount: bigint,
    transactionRef?: string,
    idempotencyKey?: string
  ) => Promise<void>;
}

export const PaymentDialog: React.FC<PaymentDialogProps> = ({
  isOpen,
  onClose,
  invoice,
  onConfirmPayment,
}) => {
  const [method, setMethod] = useState<PaymentMethod>('CASH');
  const [tenderedStr, setTenderedStr] = useState<string>('');
  const [transactionRef, setTransactionRef] = useState<string>('');
  const [transferConfirmed, setTransferConfirmed] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [idempotencyKey] = useState<string>(() => `pay-key-${invoice.id}-${Date.now()}`);

  if (!isOpen) return null;

  const totalAmount = invoice.total_amount;
  const tenderedAmount = tenderedStr ? BigInt(tenderedStr) : 0n;
  const changeAmount = tenderedAmount >= totalAmount ? tenderedAmount - totalAmount : 0n;
  const isSufficient = tenderedAmount >= totalAmount;
  const shortageAmount = totalAmount > tenderedAmount ? totalAmount - tenderedAmount : 0n;

  // Mệnh giá tròn tiền gợi ý (DESIGN.md §5.4)
  const suggestionValues = [
    { label: 'Đủ tiền', value: totalAmount },
    ...(totalAmount <= 50000n && totalAmount !== 50000n ? [{ label: '50.000đ', value: 50000n }] : []),
    ...(totalAmount <= 100000n && totalAmount !== 100000n ? [{ label: '100.000đ', value: 100000n }] : []),
    ...(totalAmount <= 200000n && totalAmount !== 200000n ? [{ label: '200.000đ', value: 200000n }] : []),
    ...(totalAmount <= 500000n && totalAmount !== 500000n ? [{ label: '500.000đ', value: 50000n }] : []),
  ];

  const handleDigit = (char: string) => {
    setErrorMsg('');
    setTenderedStr((prev) => {
      const next = prev + char;
      // Giới hạn tối đa 9 chữ số
      return next.length > 9 ? prev : next;
    });
  };

  const handleBackspace = () => {
    setErrorMsg('');
    setTenderedStr((prev) => prev.slice(0, -1));
  };

  const handleConfirm = async () => {
    setErrorMsg('');
    setIsSubmitting(true);
    try {
      if (method === 'CASH') {
        if (!isSufficient) {
          setErrorMsg('Khách đưa chưa đủ tiền');
          setIsSubmitting(false);
          return;
        }
        await onConfirmPayment('CASH', tenderedAmount, undefined, idempotencyKey);
      } else {
        if (!transferConfirmed) {
          setErrorMsg('Vui lòng xác nhận đã nhận đủ tiền chuyển khoản');
          setIsSubmitting(false);
          return;
        }
        await onConfirmPayment('TRANSFER', totalAmount, transactionRef, idempotencyKey);
      }
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Có lỗi xảy ra khi thực hiện thanh toán');
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={`Thanh toán đơn ${invoice.invoice_code}`}
      maxWidth={720}
      disableClose={isSubmitting}
      footer={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: 12 }}>
          <Button variant="secondary" size="lg" onClick={onClose} disabled={isSubmitting} style={{ minWidth: 100 }}>
            Quay lại
          </Button>
          <Button
            variant="primary"
            size="lg"
            onClick={handleConfirm}
            isLoading={isSubmitting}
            disabled={
              isSubmitting ||
              (method === 'CASH' && (!isSufficient || tenderedAmount === 0n)) ||
              (method === 'TRANSFER' && !transferConfirmed)
            }
            style={{ height: 56, flex: 1, minWidth: 160, fontSize: 16 }}
          >
            Xác nhận thanh toán
          </Button>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Tab Phương thức thanh toán: Tiền mặt hoặc Chuyển khoản (BR-30, BR-31) */}
        <div
          role="tablist"
          aria-label="Phương thức thanh toán"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 8,
            background: 'var(--color-surface-sunken)',
            padding: 4,
            borderRadius: 'var(--radius-control)',
          }}
        >
          <button
            type="button"
            role="tab"
            aria-selected={method === 'CASH'}
            aria-label="Phương thức thanh toán tiền mặt"
            onClick={() => setMethod('CASH')}
            style={{
              height: 48,
              borderRadius: 'var(--radius-control)',
              border: 'none',
              background: method === 'CASH' ? 'var(--color-surface)' : 'transparent',
              color: method === 'CASH' ? 'var(--color-brand-600)' : 'var(--color-text-muted)',
              fontSize: 16,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              boxShadow: method === 'CASH' ? '0 2px 4px rgba(0,0,0,0.06)' : 'none',
              transition: 'all 100ms ease',
            }}
          >
            <Banknote size={20} />
            <span>Tiền mặt</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={method === 'TRANSFER'}
            aria-label="Phương thức thanh toán chuyển khoản"
            onClick={() => setMethod('TRANSFER')}
            style={{
              height: 48,
              borderRadius: 'var(--radius-control)',
              border: 'none',
              background: method === 'TRANSFER' ? 'var(--color-surface)' : 'transparent',
              color: method === 'TRANSFER' ? 'var(--color-brand-600)' : 'var(--color-text-muted)',
              fontSize: 16,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              boxShadow: method === 'TRANSFER' ? '0 2px 4px rgba(0,0,0,0.06)' : 'none',
              transition: 'all 100ms ease',
            }}
          >
            <QrCode size={20} />
            <span>Chuyển khoản</span>
          </button>
        </div>

        {/* Luồng TIỀN MẶT - 2 CỘT TỐI ƯU TABLET */}
        {method === 'CASH' && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: 16,
              alignItems: 'start',
            }}
          >
            {/* Cột trái: Số tiền cần thanh toán, Mệnh giá gợi ý, Khách đưa & Tiền thối */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Số tiền cần thanh toán */}
              <div
                style={{
                  padding: '10px 14px',
                  background: 'var(--color-brand-50)',
                  borderRadius: 'var(--radius-control)',
                  display: 'flex',
                  alignItems: 'baseline',
                  justifyContent: 'space-between',
                  border: '1px solid var(--color-brand-200)',
                }}
              >
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-muted)' }}>
                  Cần thanh toán:
                </span>
                <span
                  className="money"
                  style={{
                    fontSize: 30,
                    fontWeight: 700,
                    color: 'var(--color-brand-800)',
                  }}
                >
                  {formatVND(totalAmount)}
                </span>
              </div>

              {/* Gợi ý mệnh giá tròn tiền */}
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 6 }}>
                  Gợi ý tiền đưa nhanh:
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {suggestionValues.map((sug, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setTenderedStr(sug.value.toString())}
                      className="touch-press"
                      style={{
                        height: 44,
                        padding: '0 12px',
                        borderRadius: 'var(--radius-control)',
                        border: '1px solid var(--color-border-control)',
                        background: tenderedAmount === sug.value ? 'var(--color-brand-100)' : 'var(--color-surface)',
                        color: tenderedAmount === sug.value ? 'var(--color-brand-800)' : 'var(--color-text)',
                        fontSize: 14,
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      {sug.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Khối Khách đưa */}
              <div>
                <label style={{ fontSize: 13, color: 'var(--color-text-muted)', fontWeight: 600, display: 'block', marginBottom: 4 }}>
                  Khách đưa:
                </label>
                <div
                  className="money"
                  style={{
                    height: 48,
                    padding: '0 14px',
                    background: 'var(--color-surface)',
                    border: '2px solid var(--color-brand-600)',
                    borderRadius: 'var(--radius-control)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    fontSize: 22,
                    fontWeight: 700,
                    color: 'var(--color-text)',
                  }}
                >
                  {tenderedStr ? formatVND(tenderedAmount) : '0đ'}
                </div>
              </div>

              {/* Khối Tiền thối trả khách / Thiếu */}
              <div>
                <label style={{ fontSize: 13, color: 'var(--color-text-muted)', fontWeight: 600, display: 'block', marginBottom: 4 }}>
                  {isSufficient ? 'Tiền thối trả khách:' : 'Khách đưa còn thiếu:'}
                </label>
                <div
                  className="money"
                  style={{
                    height: 56,
                    padding: '0 14px',
                    borderRadius: 'var(--radius-control)',
                    border: `2px solid ${isSufficient ? 'var(--color-success)' : 'var(--color-danger)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    fontSize: 30,
                    fontWeight: 700,
                    color: isSufficient ? 'var(--color-success)' : 'var(--color-danger)',
                    background: isSufficient ? 'var(--color-success-bg)' : 'var(--color-danger-bg)',
                  }}
                >
                  {isSufficient ? formatVND(changeAmount) : formatVND(shortageAmount)}
                </div>
              </div>

              {/* Báo lỗi nếu có */}
              {errorMsg && (
                <div
                  style={{
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-control)',
                    background: 'var(--color-danger-bg)',
                    color: 'var(--color-danger)',
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  {errorMsg}
                </div>
              )}
            </div>

            {/* Cột phải: Bàn phím số Numpad 64px kèm nút Xóa */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <Numpad
                onDigit={handleDigit}
                onClear={() => setTenderedStr('')}
                onBackspace={handleBackspace}
              />
            </div>
          </div>
        )}

        {/* Luồng CHUYỂN KHOẢN */}
        {method === 'TRANSFER' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: '4px 0' }}>
            <div
              style={{
                padding: 16,
                background: 'var(--color-surface-sunken)',
                borderRadius: 'var(--radius-control)',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 14, color: 'var(--color-text-muted)' }}>
                Yêu cầu khách chuyển khoản đúng số tiền:
              </div>
              <div
                className="money"
                style={{ fontSize: 32, fontWeight: 700, color: 'var(--color-brand-600)', margin: '8px 0' }}
              >
                {formatVND(totalAmount)}
              </div>
              <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
                Nội dung chuyển khoản: <strong style={{ color: 'var(--color-text)' }}>#{invoice.invoice_code}</strong>
              </div>
            </div>

            <div>
              <label htmlFor="payment-transfer-ref" style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text)', display: 'block', marginBottom: 6 }}>
                Mã giao dịch ngân hàng (không bắt buộc):
              </label>
              <input
                id="payment-transfer-ref"
                type="text"
                placeholder="VD: FT26102712345..."
                value={transactionRef}
                onChange={(e) => setTransactionRef(e.target.value)}
                style={{
                  height: 48,
                  width: '100%',
                  padding: '0 16px',
                  borderRadius: 'var(--radius-control)',
                  border: '1px solid var(--color-border-control)',
                  fontSize: 15,
                }}
              />
            </div>

            {/* Checkbox xác nhận đã nhận đủ tiền */}
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 16px',
                borderRadius: 'var(--radius-control)',
                background: transferConfirmed ? 'var(--color-success-bg)' : 'var(--color-surface)',
                border: `1px solid ${transferConfirmed ? 'var(--color-success)' : 'var(--color-border-control)'}`,
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={transferConfirmed}
                onChange={(e) => setTransferConfirmed(e.target.checked)}
                style={{ width: 22, height: 22, accentColor: 'var(--color-success)' }}
              />
              <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text)' }}>
                Thu ngân đã kiểm tra tài khoản và xác nhận nhận đủ tiền
              </span>
            </label>

            {errorMsg && (
              <div
                role="alert"
                style={{
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-control)',
                  background: 'var(--color-danger-bg)',
                  color: 'var(--color-danger)',
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                {errorMsg}
              </div>
            )}
          </div>
        )}
      </div>
    </Dialog>
  );
};
