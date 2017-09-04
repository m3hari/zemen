function format(zemen, pattern) {
    if (!zemen) { return ""; }

    if (!pattern) {
        return defaultFormating(zemen);
    }
    else {
        return formatWithPattern(zemen, pattern);
    }
}

function defaultFormating(zemen) {
    let [y, m, d] = [zemen.getFullYear(), zemen.getMonth(), zemen.getDate()];
    return `${y}-${m + 1}-${d}`;
}

/**
 * 
 * @param {Zemen} zemen zemen date instance
 * @param {String} pattern formatting pattern
 * @returns{Strig} returns formated date
 */
function formatWithPattern(zemen, pattern) {
    let [y, m, d] = [zemen.getFullYear(), zemen.getMonth(), zemen.getDate()];
    let result = "";
    for (let i = 0; i < pattern.length; i++) {
        let ch = pattern[i];
        switch (ch) {
            case 'Y': {
                let year = zemen.getFullYear();
                let res = year;
                let str = pattern.slice(i);
                if (/^YY/.test(str)) {
                    res = zeroPaddedTwoDigityear(year);
                    i++;
                }
                if (/^YYYY/.test(str)) {
                    res = year;
                    i += 2;
                }
                result += res;
                break;
            }
            case 'M': {
                let month = (zemen.getMonth() + 1);
                let res = month;
                let str = pattern.slice(i);
                if (/^MM/.test(str)) {
                    res = zeroPaddMonth(month);
                    i++;
                }
                if (/^MMM/.test(str)) {
                    res = zemen.getShortMonthName();
                    i++;
                }
                if (/^MMMM/.test(str)) {
                    res = zemen.getMonthName();
                    i++;
                }
                result += res
                break;
            }
            case 'D': {
                let date = (zemen.getDate());
                let res = date;
                let str = pattern.slice(i);
                if (/^DD/.test(str)) {
                    res = zeroPaddDate(date);
                    i++;
                }
                if (/^DDD/.test(str)) {
                    res = zemen.getDayOfWeek();
                    i++;
                }
                result += res
                break;
            }
            case 'd': {
                result += (zemen.getDayOfWeek());
                break;
            }
            case 'e': {
                result += (zemen.getGCWeekDay());
                break;
            }
            case 'E': {
                result += 'ዓ.ም';
                break;
            }
            default: {
                result += ch;
                break;
            }
        }
    }
    return result;
}

function zeroPaddedTwoDigityear(year) {
    let remainder = year % 100;
    return remainder >= 10 ? remainder : '0' + remainder;
}
function zeroPaddMonth(month) {
    let remainder = month % 100;
    return remainder >= 10 ? remainder : '0' + remainder;
}
function zeroPaddDate(date) {
    let remainder = date % 100;
    return remainder >= 10 ? remainder : '0' + remainder;
}


module.exports.format = format;
