import { query } from '../../shared/database/index.js';

class AccrualStrategy {
  calculate(policy, employeeJoiningDate, currentDate) {
    throw new Error('Method not implemented');
  }
}

class MonthlyAccrualStrategy extends AccrualStrategy {
  calculate(policy, employeeJoiningDate, currentDate) {
    const joiningDate = new Date(employeeJoiningDate);
    const startOfYear = new Date(currentDate.getFullYear(), 0, 1);
    const effectiveStartDate = joiningDate > startOfYear ? joiningDate : startOfYear;
    
    // Calculate full months elapsed
    let monthsElapsed = (currentDate.getFullYear() - effectiveStartDate.getFullYear()) * 12;
    monthsElapsed -= effectiveStartDate.getMonth();
    monthsElapsed += currentDate.getMonth();

    // If joining in middle of month, we can prorate. For MVP, we'll just count whole months elapsed or add 1 if past start date.
    // Simplifying: months elapsed in current year.
    if (monthsElapsed < 0) monthsElapsed = 0;
    
    // Example: joined Jan 1, current is Aug 18 -> monthsElapsed = 7 (Jan to Jul full months) + some prorated. Let's just use month index difference.
    let accrued = monthsElapsed * Number(policy.monthly_accrual);
    if (accrued > Number(policy.annual_entitlement)) {
      accrued = Number(policy.annual_entitlement);
    }
    
    return accrued;
  }
}

class AnnualAccrualStrategy extends AccrualStrategy {
  calculate(policy, employeeJoiningDate, currentDate) {
    return Number(policy.annual_entitlement);
  }
}

export class AccrualEngine {
  constructor() {
    this.strategies = {
      'MONTHLY': new MonthlyAccrualStrategy(),
      'ANNUAL': new AnnualAccrualStrategy(),
    };
  }

  getStrategy(policy) {
    // For now, if monthly_accrual > 0, use monthly, else annual
    if (Number(policy.monthly_accrual) > 0) {
      return this.strategies['MONTHLY'];
    }
    return this.strategies['ANNUAL'];
  }

  calculateAccrued(policy, employeeJoiningDate, currentDate = new Date()) {
    const strategy = this.getStrategy(policy);
    return strategy.calculate(policy, employeeJoiningDate, currentDate);
  }
}

export const accrualEngine = new AccrualEngine();
