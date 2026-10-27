// POS-F&B Cancel Invoice Modal per BR-28, BR-29, BR-47

import React, { useState } from 'react';
import { Invoice } from '../../types/entities';
import { Dialog } from '../../components/ui/Dialog';
import { Button } from '../../components/ui/Button';
import { invoiceService } from '../../services/invoiceService';
import { useToast } from '../../context/ToastContext';
import { AlertTriangle } from 'lucide-react';

export interface CancelInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice;
  onSuccess: () => void;
}

export const CancelInvoiceModal: React.FC<CancelInvoiceModalProps> = ({
  isOpen,
  onClose,
  invoice,
  onSuccess,
}) => {
  const { showToast } = useToast();
  const isPaid = invoice.status === 'PAID';

  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleCancel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Bắt buộc phải nhập lý do hủy đơn (BR-28, BR-29)');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await invoiceService.cancelInvoice(invoice.id, reason);
      showToast({
        type: 'success',
        message: isPaid
          ? `Đã hủy hóa đơn ${invoice.invoice_code} thành công và hoàn trả nguyên liệu vào kho!`
          : `Đã hủy đơn ${invoice.invoice_code}.`,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Không thể hủy hóa đơn');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={isPaid ? `Hủy hóa đơn đã thanh toán: ${invoice.invoice_code}` : `Hủy đơn: ${invoice.invoice_code}`}
      maxWidth={480}
      footer={
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', width: '100%' }}>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Không hủy
          </Button>
          <Button variant="danger" onClick={handleCancel} isLoading={loading}>
            Xác nhận hủy đơn
          </Button>
        </div>
      }
    >
      <form onSubmit={handleCancel} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div
          style={{
            padding: 14,
            borderRadius: 'var(--radius-control)',
            background: 'var(--color-danger-bg)',
            color: 'var(--color-danger)',
            fontSize: 14,
            display: 'flex',
            gap: 10,
          }}
        >
          <AlertTriangle size={20} style={{ flexShrink: 0 }} />
          <div>
            {isPaid ? (
              <span>
                <strong>Cảnh báo:</strong> Hủy hóa đơn đã thanh toán cần quyền Quản lý. Nguyên liệu đã trừ
                sẽ được tự động hoàn lại vào kho qua bút toán SALE_REVERSAL (BR-47).
              </span>
            ) : (
              <span>Đơn hàng đang mở sẽ được chuyển sang trạng thái ĐÃ HỦY.</span>
            )}
          </div>
        </div>

        <div>
          <label style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)', display: 'block', marginBottom: 6 }}>
            Lý do hủy đơn (Bắt buộc per BR-28, BR-29):
          </label>
          <textarea
            rows={3}
            placeholder="Khách đổi ý, pha nhầm món, sự cố thanh toán..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            style={{
              width: '100%',
              padding: 12,
              borderRadius: 'var(--radius-control)',
              border: `1px solid ${error ? 'var(--color-danger)' : 'var(--color-border-control)'}`,
              fontSize: 14,
              fontFamily: 'inherit',
            }}
            required
          />
        </div>

        {error && (
          <div style={{ fontSize: 13, color: 'var(--color-danger)', fontWeight: 600 }}>
            {error}
          </div>
        )}
      </form>
    </Dialog>
  );
};
