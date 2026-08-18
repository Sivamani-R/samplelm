import { leaveApi } from '../api/leaveApi.js';

export const leaveService = {
  async fetchMyLeaves() {
    return await leaveApi.getMyLeaves();
  },

  async applyLeave(formData) {
    const payload = {
      leaveTypeId: formData.leaveTypeId,
      startDate: formData.startDate,
      endDate: formData.endDate,
      startSession: formData.startSession || 'FULL_DAY',
      endSession: formData.endSession || 'FULL_DAY',
      isHourly: Boolean(formData.isHourly),
      hours: formData.isHourly ? Number(formData.hours) : 0,
      reason: formData.reason?.trim() || '',
      attachments: formData.attachments || []
    };

    return await leaveApi.applyLeave(payload);
  },

  async calculateDuration(params) {
    return await leaveApi.calculateDuration(params);
  },

  async checkOverlap(params) {
    return await leaveApi.checkOverlap(params);
  },

  async withdrawLeave(id) {
    return await leaveApi.withdrawLeave(id);
  },

  async cancelLeave(id, reason) {
    return await leaveApi.cancelLeave(id, reason);
  }
};
