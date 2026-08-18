import { auditApi } from '../api/auditApi.js';

export const auditService = {
  async fetchAuditLogs() {
    return await auditApi.getAll();
  },

  async fetchDashboardStats() {
    return await auditApi.getDashboardStats();
  }
};
