import { MockEngine } from '../../mock/mockEngine';
import { User } from '../../types/auth';

export const reportService = {
  getDailyReport(branchId?: string, dateStr?: string, customUser?: User) {
    return MockEngine.getDailyReport(branchId, dateStr, customUser);
  },
};
