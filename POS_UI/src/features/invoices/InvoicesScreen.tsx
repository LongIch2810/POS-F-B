import React, { useState, useEffect } from 'react';
import { invoiceService } from '../../services/invoiceService';
import { MockEngine } from '../../mock/mockEngine';
import { mockStorage } from '../../mock/mockStorage';
import { Invoice, InvoiceStatus } from '../../types/entities';
import { formatVND, formatDateTimeVN } from '../../utils/formatters';
import { Badge } from '../../components/ui/Badge';
import { DataTable, Column } from '../../components/ui/DataTable';
import { InvoiceDetailDrawer } from './InvoiceDetailDrawer';
import { CancelInvoiceModal } from './CancelInvoiceModal';
import { Filter } from 'lucide-react';

export const InvoicesScreen: React.FC = () => {
  const effectiveBranchId = MockEngine.getEffectiveBranchId();

  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [invoices, setInvoices] = useState<Invoice[]>(() =>
    invoiceService.getInvoices({ branchId: effectiveBranchId })
  );
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  useEffect(() => {
    const update = () => {
      const filters = {
        branchId: effectiveBranchId,
        status: statusFilter === 'ALL' ? undefined : (statusFilter as InvoiceStatus),
      };
      setInvoices(invoiceService.getInvoices(filters));
    };

    update();
    const unsubscribe = mockStorage.subscribe(update);
    return () => unsubscribe();
  }, [effectiveBranchId, statusFilter]);

  const columns: Column<Invoice>[] = [
    {
      key: 'code',
      header: 'Mã hóa đơn',
      render: (inv) => (
        <span style={{ fontWeight: 700, color: 'var(--color-brand-800)' }}>
          {inv.invoice_code}
        </span>
      ),
    },
    {
      key: 'time',
      header: 'Thời gian',
      render: (inv) => (
        <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
          {formatDateTimeVN(inv.created_at)}
        </span>
      ),
    },
    {
      key: 'table',
      header: 'Loại / Bàn',
      render: (inv) => {
        const table = mockStorage.getState().tables.find((t) => t.id === inv.dining_table_id);
        return (
          <span style={{ fontWeight: 600 }}>
            {inv.order_type === 'DINE_IN' ? (table?.name || 'Bàn') : 'Mang đi'}
          </span>
        );
      },
    },
    {
      key: 'items_count',
      header: 'Số món',
      align: 'center',
      render: (inv) => {
        const totalItems = inv.items.reduce((s, i) => s + i.quantity, 0);
        return <span>{totalItems}</span>;
      },
    },
    {
      key: 'status',
      header: 'Trạng thái',
      render: (inv) => (
        <Badge
          variant={inv.status === 'PAID' ? 'success' : inv.status === 'OPEN' ? 'info' : 'danger'}
          size="sm"
        >
          {inv.status === 'PAID' ? 'Đã thanh toán' : inv.status === 'OPEN' ? 'Đang mở' : 'Đã hủy'}
        </Badge>
      ),
    },
    {
      key: 'payment_method',
      header: 'Phương thức',
      render: (inv) => {
        const method = inv.payments[0]?.method;
        if (!method) return <span style={{ color: 'var(--color-text-disabled)' }}>-</span>;
        return <span>{method === 'CASH' ? 'Tiền mặt' : 'Chuyển khoản'}</span>;
      },
    },
    {
      key: 'total',
      header: 'Tổng tiền',
      align: 'right',
      render: (inv) => (
        <span className="money" style={{ fontWeight: 700, color: 'var(--color-brand-600)', fontSize: 15 }}>
          {formatVND(inv.total_amount)}
        </span>
      ),
    },
  ];

  return (
    <div style={{ flex: 1, padding: 'clamp(14px, 2.5vw, 24px)', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header & Filter */}
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
            Danh sách Hóa đơn
          </h1>
          <p style={{ fontSize: 14, color: 'var(--color-text-muted)', marginTop: 4 }}>
            Tra cứu hóa đơn chi nhánh, xem snapshot lúc bán và quản lý hủy đơn
          </p>
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <Filter size={18} color="var(--color-text-muted)" />
          {['ALL', 'OPEN', 'PAID', 'CANCELLED'].map((st) => {
            const isSelected = statusFilter === st;
            const labels: Record<string, string> = {
              ALL: 'Tất cả',
              OPEN: 'Đang mở',
              PAID: 'Đã thanh toán',
              CANCELLED: 'Đã hủy',
            };
            return (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                style={{
                  height: 44,
                  padding: '0 14px',
                  borderRadius: 'var(--radius-pill)',
                  border: `1px solid ${isSelected ? 'var(--color-brand-600)' : 'var(--color-border-control)'}`,
                  background: isSelected ? 'var(--color-brand-100)' : 'var(--color-surface)',
                  color: isSelected ? 'var(--color-brand-800)' : 'var(--color-text)',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                {labels[st]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bảng hóa đơn */}
      <DataTable
        columns={columns}
        data={invoices}
        keyExtractor={(inv) => inv.id}
        onRowClick={(inv) => setSelectedInvoice(inv)}
        emptyMessage="Không có hóa đơn nào phù hợp với bộ lọc"
      />

      {/* Drawer xem chi tiết hóa đơn */}
      <InvoiceDetailDrawer
        isOpen={!!selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
        invoice={selectedInvoice}
        onOpenCancelModal={() => setIsCancelModalOpen(true)}
      />

      {/* Modal hủy đơn */}
      {isCancelModalOpen && selectedInvoice && (
        <CancelInvoiceModal
          isOpen={isCancelModalOpen}
          onClose={() => setIsCancelModalOpen(false)}
          invoice={selectedInvoice}
          onSuccess={() => {
            const updated = invoiceService.getInvoiceById(selectedInvoice.id);
            setSelectedInvoice(updated || null);
          }}
        />
      )}
    </div>
  );
};
