import { apiClient } from './apiClient.js';
import { mockBackendService } from '../services/mockBackendService.js';
import { authService } from '../services/authService.js';

export const approvalApi = {
  async getMyApprovals() {
    if (apiClient.isMockMode()) {
      const currentUser = authService.getUser();
      return await mockBackendService.getMyApprovals(currentUser);
    }
    return await apiClient.get('/approvals/my');
  },

  async getApprovalRequest(id) {
    if (apiClient.isMockMode()) {
      const currentUser = authService.getUser();
      return await mockBackendService.getApprovalRequest(id, currentUser);
    }
    return await apiClient.get(`/approvals/${id}`);
  },

  async approveRequest(id, data = {}) {
    if (apiClient.isMockMode()) {
      const currentUser = authService.getUser();
      return await mockBackendService.approveRequest(id, data, currentUser);
    }
    return await apiClient.post(`/approvals/${id}/approve`, data);
  },

  async rejectRequest(id, data) {
    if (apiClient.isMockMode()) {
      const currentUser = authService.getUser();
      return await mockBackendService.rejectRequest(id, data, currentUser);
    }
    return await apiClient.post(`/approvals/${id}/reject`, data);
  },

  async requestClarification(id, data) {
    if (apiClient.isMockMode()) {
      const currentUser = authService.getUser();
      return await mockBackendService.requestClarification(id, data, currentUser);
    }
    return await apiClient.post(`/approvals/${id}/clarification`, data);
  },

  async getApprovalHistory() {
    if (apiClient.isMockMode()) {
      const currentUser = authService.getUser();
      return await mockBackendService.getApprovalHistory(currentUser);
    }
    return await apiClient.get('/approvals/history');
  },

  async getEscalatedRequests() {
    if (apiClient.isMockMode()) {
      const currentUser = authService.getUser();
      return await mockBackendService.getEscalatedRequests(currentUser);
    }
    return await apiClient.get('/approvals/escalated');
  }
};
