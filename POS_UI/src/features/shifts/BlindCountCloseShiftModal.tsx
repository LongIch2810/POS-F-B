// POS-F&B Blind Cash Reconciliation Close Shift Modal per DESIGN.md §5.5 & BR-58, BR-60, BR-19

import React, { useState } from 'react';
import { WorkShift, CashReconciliation } from '../../types/entities';
import { Dialog } from '../../components/ui/Dialog';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { formatVND } from '../../utils/formatters';
import { mockStorage } from '../../mock/mockStorage';
import { shiftService } from '../../services/shiftService';

export interface BlindCountCloseShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  shift: WorkShift;
  onSuccess: () => void;
}

const DENOMINATIONS = [500000n, 200000n, 100000n, 50000n, 20000n, 10000n, 5000n, 2000n, 1000n];

export const BlindCountCloseShiftModal: React.FC<BlindCountCloseShiftModalProps> = ({
  isOpen,
  onClose,
  shift,
  onSuccess,
}) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [directCountInput, setDirectCountInput] = useState<string>('');
  const [useDenominations, setUseDenominations] = useState<boolean>(true);
  const [note, setNote] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [reconciliationResult, setReconciliationResult] = useState<CashReconciliation | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  // Kiểm tra BR-19: Còn hóa đơn OPEN thì chặn đóng ca
  const state = mockStorage.getState();
  const openInvoices = state.invoices.filter((inv) => inv.work_shift_id === shift.id && inv.status === 'OPEN');

  // Tính tổng tiền đếm theo từng mệnh giá
  const denominationTotal = Object.entries(counts).reduce((sum, [denomStr, qty]) => {
    return sum + BigInt(denomStr) * BigInt(qty);
  }, 0n);

  const totalCounted = useDenominations
    ? denominationTotal
    : directCountInput ? BigInt(directCountInput) : 0n;

  const handleDenomChange = (denom: bigint, delta: number) => {
    const key = denom.toString();
    const current = counts[key] || 0;
    const next = Math.max(0, current + delta);
    setCounts((prev) => ({ ...prev, [key]: next }));
  };

  // Bước 1 -> Bước 2: Xác nhận số tiền đếm để hệ thống trả tiền kỳ vọng
  const handleProceedToStep2 = () => {
    setErrorMsg('');
    if (openInvoices.length > 0) {
      setErrorMsg(`Còn ${openInvoices.length} đơn chưa thanh toán. Vui lòng thanh toán hoặc hủy trước khi đóng ca (BR-19)`);
      return;
    }

    try {
      // Mô phỏng tính tiền kỳ vọng và chênh lệch từ mockEngine
      const opening = shiftService.getOpeningCashInfo(shift.branch_id).amount;
      const paidInvoices = state.invoices.filter((inv) => inv.work_shift_id === shift.id && inv.status === 'PAID');
      let cashSales = 0n;
      paidInvoices.forEach((inv) => {
        inv.payments.forEach((p) => {
          if (p.method === 'CASH') cashSales += p.amount;
        });
      });
      const expenses = state.shiftExpenses.filter((e) => e.work_shift_id === shift.id && e.paid_from_drawer);
      const expenseAmount = expenses.reduce((s, e) => s + e.amount, 0n);
      const expectedCash = opening + cashSales - expenseAmount;
      const difference = totalCounted - expectedCash;

      let status: CashReconciliation['status'] = 'MATCHED';
      if (difference < 0n) status = 'SHORTAGE';
      else if (difference > 0n) status = 'OVERAGE';

      setReconciliationResult({
        id: 'preview',
        work_shift_id: shift.id,
        opening_cash: opening,
        cash_sales_amount: cashSales,
        expense_amount: expenseAmount,
        expected_cash: expectedCash,
        counted_cash: totalCounted,
        difference,
        status,
        note: '',
        created_at: new Date().toISOString(),
      });

      setStep(2);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Có lỗi khi kiểm tra số tiền');
    }
  };

  // Hoàn tất đóng ca
  const handleFinalCloseShift = async () => {
    if (!reconciliationResult) return;
    if (reconciliationResult.difference !== 0n && !note.trim()) {
      setErrorMsg('Ca có chênh lệch tiền mặt, bắt buộc phải nhập ghi chú giải trình (BR-60)');
      return;
    }

    setIsSubmitting(true);
    try {
      await shiftService.closeShiftBlind(shift.id, reconciliationResult.counted_cash, note);
      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Không thể đóng ca');
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={step === 1 ? 'Đóng ca: Bước 1 - Đếm tiền trong két (Đếm mù)' : 'Đóng ca: Bước 2 - Kết quả đối soát'}
      maxWidth={520}
      footer={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <Button variant="secondary" onClick={step === 1 ? onClose : () => setStep(1)} disabled={isSubmitting}>
            {step === 1 ? 'Hủy' : 'Đếm lại'}
          </Button>

          {step === 1 ? (
            <Button
              variant="primary"
              size="lg"
              onClick={handleProceedToStep2}
              disabled={openInvoices.length > 0}
            >
              Xác nhận số tiền đã đếm &bull; {formatVND(totalCounted)}
            </Button>
          ) : (
            <Button
              variant="primary"
              size="lg"
              onClick={handleFinalCloseShift}
              isLoading={isSubmitting}
            >
              Hoàn tất đóng ca
            </Button>
          )}
        </div>
      }
    >
      {/* Cảnh báo BR-19: Còn đơn mở */}
      {openInvoices.length > 0 && (
        <div
          style={{
            padding: 14,
            borderRadius: 'var(--radius-control)',
            background: 'var(--color-danger-bg)',
            color: 'var(--color-danger)',
            marginBottom: 16,
            fontSize: 14,
            fontWeight: 500,
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: 4 }}>
            Không thể đóng ca (BR-19)
          </div>
          Còn {openInvoices.length} đơn chưa thanh toán thuộc ca này ({openInvoices.map((i) => i.invoice_code).join(', ')}).
          Vui lòng thanh toán hoặc hủy các đơn này trước.
        </div>
      )}

      {/* BƯỚC 1: ĐẾM MÙ (KHÔNG HIỆN TIỀN KỲ VỌNG per DESIGN.md §5.5 & BR-58) */}
      {step === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 14, color: 'var(--color-text-muted)' }}>
              Nhập số tiền thực tế có trong két:
            </span>
            <button
              type="button"
              onClick={() => setUseDenominations(!useDenominations)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--color-brand-600)',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {useDenominations ? 'Nhập thẳng tổng tiền' : 'Đếm theo số tờ mệnh giá'}
            </button>
          </div>

          {useDenominations ? (
            /* Đếm theo từng mệnh giá */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 300, overflowY: 'auto' }}>
              {DENOMINATIONS.map((denom) => {
                const count = counts[denom.toString()] || 0;
                const sub = denom * BigInt(count);
                return (
                  <div
                    key={denom.toString()}
                    style={{
                      height: 48,
                      padding: '0 12px',
                      background: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-control)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span className="money" style={{ width: 90, fontWeight: 600, fontSize: 15 }}>
                      {formatVND(denom)}
                    </span>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <button
                        type="button"
                        onClick={() => handleDenomChange(denom, -1)}
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 'var(--radius-control)',
                          border: '1px solid var(--color-border-control)',
                          background: 'var(--color-surface)',
                          fontSize: 18,
                          cursor: 'pointer',
                        }}
                      >
                        &minus;
                      </button>
                      <span className="num" style={{ width: 36, textAlign: 'center', fontWeight: 700 }}>
                        {count}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDenomChange(denom, 1)}
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 'var(--radius-control)',
                          border: '1px solid var(--color-border-control)',
                          background: 'var(--color-surface)',
                          fontSize: 18,
                          cursor: 'pointer',
                        }}
                      >
                        +
                      </button>
                    </div>

                    <span className="money" style={{ width: 110, textAlign: 'right', fontWeight: 700, color: 'var(--color-text)' }}>
                      {formatVND(sub)}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Nhập thẳng số tiền */
            <div>
              <input
                type="number"
                placeholder="Nhập tổng tiền thực đếm trong két..."
                value={directCountInput}
                onChange={(e) => setDirectCountInput(e.target.value)}
                style={{
                  height: 48,
                  width: '100%',
                  padding: '0 16px',
                  borderRadius: 'var(--radius-control)',
                  border: '1px solid var(--color-border-control)',
                  fontSize: 18,
                  fontWeight: 700,
                  textAlign: 'right',
                }}
              />
            </div>
          )}

          {/* Tổng tiền đã đếm (text-3xl) */}
          <div
            style={{
              padding: '16px 20px',
              background: 'var(--color-surface-sunken)',
              borderRadius: 'var(--radius-control)',
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'space-between',
            }}
          >
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-muted)' }}>
              Tổng tiền đã đếm:
            </span>
            <span className="money" style={{ fontSize: 28, fontWeight: 700, color: 'var(--color-brand-800)' }}>
              {formatVND(totalCounted)}
            </span>
          </div>
        </div>
      )}

      {/* BƯỚC 2: KẾT QUẢ ĐỐI SOÁT (HIỂN THỊ TIỀN KỲ VỌNG & CHÊNH LỆCH per DESIGN.md §5.5) */}
      {step === 2 && reconciliationResult && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div
            style={{
              padding: 16,
              background: 'var(--color-surface-sunken)',
              borderRadius: 'var(--radius-control)',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              fontSize: 14,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-muted)' }}>
              <span>Tiền đầu ca</span>
              <span className="money">{formatVND(reconciliationResult.opening_cash)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-muted)' }}>
              <span>Doanh thu tiền mặt bán được</span>
              <span className="money">+{formatVND(reconciliationResult.cash_sales_amount)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-danger)' }}>
              <span>Chi từ két trong ca</span>
              <span className="money">&minus;{formatVND(reconciliationResult.expense_amount)}</span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingTop: 8,
                borderTop: '1px solid var(--color-border)',
                fontWeight: 600,
              }}
            >
              <span>Tiền kỳ vọng trong két</span>
              <span className="money">{formatVND(reconciliationResult.expected_cash)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
              <span>Tiền thực đếm</span>
              <span className="money">{formatVND(reconciliationResult.counted_cash)}</span>
            </div>
          </div>

          {/* Dòng chênh lệch: text-3xl, dấu trừ thực, nhãn trạng thái */}
          <div
            style={{
              padding: '16px 20px',
              borderRadius: 'var(--radius-control)',
              border: `1px solid ${
                reconciliationResult.status === 'MATCHED'
                  ? 'var(--color-success)'
                  : reconciliationResult.status === 'SHORTAGE'
                  ? 'var(--color-danger)'
                  : 'var(--color-warning)'
              }`,
              background:
                reconciliationResult.status === 'MATCHED'
                  ? 'var(--color-success-bg)'
                  : reconciliationResult.status === 'SHORTAGE'
                  ? 'var(--color-danger-bg)'
                  : 'var(--color-warning-bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontSize: 13, color: 'var(--color-text-muted)', fontWeight: 600 }}>
                Chênh lệch đối soát:
              </div>
              <div
                className="money"
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  color:
                    reconciliationResult.status === 'MATCHED'
                      ? 'var(--color-success)'
                      : reconciliationResult.status === 'SHORTAGE'
                      ? 'var(--color-danger)'
                      : 'var(--color-warning)',
                }}
              >
                {formatVND(reconciliationResult.difference)}
              </div>
            </div>

            <Badge
              variant={
                reconciliationResult.status === 'MATCHED'
                  ? 'success'
                  : reconciliationResult.status === 'SHORTAGE'
                  ? 'danger'
                  : 'warning'
              }
              size="md"
            >
              {reconciliationResult.status === 'MATCHED'
                ? 'Khớp tiền'
                : reconciliationResult.status === 'SHORTAGE'
                ? 'Thiếu tiền'
                : 'Thừa tiền'}
            </Badge>
          </div>

          {/* Ô ghi chú (bắt buộc khi lệch tiền per BR-60) */}
          <div>
            <label style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)', display: 'block', marginBottom: 6 }}>
              Ghi chú {reconciliationResult.difference !== 0n ? '(Bắt buộc khi lệch tiền - BR-60)' : '(Không bắt buộc)'}:
            </label>
            <textarea
              rows={3}
              placeholder="Giải trình nguyên nhân thừa hoặc thiếu tiền mặt trong ca..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              style={{
                width: '100%',
                padding: 12,
                borderRadius: 'var(--radius-control)',
                border: `1px solid ${
                  reconciliationResult.difference !== 0n && !note.trim()
                    ? 'var(--color-danger)'
                    : 'var(--color-border-control)'
                }`,
                fontSize: 14,
                fontFamily: 'inherit',
              }}
            />
          </div>

          {errorMsg && (
            <div style={{ color: 'var(--color-danger)', fontSize: 13, fontWeight: 500 }}>
              {errorMsg}
            </div>
          )}
        </div>
      )}
    </Dialog>
  );
};
