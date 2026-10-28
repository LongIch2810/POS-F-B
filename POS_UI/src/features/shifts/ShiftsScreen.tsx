// POS-F&B Shifts Management Screen per DESIGN.md §5.5, BR-15, BR-18, BR-19, BR-20, BR-58..60, BR-88

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { shiftService } from '../../services/shiftService';
import { MockEngine } from '../../mock/mockEngine';
import { mockStorage } from '../../mock/mockStorage';
import { formatVND, formatDateTimeVN, formatDuration } from '../../utils/formatters';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { DataTable, Column } from '../../components/ui/DataTable';
import { BlindCountCloseShiftModal } from './BlindCountCloseShiftModal';
import { AddExpenseModal } from './AddExpenseModal';
import { ForceCloseShiftModal } from './ForceCloseShiftModal';
import { WorkShift } from '../../types/entities';
import { Clock, PlusCircle, LogOut, UserCheck, ShieldAlert, LogIn } from 'lucide-react';

export interface ShiftsScreenProps {
  onNavigateToInvoice?: (invoiceId: string) => void;
}

export const ShiftsScreen: React.FC<ShiftsScreenProps> = ({ onNavigateToInvoice }) => {
  const { session } = useAuth();
  const { showToast } = useToast();
  const effectiveBranchId = MockEngine.getEffectiveBranchId();

  const [shiftsHistory, setShiftsHistory] = useState(() => shiftService.getShiftHistory(effectiveBranchId));
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [forceCloseTargetShift, setForceCloseTargetShift] = useState<WorkShift | null>(null);
  const [isStaffChecking, setIsStaffChecking] = useState(false);

  useEffect(() => {
    const unsubscribe = mockStorage.subscribe(() => {
      setShiftsHistory(shiftService.getShiftHistory(effectiveBranchId));
    });
    return () => unsubscribe();
  }, [effectiveBranchId]);

  const myShift = shiftService.getMyActiveShift();
  const hasOpenShift = !!myShift && myShift.status === 'OPEN';
  const isCashierShift = hasOpenShift && myShift.shift_type === 'CASHIER';
  const isStaffShift = hasOpenShift && myShift.shift_type === 'STAFF';

  const canForceClose = session.permissions.includes('shift.force_close');

  // Thao tác Check-in ca nhân viên (không gắn két) per BR-15
  const handleCheckInStaff = async () => {
    setIsStaffChecking(true);
    try {
      await shiftService.checkInStaffShift(session.user.id, effectiveBranchId);
      showToast({ type: 'success', message: 'Đã check-in bắt đầu ca làm việc nhân viên' });
    } catch (err: any) {
      showToast({ type: 'error', message: err?.message || 'Không thể check-in' });
    } finally {
      setIsStaffChecking(false);
    }
  };

  // Thao tác Check-out ca nhân viên per BR-15
  const handleCheckOutStaff = async () => {
    if (!myShift) return;
    setIsStaffChecking(true);
    try {
      await shiftService.checkOutStaffShift(myShift.id);
      showToast({ type: 'success', message: 'Đã check-out kết thúc ca làm việc nhân viên' });
    } catch (err: any) {
      showToast({ type: 'error', message: err?.message || 'Không thể check-out' });
    } finally {
      setIsStaffChecking(false);
    }
  };

  const columns: Column<typeof shiftsHistory[0]>[] = [
    {
      key: 'time',
      header: 'Thời gian & Loại ca',
      render: ({ shift }) => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontWeight: 600 }}>{formatDateTimeVN(shift.started_at)}</span>
            <Badge variant={shift.shift_type === 'CASHIER' ? 'info' : 'neutral'} size="sm">
              {shift.shift_type === 'CASHIER' ? 'Thu ngân' : 'Nhân viên'}
            </Badge>
          </div>
          <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>
            {shift.ended_at ? `Đóng lúc ${formatDateTimeVN(shift.ended_at)}` : 'Đang mở'} &bull;{' '}
            {formatDuration(shift.started_at, shift.ended_at)}
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Trạng thái',
      render: ({ shift }) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Badge variant={shift.status === 'OPEN' ? 'info' : 'neutral'} size="sm">
            {shift.status === 'OPEN' ? 'Đang mở' : 'Đã đóng'}
          </Badge>
          {shift.force_closed_by && (
            <Badge variant="warning" size="sm">
              Đóng cưỡng chế
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: 'opening',
      header: 'Tiền đầu ca',
      align: 'right',
      render: ({ shift, reconciliation }) => (
        <span className="money">
          {shift.shift_type === 'CASHIER' && reconciliation ? formatVND(reconciliation.opening_cash) : '-'}
        </span>
      ),
    },
    {
      key: 'sales',
      header: 'Bán tiền mặt',
      align: 'right',
      render: ({ shift, reconciliation }) => (
        <span className="money">
          {shift.shift_type === 'CASHIER' && reconciliation ? formatVND(reconciliation.cash_sales_amount) : '-'}
        </span>
      ),
    },
    {
      key: 'expenses',
      header: 'Chi két',
      align: 'right',
      render: ({ shift, expenses }) => {
        if (shift.shift_type !== 'CASHIER') return <span>-</span>;
        const totalExp = expenses.filter((e) => e.paid_from_drawer).reduce((s, e) => s + e.amount, 0n);
        return <span className="money">{totalExp > 0n ? formatVND(totalExp) : '0đ'}</span>;
      },
    },
    {
      key: 'expected',
      header: 'Tiền kỳ vọng',
      align: 'right',
      render: ({ shift, reconciliation }) => (
        <span className="money">
          {shift.shift_type === 'CASHIER' && reconciliation ? formatVND(reconciliation.expected_cash) : '-'}
        </span>
      ),
    },
    {
      key: 'counted',
      header: 'Tiền thực đếm',
      align: 'right',
      render: ({ shift, reconciliation }) => (
        <span className="money" style={{ fontWeight: 700 }}>
          {shift.shift_type === 'CASHIER' && reconciliation ? formatVND(reconciliation.counted_cash) : '-'}
        </span>
      ),
    },
    {
      key: 'diff',
      header: 'Chênh lệch',
      align: 'center',
      render: ({ shift, reconciliation }) => {
        if (shift.shift_type !== 'CASHIER' || !reconciliation) return <span>-</span>;
        const status = reconciliation.status;
        return (
          <Badge
            variant={status === 'MATCHED' ? 'success' : status === 'SHORTAGE' ? 'danger' : 'warning'}
            size="sm"
          >
            {formatVND(reconciliation.difference)}
          </Badge>
        );
      },
    },
    {
      key: 'actions',
      header: 'Thao tác',
      align: 'right',
      render: ({ shift }) => {
        if (shift.status === 'OPEN' && canForceClose && shift.id !== myShift?.id) {
          return (
            <Button
              variant="danger"
              size="sm"
              icon={<ShieldAlert size={14} />}
              onClick={() => setForceCloseTargetShift(shift)}
            >
              Đóng cưỡng chế
            </Button>
          );
        }
        return <span style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>-</span>;
      },
    },
  ];

  return (
    <div style={{ flex: 1, padding: 'clamp(14px, 2.5vw, 24px)', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Tiêu đề & Thông tin ca hiện tại */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-text)' }}>
            Quản lý Ca làm việc & Đối soát tiền mặt
          </h1>
          <p style={{ fontSize: 14, color: 'var(--color-text-muted)', marginTop: 4 }}>
            Theo dõi ca thu ngân, ghi nhận chi phí két, điểm danh nhân viên và đối soát đếm mù
          </p>
        </div>

        {/* Nút thao tác nhanh trên Header */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {!hasOpenShift && (
            <Button
              variant="secondary"
              size="md"
              icon={<LogIn size={18} />}
              onClick={handleCheckInStaff}
              isLoading={isStaffChecking}
            >
              Check-in ca nhân viên
            </Button>
          )}

          {isCashierShift && (
            <>
              <Button
                variant="secondary"
                size="md"
                icon={<PlusCircle size={18} />}
                onClick={() => setIsExpenseModalOpen(true)}
              >
                Ghi chi phí ca
              </Button>
              <Button
                variant="primary"
                size="md"
                icon={<LogOut size={18} />}
                onClick={() => setIsCloseModalOpen(true)}
              >
                Đóng ca (Đếm mù)
              </Button>
            </>
          )}

          {isStaffShift && (
            <Button
              variant="primary"
              size="md"
              icon={<LogOut size={18} />}
              onClick={handleCheckOutStaff}
              isLoading={isStaffChecking}
            >
              Check-out kết thúc ca
            </Button>
          )}
        </div>
      </div>

      {/* Thẻ ca thu ngân hiện tại nếu đang mở */}
      {isCashierShift && (
        <div
          style={{
            background: 'var(--color-surface)',
            border: '2px solid var(--color-brand-600)',
            borderRadius: 'var(--radius-tile)',
            padding: 20,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Clock size={20} color="var(--color-brand-600)" />
              <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text)' }}>
                Ca thu ngân (Gắn két tiền) đang mở
              </span>
              <Badge variant="success" size="sm">
                Bắt đầu lúc {formatDateTimeVN(myShift.started_at)}
              </Badge>
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-brand-800)' }}>
              Đã làm: {formatDuration(myShift.started_at)}
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: 12,
              paddingTop: 8,
              borderTop: '1px solid var(--color-border)',
            }}
          >
            <div>
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Tiền đầu ca (Chỉ đọc)</div>
              <div className="money" style={{ fontSize: 18, fontWeight: 700 }}>
                {formatVND(shiftService.getOpeningCashInfo(myShift.branch_id).amount)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Thu ngân</div>
              <div style={{ fontSize: 15, fontWeight: 600 }}>{session.user.full_name}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Chi nhánh</div>
              <div style={{ fontSize: 15, fontWeight: 600 }}>{session.branch_name}</div>
            </div>
          </div>
        </div>
      )}

      {/* Thẻ ca làm việc nhân viên nếu đang mở */}
      {isStaffShift && (
        <div
          style={{
            background: 'var(--color-surface)',
            border: '2px solid var(--color-info)',
            borderRadius: 'var(--radius-tile)',
            padding: 20,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <UserCheck size={20} color="var(--color-info)" />
              <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text)' }}>
                Ca làm việc nhân viên (Pha chế / Phục vụ) đang mở
              </span>
              <Badge variant="info" size="sm">
                Bắt đầu lúc {formatDateTimeVN(myShift.started_at)}
              </Badge>
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-info)' }}>
              Đã làm: {formatDuration(myShift.started_at)}
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: 12,
              paddingTop: 8,
              borderTop: '1px solid var(--color-border)',
            }}
          >
            <div>
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Nhân viên điểm danh</div>
              <div style={{ fontSize: 15, fontWeight: 600 }}>{session.user.full_name}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Chi nhánh</div>
              <div style={{ fontSize: 15, fontWeight: 600 }}>{session.branch_name}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Két tiền</div>
              <div style={{ fontSize: 14, color: 'var(--color-text-muted)' }}>Không gắn két (Ca phục vụ)</div>
            </div>
          </div>
        </div>
      )}

      {/* Lịch sử các ca làm việc */}
      <div>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12, color: 'var(--color-text)' }}>
          Lịch sử các ca làm việc
        </h2>
        <DataTable
          columns={columns}
          data={shiftsHistory}
          keyExtractor={(item) => item.shift.id}
          emptyMessage="Chưa có dữ liệu ca làm việc nào"
        />
      </div>

      {/* Modal Đóng ca đếm mù */}
      {isCashierShift && (
        <>
          <BlindCountCloseShiftModal
            isOpen={isCloseModalOpen}
            onClose={() => setIsCloseModalOpen(false)}
            shift={myShift}
            onSuccess={() => {
              setShiftsHistory(shiftService.getShiftHistory(effectiveBranchId));
            }}
            onOpenInvoice={onNavigateToInvoice}
          />
          <AddExpenseModal
            isOpen={isExpenseModalOpen}
            onClose={() => setIsExpenseModalOpen(false)}
            shiftId={myShift.id}
            onSuccess={() => {
              setShiftsHistory(shiftService.getShiftHistory(effectiveBranchId));
            }}
          />
        </>
      )}

      {/* Modal Đóng ca cưỡng chế (Quản lý) */}
      {forceCloseTargetShift && (
        <ForceCloseShiftModal
          isOpen={!!forceCloseTargetShift}
          onClose={() => setForceCloseTargetShift(null)}
          shift={forceCloseTargetShift}
          onSuccess={() => {
            setShiftsHistory(shiftService.getShiftHistory(effectiveBranchId));
          }}
          onOpenInvoice={onNavigateToInvoice}
        />
      )}
    </div>
  );
};
