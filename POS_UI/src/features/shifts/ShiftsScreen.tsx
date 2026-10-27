// POS-F&B Shifts Management Screen per DESIGN.md §5.5

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { shiftService } from '../../services/shiftService';
import { MockEngine } from '../../mock/mockEngine';
import { mockStorage } from '../../mock/mockStorage';
import { formatVND, formatDateTimeVN, formatDuration } from '../../utils/formatters';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { DataTable, Column } from '../../components/ui/DataTable';
import { BlindCountCloseShiftModal } from './BlindCountCloseShiftModal';
import { AddExpenseModal } from './AddExpenseModal';
import { Clock, PlusCircle, LogOut } from 'lucide-react';

export const ShiftsScreen: React.FC = () => {
  const { session } = useAuth();
  const effectiveBranchId = MockEngine.getEffectiveBranchId();

  const [shiftsHistory, setShiftsHistory] = useState(() => shiftService.getShiftHistory(effectiveBranchId));
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = mockStorage.subscribe(() => {
      setShiftsHistory(shiftService.getShiftHistory(effectiveBranchId));
    });
    return () => unsubscribe();
  }, [effectiveBranchId]);

  const myShift = shiftService.getMyActiveShift();
  const hasOpenShift = myShift && myShift.status === 'OPEN';

  const columns: Column<typeof shiftsHistory[0]>[] = [
    {
      key: 'time',
      header: 'Thời gian',
      render: ({ shift }) => (
        <div>
          <div style={{ fontWeight: 600 }}>{formatDateTimeVN(shift.started_at)}</div>
          <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
            {shift.ended_at ? `Đóng lúc ${formatDateTimeVN(shift.ended_at)}` : 'Đang mở'} &bull;{' '}
            {formatDuration(shift.started_at, shift.ended_at)}
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Trạng thái ca',
      render: ({ shift }) => (
        <Badge variant={shift.status === 'OPEN' ? 'info' : 'neutral'} size="sm">
          {shift.status === 'OPEN' ? 'Đang mở' : 'Đã đóng'}
        </Badge>
      ),
    },
    {
      key: 'opening',
      header: 'Tiền đầu ca',
      align: 'right',
      render: ({ reconciliation }) => (
        <span className="money">{reconciliation ? formatVND(reconciliation.opening_cash) : '—'}</span>
      ),
    },
    {
      key: 'sales',
      header: 'Bán tiền mặt',
      align: 'right',
      render: ({ reconciliation }) => (
        <span className="money">{reconciliation ? formatVND(reconciliation.cash_sales_amount) : '—'}</span>
      ),
    },
    {
      key: 'expenses',
      header: 'Chi két',
      align: 'right',
      render: ({ expenses }) => {
        const totalExp = expenses.filter((e) => e.paid_from_drawer).reduce((s, e) => s + e.amount, 0n);
        return <span className="money">{totalExp > 0n ? formatVND(totalExp) : '0đ'}</span>;
      },
    },
    {
      key: 'expected',
      header: 'Tiền kỳ vọng',
      align: 'right',
      render: ({ reconciliation }) => (
        <span className="money">{reconciliation ? formatVND(reconciliation.expected_cash) : '—'}</span>
      ),
    },
    {
      key: 'counted',
      header: 'Tiền thực đếm',
      align: 'right',
      render: ({ reconciliation }) => (
        <span className="money" style={{ fontWeight: 700 }}>
          {reconciliation ? formatVND(reconciliation.counted_cash) : '—'}
        </span>
      ),
    },
    {
      key: 'diff',
      header: 'Chênh lệch',
      align: 'center',
      render: ({ reconciliation }) => {
        if (!reconciliation) return <span>—</span>;
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
      key: 'note',
      header: 'Ghi chú',
      render: ({ reconciliation }) => (
        <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
          {reconciliation?.note || '—'}
        </span>
      ),
    },
  ];

  return (
    <div style={{ flex: 1, padding: 24, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
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
            Theo dõi ca thu ngân, ghi nhận chi phí két và đối soát đếm mù
          </p>
        </div>

        {hasOpenShift && (
          <div style={{ display: 'flex', gap: 12 }}>
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
          </div>
        )}
      </div>

      {/* Thẻ ca làm hiện tại nếu đang mở */}
      {hasOpenShift && (
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Clock size={20} color="var(--color-brand-600)" />
              <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text)' }}>
                Ca thu ngân của bạn đang mở
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

      {/* Modals */}
      {hasOpenShift && (
        <>
          <BlindCountCloseShiftModal
            isOpen={isCloseModalOpen}
            onClose={() => setIsCloseModalOpen(false)}
            shift={myShift}
            onSuccess={() => {
              setShiftsHistory(shiftService.getShiftHistory(effectiveBranchId));
            }}
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
    </div>
  );
};
