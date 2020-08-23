import { SimpleDate } from "../@types/index";
import { validateEthiopianDate } from "../util";
import { getDayOfWeekFromRD, rdFromEthiopic } from "../conversion/core";

// ISO 8601 Extended format `YYYY-MM-DDTHH:mm:ss.sssZ`
const DEFAULT_FORMAT = `YYYY-MM-DD`;

export const days = ["እሑድ", "ሰኞ", "ማክሰኞ", "ረቡዕ", "ሐሙስ", "ዓርብ", "ቅዳሜ"];
export const months = [
  "መስከረም",
  "ጥቅምት",
  "ህዳር",
  "ታህሣሥ",
  "ጥር",
  "የካቲት",
  "መጋቢት",
  "ሚያዝያ",
  "ግንቦት",
  "ሰኔ",
  "ሐምሌ",
  "ነሐሴ",
  "ጳጉሜን",
];
export const daysShort = days.map((day) => day.slice(0, 3));
export const monthsShort = months.map((month) => month.slice(0, 3));

const twoDigit = (num: number) => {
  const digits = num.toString().slice(-2);
  return digits.length === 2 ? digits : `0${digits}`;
};

export function format(date: SimpleDate, pattern = DEFAULT_FORMAT): string {
  validateEthiopianDate(date);

  const weekDay = getDayOfWeekFromRD(rdFromEthiopic(date));

  const patterns = [
    ["YYYY", date.year], // 2012
    ["YY", twoDigit(date.year)], // 12

    ["MMMM", months[date.month - 1]], // መስከረም
    ["MMM", monthsShort[date.month - 1]], // መስከ
    ["MM", twoDigit(date.month)], // 01
    ["M", date.month], // 1

    ["DD", twoDigit(date.day)], // 07
    ["D", date.day], // 7

    ["dd", days[weekDay]], // ማክሰኞ
    ["d", daysShort[weekDay]], // ማክ

    ["e", "ዓ.ም"],
  ];

  let result = pattern || DEFAULT_FORMAT;
  patterns.forEach(([key, val]) => {
    result = result.replace(new RegExp(key.toString()), val.toString());
  });

  return result;
}
