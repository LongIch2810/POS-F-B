// POS-F&B Daily Report Screen per DESIGN.md §5.6 & BR-62 to BR-65, BR-77

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { reportService } from '../../services/reportService';
import { MockEngine } from '../../mock/mockEngine';
import { mockStorage } from '../../mock/mockStorage';
import { formatVND } from '../../utils/formatters';
import { Banknote, QrCode, Calendar } from 'lucide-react';

export const DailyReportScreen: React.FC = () => {
  const { session } = useAuth();
  const user = session.user;
  const isOwner = user.role_code === 'OWNER';

  const accessibleBranches = MockEngine.getAccessibleBranches();
  const [selectedBranchId, setSelectedBranchId] = useState<string>(
    isOwner ? '' : MockEngine.getEffectiveBranchId()
  );

  const todayStr = new Date().toISOString().slice(0, 10);
  const [reportDate, setReportDate] = useState<string>(todayStr);

  const [report, setReport] = useState(() =>
    reportService.getDailyReport(selectedBranchId || undefined, reportDate)
  );

  useEffect(() => {
    const update = () => {
      setReport(reportService.getDailyReport(selectedBranchId || undefined, reportDate));
    };
    update();
    const unsubscribe = mockStorage.subscribe(update);
    return () => unsubscribe();
  }, [selectedBranchId, reportDate]);

  const cashPercent =
    report.totalRevenue > 0n
      ? Number((report.cashRevenue * 100n) / report.totalRevenue)
      : 0;
  const transferPercent =
    report.totalRevenue > 0n
      ? Number((report.transferRevenue * 100n) / report.totalRevenue)
      : 0;

  return (
    <div style={{ flex: 1, padding: 24, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header & Controls */}
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
            Báo cáo Doanh thu Ngày
          </h1>
          <p style={{ fontSize: 14, color: 'var(--color-text-muted)', marginTop: 4 }}>
            Chỉ tính các đơn đã thanh toán, gom theo múi giờ Việt Nam (Asia/Ho_Chi_Minh)
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Lọc chi nhánh cho OWNER (BR-77) */}
          {isOwner && (
            <select
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value)}
              style={{
                height: 40,
                padding: '0 12px',
                borderRadius: 'var(--radius-control)',
                border: '1px solid var(--color-border-control)',
                background: 'var(--color-surface)',
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              <option value="">Tất cả chi nhánh (Tổng hợp)</option>
              {accessibleBranches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          )}

          {/* Ngày báo cáo */}
          <div
            style={{
              height: 40,
              padding: '0 12px',
              borderRadius: 'var(--radius-control)',
              border: '1px solid var(--color-border-control)',
              background: 'var(--color-surface)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 14,
            }}
          >
            <Calendar size={16} color="var(--color-text-muted)" />
            <input
              type="date"
              value={reportDate}
              onChange={(e) => setReportDate(e.target.value)}
              style={{ border: 'none', background: 'transparent', fontSize: 14, outline: 'none' }}
            />
          </div>
        </div>
      </div>

      {/* Hàng chỉ số nhanh gọn per DESIGN.md §5.6 */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16,
        }}
      >
        {/* Tổng doanh thu */}
        <div
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-tile)',
            padding: 20,
          }}
        >
          <div style={{ fontSize: 13, color: 'var(--color-text-muted)', fontWeight: 600, marginBottom: 6 }}>
            TỔNG DOANH THU
          </div>
          <div
            className="money"
            style={{ fontSize: 28, fontWeight: 700, color: 'var(--color-brand-600)' }}
          >
            {formatVND(report.totalRevenue)}
          </div>
          <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4 }}>
            {report.invoiceCount} hóa đơn hoàn tất
          </div>
        </div>

        {/* Tiền mặt */}
        <div
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-tile)',
            padding: 20,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--color-text-muted)', fontWeight: 600, marginBottom: 6 }}>
            <Banknote size={16} />
            <span>TIỀN MẶT (CASH)</span>
          </div>
          <div
            className="money"
            style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-text)' }}
          >
            {formatVND(report.cashRevenue)}
          </div>
          <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4 }}>
            Chiếm {cashPercent}% tổng doanh thu
          </div>
        </div>

        {/* Chuyển khoản */}
        <div
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-tile)',
            padding: 20,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--color-text-muted)', fontWeight: 600, marginBottom: 6 }}>
            <QrCode size={16} />
            <span>CHUYỂN KHOẢN (TRANSFER)</span>
          </div>
          <div
            className="money"
            style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-text)' }}
          >
            {formatVND(report.transferRevenue)}
          </div>
          <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4 }}>
            Chiếm {transferPercent}% tổng doanh thu
          </div>
        </div>
      </div>

      {/* Thanh phân bổ Doanh thu Tiền mặt & Chuyển khoản */}
      <div
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-tile)',
          padding: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text)' }}>
          Cơ cấu hình thức thanh toán
        </h3>

        {report.totalRevenue === 0n ? (
          <div style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>
            Chưa có doanh thu trong ngày {reportDate}.
          </div>
        ) : (
          <div>
            <div
              style={{
                height: 24,
                width: '100%',
                borderRadius: 'var(--radius-control)',
                overflow: 'hidden',
                display: 'flex',
                background: 'var(--color-surface-sunken)',
              }}
            >
              <div
                style={{
                  width: `${cashPercent}%`,
                  background: 'var(--color-brand-600)',
                  transition: 'width 200ms ease',
                }}
                title={`Tiền mặt: ${cashPercent}%`}
              />
              <div
                style={{
                  width: `${transferPercent}%`,
                  background: 'var(--color-info)',
                  transition: 'width 200ms ease',
                }}
                title={`Chuyển khoản: ${transferPercent}%`}
              />
            </div>

            <div style={{ display: 'flex', gap: 24, marginTop: 12, fontSize: 13 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 12, height: 12, background: 'var(--color-brand-600)', borderRadius: 2 }} />
                <span>Tiền mặt: <strong>{cashPercent}%</strong> ({formatVND(report.cashRevenue)})</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 12, height: 12, background: 'var(--color-info)', borderRadius: 2 }} />
                <span>Chuyển khoản: <strong>{transferPercent}%</strong> ({formatVND(report.transferRevenue)})</span>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
