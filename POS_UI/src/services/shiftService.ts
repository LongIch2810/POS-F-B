// Shift Service Layer (API Ready)

import { MockEngine } from '../mock/mockEngine';
import { mockStorage } from '../mock/mockStorage';
import { WorkShift, CashReconciliation, ShiftExpense, Invoice } from '../types/entities';

export const shiftService = {
  getMyActiveShift(): WorkShift | undefined {
    return MockEngine.getMyActiveShift();
  },

  getOpeningCashInfo(branchId: string): { amount: bigint; sourceText: string } {
    return MockEngine.getExpectedOpeningCash(branchId);
  },

  openShift(branchId: string): Promise<WorkShift> {
    return Promise.resolve(MockEngine.openCashierShift(branchId));
  },

  addExpense(shiftId: string, amount: bigint, reason: string, paidFromDrawer: boolean): Promise<ShiftExpense> {
    return Promise.resolve(MockEngine.addShiftExpense(shiftId, amount, reason, paidFromDrawer));
  },

  closeShiftBlind(
    shiftId: string,
    countedCash: bigint,
    note?: string
  ): Promise<{ reconciliation: CashReconciliation; shift: WorkShift }> {
    return Promise.resolve(MockEngine.closeShiftBlind(shiftId, countedCash, note));
  },

  getOpenInvoicesForShift(shiftId: string): (Invoice & { tableName?: string })[] {
    return MockEngine.getOpenInvoicesForShift(shiftId);
  },

  forceCloseShift(
    shiftId: string,
    managerId: string,
    countedCash: bigint,
    reason: string
  ): Promise<{ reconciliation: CashReconciliation; shift: WorkShift }> {
    return Promise.resolve(MockEngine.forceCloseShift(shiftId, managerId, countedCash, reason));
  },

  checkInStaffShift(userId: string, branchId: string): Promise<WorkShift> {
    return Promise.resolve(MockEngine.checkInStaffShift(userId, branchId));
  },

  checkOutStaffShift(shiftId: string): Promise<WorkShift> {
    return Promise.resolve(MockEngine.checkOutStaffShift(shiftId));
  },

  getShiftHistory(branchId?: string): { shift: WorkShift; reconciliation?: CashReconciliation; expenses: ShiftExpense[] }[] {
    const state = mockStorage.getState();
    const effectiveBranch = branchId || MockEngine.getEffectiveBranchId();
    let shifts = state.workShifts;
    if (effectiveBranch) {
      shifts = shifts.filter((s) => s.branch_id === effectiveBranch);
    }

    return shifts.map((shift) => ({
      shift,
      reconciliation: state.cashReconciliations.find((r) => r.work_shift_id === shift.id),
      expenses: state.shiftExpenses.filter((e) => e.work_shift_id === shift.id),
    }));
  },
};
