import type { Zemen } from "./zemen";

/**
 * Zero-pad to two digits. Single port of the original's three identical
 * helpers (zeroPaddedTwoDigityear / zeroPaddMonth / zeroPaddDate), keeping
 * the exact `% 100` + concat semantics so output strings are byte-identical.
 */
function pad2(value: number): string {
    const remainder = value % 100;
    return remainder >= 10 ? `${remainder}` : `0${remainder}`;
}

function defaultFormat(zemen: Zemen): string {
    const [y, m, d] = [zemen.getFullYear(), zemen.getMonth(), zemen.getDate()];
    return `${y}-${m + 1}-${d}`;
}

/**
 * @param zemen zemen date instance
 * @param pattern formatting pattern
 * @returns formatted date
 */
function formatWithPattern(zemen: Zemen, pattern: string): string {
    let result = "";
    for (let i = 0; i < pattern.length; i += 1) {
        const ch = pattern[i];
        switch (ch) {
            case 'Y': {
                const year = zemen.getFullYear();
                let res = `${year}`;
                const str = pattern.slice(i);
                if (/^YY/.test(str)) {
                    res = pad2(year);
                    i += 1;
                }
                if (/^YYYY/.test(str)) {
                    res = `${year}`;
                    i += 2;
                }
                result += res;
                break;
            }
            case 'M': {
                const month = (zemen.getMonth() + 1);
                let res = `${month}`;
                const str = pattern.slice(i);
                if (/^MM/.test(str)) {
                    res = pad2(month);
                    i += 1;
                }
                if (/^MMM/.test(str)) {
                    res = zemen.getShortMonthName();
                    i += 1;
                }
                if (/^MMMM/.test(str)) {
                    res = zemen.getMonthName();
                    i += 1;
                }
                result += res;
                break;
            }
            case 'D': {
                const date = zemen.getDate();
                let res = `${date}`;
                const str = pattern.slice(i);
                if (/^DD/.test(str)) {
                    res = pad2(date);
                    i += 1;
                }
                if (/^DDD/.test(str)) {
                    res = zemen.getDayOfWeek();
                    i += 1;
                }
                result += res;
                break;
            }
            case 'd': {
                result += zemen.getDayOfWeek();
                break;
            }
            case 'e': {
                result += zemen.getGCWeekDay();
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

export function format(zemen: Zemen | null | undefined, pattern?: string): string {
    if (!zemen) { return ""; }

    if (!pattern) {
        return defaultFormat(zemen);
    }

    return formatWithPattern(zemen, pattern);
}
