import { toEthiopic, toGregorian, type Ymd } from "./conversion";
import { formatWithTokens } from "./format";
import { MONTH_NAMES, SHORT_MONTH_NAMES, WEEKDAY_NAMES } from "./names";

export type ZemenDateValue = string | number | Date | Zemen;

/**
 * An Ethiopian calendar date. Months are 0-based across the public API
 * (0 = መስከረም … 12 = ጳጉሜን), matching `Date#getMonth`.
 */
export class Zemen {
  readonly year: number;
  readonly month: number;
  readonly date: number;
  /** Gregorian equivalent; backs the weekday queries. */
  readonly gc: Date;

  constructor(val?: ZemenDateValue, month?: number | string, day?: number | string) {
    if (arguments.length === 0) {
      const today = Zemen.toEC(new Date());
      this.year = today.year;
      this.month = today.month;
      this.date = today.date;
    } else if (arguments.length === 3) {
      this.year = parseInt(String(val), 10);
      this.month = parseInt(String(month), 10);
      this.date = parseInt(String(day), 10);
    } else if (arguments.length === 1 && typeof val === "string") {
      const parsed = Zemen.parse(val);
      this.year = parsed.getFullYear();
      this.month = parsed.getMonth();
      this.date = parsed.getDate();
    } else if (arguments.length === 1 && val instanceof Date) {
      const ec = Zemen.toEC(val);
      this.year = ec.year;
      this.month = ec.month;
      this.date = ec.date;
    } else {
      throw new Error("Invalid Argument Exception");
    }
    this.gc = Zemen.toGC(this.year, this.month, this.date);
  }

  /** Ethiopian → Gregorian: accepts `('y-m-d')`, `(zemen)`, or `(year, month, day)`. */
  static toGC(val: ZemenDateValue, month?: number, day?: number): Date {
    let g: Ymd;
    if (arguments.length === 3) {
      g = toGregorian(val as number, (month as number) + 1, day as number);
    } else if (arguments.length === 1 && typeof val === "string") {
      const et = new Zemen(val);
      g = toGregorian(et.year, et.month + 1, et.date);
    } else if (arguments.length === 1 && val instanceof Zemen) {
      g = toGregorian(val.year, val.month + 1, val.date);
    } else {
      throw new Error("Invalid Argument Exception");
    }
    const date = new Date(g[0], g[1] - 1, g[2]);
    date.setFullYear(g[0]); // new Date(y, …) would map years 0-99 into 1900-1999
    return date;
  }

  /** Gregorian → Ethiopian: accepts `(dateString)`, `(date)`, or `(year, month, day)`. */
  static toEC(val: ZemenDateValue, month?: number, day?: number): Zemen {
    let g: Ymd;
    if (arguments.length === 3) {
      g = [val as number, (month as number) + 1, day as number];
    } else if (arguments.length === 1 && typeof val === "string") {
      // Native parsing treats date-only ISO strings as UTC midnight, which
      // shifts the day in negative-UTC timezones; read them as plain calendar
      // dates instead (and let validation see the raw components).
      const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(val);
      const gc = iso ? null : new Date(val);
      g = iso
        ? [+iso[1]!, +iso[2]!, +iso[3]!]
        : [gc!.getFullYear(), gc!.getMonth() + 1, gc!.getDate()];
    } else if (arguments.length === 1 && val instanceof Date) {
      g = [val.getFullYear(), val.getMonth() + 1, val.getDate()];
    } else {
      throw new Error("Invalid Argument Exception");
    }
    // EC 1-1-1 ዓ/ም is Aug 27, 8 AD. Earlier dates belong to the ዓመተ ዓለም era,
    // which this API does not expose — reject rather than mislabel the year.
    if (g[0] < 8 || (g[0] === 8 && (g[1] < 8 || (g[1] === 8 && g[2] < 27)))) {
      throw new Error("Invalid Gregorian Date");
    }
    const e = toEthiopic(g[0], g[1], g[2]);
    return new Zemen(e[0], e[1] - 1, e[2]);
  }

  /** Parse an Ethiopian `'y-m-d'` string. */
  static parse(dateString?: string | null, pattern?: string): Zemen {
    if (!dateString) {
      throw new Error(`ParsingError: Can't parse ${dateString}`);
    }
    if (pattern) {
      throw new Error("Not implemented Exception :(");
    }
    const parts = dateString.split("-");
    if (parts.length !== 3) {
      throw new Error(`ParsingError: Can't parse ${dateString}`);
    }
    const [y, m, d] = parts as [string, string, string];
    return new Zemen(y, Number(m) - 1, d);
  }

  /** Format with `Y M D d e E` tokens; no pattern → `'y-m-d'`. */
  format(pattern?: string): string {
    return pattern ? formatWithTokens(this, pattern) : this.toString();
  }

  /** `'y-m-d'`, month shown 1-based, no zero padding. */
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
    return MONTH_NAMES[this.month]!;
  }

  getShortMonthName(): string {
    return SHORT_MONTH_NAMES[this.month]!;
  }

  getDayOfWeek(): string {
    return WEEKDAY_NAMES[this.getGCWeekDay()]!;
  }

  /** Gregorian weekday index, 0 = Sunday. */
  getGCWeekDay(): number {
    return this.gc.getDay();
  }
}

export default Zemen;
