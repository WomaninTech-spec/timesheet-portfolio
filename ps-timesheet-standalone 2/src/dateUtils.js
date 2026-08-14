/**
 * Converts a "YYYY-MM" .. "YYYY-MM" month range into concrete
 * first-day / last-day ISO date strings, inclusive on both ends.
 *
 * @param {string} startMonth e.g. "2026-06"
 * @param {string} endMonth   e.g. "2026-08"
 * @returns {{ startDate: string, endDate: string }}
 */
export function monthRangeToDates(startMonth, endMonth) {
  if (!/^\d{4}-\d{2}$/.test(startMonth) || !/^\d{4}-\d{2}$/.test(endMonth)) {
    throw new Error('startMonth and endMonth must be in "YYYY-MM" format');
  }

  const [endYear, endMonthNum] = endMonth.split('-').map(Number);
  const startDate = `${startMonth}-01`;

  // Day 0 of "next month" is the last day of the target month.
  const lastDay = new Date(endYear, endMonthNum, 0).getDate();
  const endDate = `${endMonth}-${String(lastDay).padStart(2, '0')}`;

  return { startDate, endDate };
}

/** Extracts a "YYYY-MM" month key from a "YYYY-MM-DD..." date string. */
export function monthKey(dateStr) {
  return dateStr.slice(0, 7);
}
