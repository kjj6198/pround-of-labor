import { describe, it, expect } from "vite-plus/test";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import {
  data,
  latestWage,
  latestHours,
  latestMigrant,
  latestUnemployment,
  currentMinimum,
} from "../src/lib/data";

describe("official labor snapshot", () => {
  it("matches the independently checked latest releases", () => {
    expect([latestWage.period, latestWage.mean.value, latestWage.median.value]).toEqual([
      "2025",
      47885,
      38407,
    ]);
    expect([latestHours.period, latestHours.hours.value]).toEqual(["2025", 168.9]);
    expect([latestMigrant.period, latestMigrant.total.value, latestMigrant.valid.value]).toEqual([
      "2025",
      866275,
      766212,
    ]);
    expect([latestUnemployment.period, latestUnemployment.total.value]).toEqual(["2025", 3.35]);
  });
  it("publishes annual observations from 2012 without unfinished 2026 data", () => {
    for (const rows of [
      data.wages,
      data.indicators,
      data.unemployment,
      data.migrants,
      data.industries,
      data.births,
    ]) {
      expect(
        rows.every(
          (r) => r.frequency === "annual" && Number(r.period) >= 2012 && Number(r.period) <= 2025,
        ),
      ).toBe(true);
    }
    for (const rows of [
      data.wages,
      data.indicators,
      data.unemployment,
      data.migrants,
      data.births,
    ]) {
      expect(rows.map((r) => r.period)).toEqual(
        Array.from({ length: 14 }, (_, i) => String(2012 + i)),
      );
    }
    expect(
      data.wages
        .filter((r) => Number(r.period) < 2020)
        .every((r) => r.median.value === null && r.median.status === "not-in-source"),
    ).toBe(true);
  });
  it("keeps the current legal minimum separate from completed annual statistics", () => {
    expect(currentMinimum.effectiveFrom).toBe("2026-01-01");
    expect(currentMinimum.minimum.value).toBe(29500);
    expect(currentMinimum.hourlyMinimum.value).toBe(196);
    expect(data.indicators.at(-1)?.minimum.value).toBe(28590);
    expect(readFileSync("data/raw/minimum-wage.html", "utf8")).toContain(
      "每月最低工資為29,500元，每小時最低工資為196元",
    );
  });
  it("uses registered annual births, not occurrence counts or annualized monthly rates", () => {
    expect([data.births[0]?.births.value, data.births[0]?.rate.value]).toEqual([229481, 9.86]);
    expect([data.births.at(-1)?.births.value, data.births.at(-1)?.rate.value]).toEqual([
      107812, 4.62,
    ]);
  });
  it("reconciles every migrant total without mixing permit categories", () => {
    for (const r of data.migrants) {
      expect(r.total.value).toBe(r.valid.value + r.invalid.value);
      expect(r.valid.value).toBe(r.industry.value + r.welfare.value);
      expect(r.industry.value).toBe(
        r.industryIndonesia.value +
          r.industryVietnam.value +
          r.industryPhilippines.value +
          r.industryThailand.value +
          r.industryOther.value,
      );
      expect(r.welfare.value).toBe(
        r.welfareIndonesia.value +
          r.welfareVietnam.value +
          r.welfarePhilippines.value +
          r.welfareThailand.value +
          r.welfareOther.value,
      );
    }
  });
  it("retains the official source bytes and publishes the same dataset", () => {
    for (const source of data.sources) {
      expect(
        createHash("sha256")
          .update(readFileSync(`data/raw/${source.id}`))
          .digest("hex"),
      ).toBe(source.sha256);
    }
    expect(JSON.parse(readFileSync("public/data/labor.json", "utf8"))).toEqual(data);
    expect(data.population.groups.reduce((sum, r) => sum + r.value, 0)).toBe(23299132);
  });
  it("has unique periods and positive source coordinates", () => {
    for (const rows of [data.wages, data.indicators, data.unemployment, data.migrants]) {
      expect(new Set(rows.map((r) => r.period)).size).toBe(rows.length);
      for (const row of rows)
        for (const value of Object.values(row))
          if (typeof value === "object" && value !== null) {
            if (value.status !== "not-in-source") {
              expect(value.row).toBeGreaterThan(0);
              expect(value.column).toBeGreaterThan(0);
            }
            expect(data.sources.some((s) => s.id === value.source)).toBe(true);
          }
    }
  });
});
