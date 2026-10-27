// POS-F&B Main POS Screen per DESIGN.md §5.2

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { posService } from '../../services/posService';
import { shiftService } from '../../services/shiftService';
import { MockEngine } from '../../mock/mockEngine';
import { mockStorage } from '../../mock/mockStorage';
import { Invoice, DiningTable, PaymentMethod } from '../../types/entities';
import { ProductGrid } from './ProductGrid';
import { TableMap } from './TableMap';
import { OrderPanel } from './OrderPanel';
import { PaymentDialog } from './PaymentDialog';
import { OpenShiftGate } from '../shifts/OpenShiftGate';
import { LayoutGrid, UtensilsCrossed } from 'lucide-react';

export const PosScreen: React.FC = () => {
  const { session, isOffline } = useAuth();
  const { showToast } = useToast();
  const user = session.user;
  const storeId = user.store_id || 'store-1';
  const effectiveBranchId = MockEngine.getEffectiveBranchId();

  const [activeTab, setActiveTab] = useState<'menu' | 'tables'>('menu');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [selectedTable, setSelectedTable] = useState<DiningTable | null>(null);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  // Dữ liệu menu & bàn
  const [menuData, setMenuData] = useState(() => posService.getMenuData(storeId));
  const [tablesWithInvoices, setTablesWithInvoices] = useState(() =>
    posService.getTablesWithStatus(effectiveBranchId)
  );

  // Kiểm tra ca làm việc của chính mình (BR-16)
  const myShift = shiftService.getMyActiveShift();
  const hasOpenCashierShift = myShift && myShift.status === 'OPEN' && myShift.shift_type === 'CASHIER';

  useEffect(() => {
    const unsubscribe = mockStorage.subscribe(() => {
      setMenuData(posService.getMenuData(storeId));
      setTablesWithInvoices(posService.getTablesWithStatus(effectiveBranchId));

      // Cập nhật lại invoice đang chọn nếu có thay đổi
      if (selectedInvoice) {
        const updated = mockStorage.getState().invoices.find((inv) => inv.id === selectedInvoice.id);
        setSelectedInvoice(updated || null);
      }
    });
    return () => unsubscribe();
  }, [storeId, effectiveBranchId, selectedInvoice?.id]);

  // Nếu chưa mở ca thu ngân -> Chặn và thay bằng màn hình Mở ca (BR-16)
  if (!hasOpenCashierShift) {
    return (
      <OpenShiftGate
        branchId={effectiveBranchId}
        branchName={session.branch_name || 'Chi nhánh'}
        onShiftOpened={() => {
          setTablesWithInvoices(posService.getTablesWithStatus(effectiveBranchId));
        }}
      />
    );
  }

  // Thao tác chọn bàn từ sơ đồ
  const handleSelectTable = async (table: DiningTable, invoice?: Invoice) => {
    setSelectedTable(table);
    if (invoice) {
      setSelectedInvoice(invoice);
    } else {
      try {
        const newInv = await posService.getOrCreateTableInvoice(table.id);
        setSelectedInvoice(newInv);
        showToast({ type: 'info', message: `Đã mở ${table.name}` });
      } catch (err: any) {
        showToast({ type: 'error', message: err?.message || 'Không thể tạo đơn cho bàn này' });
      }
    }
    setActiveTab('menu'); // Chuyển sang menu để chọn món
  };

  // Thao tác tạo đơn mang đi
  const handleCreateTakeaway = async () => {
    setSelectedTable(null);
    try {
      const newInv = await posService.createTakeawayInvoice(effectiveBranchId);
      setSelectedInvoice(newInv);
      showToast({ type: 'info', message: 'Đã tạo đơn mang đi mới' });
      setActiveTab('menu');
    } catch (err: any) {
      showToast({ type: 'error', message: err?.message || 'Không thể tạo đơn mang đi' });
    }
  };

  // Thao tác thêm món vào đơn
  const handleAddItem = async (productSizeId: string, quantity: number, selectedToppingIds: string[]) => {
    if (isOffline) {
      showToast({ type: 'error', message: 'Mất kết nối mạng. Không thể thêm món lúc này.' });
      return;
    }

    let targetInvoice = selectedInvoice;
    // Nếu chưa có đơn nào được chọn, tự động tạo đơn mang đi
    if (!targetInvoice || targetInvoice.status !== 'OPEN') {
      try {
        targetInvoice = await posService.createTakeawayInvoice(effectiveBranchId);
        setSelectedInvoice(targetInvoice);
        setSelectedTable(null);
      } catch (err: any) {
        showToast({ type: 'error', message: err?.message || 'Không thể tạo đơn' });
        return;
      }
    }

    try {
      const updated = await posService.addItemToInvoice(targetInvoice.id, productSizeId, quantity, selectedToppingIds);
      setSelectedInvoice(updated);
    } catch (err: any) {
      showToast({ type: 'error', message: err?.message || 'Lỗi thêm món' });
    }
  };

  // Tăng giảm số lượng dòng món
  const handleUpdateQuantity = async (itemId: string, newQty: number) => {
    if (!selectedInvoice) return;
    try {
      const updated = await posService.updateItemQuantity(selectedInvoice.id, itemId, newQty);
      setSelectedInvoice(updated);
    } catch (err: any) {
      showToast({ type: 'error', message: err?.message || 'Lỗi cập nhật số lượng' });
    }
  };

  // Xóa dòng món
  const handleRemoveItem = async (itemId: string) => {
    if (!selectedInvoice) return;
    try {
      const updated = await posService.removeItem(selectedInvoice.id, itemId);
      setSelectedInvoice(updated);
    } catch (err: any) {
      showToast({ type: 'error', message: err?.message || 'Lỗi xóa món' });
    }
  };

  // Áp mã giảm giá
  const handleApplyPromotion = async (code: string) => {
    if (!selectedInvoice) return;
    const updated = await posService.applyPromotion(selectedInvoice.id, code);
    setSelectedInvoice(updated);
  };

  // Bỏ mã giảm giá
  const handleRemovePromotion = async () => {
    if (!selectedInvoice) return;
    const updated = await posService.removePromotion(selectedInvoice.id);
    setSelectedInvoice(updated);
  };

  // Xác nhận thanh toán
  const handleConfirmPayment = async (
    method: PaymentMethod,
    tenderedAmount: bigint,
    transactionRef?: string,
    idempotencyKey?: string
  ) => {
    if (!selectedInvoice) return;
    await posService.processPayment(
      selectedInvoice.id,
      method,
      tenderedAmount,
      transactionRef,
      idempotencyKey
    );
    setSelectedInvoice(null);
    setSelectedTable(null);
    showToast({
      type: 'success',
      message: `Đã thanh toán ${selectedInvoice.invoice_code} thành công! Kho đã tự động trừ nguyên liệu.`,
    });
  };

  return (
    <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
      {/* Vùng trái: Chuyển tab giữa Menu món và Sơ đồ bàn */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Toggle Bar giữa Menu và Bàn */}
        <div
          style={{
            height: 48,
            padding: '0 16px',
            background: 'var(--color-surface)',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            flexShrink: 0,
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('menu')}
            style={{
              height: 36,
              padding: '0 16px',
              borderRadius: 'var(--radius-control)',
              border: 'none',
              background: activeTab === 'menu' ? 'var(--color-brand-100)' : 'transparent',
              color: activeTab === 'menu' ? 'var(--color-brand-800)' : 'var(--color-text-muted)',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <UtensilsCrossed size={16} />
            <span>Thực đơn chọn món</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('tables')}
            style={{
              height: 36,
              padding: '0 16px',
              borderRadius: 'var(--radius-control)',
              border: 'none',
              background: activeTab === 'tables' ? 'var(--color-brand-100)' : 'transparent',
              color: activeTab === 'tables' ? 'var(--color-brand-800)' : 'var(--color-text-muted)',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <LayoutGrid size={16} />
            <span>Sơ đồ bàn ({tablesWithInvoices.length})</span>
          </button>
        </div>

        {/* Nội dung vùng trái */}
        {activeTab === 'menu' ? (
          <ProductGrid
            categories={menuData.categories}
            products={menuData.products}
            productSizes={menuData.productSizes}
            toppings={menuData.toppings}
            categoryToppings={menuData.categoryToppings}
            onAddItem={handleAddItem}
          />
        ) : (
          <TableMap
            tablesWithInvoices={tablesWithInvoices}
            selectedTableId={selectedTable?.id}
            onSelectTable={handleSelectTable}
            onCreateTakeaway={handleCreateTakeaway}
          />
        )}
      </div>

      {/* Vùng phải: Panel đơn hàng cố định 400px (DESIGN.md §5.2) */}
      <OrderPanel
        invoice={selectedInvoice}
        tableName={selectedTable?.name}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onApplyPromotion={handleApplyPromotion}
        onRemovePromotion={handleRemovePromotion}
        onOpenPayment={() => setIsPaymentOpen(true)}
      />

      {/* Hộp thoại thanh toán (PaymentDialog) */}
      {isPaymentOpen && selectedInvoice && (
        <PaymentDialog
          isOpen={isPaymentOpen}
          onClose={() => setIsPaymentOpen(false)}
          invoice={selectedInvoice}
          onSuccess={() => setIsPaymentOpen(false)}
          onConfirmPayment={handleConfirmPayment}
        />
      )}
    </div>
  );
};
