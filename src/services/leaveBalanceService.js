import { leaveBalanceApi } from '../api/leaveBalanceApi.js';

export const leaveBalanceService = {
  async fetchMyBalances() {
    return await leaveBalanceApi.getMyBalances();
  },

  /**
   * Formats balance formula string: Opening + Accrued - Used - Pending - Encashed = Closing
   */
  formatFormula(balance) {
    if (!balance) return '';
    return `${balance.openingBalance} (Opening) + ${balance.accrued} (Accrued) - ${balance.used} (Used) - ${balance.pending} (Pending) = ${balance.closingBalance} Days Available`;
  }
};
