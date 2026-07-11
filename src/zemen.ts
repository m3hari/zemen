import { toEthiopic, toGregorian } from "./conversion";
import { formatWithTokens } from "./format";
import { MONTH_NAMES, WEEKDAY_NAMES } from "./names";

/** Build the Gregorian Date backing an Ethiopian date (validates via toGregorian). */
function gregorianDateOf(year: number, month0: number, day: number): Date {
  const [gy, gm, gd] = toGregorian(year, month0 + 1, day);
  const date = new Date(gy, gm - 1, gd);
  date.setFullYear(gy); // new Date(y, …) would map years 0-99 into 1900-1999
  return date;
}

/**
 * An Ethiopian calendar date — the read API of JavaScript's `Date`,
 * translated to the Ethiopian calendar. Months are 0-based across the public
 * API (0 = መስከረም … 12 = ጳጉሜን), matching `Date#getMonth`. Instances are
 * immutable.
 */
export class Zemen {
  readonly #year: number;
  readonly #month: number;
  readonly #date: number;
  /** Gregorian equivalent; backs getDay()/toGregorian(). */
  readonly #gc: Date;

  constructor();
  constructor(val: string);
  constructor(year: number | string, month: number | string, day: number | string);
  constructor(val?: string | number, month?: number | string, day?: number | string) {
    if (arguments.length === 0) {
      const today = Zemen.fromGregorian(new Date());
      this.#year = today.#year;
      this.#month = today.#month;
      this.#date = today.#date;
    } else if (arguments.length === 3) {
      this.#year = parseInt(String(val), 10);
      this.#month = parseInt(String(month), 10);
      this.#date = parseInt(String(day), 10);
    } else if (arguments.length === 1 && typeof val === "string") {
      const parts = val ? val.split("-") : [];
      if (parts.length !== 3) {
        throw new Error(`ParsingError: Can't parse ${val}`);
      }
      this.#year = parseInt(parts[0]!, 10);
      this.#month = Number(parts[1]) - 1;
      this.#date = parseInt(parts[2]!, 10);
    } else {
      throw new Error("Invalid Argument Exception");
    }
    this.#gc = gregorianDateOf(this.#year, this.#month, this.#date);
  }

  /** Gregorian → Ethiopian: accepts a `Date`, a date string, or `(year, month, day)` with a 0-based month. */
  static fromGregorian(val: string | Date): Zemen;
  static fromGregorian(year: number, month: number, day: number): Zemen;
  static fromGregorian(val: string | Date | number, month?: number, day?: number): Zemen {
    let g: [number, number, number];
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

  /** This date in the Gregorian calendar, as a JS `Date`. */
  toGregorian(): Date {
    return new Date(this.#gc.getTime());
  }

  /** Format with `Y M D d e E` tokens; no pattern → `'y-m-d'`. */
  format(pattern?: string): string {
    return pattern ? formatWithTokens(this, pattern) : this.toString();
  }

  /** `'y-m-d'`, month shown 1-based, no zero padding. */
  toString(): string {
    return `${this.#year}-${this.#month + 1}-${this.#date}`;
  }

  getFullYear(): number {
    return this.#year;
  }

  getMonth(): number {
    return this.#month;
  }

  getDate(): number {
    return this.#date;
  }

  /** Weekday index, 0 = Sunday — same 7-day week as `Date#getDay`. */
  getDay(): number {
    return this.#gc.getDay();
  }

  getMonthName(): string {
    return MONTH_NAMES[this.#month]!;
  }

  getDayOfWeek(): string {
    return WEEKDAY_NAMES[this.getDay()]!;
  }
}

export default Zemen;
