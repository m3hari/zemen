const GEREGORIAN_EPOCH = 1;

const ETHIOPIC_EPOCH = 2796; // Ethiopian yeah 1 E.E starts at 2796 rd

const COPTIC_EPOCH = 103605;

export type Ken = {
  year: number;
  month: number;
  day: number;
};

// COPTIC
export function fixedFromCoptic({ year, month, day }: Ken) {
  return (
    COPTIC_EPOCH -
    1 +
    365 * (year - 1) +
    Math.floor(year / 4) +
    30 * (month - 1) +
    day
  );
}

export function copticFromFixed(date: number): Ken {
  const year = Math.floor((1 / 1461) * (4 * (date - COPTIC_EPOCH) + 1463));
  const month =
    Math.floor(
      (1 / 30) * (date - fixedFromCoptic({ year, month: 1, day: 1 }))
    ) + 1;

  const day = date + 1 - fixedFromCoptic({ year, month, day: 1 });

  return { year, month, day };
}

// ETHIOPIC
export function fixedFromEthiopic(ken: Ken) {
  return ETHIOPIC_EPOCH + fixedFromCoptic(ken) - COPTIC_EPOCH;
}

export function ethiopicFromFixed(date: number) {
  return copticFromFixed(date + COPTIC_EPOCH - ETHIOPIC_EPOCH);
}

// GEREGORIAN

function isGeregorianLeapYear(year: number) {
  return year % 4 === 0 && ![100, 200, 300].includes(year % 400);
}

export function fixedFromGeregorian({ year, month, day }: Ken) {
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
  return fixedFromGeregorian({ year, month: 1, day: 1 });
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

export function geregorianFromFixed(date: number) {
  const year = geregorianYear(date);
  const priorDays = date - gregorianNewYear(year);
  const correction =
    date < fixedFromGeregorian({ year, month: 3, day: 1 }) // year,march,1
      ? 0
      : isGeregorianLeapYear(year)
      ? 1
      : 2;
  const month = Math.floor((1 / 367) * (12 * (priorDays + correction) + 373));

  const day = date - fixedFromGeregorian({ year, month, day: 1 }) + 1;

  return { year, month, day };
}
