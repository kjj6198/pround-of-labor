import snapshot from "../../data/clean.json";
import comparisons from "../../data/comparisons.json";
export const data = snapshot;
export const japanAging = comparisons.japanAging;
export const ink = "oklch(0.34 0.016 137.846)";
export const red = "oklch(0.546 0.154 32.4)";
export const gold = "oklch(0.588 0.099 81.518)";
export function format(value: number | null, digits = 0) {
  return value === null
    ? "未提供"
    : value.toLocaleString("zh-TW", {
        maximumFractionDigits: digits,
        minimumFractionDigits: digits,
      });
}
export function periodLabel(period: string) {
  const [year, month] = period.split("-");
  return month ? `${year} 年 ${Number(month)} 月` : `${year} 年`;
}
export function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Required published observation missing");
  return value;
}
export function sourcePage(id: string) {
  return required(data.sources.find((s) => s.id === id)).page;
}
export const latestWage = required(data.wages.filter((r) => r.frequency === "annual").at(-1));
export const latestMigrant = required(data.migrants.filter((r) => r.frequency === "annual").at(-1));
export const latestUnemployment = required(
  data.unemployment.filter((r) => r.frequency === "annual").at(-1),
);
export const latestHours = required(
  data.indicators.filter((r) => r.frequency === "annual" && r.hours.value !== null).at(-1),
);
export const currentMinimum = data.currentMinimum;
