import { SimpleDate } from "./@types";
import { gregorianToEthiopic } from "./conversion";
import { format } from "./formatting";
import { rdFromEthiopic, getDayOfWeekFromRD } from "./conversion/core";

export default class Zemen {
  private date: SimpleDate;
  private gregorian: Date;

  constructor(date?: Date | number | string) {
    this.gregorian = date ? new Date(date) : new Date(Date.now());

    if (Number.isNaN(this.gregorian.getTime())) {
      throw new Error(`Invalid Date "${date}"`);
    }
    this.date = gregorianToEthiopic({
      year: this.gregorian.getFullYear(),
      month: this.gregorian.getMonth() + 1, // SimpleDate is 1-index
      day: this.gregorian.getDate(),
    });
  }
  format(pattern: string) {
    return format(this.date, pattern);
  }
  toString() {
    return format(this.date, "YYYY-MM-DD");
  }
  toShortDateString() {
    return format(this.date, "dd DD MM YYYY");
  }
  toLongDateString() {
    return format(this.date, "dd MMMM DD YYYY e");
  }
  getYear() {
    return this.date.year;
  }
  getMonth() {
    return this.date.month;
  }
  getDay() {
    return this.date.day;
  }
  getTime() {
    return this.gregorian.getTime();
  }
  dayOfWeek() {
    return getDayOfWeekFromRD(rdFromEthiopic(this.date));
  }
  toGeregorian() {
    return this.gregorian;
  }
}
