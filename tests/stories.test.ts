import { describe, it, expect } from "vite-plus/test";
import { readFileSync } from "node:fs";
import archive from "../data/stories.json";
import original from "../data/stories-original.json";
describe("labor story archive", () => {
  it("retains all nineteen original narratives and credits without truncation", () => {
    const retained = archive.items.filter((s) => s.original !== null);
    expect(retained).toHaveLength(19);
    for (const record of original) {
      const story = retained.find((s) => s.original?.title === record.Title.trim());
      expect(story?.original?.text).toBe(record.Description);
      expect(story?.original?.imageCredit).toBe(record.caption);
    }
  });
  it("adds twelve sourced recent stories without future events", () => {
    const recent = archive.items.filter((s) => s.collection === "recent");
    expect(recent).toHaveLength(12);
    expect(recent.every((s) => s.date >= "2018" && s.date <= archive.checkedAt)).toBe(true);
    expect(new Set(archive.items.map((s) => s.id)).size).toBe(31);
    for (const story of archive.items) {
      expect(story.sources.length).toBeGreaterThan(0);
      expect(story.sources.every((s) => new URL(s.url).protocol === "https:")).toBe(true);
    }
    expect(JSON.parse(readFileSync("public/data/stories.json", "utf8"))).toEqual(archive);
  });
  it("records corrected dates while preserving the original dates", () => {
    const haymarket = archive.items.find((s) => s.id === "original-01");
    expect(haymarket?.date).toBe("1886-05-04");
    expect(haymarket?.original?.date).toBe("1866 / 5 / 1");
    expect(haymarket?.note).toContain("1886");
    expect(archive.items.find((s) => s.id === "original-18")?.date).toBe("2018-04-23");
  });
});
