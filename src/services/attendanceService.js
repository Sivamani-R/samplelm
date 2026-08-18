import { attendanceApi } from '../api/attendanceApi.js';

export const attendanceService = {
  async fetchAttendanceData() {
    return await attendanceApi.getMyAttendance();
  },

  async submitRegularization(formData) {
    const payload = {
      date: formData.date,
      issueType: formData.issueType,
      checkIn: formData.checkIn,
      checkOut: formData.checkOut,
      reason: formData.reason?.trim() || ''
    };
    return await attendanceApi.submitRegularization(payload);
  }
};
