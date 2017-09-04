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

    });



    describe('Mixed', () => {
        // (function () {
        //     it('Should Conver form  Zemen Object to Date  Object and vice versa', () => {
        //         let now = new Date();
        //         let ahun = new Zemen(now);
        //         expect(Zemen.toEC(now).toString()).toEqual(ahun.toString());
        //         // expect(Zemen.toGC(ahun).toDateString()).toEqual(now.toDateString());
        //     })
        // })();
    })


})