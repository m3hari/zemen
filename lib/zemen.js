const Converter = require('./ conversion');
const Formatter = require('./formating');
const Util = require('./util');
/**
 * @class Zemen
 */
class Zemen {

    /**
     * @param {number} year A numeric value equal for the year.
     * @param { Number } month A zero-based numeric value for the month (0 for መስከረም, 12 for ጳጉሜን)
     * @param { Number } day A numeric value equal for the day of the month.
     */
    constructor(year, month, day) {
        this.year = year;
        this.month = month;
        this.date = day;
        this._gc = Zemen.toGC(this.year, this.month + 1, this.date);
    }

    /**
     * Converts a Ethiopian date to Gregorian and returns Date instance representing Gregorian Date.
     * @param { String | Number  } val - A numeric year value if the second and third parameters ar provided,
     *                                        It should be a date string if not  
     * @param { Number } month A zero-based numeric value for the month (0 for January, 11 for December)
     * @param { Number } day A numeric value equal for the day of the month.
     */
    static toGC(val, month, day) {
        let gc;
        if (arguments.length === 1) {
            if (typeof (val) === 'string') {
                let valArray = Zemen.parse(val);
                gc = Converter.toGC(valArray);
            } else {
                return new Error('Invalid Argument Exception');
            }
        } else if (arguments.length === 3) {
            gc = Converter.toGC([val, month, day]);
        } else {
            return new Error('Invalid Argument Exception');
        }
        if (gc) {
            return new Date(gc[0], gc[1] - 1, gc[2]);
        } else {
            return new Error('Invalid Argument Exception');
        }

    }

    /**
     * Converts a Gregorian date to Ethiopian and returns Zemen instance representing Ethiopian Date.
     * @param { String | Number | Date } val - A numeric year value if the second and third parameters ar provided,
     *                                         It should be  either a date string or a Date object if not  
     * @param { Number } month A zero-based numeric value for the month (0 for January, 11 for December)
     * @param { Number } day A numeric value equal for the day of the month.
     */
    static toEC(val, month, day) {
        let ec;
        if (arguments.length === 1) {
            if (typeof (val) === 'string') {
                let valArray = Zemen.parse(val);
                console.log('valArray:', valArray);
                ec = Converter.toEC(valArray);
            } else if (typeof val === 'object' && val instanceof Date) {
                let d = val.getDate();
                let m = val.getMonth() + 1;
                let y = val.getFullYear();
                ec = Converter.toEC([y, m, d]);
            } else {
                return new Error('Invalid Argument Exception');
            }
        } else if (arguments.length === 3) {
            ec = Converter.toEC([val, month, day]);
        } else {
            return new Error('Invalid Argument Exception');
        }
        if (ec) {
            return new Zemen(ec[0], ec[1] - 1, ec[2]);
        } else {
            return new Error('Invalid Argument Exception');
        }
    }


    /**
     * Parses a string containing a date, and returns an array [year,month,date].
     * @param {String} dateString A date string with delimiter
     */
    static parse(dateString) {
        let result = dateString.split("-");
        if (result.length === 3) {
            return result;
        } else {
            throw new Error(`Parsing Error: Can't parse ${dateString}`)
        }
    }

    toString() {
        return `${this.year}-${this.month + 1}-${this.date}`;
    }

    /**
     * returns formated string for zemen instance 
     */
    format(pattern) {
        return Formatter.format(this, pattern);
    }

    getDate() {
        return this.date;
    }
    getMonth() {
        return this.month;
    }
    getFullYear() {
        return this.year;
    }
    getMonthName() {
        return Util.MONTHS_NAMES[this.month];
    }
    getShortMonthName() {
        return Util.SHORT_MONTHS_NAMES[this.month];
    }
    getDayOfWeek() {
        let weekDay = this.getGCWeekDay();
        return Util.WEEK_NAMES[weekDay];
    }

    getGCWeekDay() {
        return this._gc.getDay();
    }

}

module.exports = Zemen;