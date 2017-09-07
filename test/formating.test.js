const Zemen = require('../zemen');
const Formatter = require('../lib/formating');

let zare = new Zemen('2009-12-27');
let day2 = new Zemen('2009-1-1');

describe('Zemen Formating', () => {
    describe('Default & ISO8601', () => {
        (function () {
            let expected = '2009-12-27';
            it(`Default Formating should format ${zare.toString()} as ${expected}`, () => {
                let actual = zare.format();
                expect(actual).toEqual(expected);
            });

        })();
        (function () {
            let expected = '2009-12-27';
            it(`ISO8601 Formating should format ${zare.toString()} as ${expected}`, () => {
                let actual = zare.format();
                expect(actual).toEqual(expected);
            });
        })();
    })

    describe('Year Patterns', () => {
        (function () {
            let pattern = 'Y';
            let expected = '2009';
            it(`${pattern} should format ${zare.toString()} as ${expected}`, () => {
                let actual = zare.format(pattern);
                expect(actual).toEqual(expected);
            });
        })();
        (function () {
            let pattern = 'YY';
            let expected = '09';
            it(`${pattern} should format ${zare.toString()} as ${expected}`, () => {
                let actual = zare.format(pattern);
                expect(actual).toEqual(expected);
            });
        })();
        (function () {
            let pattern = 'YYY';
            let expected = '092009';
            it(`${pattern} should format ${zare.toString()} as ${expected}`, () => {
                let actual = zare.format(pattern);
                expect(actual).toEqual(expected);
            });
        })();
        (function () {
            let pattern = 'YYYY';
            let expected = '2009';
            it(`${pattern} should format ${zare.toString()} as ${expected}`, () => {
                let actual = zare.format(pattern);
                expect(actual).toEqual(expected);
            });
        })();
        (function () {
            let pattern = 'YYYYY';
            let expected = '20092009';
            it(`${pattern} should format ${zare.toString()} as ${expected}`, () => {
                let actual = zare.format(pattern);
                expect(actual).toEqual(expected);
            });
        })();
        (function () {
            let pattern = 'YY';
            let expected = '09';
            it(`${pattern} should format ${day2.toString()} as ${expected}`, () => {
                let actual = day2.format(pattern);
                expect(actual).toEqual(expected);
            });
        })();
    });

    describe('Month Patterns', () => {
        (function () {
            let pattern = 'M';
            let expected = '12';
            it(`${pattern} should format ${zare.toString()} as ${expected}`, () => {
                let actual = zare.format(pattern);
                expect(actual).toEqual(expected);
            });
        })();
        (function () {
            let pattern = 'MM';
            let expected = '12';
            it(`${pattern} should format ${zare.toString()} as ${expected}`, () => {
                let actual = zare.format(pattern);
                expect(actual).toEqual(expected);
            });
        })();
        (function () {
            let pattern = 'MMM';
            let expected = 'ነሐሴ';
            it(`${pattern} should format ${zare.toString()} as ${expected}`, () => {
                let actual = zare.format(pattern);
                expect(actual).toEqual(expected);
            });
        })();
        (function () {
            let pattern = 'MMMM';
            let expected = 'ነሐሴ';
            it(`${pattern} should format ${zare.toString()} as ${expected}`, () => {
                let actual = zare.format(pattern);
                expect(actual).toEqual(expected);
            });
        })();
        (function () {
            let pattern = 'MMMMM';
            let expected = 'ነሐሴ12';
            it(`${pattern} should format ${zare.toString()} as ${expected}`, () => {
                let actual = zare.format(pattern);
                expect(actual).toEqual(expected);
            });
        })();
        (function () {
            let pattern = 'MM';
            let expected = '01';
            it(`${pattern} should format ${day2.toString()} as ${expected}`, () => {
                let actual = day2.format(pattern);
                expect(actual).toEqual(expected);
            });
        })();
    });

    describe('Day Patterns', () => {
        (function () {
            let pattern = 'D';
            let expected = '27';
            it(`${pattern} should format ${zare.toString()} as ${expected}`, () => {
                let actual = zare.format(pattern);
                expect(actual).toEqual(expected);
            });
        })();
        (function () {
            let pattern = 'DD';
            let expected = '27';
            it(`${pattern} should format ${zare.toString()} as ${expected}`, () => {
                let actual = zare.format(pattern);
                expect(actual).toEqual(expected);
            });
        })();
        (function () {
            let pattern = 'DDD';
            let expected = 'ቅዳሜ';
            it(`${pattern} should format ${zare.toString()} as ${expected}`, () => {
                let actual = zare.format(pattern);
                expect(actual).toEqual(expected);
            });
        })();
        (function () {
            let pattern = 'd';
            let expected = 'ቅዳሜ';
            it(`${pattern} should format ${zare.toString()} as ${expected}`, () => {
                let actual = zare.format(pattern);
                expect(actual).toEqual(expected);
            });
        })();
        (function () {
            let pattern = 'DDDDD';
            let expected = 'ቅዳሜ27';
            it(`${pattern} should format ${zare.toString()} as ${expected}`, () => {
                let actual = zare.format(pattern);
                expect(actual).toEqual(expected);
            });
        })();
        (function () {
            let pattern = 'DD';
            let expected = '01';
            it(`${pattern} should format ${day2.toString()} as ${expected}`, () => {
                let actual = day2.format(pattern);
                expect(actual).toEqual(expected);
            });
        })();
    });

    describe('Mixed', () => {
        (function () {
            let pattern = 'd MMM/DD/YYYY';
            let expected = 'ቅዳሜ ነሐሴ/27/2009';
            it(`${pattern} should format ${zare.toString()} as ${expected}`, () => {
                let actual = zare.format(pattern);
                expect(actual).toEqual(expected);
            });
        })();
        (function () {
            let pattern = 'd ፣ MMM DD ቀን YYYY E';
            let expected = 'ቅዳሜ ፣ ነሐሴ 27 ቀን 2009 ዓ.ም';
            it(`${pattern} should format ${zare.toString()} as ${expected}`, () => {
                let actual = zare.format(pattern);
                expect(actual).toEqual(expected);
            });
        })();
        (function () {
            let pattern = 'e';
            let expected = '6';
            it(`${pattern} should format ${zare.toString()} as ${expected}`, () => {
                let actual = zare.format(pattern);
                expect(actual).toEqual(expected);
            });
        })();
    })

    describe('Exceptions', () => {
        it(`Formatter should return empty string if date is  undefined `, () => {
            let actual = Formatter.format(null);
            expect(actual).toBe("");
        });
    })

});