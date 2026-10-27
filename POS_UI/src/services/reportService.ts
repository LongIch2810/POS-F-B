// Report Service Layer (API Ready)

import { MockEngine } from '../mock/mockEngine';

export const reportService = {
  getDailyReport(branchId?: string, dateStr?: string) {
    return MockEngine.getDailyReport(branchId, dateStr);
  },
};
