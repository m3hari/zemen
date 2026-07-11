/**
 * @author መሃሪ <gmehari.edu@gmail.com>
 * @on APR 10 2017 , ነሃሴ 4 2009  ዓ/ም
 * Adopted from http://www.geez.org/Calendars/EthiopicCalendar.java
 */

const JD_EPOCH_OFFSET_AMETE_ALEM = -285019; //      ዓ/ዓ
const JD_EPOCH_OFFSET_AMETE_MIHRET = 1723856; //    ዓ/ም
const JD_EPOCH_OFFSET_GREGORIAN = 1721426;

const GREGORIAN_MONTH_DAYS = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

/** HELPERS * */
const quotient = (i: number, j: number): number => Math.floor(i / j);

const mod = (i: number, j: number): number => i % j;

const isGregorianLeap = (year: number): boolean =>
    (year % 4 === 0) && ((year % 100 !== 0) || (year % 400 === 0));

/** ERA HELPERS */
function assertKnownEra(era: number): void {
    if ((era !== JD_EPOCH_OFFSET_AMETE_ALEM) && (era !== JD_EPOCH_OFFSET_AMETE_MIHRET)) {
        // The original threw `new Error("Unknown Era:", era)`; Error ignores the
        // second argument, so the observable message is exactly "Unknown Era:".
        throw new Error("Unknown Era:");
    }
}

function guessEraFromJDN(jdn: number): number {
    return (jdn >= (JD_EPOCH_OFFSET_AMETE_MIHRET + 365)) ?
        JD_EPOCH_OFFSET_AMETE_MIHRET : JD_EPOCH_OFFSET_AMETE_ALEM;
}

/** CONVERSION * */
function ethiopicToJDN(day: number, month: number, year: number, era: number): number {
    return (era + 365) +
        365 * (year - 1) +
        quotient(year, 4) +
        30 * month +
        day - 31;
}

function jdnToEthiopic(jdn: number): [number, number, number] {
    const era = guessEraFromJDN(jdn);
    const r = mod((jdn - era), 1461);
    const n = mod(r, 365) + 365 * quotient(r, 1460);
    const year = 4 * quotient((jdn - era), 1461) +
        quotient(r, 365) -
        quotient(r, 1460);
    const month = quotient(n, 30) + 1;
    const day = mod(n, 30) + 1;

    return [year, month, day];
}

function gregorianToJDN(day: number, month: number, year: number): number {
    const s = quotient(year, 4) -
        quotient(year - 1, 4) -
        quotient(year, 100) +
        quotient(year - 1, 100) +
        quotient(year, 400) -
        quotient(year - 1, 400);

    const t = quotient(14 - month, 12);

    const n = 31 * t * (month - 1) +
        (1 - t) * (59 + s + 30 * (month - 3) + quotient((3 * month - 7), 5)) +
        day - 1;

    return JD_EPOCH_OFFSET_GREGORIAN +
        365 * (year - 1) +
        quotient(year - 1, 4) -
        quotient(year - 1, 100) +
        quotient(year - 1, 400) +
        n;
}

function jdnToGregorian(jdn: number): [number, number, number] {
    const r2000 = mod((jdn - JD_EPOCH_OFFSET_GREGORIAN), 730485);
    const r400 = mod((jdn - JD_EPOCH_OFFSET_GREGORIAN), 146097);
    const r100 = mod(r400, 36524);
    const r4 = mod(r100, 1461);
    let n = mod(r4, 365) + 365 * quotient(r4, 1460);
    const s = quotient(r4, 1095);
    const aprime = 400 * quotient((jdn - JD_EPOCH_OFFSET_GREGORIAN), 146097) +
        100 * quotient(r400, 36524) +
        4 * quotient(r100, 1461) +
        quotient(r4, 365) -
        quotient(r4, 1460) -
        quotient(r2000, 730484);
    const year = aprime + 1;
    const t = quotient((364 + s - n), 306);
    let month = t * (quotient(n, 31) + 1) + (1 - t) * (quotient((5 * (n - s) + 13), 153) + 1);
    n += 1 - quotient(r2000, 730484);
    let day = n;

    if ((r100 === 0) && (n === 0) && (r400 !== 0)) {
        month = 12;
        day = 31;
    } else {
        const monthDays = [...GREGORIAN_MONTH_DAYS];
        monthDays[2] = isGregorianLeap(year) ? 29 : 28;
        for (let i = 1; i <= 12; i += 1) {
            if (n <= monthDays[i]) {
                day = n;
                break;
            }
            n -= monthDays[i];
        }
    }
    return [year, month, day];
}

/** API * */

/** ethiopian [year, month(1-based), day, era?] to gregorian [year, month(1-based), day] */
export function toGC(dateArray: number[]): [number, number, number] {
    const [y, m, d] = dateArray as [number, number, number];
    const era = dateArray[3] || JD_EPOCH_OFFSET_AMETE_MIHRET;
    if (d < 0 || d > 30 || m < 0 || m > 13) {
        throw new Error('Invalid Ethiopian Date');
    }
    assertKnownEra(era);
    return jdnToGregorian(ethiopicToJDN(d, m, y, era));
}

/** gregorian [year, month(1-based), day] to ethiopian [year, month(1-based), day] */
export function toEC(dateArray: number[]): [number, number, number] {
    const [y, m, d] = dateArray as [number, number, number];
    if (d < 0 || d > 31 || m < 0 || m > 12) {
        throw new Error('Invalid Gregorian Date');
    }
    return jdnToEthiopic(gregorianToJDN(d, m, y));
}
