const JD_EPOCH_OFFSET_AMETE_ALEM = -285019; //      ዓ/ዓ    
const JD_EPOCH_OFFSET_AMETE_MIHRET = 1723856; //    ዓ/ም

/**
 * TEST CASE 
 * Adopted from http://www.geez.org/Calendars/EthiopicCalendarTest.java
 *
 * */

/*
 ** ********************************************************************************
 **  The following section is here for testing purposes only and may be disabled or
 **  removed. Coptic test dates will be added at a later time.
 ** ********************************************************************************
 */

/* Test dates from:
 * "The Amharic Letters of Emperor Theodore of Ethiopia to Queen Victoria and
 * Her Special Envoy", David Appleyard, Girma Selasse Asfaw, Oxford University Press, 
 * June 1 1979, ISBN: 0856726605, Longwood Pr Ltd
 *  
 * Ethiopic      Gregorian     JDN
 * 20/02/1855    29/10/1862    2401443
 * 29/10/1857    05/07/1865    2402423
 * 22/05/1858    29/01/1866    2402631
 * 10/08/1858    17/04/1866    2402709
 * 28/04/1859    05/01/1867    2402972
 * 05/05/1860    13/01/1868    2403345
 * 
 * --------------------------------------------------
 * Theses dates are taken from Calendrica applet:
 *   http://emr.cs.iit.edu/home/reingold/calendar-book/Calendrica.html
 * 
 * Ethiopic      Gregorian       JDN
 * 07/05/5492    01/01/0000    1721060
 * 08/05/5493    01/01/0001    1721426
 * 06/13/5499    27/08/0007    1723855
 * 
 * 01/01/5500    28/08/0007    1723856
 * 02/01/5500    29/08/0007    1723857
 * 01/01/0001    27/08/0008    1724221
 * 01/01/0002    27/08/0009    1724586
 * 01/01/0003    27/08/0010    1724951
 * 01/01/0004    28/08/0011    1724537
 * 05/13/5500    26/08/0008    1724220
 * 05/13/0001    26/08/0009    1724585
 * 05/13/0002    26/08/0010    1724950
 * 05/13/0003    26/08/0011    1725315
 * 06/13/0003    27/08/0011    1725316  first ethiopian leap year
 * 05/13/0004    26/08/0012    1725561
 * 
 * 06/02/1575    13/10/1582    2299159
 * 07/02/1575    14/10/1582    2299160  Julian 04/10/1582
 * 08/02/1575    15/10/1582    2299161
 * 09/02/1575    16/10/1582    2299162
 * 
 * 23/04/1892    01/01/1900    2415021
 * 23/04/1997    01/01/2005    2453372
 * 05/13/2000    10/09/2008    2454720
 * 
 * 22/04/1893    31/12/1900    2415385
 * 22/04/1985    31/12/1992    2448988
 * 22/04/1989    31/12/1996    2450449
 * 22/04/1993    31/12/2000    2451910
 * 22/04/1997    31/12/2004    2453371
 * 22/04/2001    31/12/2008    2454382
 * 14/04/2993    31/12/3000    2817152
 * 07/04/3993    31/12/4000    3182395
 * 22/03/5993    31/12/6000    3912880
 */

const zemen = require('../src/ conversion');


const EthiopicDays = [
    // Dates from "Emporer Theodore..."
    // ETHIOPIC      //     GREGORIAN
    [2401443, 1855, 2, 20], //  [1862, 10, 29]
    [2402423, 1857, 10, 29], //  [1865,  7,  5]
    [2402631, 1858, 5, 22], //  [1866,  1, 29]
    [2402709, 1858, 8, 10], //  [1866,  4, 17]
    [2402972, 1859, 4, 28], //  [1867,  1,  5]
    [2403345, 1860, 5, 5], //  [1868,  1, 13]
    // Miscellaneous dates that test some corner cases:
    // [1721060, 5492, 5, 7, JD_EPOCH_OFFSET_AMETE_ALEM], //  [   0,  1,  1]
    [1721426, 5493, 5, 8, JD_EPOCH_OFFSET_AMETE_ALEM], //  [   1,  1,  1]
    [1723855, 5499, 13, 6, JD_EPOCH_OFFSET_AMETE_ALEM], //  [   7,  8, 27]

    [1723856, 5500, 1, 1, JD_EPOCH_OFFSET_AMETE_ALEM], //  [   7,  8, 28]
    [1723857, 5500, 1, 2, JD_EPOCH_OFFSET_AMETE_ALEM], //  [   7,  8, 29]
    [1724221, 1, 1, 1], //  [   8,  8, 27]
    [1724586, 2, 1, 1], //  [   9,  8, 27]
    [1724951, 3, 1, 1], //  [  10,  8, 27]
    [1724220, 5500, 13, 5, JD_EPOCH_OFFSET_AMETE_ALEM], //  [   8,  8, 26]
    [1724585, 1, 13, 5], //  [   9,  8, 26]
    [1724950, 2, 13, 5], //  [  10,  8, 26]
    [1725315, 3, 13, 5], //  [  11,  8, 26]
    [1725316, 3, 13, 6], //  [  11,  8, 27]  first Ethiopic leap year
    [2299159, 1575, 2, 6], //  [1582, 10, 13]
    [2299160, 1575, 2, 7], //  [1582, 10, 14]
    [2299161, 1575, 2, 8], //  [1582, 10, 15]
    [2299162, 1575, 2, 9], //  [1582, 10, 16]
    [2415021, 1892, 4, 23], //  [1900,  1,  1]
    [2453372, 1997, 4, 23], //  [2005,  1,  1]
    [2454720, 2000, 13, 5], //  [2008,  9, 10]
    [2415385, 1893, 4, 22], //  [1900, 12, 31]
    [2448988, 1985, 4, 22], //  [1992, 12, 31]
    [2450449, 1989, 4, 22], //  [1996, 12, 31]
    [2451910, 1993, 4, 22], //  [2000, 12, 31]
    [2453371, 1997, 4, 22], //  [2004, 12, 31]
    [2817152, 2993, 4, 14], //  [3000, 12, 31]
    [3182395, 3993, 4, 7], //  [4000, 12, 31]
    [3912880, 5993, 3, 22], //  [6000, 12, 31]
];


const GregorianDays = [
    // Dates from "Emporer Theodore..."
    // GREGORIAN      //     ETHIOPIC
    [2401443, 1862, 10, 29], //  [1855,  2, 20]
    [2402423, 1865, 7, 5], //  [1857, 10, 29]
    [2402631, 1866, 1, 29], //  [1858,  5, 22]
    [2402709, 1866, 4, 17], //  [1858,  8, 10]
    [2402972, 1867, 1, 5], //  [1859,  4, 28]
    [2403345, 1868, 1, 13], //  [1860,  5,  5]

    // Miscellaneous dates that test some corner cases:
    // [1721060, 0, 1, 1], //  [5492,  5,  7]
    [1721426, 1, 1, 1], //  [5493,  5,  8]
    [1723855, 7, 8, 27], //  [5499, 13,  6]

    [1723856, 7, 8, 28], //  [5500,  1,  1]
    [1723857, 7, 8, 29], //  [5500,  1,  2]
    [1724221, 8, 8, 27], //  [   1,  1,  1]
    [1724586, 9, 8, 27], //  [   2,  1,  1]
    [1724951, 10, 8, 27], //  [   3,  1,  1]
    [1724220, 8, 8, 26], //  [5500, 13,  5]
    [1724585, 9, 8, 26], //  [   1, 13,  5]
    [1724950, 10, 8, 26], //  [   2, 13,  5]
    [1725315, 11, 8, 26], //  [   3, 13,  5]
    [1725316, 11, 8, 27], //  [   3, 13,  6]  first Ethiopic leap year

    [2299159, 1582, 10, 13], //  [1575,  2,  6]
    [2299160, 1582, 10, 14], //  [1575,  2,  7]
    [2299161, 1582, 10, 15], //  [1575,  2,  8]
    [2299162, 1582, 10, 16], //  [1575,  2,  9]
    [2415021, 1900, 1, 1], //  [1892,  4, 23]
    [2453372, 2005, 1, 1], //  [1997,  4, 23]
    [2454720, 2008, 9, 10], //  [2000, 13,  5]
    [2415385, 1900, 12, 31], //  [1893,  4, 22]
    [2448988, 1992, 12, 31], //  [1985,  4, 22]
    [2450449, 1996, 12, 31], //  [1989,  4, 22]
    [2451910, 2000, 12, 31], //  [1993,  4, 22]
    [2453371, 2004, 12, 31], //  [1997,  4, 22]
    [2817152, 3000, 12, 31], //  [2993,  4, 14]
    [3182395, 4000, 12, 31], //  [3993,  4,  7]
    [3912880, 6000, 12, 31], //  [5993,  3, 22]
];


function testToGregorian(testCaseIndex) {
    const ecDate = EthiopicDays[testCaseIndex];
    const gcDate = GregorianDays[testCaseIndex];

    it(`should  convert ${ecDate} E.C to ${gcDate} G.C`, () => {
        let query;
        if (ecDate.length === 5) {
            query = [ecDate[1], ecDate[2], ecDate[3], ecDate[4]];
        } else {
            query = [ecDate[1], ecDate[2], ecDate[3], JD_EPOCH_OFFSET_AMETE_MIHRET];
        }
        const expected = [gcDate[1], gcDate[2], gcDate[3]];
        const actual = zemen.toGC(query);
        expect(actual).toEqual(expected);
    });
}

function testToEthiopian(testCaseIndex) {
    const gcDate = GregorianDays[testCaseIndex];
    const ecDate = EthiopicDays[testCaseIndex];

    it(`should  convert ${gcDate} G.C to ${ecDate} E.C`, () => {
        const query = [gcDate[1], gcDate[2], gcDate[3]];
        const expected = [ecDate[1], ecDate[2], ecDate[3]];
        const actual = zemen.toEC(query);
        expect(actual).toEqual(expected);
    });
}

describe('Zemen', () => {

    describe('Converting Gregorian date to Ethiopian date', () => {
        for (let i = 0; i < EthiopicDays.length; i += 1) {
            testToEthiopian(i);
        }
    });
    describe('Converting Ethiopian date to Gregorian date', () => {
        for (let i = 0; i < GregorianDays.length; i += 1) {
            testToGregorian(i);
        }
    });
    describe('Exceptions', () => {
        it('Converting Invalid Ethiopina date to Gregorian date Should throw Invalid Ethiopian Date Exception', () => {
            expect(() => { zemen.toGC([2009, 9, -1]); }).toThrow();
            expect(() => { zemen.toGC([2009, -2, 32]); }).toThrow();
            expect(() => { zemen.toGC([2009, 14, 1]); }).toThrow();
            expect(() => { zemen.toGC([2009, 9, 31]); }).toThrow();
        });
        it('Converting Invalid Gregorian date to Ethiopian date Should throw Invalid Gregorian Date Exception', () => {
            expect(() => { zemen.toEC([2009, 13, -1]); }).toThrow();
            expect(() => { zemen.toEC([2009, -2, 32]); }).toThrow();
            expect(() => { zemen.toEC([2009, 14, 15]); }).toThrow();
            expect(() => { zemen.toEC([2009, 9, 32]); }).toThrow();
        });
        it('toGC should throw error if invalid era passed', () => {
            expect(() => { zemen.toGC([2009, 10, 10, 25]); }).toThrow();
        });
        it('toGC should support AMETE_ALEM dates', () => {
            const res = zemen.toGC([-500, 10, 10]);
            expect(Array.isArray(res)).toBe(true);
        });
    });
});