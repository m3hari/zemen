/** Amharic weekday and month names. */

export const WEEKDAY_NAMES = ["እሑድ", "ሰኞ", "ማክሰኞ", "ረቡዕ", "ሓሙስ", "ዓርብ", "ቅዳሜ"];

export const MONTH_NAMES = [
  "መስከረም", "ጥቅምት", "ኅዳር", "ታኅሣሥ", "ጥር", "የካቲት", "መጋቢት",
  "ሚያዝያ", "ግንቦት", "ሰኔ", "ሐምሌ", "ነሐሴ", "ጳጉሜን",
];

/** Short month names are the first three characters of the full name. */
export const SHORT_MONTH_NAMES = MONTH_NAMES.map((name) => name.slice(0, 3));
