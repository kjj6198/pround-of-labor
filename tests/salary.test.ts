import { describe, expect, it } from "vite-plus/test";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import {
  findSalaryBracket,
  parseSalaryInput,
  salaryDistribution,
  bracketRange,
  findSalaryBin,
  salaryBins,
  salaryStanding,
} from "../src/lib/salary";

describe("2024 official annual salary distribution", () => {
  it("estimates top percentages through 2 million and stops only above the boundary", () => {
    expect(salaryStanding(0)).toEqual({ kind: "estimated", topPercent: 100 });
    expect(salaryStanding(600000)).toEqual({ kind: "estimated", topPercent: 43 });
    expect(salaryStanding(630000)).toEqual({ kind: "estimated", topPercent: 40 });
    expect(salaryStanding(1999999)).toEqual({ kind: "estimated", topPercent: 3 });
    expect(salaryStanding(2000000)).toEqual({ kind: "estimated", topPercent: 3 });
    expect(salaryStanding(150000 * 12 + 200000)).toEqual({ kind: "estimated", topPercent: 3 });
    for (const value of [2000001, 99999999, 150000 * 12 + 200001]) {
      expect(salaryStanding(value)).toEqual({ kind: "over-limit" });
    }
    let previous = 100;
    for (let annual = 0; annual <= 2000000; annual += 1000) {
      const result = salaryStanding(annual);
      expect(result?.kind).toBe("estimated");
      if (result?.kind === "estimated") {
        expect(result.topPercent).toBeLessThanOrEqual(previous);
        previous = result.topPercent;
      }
    }
    for (const value of [-1, NaN, Infinity]) expect(salaryStanding(value)).toBeNull();
  });

  it("honors every Excel decile and interpolates between those anchors", () => {
    for (const point of salaryDistribution.deciles) {
      expect(salaryStanding(point.annualTwd)).toEqual({
        kind: "estimated",
        topPercent: 100 - point.percentile,
      });
    }
    expect(salaryStanding((546000 + 628000) / 2)).toEqual({ kind: "estimated", topPercent: 45 });
    expect(salaryStanding(165000)).toEqual({ kind: "estimated", topPercent: 95 });
    expect(salaryStanding(1335999)).toEqual({ kind: "estimated", topPercent: 10 });
    expect(salaryStanding(1336001)).toEqual({ kind: "estimated", topPercent: 10 });
    // The platform tail is rescaled so the official D9 remains top 10%.
    expect(salaryStanding(1500000)).toEqual({ kind: "estimated", topPercent: 7 });
  });

  it("checks both Excel originals and labels the count conversion separately", () => {
    expect(salaryDistribution.rawFile).toMatch(/\.xlsx$/);
    expect(salaryDistribution.summary).toMatchObject({
      meanAnnualTwd: 732000,
      medianAnnualTwd: 546000,
    });
    for (const source of [salaryDistribution.summary, salaryDistribution.frequency]) {
      expect(createHash("sha256").update(readFileSync(source.rawFile)).digest("hex")).toBe(
        source.sha256,
      );
    }
    expect(
      createHash("sha256")
        .update(readFileSync(salaryDistribution.frequency.populationRawFile))
        .digest("hex"),
    ).toBe(salaryDistribution.frequency.populationSha256);
    expect(salaryBins.reduce((total, bin) => total + bin.percent, 0)).toBeCloseTo(100, 6);
    expect(salaryBins.find((bin) => bin.lower === 300000)).toMatchObject({
      percent: 19.94107426,
      estimatedCount: 1686417,
    });
    expect(salaryDistribution.frequency.countMethod).toContain("推估");
    expect(salaryBins.at(-1)).toMatchObject({ lower: 2000000, upper: null, percent: 2.81624158 });
    expect(
      Math.abs(salaryBins.reduce((total, bin) => total + bin.estimatedCount, 0) - 8457000),
    ).toBeLessThan(11);
  });

  it("places earnings in numeric salary bands, including the open upper tail", () => {
    expect(findSalaryBin(599999)).toMatchObject({ lower: 500000, upper: 600000 });
    expect(findSalaryBin(600000)).toMatchObject({ lower: 600000, upper: 700000 });
    expect(findSalaryBin(2000000)).toMatchObject({ lower: 2000000, upper: null });
    expect(findSalaryBin(99999999)).toMatchObject({ lower: 2000000, upper: null });
    expect(findSalaryBin(0)).toMatchObject({ lower: 0, upper: 100000 });
    expect(findSalaryBin(-1)).toBeNull();
  });
  it("keeps the published D1–D9 thresholds and the source snapshot", () => {
    expect(salaryDistribution.deciles.map((point) => point.annualTwd)).toEqual([
      330000, 381000, 432000, 487000, 546000, 628000, 753000, 959000, 1336000,
    ]);
    expect(
      createHash("sha256").update(readFileSync(salaryDistribution.rawFile)).digest("hex"),
    ).toBe(salaryDistribution.sha256);
    expect(readFileSync("public/data/salary-distribution.json", "utf8")).toBe(
      readFileSync("data/salary-distribution.json", "utf8"),
    );
  });

  it("assigns each published boundary to the higher bracket without gaps", () => {
    for (const [index, point] of salaryDistribution.deciles.entries()) {
      expect(findSalaryBracket(point.annualTwd - 1)?.group).toBe(index + 1);
      expect(findSalaryBracket(point.annualTwd)?.group).toBe(index + 2);
      expect(findSalaryBracket(point.annualTwd + 1)?.group).toBe(index + 2);
    }
  });

  it("keeps both tails open and rejects invalid annual earnings", () => {
    expect(findSalaryBracket(0)?.group).toBe(1);
    const high = findSalaryBracket(100_000_000);
    expect(high).toMatchObject({ group: 10, upper: null, percentileLow: 90, percentileHigh: 100 });
    if (high) expect(bracketRange(high)).toBe("133.6 萬元以上");
    for (const value of [-1, NaN, Infinity]) expect(findSalaryBracket(value)).toBeNull();
    expect(findSalaryBracket(45000 * 12 + 90000)?.group).toBe(7);
  });

  it("accepts pasted grouped and full-width amounts, keeping empty input distinct from zero", () => {
    for (const value of ["45000", "45,000", " ４５，０００ "]) {
      expect(parseSalaryInput(value)).toEqual({ kind: "valid", value: 45000 });
    }
    expect(parseSalaryInput("0")).toEqual({ kind: "valid", value: 0 });
    expect(parseSalaryInput(" ")).toEqual({ kind: "empty" });
    for (const value of ["-1", "1.5", "1e6", "45,00", "50萬", "NaN", "1000000001"]) {
      expect(parseSalaryInput(value).kind).toBe("invalid");
    }
  });
});
