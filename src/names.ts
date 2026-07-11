/** Amharic weekday and month names. */

export const WEEKDAY_NAMES: readonly string[] = ["እሑድ", "ሰኞ", "ማክሰኞ", "ረቡዕ", "ሓሙስ", "ዓርብ", "ቅዳሜ"];

export const MONTH_NAMES: readonly string[] = [
  "መስከረም", "ጥቅምት", "ኅዳር", "ታኅሣሥ", "ጥር", "የካቲት", "መጋቢት",
  "ሚያዝያ", "ግንቦት", "ሰኔ", "ሐምሌ", "ነሐሴ", "ጳጉሜን",
];

/** Short month names are the first three characters of the full name. */
export const SHORT_MONTH_NAMES: readonly string[] = MONTH_NAMES.map((name) => name.slice(0, 3));
