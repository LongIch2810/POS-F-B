// POS-F&B Force Close Shift Modal (Đóng ca cưỡng chế bởi Quản lý) per BR-20, BR-88, BR-19

import React, { useState } from 'react';
import { WorkShift } from '../../types/entities';
import { Dialog } from '../../components/ui/Dialog';
import { Button } from '../../components/ui/Button';
import { formatVND, formatDateTimeVN } from '../../utils/formatters';
import { shiftService } from '../../services/shiftService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { AlertTriangle, ShieldAlert } from 'lucide-react';

export interface ForceCloseShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  shift: WorkShift;
  onSuccess: () => void;
  onOpenInvoice?: (invoiceId: string) => void;
}

export const ForceCloseShiftModal: React.FC<ForceCloseShiftModalProps> = ({
  isOpen,
  onClose,
  shift,
  onSuccess,
  onOpenInvoice,
}) => {
  const { session } = useAuth();
  const { showToast } = useToast();
  const [countedCashStr, setCountedCashStr] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const openInvoices = shiftService.getOpenInvoicesForShift(shift.id);
  const countedCash = countedCashStr ? BigInt(countedCashStr) : 0n;

  const handleSubmit = async () => {
    setErrorMsg('');
    if (openInvoices.length > 0) {
      setErrorMsg(`Còn ${openInvoices.length} đơn chưa thanh toán. Vui lòng thanh toán hoặc hủy các đơn này trước khi đóng ca.`);
      return;
    }
    if (!reason.trim()) {
      setErrorMsg('Bắt buộc phải nhập lý do khi đóng cưỡng chế ca làm việc.');
      return;
    }

    setIsSubmitting(true);
    try {
      await shiftService.forceCloseShift(shift.id, session.user.id, countedCash, reason.trim());
      showToast({ type: 'success', message: 'Đã đóng ca cưỡng chế thành công' });
      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Có lỗi xảy ra khi đóng ca');
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={
        openInvoices.length > 0
          ? 'Chưa thể đóng ca cưỡng chế (Còn đơn chưa hoàn tất)'
          : 'Đóng ca cưỡng chế (Quản lý / Chủ quán)'
      }
      maxWidth={520}
      disableClose={isSubmitting}
      footer={
        openInvoices.length > 0 ? (
          <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
            <Button variant="secondary" onClick={onClose}>
              Đóng hộp thoại
            </Button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
              Hủy bỏ
            </Button>
            <Button
              variant="danger"
              size="lg"
              onClick={handleSubmit}
              isLoading={isSubmitting}
              disabled={isSubmitting}
            >
              Xác nhận đóng ca cưỡng chế
            </Button>
          </div>
        )
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Banner cảnh báo quyền quản lý */}
        <div
          style={{
            padding: 12,
            borderRadius: 'var(--radius-control)',
            background: 'var(--color-warning-bg)',
            color: 'var(--color-warning)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          <ShieldAlert size={20} />
          <span>Hành động này sẽ ghi nhận tài khoản của bạn là người đóng cưỡng chế ca này.</span>
        </div>

        {/* Thông tin ca làm việc */}
        <div
          style={{
            padding: 14,
            background: 'var(--color-surface-sunken)',
            borderRadius: 'var(--radius-control)',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 10,
            fontSize: 13,
          }}
        >
          <div>
            <div style={{ color: 'var(--color-text-muted)' }}>Mã ca:</div>
            <div style={{ fontWeight: 600, color: 'var(--color-text)' }}>#{shift.id.slice(-8)}</div>
          </div>
          <div>
            <div style={{ color: 'var(--color-text-muted)' }}>Loại ca:</div>
            <div style={{ fontWeight: 600, color: 'var(--color-text)' }}>
              {shift.shift_type === 'CASHIER' ? 'Ca thu ngân (Két tiền)' : 'Ca nhân viên'}
            </div>
          </div>
          <div>
            <div style={{ color: 'var(--color-text-muted)' }}>Bắt đầu:</div>
            <div style={{ fontWeight: 600, color: 'var(--color-text)' }}>
              {formatDateTimeVN(shift.started_at)}
            </div>
          </div>
          <div>
            <div style={{ color: 'var(--color-text-muted)' }}>Tiền đầu ca:</div>
            <div className="money" style={{ fontWeight: 600, color: 'var(--color-brand-800)' }}>
              {formatVND(shiftService.getOpeningCashInfo(shift.branch_id).amount)}
            </div>
          </div>
        </div>

        {/* Cảnh báo nếu còn đơn chưa thanh toán */}
        {openInvoices.length > 0 ? (
          <div
            style={{
              padding: 14,
              borderRadius: 'var(--radius-control)',
              background: 'var(--color-danger-bg)',
              border: '1px solid var(--color-danger)',
              color: 'var(--color-danger)',
            }}
          >
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
              <AlertTriangle size={18} />
              <span>Không thể đóng ca: Còn {openInvoices.length} đơn chưa thanh toán</span>
            </div>
            <p style={{ fontSize: 13, marginBottom: 10, color: 'var(--color-text)' }}>
              Hệ thống yêu cầu tất cả hóa đơn của ca phải được thanh toán hoặc hủy trước khi đóng ca:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 180, overflowY: 'auto' }}>
              {openInvoices.map((inv) => (
                <div
                  key={inv.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    background: 'var(--color-surface)',
                    borderRadius: 'var(--radius-control)',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  <span style={{ fontWeight: 600, fontSize: 13 }}>
                    #{inv.invoice_code} ({inv.tableName}) &bull; {formatVND(inv.total_amount)}
                  </span>
                  {onOpenInvoice && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        onClose();
                        onOpenInvoice(inv.id);
                      }}
                    >
                      Mở đơn
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Nhập tiền thực tế quản lý đếm được (với ca thu ngân) */}
            {shift.shift_type === 'CASHIER' && (
              <div>
                <label
                  htmlFor="force-close-counted-cash"
                  style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)', display: 'block', marginBottom: 6 }}
                >
                  Tiền mặt trong két quản lý kiểm đếm được (VND):
                </label>
                <input
                  id="force-close-counted-cash"
                  type="number"
                  min="0"
                  step="1000"
                  placeholder="VD: 2500000"
                  value={countedCashStr}
                  onChange={(e) => setCountedCashStr(e.target.value)}
                  style={{
                    width: '100%',
                    height: 48,
                    padding: '0 14px',
                    borderRadius: 'var(--radius-control)',
                    border: '1px solid var(--color-border-control)',
                    fontSize: 16,
                    fontWeight: 600,
                  }}
                />
                <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 4 }}>
                  Số tiền định dạng: <strong className="money" style={{ color: 'var(--color-brand-700)' }}>{formatVND(countedCash)}</strong>
                </div>
              </div>
            )}

            {/* Nhập lý do đóng cưỡng chế */}
            <div>
              <label
                htmlFor="force-close-reason"
                style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)', display: 'block', marginBottom: 6 }}
              >
                Lý do đóng ca cưỡng chế (Bắt buộc):
              </label>
              <textarea
                id="force-close-reason"
                rows={3}
                placeholder="VD: Thu ngân có việc gấp về sớm không kịp kiểm két, Quản lý tiếp quản đối soát..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                style={{
                  width: '100%',
                  padding: 12,
                  borderRadius: 'var(--radius-control)',
                  border: '1px solid var(--color-border-control)',
                  fontSize: 14,
                  fontFamily: 'inherit',
                }}
              />
            </div>
          </>
        )}

        {errorMsg && (
          <div role="alert" style={{ color: 'var(--color-danger)', fontSize: 13, fontWeight: 600 }}>
            {errorMsg}
          </div>
        )}
      </div>
    </Dialog>
  );
};

