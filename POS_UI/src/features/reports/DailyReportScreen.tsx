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
            Chỉ tính các đơn đã thanh toán (PAID), gom theo múi giờ Việt Nam Asia/Ho_Chi_Minh (BR-62, BR-63)
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
          Cơ cấu hình thức thanh toán (BR-64)
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

      {/* Biểu đồ phân bổ doanh thu theo giờ (DESIGN.md §5.6 & taste-skill Charts.bars) */}
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text)' }}>
              Doanh thu theo khung giờ bán hàng
            </h3>
            <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 2 }}>
              Khung giờ cao điểm trong ngày (từ 07:00 đến 22:00)
            </p>
          </div>
        </div>

        {/* Khung vẽ biểu đồ cột SVG */}
        <div style={{ width: '100%', height: 220, position: 'relative', overflowX: 'auto' }}>
          {(() => {
            const hours = report.hourlyRevenue;
            const maxRev = hours.reduce(
              (m: bigint, h: { hour: number; revenue: bigint; count: number }) => (h.revenue > m ? h.revenue : m),
              100000n
            );
            const chartHeight = 160;

            return (
              <div style={{ minWidth: 600, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', gap: 12, paddingBottom: 8, borderBottom: '1px solid var(--color-border)' }}>
                  {hours.map((h: { hour: number; revenue: bigint; count: number }) => {
                    const barHeight = maxRev > 0n ? Number((h.revenue * BigInt(chartHeight)) / maxRev) : 0;
                    const hasData = h.revenue > 0n;

                    return (
                      <div
                        key={h.hour}
                        style={{
                          flex: 1,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'flex-end',
                          height: chartHeight,
                          position: 'relative',
                        }}
                        title={`${h.hour}:00 - ${formatVND(h.revenue)} (${h.count} đơn)`}
                      >
                        {hasData && (
                          <div
                            className="num"
                            style={{
                              fontSize: 10,
                              fontWeight: 600,
                              color: 'var(--color-brand-700)',
                              marginBottom: 4,
                            }}
                          >
                            {Math.round(Number(h.revenue) / 1000)}k
                          </div>
                        )}
                        <div
                          style={{
                            width: '100%',
                            maxWidth: 32,
                            height: Math.max(barHeight, hasData ? 6 : 2),
                            background: hasData ? 'var(--color-brand-600)' : 'var(--color-border-subtle)',
                            borderRadius: '3px 3px 0 0',
                            transition: 'height 250ms ease',
                          }}
                        />
                      </div>
                    );
                  })}
                </div>

                {/* Trục X thời gian */}
                <div style={{ display: 'flex', gap: 12, paddingTop: 6 }}>
                  {hours.map((h: { hour: number; revenue: bigint; count: number }) => (
                    <div
                      key={h.hour}
                      className="num"
                      style={{
                        flex: 1,
                        textAlign: 'center',
                        fontSize: 11,
                        color: 'var(--color-text-muted)',
                        fontWeight: 500,
                      }}
                    >
                      {h.hour}h
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
};
