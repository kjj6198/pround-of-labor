import distribution from "../../data/salary-distribution.json";

export const salaryDistribution = distribution;
export const salaryBins = distribution.frequency.bins;
export type SalaryBin = (typeof salaryBins)[number];

type SalaryStanding = { kind: "estimated"; topPercent: number } | { kind: "over-limit" };

export function salaryStanding(annual: number): SalaryStanding | null {
  if (!Number.isFinite(annual) || annual < 0) return null;
  if (annual > 2_000_000) return { kind: "over-limit" };
  let lower = { annualTwd: 0, percentile: 0 };
  for (const upper of distribution.deciles) {
    if (annual <= upper.annualTwd) {
      const fraction = (annual - lower.annualTwd) / (upper.annualTwd - lower.annualTwd);
      const percentile = lower.percentile + fraction * (upper.percentile - lower.percentile);
      return { kind: "estimated", topPercent: Math.round(100 - percentile) };
    }
    lower = upper;
  }
  // Preserve the official D9 anchor; use only the platform's relative tail shape.
  return {
    kind: "estimated",
    topPercent: Math.round(
      ((100 - lower.percentile) * platformTopPercent(annual)) / platformTopPercent(lower.annualTwd),
    ),
  };
}

function platformTopPercent(annual: number): number {
  let topPercent = 0;
  for (const bin of salaryBins) {
    if (annual <= bin.lower) {
      topPercent += bin.percent;
    } else if (bin.upper !== null && annual < bin.upper) {
      topPercent += (bin.percent * (bin.upper - annual)) / (bin.upper - bin.lower);
    }
  }
  return topPercent;
}

export function findSalaryBin(annual: number): SalaryBin | null {
  if (!Number.isFinite(annual) || annual < 0) return null;
  return salaryBins.find((bin) => bin.upper === null || annual < bin.upper) ?? null;
}

export function salaryBinLabel(bin: SalaryBin) {
  return bin.upper === null
    ? `${salaryWan(bin.lower)} 萬元以上`
    : `${salaryWan(bin.lower)}–${salaryWan(bin.upper)} 萬元`;
}

export function salaryPeople(count: number) {
  return count < 10000
    ? `約 ${count.toLocaleString("zh-TW")} 人`
    : `約 ${(count / 10000).toLocaleString("zh-TW", { maximumFractionDigits: 1 })} 萬人`;
}
export const salaryBrackets = Array.from({ length: 10 }, (_, index) => ({
  group: index + 1,
  percentileLow: index * 10,
  percentileHigh: (index + 1) * 10,
  lower: distribution.deciles[index - 1]?.annualTwd ?? 0,
  upper: distribution.deciles[index]?.annualTwd ?? null,
}));

export type SalaryBracket = (typeof salaryBrackets)[number];
export type MoneyInput =
  | { kind: "empty" }
  | { kind: "invalid"; message: string }
  | { kind: "valid"; value: number };

export function parseSalaryInput(input: string): MoneyInput {
  const normalized = input.normalize("NFKC").trim();
  if (!normalized) return { kind: "empty" };
  if (!/^(?:\d+|\d{1,3}(?:,\d{3})+)$/.test(normalized)) {
    return { kind: "invalid", message: "請輸入 0 以上的整數金額，例如 45,000。" };
  }
  const value = Number(normalized.replaceAll(",", ""));
  if (!Number.isSafeInteger(value) || value > 1_000_000_000) {
    return { kind: "invalid", message: "金額上限為 10 億元，請確認單位是新台幣元。" };
  }
  return { kind: "valid", value };
}

export function findSalaryBracket(annual: number): SalaryBracket | null {
  if (!Number.isFinite(annual) || annual < 0) return null;
  return salaryBrackets.find((bracket) => bracket.upper === null || annual < bracket.upper) ?? null;
}

export function salaryWan(value: number) {
  return (value / 10_000).toLocaleString("zh-TW", { maximumFractionDigits: 4 });
}

export function bracketRange(bracket: SalaryBracket) {
  if (bracket.upper === null) return `${salaryWan(bracket.lower)} 萬元以上`;
  if (bracket.lower === 0) return `未滿 ${salaryWan(bracket.upper)} 萬元`;
  return `${salaryWan(bracket.lower)} 萬至未滿 ${salaryWan(bracket.upper)} 萬元`;
}
