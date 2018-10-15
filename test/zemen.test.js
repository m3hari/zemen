/* eslint no-new:0 */

const Zemen = require("../zemen");

describe("Zemen Public API", () => {
  describe("Zemen Constructor", () => {
    (() => {
      it("Should Create Zemen Object of current timestamp", () => {
        const ahun = new Zemen();
        expect(ahun instanceof Zemen).toBe(true);
      });
    })();

    (() => {
      const expected = "2009-12-27";
      const zare = new Zemen(expected);
      it("Should Create Zemen Object from string", () => {
        const actual = zare.toString();
        expect(zare instanceof Zemen).toBe(true);
        expect(actual).toEqual(expected);
      });
    })();

    (() => {
      const gcDate = new Date(2017, 8, 2);
      const zare = new Zemen(gcDate);
      it("Should Create Zemen Object from Date Object", () => {
        expect(zare instanceof Zemen).toBe(true);
      });
    })();

    (() => {
      const expected = "2009-12-27";
      const zare = new Zemen(2009, 11, 27);
      it("Should Create Zemen Object from number", () => {
        expect(zare instanceof Zemen).toBe(true);
        expect(zare.toString()).toBe(expected);
      });
    })();

    (() => {
      it("Should throw Invalid Argument Exception for  argumets length greater than 3", () => {
        expect(() => {
          new Zemen(2009, 5, 15, 15);
        }).toThrow();
      });
      it("Should throw Invalid Argument Exception for invalid argument type", () => {
        expect(() => {
          new Zemen(null);
        }).toThrow();
        expect(() => {
          new Zemen(undefined);
        }).toThrow();
        expect(() => {
          new Zemen({});
        }).toThrow();
        expect(() => {
          new Zemen(new Error("invalid"));
        }).toThrow();
        expect(() => {
          new Zemen(2009);
        }).toThrow();
      });
    })();
  });
  describe("Zemen.toEC", () => {
    (() => {
      it("toEC() Should Convert  gc date String to Ethiopian Date (Zemen Object)", () => {
        const today = "2017-09-02";
        const zare = "2009-12-27";
        expect(Zemen.toEC(today).toString()).toEqual(zare);
      });
    })();
    (() => {
      it("toEC() Should Convert  gc  Date Object to Ethiopian Date (Zemen Object)", () => {
        const today = new Date("2017-09-02");
        const zare = "2009-12-27";
        expect(Zemen.toEC(today).toString()).toEqual(zare);
      });
    })();
    (() => {
      it("toEC() Should Convert  gc date Number to Ethiopian Date (Zemen Object)", () => {
        const zare = "2009-12-27";
        expect(Zemen.toEC(2017, 8, 2).toString()).toEqual(zare);
      });
    })();

    (() => {
      it("toEC() Should throw Invalid Argument Exception for  argumets length greater than 3", () => {
        expect(() => {
          Zemen.toEC(2009, 5, 15, 15);
        }).toThrow();
      });
    })();

    (() => {
      it("toEC() Should throw Invalid Argument Exception for invalid argument type", () => {
        expect(() => {
          Zemen.toEC(null);
        }).toThrow();
        expect(() => {
          Zemen.toEC(undefined);
        }).toThrow();
        expect(() => {
          Zemen.toEC({});
        }).toThrow();
      });
    })();
  });
  describe("Zemen.toGC", () => {
    (() => {
      it("toGC() Should Convert  et date String to Gregorian Date Object", () => {
        const zare = "2009-12-27";
        const today = "Sat Sep 02 2017";
        expect(Zemen.toGC(zare).toDateString()).toBe(today);
      });
    })();
    (() => {
      it("toGC() Should Convert  et  Zemen Object to Gregorian Date Object", () => {
        const zare = new Zemen("2009-12-27");
        const today = "Sat Sep 02 2017";
        expect(Zemen.toGC(zare).toDateString()).toBe(today);
      });
    })();
    (() => {
      it("toGC() Should Convert  et date Number to Gregorian Date Object", () => {
        const today = "Sat Sep 02 2017";
        expect(Zemen.toGC(2009, 11, 27).toDateString()).toBe(today);
      });
    })();
    (() => {
      it("toGC() Should throw Invalid Argument Exception for  argumets length greater than 3", () => {
        expect(() => {
          Zemen.toGC(2009, 5, 15, 15);
        }).toThrow();
      });
    })();

    (() => {
      it("toGC() Should throw Invalid Argument Exception for invalid argument type", () => {
        expect(() => {
          Zemen.toGC(null);
        }).toThrow();
        expect(() => {
          Zemen.toGC(undefined);
        }).toThrow();
        expect(() => {
          Zemen.toGC({});
        }).toThrow();
      });
    })();
  });
  describe("Zemen parse", () => {
    (() => {
      it("should parse string with no pattern using the default pattern", () => {
        const date = Zemen.parse("2010-01-01");
        expect(date).toBeInstanceOf(Zemen);
        expect(date.getFullYear()).toBe(2010);
        expect(date.getMonth()).toBe(0);
        expect(date.getDate()).toBe(1);
      });
    })();
    (() => {
      it("should return empty string for undefined datestring", () => {
        const res1 = Zemen.parse();
        const res2 = Zemen.parse(null);
        const res3 = Zemen.parse(undefined);
        expect(res1).toBe("");
        expect(res2).toBe("");
        expect(res3).toBe("");
      });
    })();
    (() => {
      it("should throw ParseException for invalid pattern", () => {
        expect(() => {
          Zemen.parse("2010-01-01-0669--");
        }).toThrow();
      });
    })();
    (() => {
      it("should throw Notimplemented Exception for Unsported pattern", () => {
        expect(() => {
          Zemen.parse("2010/01/01", "DDDD");
        }).toThrow();
      });
    })();
  });
});
