const Zemen = require('../zemen');
let zare = Zemen.toEC(new Date());

describe('Zemen Public API', () => {

    describe('Zemen Constructor', () => {
        (function () {
            it('Should Create Zemen Object of current timestamp', () => {
                let ahun = new Zemen();
                expect(ahun instanceof Zemen).toBe(true);
            });

        })();

        (function () {
            let expected = "2009-12-27";
            let zare = new Zemen(expected);
            it('Should Create Zemen Object from string', () => {
                let actual = zare.toString();
                expect(zare instanceof Zemen).toBe(true);
                expect(actual).toEqual(expected);
            })
        })();

        (function () {
            let gcDate = new Date(2017, 8, 2);
            let zare = new Zemen(gcDate);
            it('Should Create Zemen Object from Date Object', () => {
                expect(zare instanceof Zemen).toBe(true);
            })
        })();

        (function () {
            let expected = "2009-12-27";
            let zare = new Zemen(2009, 11, 27);
            it('Should Create Zemen Object from number', () => {
                expect(zare instanceof Zemen).toBe(true);
                expect(zare.toString()).toBe(expected);
            })
        })();

        (function () {
            it('Should throw Invalid Argument Exception for  argumets length greater than 3', () => {
                expect(() => { new Zemen(2009, 5, 15, 15); }).toThrow();
            });
            it('Should throw Invalid Argument Exception for invalid argument type', () => {
                expect(() => { new Zemen(null); }).toThrow();
                expect(() => { new Zemen(undefined); }).toThrow();
                expect(() => { new Zemen({}); }).toThrow();
                expect(() => { new Zemen(new Error('invalid')); }).toThrow();
                expect(() => { new Zemen(2009); }).toThrow();
            });

        })();
    })
    describe('Zemen.toEC', () => {
        (function () {
            it('toEC() Should Convert  gc date String to Ethiopian Date (Zemen Object)', () => {
                let today = "2017-09-02";
                let zare = "2009-12-27";
                expect(Zemen.toEC(today).toString()).toEqual(zare);
            })
        })();
        (function () {
            it('toEC() Should Convert  gc  Date Object to Ethiopian Date (Zemen Object)', () => {
                let today = new Date("2017-09-02");
                let zare = "2009-12-27";
                expect(Zemen.toEC(today).toString()).toEqual(zare);
            })
        })();
        (function () {
            it('toEC() Should Convert  gc date Number to Ethiopian Date (Zemen Object)', () => {
                let zare = "2009-12-27";
                expect(Zemen.toEC(2017, 8, 2).toString()).toEqual(zare);
            })
        })();

        (function () {
            it('toEC() Should throw Invalid Argument Exception for  argumets length greater than 3', () => {
                expect(() => { Zemen.toEC(2009, 5, 15, 15); }).toThrow();
            });
        })();

        (function () {
            it('toEC() Should throw Invalid Argument Exception for invalid argument type', () => {
                expect(() => { Zemen.toEC(null) }).toThrow();
                expect(() => { Zemen.toEC(undefined); }).toThrow();
                expect(() => { Zemen.toEC({}); }).toThrow();
            })
        })();

    });
    describe('Zemen.toGC', () => {
        (function () {
            it('toGC() Should Convert  et date String to Gregorian Date Object', () => {
                let zare = "2009-12-27";
                let today = "Sat Sep 02 2017";
                expect(Zemen.toGC(zare).toDateString()).toBe(today);
            })
        })();
        (function () {
            it('toGC() Should Convert  et  Zemen Object to Gregorian Date Object', () => {
                let zare = new Zemen("2009-12-27");
                let today = "Sat Sep 02 2017";
                expect(Zemen.toGC(zare).toDateString()).toBe(today);
            })
        })();
        (function () {
            it('toGC() Should Convert  et date Number to Gregorian Date Object', () => {
                let today = "Sat Sep 02 2017";
                expect(Zemen.toGC(2009, 11, 27).toDateString()).toBe(today);
            })
        })();
        (function () {
            it('toGC() Should throw Invalid Argument Exception for  argumets length greater than 3', () => {
                expect(() => { Zemen.toGC(2009, 5, 15, 15) }).toThrow();
            });
        })();

        (function () {
            it('toGC() Should throw Invalid Argument Exception for invalid argument type', () => {
                expect(() => { Zemen.toGC(null); }).toThrow();
                expect(() => { Zemen.toGC(undefined); }).toThrow();
                expect(() => { Zemen.toGC({}); }).toThrow();
            })
        })();
    })
    describe('Zemen parse', () => {
        (function () {
            it('should parse string with no pattern using the default pattern', () => {
                let date = Zemen.parse('2010-01-01');
                expect(date).toBeInstanceOf(Zemen);
                expect(date.getFullYear()).toBe(2010);
                expect(date.getMonth()).toBe(0);
                expect(date.getDate()).toBe(1);
            });
        })();
        (function () {
            it('should return empty string for undefined datestring', () => {
                let res1 = Zemen.parse();
                let res2 = Zemen.parse(null);
                let res3 = Zemen.parse(undefined);
                expect(res1).toBe("");
                expect(res2).toBe("");
                expect(res3).toBe("");
            })
        })();
        (function () {
            it('should throw ParseException for invalid pattern', () => {
                expect(() => { Zemen.parse('2010-01-01-0669--'); }).toThrow();
            })
        })();
        (function () {
            it('should throw Notimplemented Exception for Unsported pattern', () => {
                expect(() => { Zemen.parse('2010/01/01','DDDD'); }).toThrow();
            })
        })()
    });

})