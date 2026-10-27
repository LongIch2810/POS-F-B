// POS-F&B Add Shift Expense Modal per BR-51, BR-52, BR-53

import React, { useState } from 'react';
import { Dialog } from '../../components/ui/Dialog';
import { Button } from '../../components/ui/Button';
import { Field } from '../../components/ui/Field';
import { shiftService } from '../../services/shiftService';
import { useToast } from '../../context/ToastContext';

export interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  shiftId: string;
  onSuccess: () => void;
}

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  isOpen,
  onClose,
  shiftId,
  onSuccess,
}) => {
  const { showToast } = useToast();
  const [amountStr, setAmountStr] = useState('');
  const [reason, setReason] = useState('');
  const [paidFromDrawer, setPaidFromDrawer] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const amount = amountStr ? BigInt(amountStr) : 0n;
    if (amount <= 0n) {
      setError('Số tiền chi phải lớn hơn 0 (BR-52)');
      return;
    }

    if (!reason.trim()) {
      setError('Bắt buộc phải nhập lý do chi (BR-52)');
      return;
    }

    setLoading(true);
    try {
      await shiftService.addExpense(shiftId, amount, reason, paidFromDrawer);
      showToast({ type: 'success', message: 'Đã ghi nhận khoản chi trong ca!' });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Không thể ghi chi phí');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Ghi nhận chi phí trong ca"
      maxWidth={460}
      footer={
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', width: '100%' }}>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleSubmit} isLoading={loading}>
            Lưu khoản chi
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Field
          label="Số tiền chi"
          type="number"
          placeholder="50000"
          value={amountStr}
          onChange={(e) => setAmountStr(e.target.value)}
          isNumericMoney
          suffix="đ"
          required
        />

        <div>
          <label style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-muted)', display: 'block', marginBottom: 6 }}>
            Lý do chi (bắt buộc)
          </label>
          <input
            type="text"
            placeholder="VD: Mua thêm đá viên, mua giấy in bill..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            style={{
              height: 48,
              width: '100%',
              padding: '0 16px',
              borderRadius: 'var(--radius-control)',
              border: '1px solid var(--color-border-control)',
              fontSize: 15,
            }}
            required
          />
        </div>

        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '12px 14px',
            borderRadius: 'var(--radius-control)',
            background: 'var(--color-surface-sunken)',
            cursor: 'pointer',
          }}
        >
          <input
            type="checkbox"
            checked={paidFromDrawer}
            onChange={(e) => setPaidFromDrawer(e.target.checked)}
            style={{ width: 18, height: 18, accentColor: 'var(--color-brand-600)' }}
          />
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)' }}>
              Lấy tiền trực tiếp từ két tiền mặt (BR-53)
            </div>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
              Khoản này sẽ được trừ vào số tiền kỳ vọng khi đối soát ca
            </div>
          </div>
        </label>

        {error && (
          <div style={{ fontSize: 13, color: 'var(--color-danger)', fontWeight: 500 }}>
            {error}
          </div>
        )}
      </form>
    </Dialog>
  );
};
