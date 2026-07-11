/** The date surface the formatter reads; `Zemen` satisfies it structurally. */
export interface Formattable {
  getFullYear(): number;
  getMonth(): number;
  getDate(): number;
  getMonthName(): string;
  getShortMonthName(): string;
  getDayOfWeek(): string;
  getGCWeekDay(): number;
}

/** Two-digit zero-pad of `value % 100`. */
const pad2 = (value: number): string => {
  const r = value % 100;
  return r >= 10 ? `${r}` : `0${r}`;
};

/** Format tokens, longest first — the scanner is greedy per position. */
const TOKENS: [token: string, render: (date: Formattable) => string][] = [
  ["YYYY", (z) => `${z.getFullYear()}`],
  ["YY", (z) => pad2(z.getFullYear())],
  ["Y", (z) => `${z.getFullYear()}`],
  ["MMMM", (z) => z.getMonthName()],
  ["MMM", (z) => z.getShortMonthName()],
  ["MM", (z) => pad2(z.getMonth() + 1)],
  ["M", (z) => `${z.getMonth() + 1}`],
  ["DDD", (z) => z.getDayOfWeek()],
  ["DD", (z) => pad2(z.getDate())],
  ["D", (z) => `${z.getDate()}`],
  ["d", (z) => z.getDayOfWeek()],
  ["e", (z) => `${z.getGCWeekDay()}`],
  ["E", () => "ዓ.ም"],
];

/** Render `pattern`, replacing tokens and copying every other character through. */
export function formatWithTokens(date: Formattable, pattern: string): string {
  let out = "";
  for (let i = 0; i < pattern.length; ) {
    const token = TOKENS.find(([t]) => pattern.startsWith(t, i));
    if (token) {
      out += token[1](date);
      i += token[0].length;
    } else {
      out += pattern[i]!;
      i += 1;
    }
  }
  return out;
}
