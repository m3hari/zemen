import * as Converter from "./conversion";
import * as Formatter from "./formatting";
import { MONTHS_NAMES, SHORT_MONTHS_NAMES, WEEK_NAMES } from "./names";

export type ZemenDateValue = string | number | Date | Zemen;

/**
 * An Ethiopian calendar date.
 *
 * Behavior is a byte-exact port of zemen@0.0.7 — every branch, coercion and
 * error message below is contract, locked in by the golden-master suite
 * (test/golden.test.ts). Known oddities are deliberately preserved and
 * documented in POTENTIAL-IMPROVEMENTS.md.
 */
export class Zemen {
    year!: number;
    month!: number;
    date!: number;
    gc!: Date;

    /**
     * @param val A numeric year value if the second and third parameters are
     *            provided; a date string or a Date object if not.
     * @param month A zero-based numeric value for the month (0 for መስከረም, 12 for ጳጉሜን).
     * @param day A numeric value equal for the day of the month.
     */
    constructor(val?: ZemenDateValue, month?: number | string, day?: number | string) {
        if (arguments.length === 0) {
            const ahun = Zemen.toEC(new Date());
            [this.year, this.month, this.date] = [ahun.getFullYear(), ahun.getMonth(), ahun.getDate()];
            this.gc = Zemen.toGC(this.year, this.month, this.date);
        } else if (arguments.length === 1) {
            if (typeof val === 'string') {
                // Zemen.parse returns "" for falsy input, so `new Zemen("")`
                // fails here with a TypeError — preserved behavior.
                const result = Zemen.parse(val);
                [this.year, this.month, this.date] = [result.getFullYear(), result.getMonth(), result.getDate()];
                this.gc = Zemen.toGC(this.year, this.month, this.date);
            } else if (typeof val === 'object' && val instanceof Date) {
                // Preserved bug: 3-arg toEC expects a 0-based month and adds 1
                // itself, so this path runs one month ahead and throws for
                // December dates. See POTENTIAL-IMPROVEMENTS.md (Q1).
                const result = Zemen.toEC(val.getFullYear(), val.getMonth() + 1, val.getDate());
                [this.year, this.month, this.date] = [result.getFullYear(), result.getMonth(), result.getDate()];
                this.gc = Zemen.toGC(this.year, this.month, this.date);
            } else {
                throw new Error('Invalid Argument Exception');
            }
        } else if (arguments.length === 3) {
            this.year = parseInt(String(val), 10);
            this.month = parseInt(String(month), 10);
            this.date = parseInt(String(day), 10);
            this.gc = Zemen.toGC(this.year, this.month, this.date);
        } else {
            throw new Error('Invalid Argument Exception');
        }
    }

    /**
     * Converts an Ethiopian date to Gregorian and returns a Date instance
     * representing the Gregorian date.
     * @param val A numeric year value if the second and third parameters are
     *            provided; a date string or a Zemen instance if not.
     * @param month A zero-based numeric value for the month.
     * @param day A numeric value equal for the day of the month.
     */
    static toGC(val?: ZemenDateValue, month?: number, day?: number): Date {
        let gc: [number, number, number];
        if (arguments.length === 1) {
            if (typeof val === 'string') {
                const etDate = new Zemen(val);
                gc = Converter.toGC([etDate.getFullYear(), etDate.getMonth() + 1, etDate.getDate()]);
            } else if (typeof val === 'object' && val instanceof Zemen) {
                const [y, m, d] = [val.getFullYear(), val.getMonth() + 1, val.getDate()];
                gc = Converter.toGC([y, m, d]);
            } else {
                throw new Error('Invalid Argument Exception');
            }
        } else if (arguments.length === 3) {
            gc = Converter.toGC([val as number, (month as number) + 1, day as number]);
        } else {
            throw new Error('Invalid Argument Exception');
        }

        return new Date(gc[0], gc[1] - 1, gc[2]);
    }

    /**
     * Converts a Gregorian date to Ethiopian and returns a Zemen instance
     * representing the Ethiopian date.
     * @param val A numeric year value if the second and third parameters are
     *            provided; a date string or a Date object if not.
     * @param month A zero-based numeric value for the month (0 for January, 11 for December).
     * @param day A numeric value equal for the day of the month.
     */
    static toEC(val?: ZemenDateValue, month?: number, day?: number): Zemen {
        let ec: [number, number, number];
        if (arguments.length === 1) {
            if (typeof val === 'string') {
                const gcDate = new Date(val); // will use native date parsing
                ec = Converter.toEC([gcDate.getFullYear(), gcDate.getMonth() + 1, gcDate.getDate()]);
            } else if (typeof val === 'object' && val instanceof Date) {
                const [y, m, d] = [val.getFullYear(), val.getMonth() + 1, val.getDate()];
                ec = Converter.toEC([y, m, d]);
            } else {
                throw new Error('Invalid Argument Exception');
            }
        } else if (arguments.length === 3) {
            ec = Converter.toEC([val as number, (month as number) + 1, day as number]);
        } else {
            throw new Error('Invalid Argument Exception');
        }
        return new Zemen(ec[0], ec[1] - 1, ec[2]);
    }

    /**
     * Parse an Ethiopian date from a string.
     * @param dateString a date string to parse ("yyyy-m-d")
     * @param pattern a parsing pattern (not implemented — always throws)
     */
    static parse(dateString?: string | null, pattern?: string): Zemen {
        if (!dateString) {
            // Preserved quirk: falsy input yields "" rather than a Zemen or
            // an error (see POTENTIAL-IMPROVEMENTS.md, Q2).
            return "" as unknown as Zemen;
        }
        if (!pattern) {
            const result = dateString.split("-");
            if (result.length === 3) {
                const [y, m, d] = result as [string, string, string];
                return new Zemen(y, Number(m) - 1, d);
            }
            throw new Error(`ParsingError: Can't parse ${dateString}`);
        } else {
            throw new Error('Not implemented Exception :(');
        }
    }

    /** Returns a formatted string for this instance. */
    format(pattern?: string): string {
        return Formatter.format(this, pattern);
    }

    toString(): string {
        return `${this.year}-${this.month + 1}-${this.date}`;
    }

    getDate(): number {
        return this.date;
    }

    getMonth(): number {
        return this.month;
    }

    getFullYear(): number {
        return this.year;
    }

    getMonthName(): string {
        return MONTHS_NAMES[this.month];
    }

    getShortMonthName(): string {
        return SHORT_MONTHS_NAMES[this.month];
    }

    getDayOfWeek(): string {
        const weekDay = this.getGCWeekDay();
        return WEEK_NAMES[weekDay];
    }

    getGCWeekDay(): number {
        return this.gc.getDay();
    }
}
