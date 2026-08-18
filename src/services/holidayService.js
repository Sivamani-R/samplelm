import { holidayApi } from '../api/holidayApi.js';

export const holidayService = {
  async fetchMyHolidays() {
    return await holidayApi.getMyHolidays();
  }
};
