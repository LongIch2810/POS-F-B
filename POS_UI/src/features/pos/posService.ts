// POS Service Layer (API Ready)

import { MockEngine } from '../../mock/mockEngine';
import { mockStorage } from '../../mock/mockStorage';
import {
  Invoice,
  Category,
  Product,
  ProductSize,
  Topping,
  CategoryTopping,
  DiningTable,
  PaymentMethod,
} from '../../types/entities';

export const posService = {
  getMenuData(storeId: string): {
    categories: Category[];
    products: Product[];
    productSizes: ProductSize[];
    toppings: Topping[];
    categoryToppings: CategoryTopping[];
  } {
    const state = mockStorage.getState();
    return {
      categories: state.categories.filter((c) => c.store_id === storeId && c.is_active).sort((a, b) => a.sort_order - b.sort_order),
      products: state.products.filter((p) => p.is_active),
      productSizes: state.productSizes,
      toppings: state.toppings.filter((t) => t.store_id === storeId && t.is_active),
      categoryToppings: state.categoryToppings,
    };
  },

  getTablesWithStatus(branchId: string): { table: DiningTable; activeInvoice?: Invoice }[] {
    return MockEngine.getTablesWithStatus(branchId);
  },

  getOrCreateTableInvoice(tableId: string): Promise<Invoice> {
    return Promise.resolve(MockEngine.getOrCreateTableInvoice(tableId));
  },

  createTakeawayInvoice(branchId: string): Promise<Invoice> {
    return Promise.resolve(MockEngine.createTakeawayInvoice(branchId));
  },

  addItemToInvoice(
    invoiceId: string,
    productSizeId: string,
    quantity: number,
    selectedToppingIds: string[] = [],
    notes?: string
  ): Promise<Invoice> {
    return Promise.resolve(
      MockEngine.addItemToInvoice(invoiceId, productSizeId, quantity, selectedToppingIds, notes)
    );
  },

  updateItemQuantity(invoiceId: string, itemId: string, newQuantity: number): Promise<Invoice> {
    return Promise.resolve(MockEngine.updateItemQuantity(invoiceId, itemId, newQuantity));
  },

  removeItem(invoiceId: string, itemId: string): Promise<Invoice> {
    return Promise.resolve(MockEngine.removeItemFromInvoice(invoiceId, itemId));
  },

  applyPromotion(invoiceId: string, code: string): Promise<Invoice> {
    return Promise.resolve(MockEngine.applyPromotion(invoiceId, code));
  },

  removePromotion(invoiceId: string): Promise<Invoice> {
    return Promise.resolve(MockEngine.removePromotion(invoiceId));
  },

  processPayment(
    invoiceId: string,
    method: PaymentMethod,
    tenderedAmount: bigint,
    transactionRef?: string,
    idempotencyKey?: string
  ): Promise<{ invoice: Invoice }> {
    return new Promise((resolve, reject) => {
      // Giả lập độ trễ mạng nhẹ 250ms
      setTimeout(() => {
        try {
          const res = MockEngine.processPayment(invoiceId, method, tenderedAmount, transactionRef, idempotencyKey);
          resolve({ invoice: res.invoice });
        } catch (err) {
          reject(err);
        }
      }, 250);
    });
  },
};
