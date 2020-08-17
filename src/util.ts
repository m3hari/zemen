import { SimpleDate } from "./@types";

const MONTH_MAX = 13;
const DAY_MAX = 30;

export function validateEthiopianDate(date: SimpleDate) {
  const invalidDate =
    !date ||
    typeof date !== "object" ||
    Object.entries(date).some(
      ([key, val]) =>
        !["year", "month", "day"].includes(key) ||
        typeof val !== "number" ||
        val < 1
    );

  if (invalidDate || date.day > DAY_MAX || date.month > MONTH_MAX) {
    throw new Error("Invalid Ethiopian Date");
  }
}
