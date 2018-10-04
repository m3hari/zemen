const Zemen = require('../zemen');
const Formatter = require('../lib/formating');

const zare = new Zemen('2009-12-27');
const day2 = new Zemen('2009-1-1');

describe('Zemen Formating', () => {
    describe('Default & ISO8601', () => {
        (function () {
            const expected = '2009-12-27';
            it(`Default Formating should format ${zare.toString()} as ${expected}`, () => {
                const actual = zare.format();
                expect(actual).toEqual(expected);
            });

        })();
        (function () {
            const expected = '2009-12-27';
            it(`ISO8601 Formating should format ${zare.toString()} as ${expected}`, () => {
                const actual = zare.format();
                expect(actual).toEqual(expected);
            });
        })();
    })

    describe('Year Patterns', () => {
        (function () {
            const pattern = 'Y';
            const expected = '2009';
            it(`${pattern} should format ${zare.toString()} as ${expected}`, () => {
                const actual = zare.format(pattern);
                expect(actual).toEqual(expected);
            });
        })();
        (function () {
            const pattern = 'YY';
            const expected = '09';
            it(`${pattern} should format ${zare.toString()} as ${expected}`, () => {
                const actual = zare.format(pattern);
                expect(actual).toEqual(expected);
            });
        })();
        (function () {
            const pattern = 'YYY';
            const expected = '092009';
            it(`${pattern} should format ${zare.toString()} as ${expected}`, () => {
                const actual = zare.format(pattern);
                expect(actual).toEqual(expected);
            });
        })();
        (function () {
            const pattern = 'YYYY';
            const expected = '2009';
            it(`${pattern} should format ${zare.toString()} as ${expected}`, () => {
                const actual = zare.format(pattern);
                expect(actual).toEqual(expected);
            });
        })();
        (function () {
            const pattern = 'YYYYY';
            const expected = '20092009';
            it(`${pattern} should format ${zare.toString()} as ${expected}`, () => {
                const actual = zare.format(pattern);
                expect(actual).toEqual(expected);
            });
        })();
        (function () {
            const pattern = 'YY';
            const expected = '09';
            it(`${pattern} should format ${day2.toString()} as ${expected}`, () => {
                const actual = day2.format(pattern);
                expect(actual).toEqual(expected);
            });
        })();
    });

    describe('Month Patterns', () => {
        (function () {
            const pattern = 'M';
            const expected = '12';
            it(`${pattern} should format ${zare.toString()} as ${expected}`, () => {
                const actual = zare.format(pattern);
                expect(actual).toEqual(expected);
            });
        })();
        (function () {
            const pattern = 'MM';
            const expected = '12';
            it(`${pattern} should format ${zare.toString()} as ${expected}`, () => {
                const actual = zare.format(pattern);
                expect(actual).toEqual(expected);
            });
        })();
        (function () {
            const pattern = 'MMM';
            const expected = 'ነሐሴ';
            it(`${pattern} should format ${zare.toString()} as ${expected}`, () => {
                const actual = zare.format(pattern);
                expect(actual).toEqual(expected);
            });
        })();
        (function () {
            const pattern = 'MMMM';
            const expected = 'ነሐሴ';
            it(`${pattern} should format ${zare.toString()} as ${expected}`, () => {
                const actual = zare.format(pattern);
                expect(actual).toEqual(expected);
            });
        })();
        (function () {
            const pattern = 'MMMMM';
            const expected = 'ነሐሴ12';
            it(`${pattern} should format ${zare.toString()} as ${expected}`, () => {
                const actual = zare.format(pattern);
                expect(actual).toEqual(expected);
            });
        })();
        (function () {
            const pattern = 'MM';
            const expected = '01';
            it(`${pattern} should format ${day2.toString()} as ${expected}`, () => {
                const actual = day2.format(pattern);
                expect(actual).toEqual(expected);
            });
        })();
    });

    describe('Day Patterns', () => {
        (function () {
            const pattern = 'D';
            const expected = '27';
            it(`${pattern} should format ${zare.toString()} as ${expected}`, () => {
                const actual = zare.format(pattern);
                expect(actual).toEqual(expected);
            });
        })();
        (function () {
            const pattern = 'DD';
            const expected = '27';
            it(`${pattern} should format ${zare.toString()} as ${expected}`, () => {
                const actual = zare.format(pattern);
                expect(actual).toEqual(expected);
            });
        })();
        (function () {
            const pattern = 'DDD';
            const expected = 'ቅዳሜ';
            it(`${pattern} should format ${zare.toString()} as ${expected}`, () => {
                const actual = zare.format(pattern);
                expect(actual).toEqual(expected);
            });
        })();
        (function () {
            const pattern = 'd';
            const expected = 'ቅዳሜ';
            it(`${pattern} should format ${zare.toString()} as ${expected}`, () => {
                const actual = zare.format(pattern);
                expect(actual).toEqual(expected);
            });
        })();
        (function () {
            const pattern = 'DDDDD';
            const expected = 'ቅዳሜ27';
            it(`${pattern} should format ${zare.toString()} as ${expected}`, () => {
                const actual = zare.format(pattern);
                expect(actual).toEqual(expected);
            });
        })();
        (function () {
            const pattern = 'DD';
            const expected = '01';
            it(`${pattern} should format ${day2.toString()} as ${expected}`, () => {
                const actual = day2.format(pattern);
                expect(actual).toEqual(expected);
            });
        })();
    });

    describe('Mixed', () => {
        (function () {
            const pattern = 'd MMM/DD/YYYY';
            const expected = 'ቅዳሜ ነሐሴ/27/2009';
            it(`${pattern} should format ${zare.toString()} as ${expected}`, () => {
                const actual = zare.format(pattern);
                expect(actual).toEqual(expected);
            });
        })();
        (function () {
            const pattern = 'd ፣ MMM DD ቀን YYYY E';
            const expected = 'ቅዳሜ ፣ ነሐሴ 27 ቀን 2009 ዓ.ም';
            it(`${pattern} should format ${zare.toString()} as ${expected}`, () => {
                const actual = zare.format(pattern);
                expect(actual).toEqual(expected);
            });
        })();
        (function () {
            const pattern = 'e';
            const expected = '6';
            it(`${pattern} should format ${zare.toString()} as ${expected}`, () => {
                const actual = zare.format(pattern);
                expect(actual).toEqual(expected);
            });
        })();
    })

    describe('Exceptions', () => {
        it(`Formatter should return empty string if date is  undefined `, () => {
            const actual = Formatter.format(null);
            expect(actual).toBe("");
        });
    })

});