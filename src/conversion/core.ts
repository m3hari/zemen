// Based on the book Calendrical Calculations https://en.wikipedia.org/wiki/Calendrical_Calculations

/**
 * RD : Rata Die
 * Fixed date—elapsed days since the onset of Monday, January 1, 1 (Gregorian)
 * https://en.wikipedia.org/wiki/Rata_Die
 *  */

const GEREGORIAN_EPOCH = 1;

const ETHIOPIC_EPOCH = 2796; // Ethiopian year 1 E.E starts at 2796 rd

const COPTIC_EPOCH = 103605;

type RataDie = number;

import { SimpleDate } from "../@types/index";

// COPTIC
export function rdFromCoptic({ year, month, day }: SimpleDate): RataDie {
  return (
    COPTIC_EPOCH -
    1 +
    365 * (year - 1) +
    Math.floor(year / 4) +
    30 * (month - 1) +
    day
  );
}

export function copticFromRd(date: number): SimpleDate {
  const year = Math.floor((1 / 1461) * (4 * (date - COPTIC_EPOCH) + 1463));
  const month =
    Math.floor((1 / 30) * (date - rdFromCoptic({ year, month: 1, day: 1 }))) +
    1;

  const day = date + 1 - rdFromCoptic({ year, month, day: 1 });

  return { year, month, day };
}

// ETHIOPIC
export function rdFromEthiopic(SimpleDate: SimpleDate): RataDie {
  return ETHIOPIC_EPOCH + rdFromCoptic(SimpleDate) - COPTIC_EPOCH;
}

export function ethiopicFromRd(date: number): SimpleDate {
  return copticFromRd(date + COPTIC_EPOCH - ETHIOPIC_EPOCH);
}

// GEREGORIAN

function isGeregorianLeapYear(year: number) {
  return year % 4 === 0 && ![100, 200, 300].includes(year % 400);
}

export function rdFromGeregorian({ year, month, day }: SimpleDate): RataDie {
  const step1 =
    GEREGORIAN_EPOCH -
    1 +
    365 * (year - 1) +
    Math.floor((year - 1) / 4) -
    Math.floor((year - 1) / 100);

  const step2 =
    Math.floor((year - 1) / 400) + Math.floor((1 / 12) * (367 * month - 362));

  const step3 = (month < 2 ? 0 : isGeregorianLeapYear(year) ? -1 : -2) + day;

  return step1 + step2 + step3;
}

function gregorianNewYear(year: number) {
  return rdFromGeregorian({ year, month: 1, day: 1 });
}

function geregorianYear(date: number) {
  const d0 = date - GEREGORIAN_EPOCH;
  const d1 = d0 % 146097;
  const d2 = d1 % 36524;
  const d3 = d2 % 1461;

  const n400 = Math.floor(d0 / 146097);
  const n100 = Math.floor(d1 / 36524);
  const n4 = Math.floor(d2 / 1461);
  const n1 = Math.floor(d3 / 365);

  const year = 400 * n400 + 100 * n100 + 4 * n4 + n1;

  return n100 === 4 || n1 === 4 ? year : year + 1;
}

export function geregorianFromRd(date: number): SimpleDate {
  const year = geregorianYear(date);
  const priorDays = date - gregorianNewYear(year);
  const correction =
    date < rdFromGeregorian({ year, month: 3, day: 1 }) // year,march,1
      ? 0
      : isGeregorianLeapYear(year)
      ? 1
      : 2;
  const month = Math.floor((1 / 367) * (12 * (priorDays + correction) + 373));

  const day = date - rdFromGeregorian({ year, month, day: 1 }) + 1;

  return { year, month, day };
}

export function getDayOfWeekFromRD(rd: RataDie) {
  // R.D. 1 is a Monday, determining the day of the week amounts to taking the R.D. modulo 7
  // 0 is Sunday, 1 is Monday
  return rd % 7;
}
