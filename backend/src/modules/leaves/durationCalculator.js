import { query } from '../../shared/database/index.js';

export class DurationCalculator {
  async calculate(arg1, arg2, arg3 = 'FULL_DAY', arg4 = 'FULL_DAY', arg5 = false, arg6 = 0, arg7 = null) {
    let startDateStr, endDateStr, startSession, endSession, isHourly, hours, locationId;

    if (typeof arg1 === 'object' && arg1 !== null) {
      startDateStr = arg1.startDate;
      endDateStr = arg1.endDate;
      startSession = arg1.startSession || 'FULL_DAY';
      endSession = arg1.endSession || 'FULL_DAY';
      isHourly = Boolean(arg1.isHourly);
      hours = Number(arg1.hours) || 0;
      locationId = arg1.locationId || arg2 || null;
    } else {
      startDateStr = arg1;
      endDateStr = arg2;
      startSession = arg3;
      endSession = arg4;
      isHourly = Boolean(arg5);
      hours = Number(arg6) || 0;
      locationId = arg7;
    }

    if (isHourly) {
      const numHours = hours || 0;
      const dayEquivalent = Number((numHours / 8).toFixed(2));
      return {
        workingDays: dayEquivalent,
        calendarDays: 1,
        holidayDays: 0,
        weekendDays: 0,
        isHourly: true,
        hours: numHours,
        breakdown: `${numHours} hours (${dayEquivalent} day equivalent based on 8h shift)`
      };
    }

    if (!startDateStr || !endDateStr) {
      return { workingDays: 0, calendarDays: 0, holidayDays: 0, weekendDays: 0, breakdown: 'Invalid dates' };
    }

    const start = new Date(startDateStr);
    const end = new Date(endDateStr);
    if (end < start) {
      return { workingDays: 0, calendarDays: 0, holidayDays: 0, weekendDays: 0, breakdown: 'End date before start date' };
    }

    // Fetch holidays for location
    let holidayDates = new Set();
    if (locationId) {
      const { rows: holidays } = await query(
        'SELECT date FROM holidays WHERE location_id = $1 AND date >= $2 AND date <= $3',
        [locationId, startDateStr, endDateStr]
      );
      holidayDates = new Set(holidays.map(h => typeof h.date === 'string' ? h.date.split('T')[0] : new Date(h.date).toISOString().split('T')[0]));
    }

    let calendarDays = 0;
    let weekendDays = 0;
    let holidayDays = 0;
    let workingDays = 0;

    // Use UTC dates to prevent timezone drift
    const [sY, sM, sD] = startDateStr.split('-').map(Number);
    const [eY, eM, eD] = endDateStr.split('-').map(Number);
    const current = new Date(Date.UTC(sY, sM - 1, sD));
    const finalDate = new Date(Date.UTC(eY, eM - 1, eD));

    while (current <= finalDate) {
      calendarDays++;
      const dayOfWeek = current.getUTCDay(); // 0: Sun, 6: Sat
      const dateStr = current.toISOString().split('T')[0];

      if (dayOfWeek === 0 || dayOfWeek === 6) {
        weekendDays++;
      } else if (holidayDates.has(dateStr)) {
        holidayDays++;
      } else {
        workingDays++;
      }
      current.setUTCDate(current.getUTCDate() + 1);
    }

    if (workingDays > 0) {
      if (startDateStr === endDateStr) {
        if (startSession === 'FIRST_HALF' || startSession === 'SECOND_HALF') {
          workingDays = 0.5;
        }
      } else {
        if (startSession === 'SECOND_HALF') {
          workingDays -= 0.5;
        }
        if (endSession === 'FIRST_HALF') {
          workingDays -= 0.5;
        }
      }
    }

    const finalWorkingDays = Math.max(0, workingDays);

    return {
      workingDays: finalWorkingDays,
      calendarDays,
      holidayDays,
      weekendDays,
      isHourly: false,
      hours: 0,
      breakdown: `${finalWorkingDays} working day(s) charged. (${calendarDays} calendar days - ${weekendDays} weekends - ${holidayDays} holidays)`
    };
  }
}

export const durationCalculator = new DurationCalculator();
