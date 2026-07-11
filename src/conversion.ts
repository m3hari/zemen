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

/** Days per Gregorian month, 1-indexed; February is patched per leap year. */
const MONTH_DAYS = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

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

function jdnToGregorian(jdn: number): Ymd {
  const r2000 = (jdn - GREGORIAN_EPOCH) % 730485;
  const r400 = (jdn - GREGORIAN_EPOCH) % 146097;
  const r100 = r400 % 36524;
  const r4 = r100 % 1461;
  let n = (r4 % 365) + 365 * floorDiv(r4, 1460);
  const s = floorDiv(r4, 1095);
  const year =
    400 * floorDiv(jdn - GREGORIAN_EPOCH, 146097) +
    100 * floorDiv(r400, 36524) +
    4 * floorDiv(r100, 1461) +
    floorDiv(r4, 365) - floorDiv(r4, 1460) - floorDiv(r2000, 730484) +
    1;
  const t = floorDiv(364 + s - n, 306);
  const month = t * (floorDiv(n, 31) + 1) + (1 - t) * (floorDiv(5 * (n - s) + 13, 153) + 1);
  n += 1 - floorDiv(r2000, 730484);

  if (r100 === 0 && n === 0 && r400 !== 0) {
    return [year, 12, 31];
  }
  let day = n;
  const monthDays = [...MONTH_DAYS];
  monthDays[2] = isGregorianLeap(year) ? 29 : 28;
  for (let m = 1; m <= 12; m += 1) {
    if (n <= monthDays[m]!) {
      day = n;
      break;
    }
    n -= monthDays[m]!;
  }
  return [year, month, day];
}

/**
 * Ethiopian → Gregorian, both sides as (year, 1-based month, day).
 * @throws 'Invalid Ethiopian Date' | 'Unknown Era:'
 */
export function toGregorian(year: number, month: number, day: number, era: number = AMETE_MIHRET): Ymd {
  if (day < 0 || day > 30 || month < 0 || month > 13) {
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
  if (day < 0 || day > 31 || month < 0 || month > 12) {
    throw new Error("Invalid Gregorian Date");
  }
  return jdnToEthiopic(gregorianToJdn(year, month, day));
}
