/**
 * Ethiopian ⇆ Gregorian conversion via Julian Day Numbers.
 *
 * Adopted from the Beyene–Kudlek algorithm,
 * http://www.geez.org/Calendars/EthiopicCalendar.java
 * @author መሃሪ <gmehari.edu@gmail.com>
 */

/** ዓመተ ዓለም era epoch. */
export const AMETE_ALEM = -285019;
/** ዓመተ ምሕረት era epoch (the default). */
export const AMETE_MIHRET = 1723856;
const GREGORIAN_EPOCH = 1721426;

const floorDiv = (a: number, b: number): number => Math.floor(a / b);

const isGregorianLeap = (year: number): boolean =>
  year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);

/** Days per Gregorian month, 1-indexed; February resolved per leap year at use. */
const MONTH_DAYS = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31] as const;

/** Days in ጳጉሜን: 6 in Ethiopian leap years (year % 4 === 3), else 5. */
const pagumeDays = (year: number): number => (year % 4 === 3 ? 6 : 5);

const daysInEthiopicMonth = (year: number, month: number): number =>
  month === 13 ? pagumeDays(year) : 30;

const daysInGregorianMonth = (year: number, month: number): number =>
  month === 2 && isGregorianLeap(year) ? 29 : MONTH_DAYS[month]!;

export type Ymd = [year: number, month: number, day: number];

function ethiopicToJdn(year: number, month: number, day: number, era: number): number {
  return era + 365 + 365 * (year - 1) + floorDiv(year, 4) + 30 * month + day - 31;
}

function jdnToEthiopic(jdn: number): Ymd {
  const era = jdn >= AMETE_MIHRET + 365 ? AMETE_MIHRET : AMETE_ALEM;
  const r = (jdn - era) % 1461;
  const n = (r % 365) + 365 * floorDiv(r, 1460);
  const year = 4 * floorDiv(jdn - era, 1461) + floorDiv(r, 365) - floorDiv(r, 1460);
  return [year, floorDiv(n, 30) + 1, (n % 30) + 1];
}

function gregorianToJdn(year: number, month: number, day: number): number {
  const s =
    floorDiv(year, 4) - floorDiv(year - 1, 4) -
    floorDiv(year, 100) + floorDiv(year - 1, 100) +
    floorDiv(year, 400) - floorDiv(year - 1, 400);
  const t = floorDiv(14 - month, 12);
  const n =
    31 * t * (month - 1) +
    (1 - t) * (59 + s + 30 * (month - 3) + floorDiv(3 * month - 7, 5)) +
    day - 1;
  return (
    GREGORIAN_EPOCH +
    365 * (year - 1) +
    floorDiv(year - 1, 4) - floorDiv(year - 1, 100) + floorDiv(year - 1, 400) +
    n
  );
}

// Cycle lengths in days: 1461 = 4 years, 36524 = 100 years, 146097 = 400 years.
function jdnToGregorian(jdn: number): Ymd {
  const r400 = (jdn - GREGORIAN_EPOCH) % 146097;
  // The last day of a 400-year cycle (Dec 31 of 1600, 2000, 2400…) belongs to
  // century index 3; unclamped division slots it into a nonexistent 5th century.
  const century = Math.min(floorDiv(r400, 36524), 3);
  const r100 = r400 - century * 36524;
  const r4 = r100 % 1461;
  let n = (r4 % 365) + 365 * floorDiv(r4, 1460);
  const year =
    400 * floorDiv(jdn - GREGORIAN_EPOCH, 146097) +
    100 * century +
    4 * floorDiv(r100, 1461) +
    floorDiv(r4, 365) - floorDiv(r4, 1460) +
    1;
  n += 1;

  // Walk the month lengths to find month and day. (The original closed-form
  // month expression assumed every 4th year is leap, which is false in
  // non-leap century years — 1900, 2100 — and misplaced the 1st of Feb-Nov.)
  let month = 1;
  for (let m = 1; m <= 12; m += 1) {
    if (n <= daysInGregorianMonth(year, m)) {
      month = m;
      break;
    }
    n -= daysInGregorianMonth(year, m);
  }
  return [year, month, n];
}

/**
 * Ethiopian → Gregorian, both sides as (year, 1-based month, day).
 * @throws 'Invalid Ethiopian Date' | 'Unknown Era:'
 */
export function toGregorian(year: number, month: number, day: number, era: number = AMETE_MIHRET): Ymd {
  if (day < 0 || month < 0 || month > 13 || day > (month >= 1 && month <= 13 ? daysInEthiopicMonth(year, month) : 30)) {
    throw new Error("Invalid Ethiopian Date");
  }
  if (era !== AMETE_ALEM && era !== AMETE_MIHRET) {
    throw new Error("Unknown Era:");
  }
  return jdnToGregorian(ethiopicToJdn(year, month, day, era));
}

/**
 * Gregorian → Ethiopian, both sides as (year, 1-based month, day).
 * @throws 'Invalid Gregorian Date'
 */
export function toEthiopic(year: number, month: number, day: number): Ymd {
  if (day < 0 || month < 0 || month > 12 || day > (month >= 1 ? daysInGregorianMonth(year, month) : 31)) {
    throw new Error("Invalid Gregorian Date");
  }
  return jdnToEthiopic(gregorianToJdn(year, month, day));
}
