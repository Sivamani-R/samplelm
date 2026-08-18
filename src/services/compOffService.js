import { compOffApi } from '../api/compOffApi.js';

export const compOffService = {
  async fetchCompOffData() {
    return await compOffApi.getMyCompOff();
  },

  async requestCompOff(formData) {
    const payload = {
      workedDate: formData.workedDate,
      hoursWorked: Number(formData.hoursWorked),
      reason: formData.reason?.trim() || ''
    };
    return await compOffApi.requestCompOff(payload);
  }
};
