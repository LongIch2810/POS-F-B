// POS-F&B Open Shift Gatekeeper per DESIGN.md §5.5 & BR-16, BR-55

import React, { useState } from 'react';
import { shiftService } from '../../services/shiftService';
import { formatVND } from '../../utils/formatters';
import { Button } from '../../components/ui/Button';
import { Dialog } from '../../components/ui/Dialog';
import { useToast } from '../../context/ToastContext';
import { Lock } from 'lucide-react';

export interface OpenShiftGateProps {
  branchId: string;
  branchName: string;
  onShiftOpened: () => void;
}

export const OpenShiftGate: React.FC<OpenShiftGateProps> = ({ branchId, branchName, onShiftOpened }) => {
  const { showToast } = useToast();
  const [openingInfo] = useState(() => shiftService.getOpeningCashInfo(branchId));
  const [loading, setLoading] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');

  const handleOpenShift = async () => {
    setLoading(true);
    try {
      await shiftService.openShift(branchId);
      showToast({ type: 'success', message: 'Mở ca thu ngân thành công! Bắt đầu phiên bán hàng.' });
      onShiftOpened();
    } catch (err: any) {
      showToast({ type: 'error', message: err?.message || 'Không thể mở ca thu ngân' });
    } finally {
      setLoading(false);
    }
  };

  const handleSendReport = () => {
    if (!reportReason.trim()) return;
    showToast({
      type: 'info',
      message: 'Đã gửi biên bản báo lệch tiền giao ca đến Quản lý chi nhánh.',
    });
    setReportModalOpen(false);
    setReportReason('');
  };

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-bg)',
        padding: 24,
      }}
    >
      <div
        style={{
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-sheet)',
          boxShadow: 'var(--shadow-overlay)',
          border: '1px solid var(--color-border)',
          width: '100%',
          maxWidth: 460,
          padding: 32,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: 20,
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 'var(--radius-tile)',
            background: 'var(--color-brand-100)',
            color: 'var(--color-brand-600)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Lock size={32} />
        </div>

        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-text)' }}>
            Mở ca thu ngân
          </h2>
          <div style={{ fontSize: 15, color: 'var(--color-text-muted)', marginTop: 4 }}>
            {branchName}
          </div>
        </div>

        {/* Tiền đầu ca: CHỈ ĐỌC, KHÔNG PHẢI Ô NHẬP (BR-55) */}
        <div
          style={{
            width: '100%',
            background: 'var(--color-surface-sunken)',
            borderRadius: 'var(--radius-control)',
            padding: '16px 20px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 13, color: 'var(--color-text-muted)', fontWeight: 500, marginBottom: 4 }}>
            Tiền đầu ca trong két (Chỉ đọc)
          </div>
          <div
            className="money"
            style={{ fontSize: 32, fontWeight: 700, color: 'var(--color-brand-800)' }}
          >
            {formatVND(openingInfo.amount)}
          </div>
          <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 6 }}>
            {openingInfo.sourceText}
          </div>
        </div>

        {/* Nút Mở ca & Báo lệch tiền giao ca */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Button variant="primary" size="lg" fullWidth isLoading={loading} onClick={handleOpenShift}>
            Xác nhận mở ca thu ngân
          </Button>

          <button
            type="button"
            onClick={() => setReportModalOpen(true)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--color-brand-600)',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              padding: '6px 12px',
            }}
          >
            Báo lệch tiền giao ca cho Quản lý
          </button>
        </div>
      </div>

      {/* Dialog báo lệch tiền giao ca */}
      <Dialog
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        title="Báo lệch tiền giao ca"
        footer={
          <div style={{ display: 'flex', gap: 10 }}>
            <Button variant="secondary" onClick={() => setReportModalOpen(false)}>
              Hủy
            </Button>
            <Button variant="primary" onClick={handleSendReport} disabled={!reportReason.trim()}>
              Gửi biên bản
            </Button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <p style={{ fontSize: 14, color: 'var(--color-text-muted)' }}>
            Nếu két tiền mặt thực tế khác số tiền hệ thống hiển thị ({formatVND(openingInfo.amount)}),
            hãy nhập số tiền thực tế và lý do để gửi biên bản đến Quản lý chi nhánh xử lý.
          </p>
          <textarea
            rows={4}
            placeholder="Mô tả số tiền thực tế trong két và nguyên nhân..."
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
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
      </Dialog>
    </div>
  );
};
