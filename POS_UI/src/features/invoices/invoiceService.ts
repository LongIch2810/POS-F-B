// Invoice Service Layer (API Ready)

import { MockEngine } from '../../mock/mockEngine';
import { mockStorage } from '../../mock/mockStorage';
import { Invoice, InvoiceStatus } from '../../types/entities';

export interface InvoiceFilters {
  status?: InvoiceStatus;
  branchId?: string;
  date?: string;
  tableId?: string;
}

export const invoiceService = {
  getInvoices(filters?: InvoiceFilters): Invoice[] {
    const state = mockStorage.getState();
    const effectiveBranch = filters?.branchId || MockEngine.getEffectiveBranchId();
    let result = state.invoices;

    if (effectiveBranch) {
      result = result.filter((inv) => inv.branch_id === effectiveBranch);
    }

    if (filters?.status) {
      result = result.filter((inv) => inv.status === filters.status);
    }

    if (filters?.date) {
      result = result.filter((inv) => inv.created_at.startsWith(filters.date!));
    }

    if (filters?.tableId) {
      result = result.filter((inv) => inv.dining_table_id === filters.tableId);
    }

    return result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  getInvoiceById(invoiceId: string): Invoice | undefined {
    return mockStorage.getState().invoices.find((inv) => inv.id === invoiceId);
  },

  cancelInvoice(invoiceId: string, reason: string): Promise<Invoice> {
    return Promise.resolve(MockEngine.cancelInvoice(invoiceId, reason));
  },
};
