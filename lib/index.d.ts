// TypeScript Version: 3.1.1

type ZemenDateValue = string | number | Date | Zemen;

declare class Zemen {
    constructor(val?: ZemenDateValue, month?: number, day?: number);

    static toGC(val: ZemenDateValue, month?: number, day?: number): Date;

    static toEC(val: ZemenDateValue, month?: number, day?: number): Zemen;
}

export = Zemen;
