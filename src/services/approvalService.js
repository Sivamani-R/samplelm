import { approvalApi } from '../api/approvalApi.js';

export const approvalService = {
  async fetchMyApprovals() {
    return await approvalApi.getMyApprovals();
  },

  async fetchApprovalRequest(id) {
    return await approvalApi.getApprovalRequest(id);
  },

  async approveRequest(id, remarks = '') {
    return await approvalApi.approveRequest(id, { remarks });
  },

  async rejectRequest(id, reason) {
    return await approvalApi.rejectRequest(id, { reason });
  },

  async requestClarification(id, clarificationMessage) {
    return await approvalApi.requestClarification(id, { clarificationMessage });
  },

  async fetchApprovalHistory() {
    return await approvalApi.getApprovalHistory();
  },

  async fetchEscalatedRequests() {
    return await approvalApi.getEscalatedRequests();
  }
};
