import { chromium, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir } from "node:fs/promises";
import assert from "node:assert/strict";
const base = process.env.TEST_URL || "http://localhost:3001/";
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
  headless: true,
  args: ["--no-sandbox"],
});
await mkdir("test-results", { recursive: true });
const errors = [];
try {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(base, { waitUntil: "networkidle" });
  await expect(page.locator(".stats-strip")).toContainText("29,500");
  await expect(page.locator(".stats-strip")).toContainText("時薪 196 元");
  assert.equal(await page.locator("#frequency").count(), 0);
  await expect(page.locator("#start-year")).toHaveValue("2012");
  assert.equal(await page.locator("canvas").count(), 3);
  await page.locator("#trends details summary").click();
  await expect(page.locator("#trends table")).toContainText("2012");
  await expect(page.locator("#trends table")).toContainText("38,407");
  await page.getByRole("button", { name: "工時", exact: true }).click();
  await expect(page.locator("#trends table")).toContainText("168.9");
  await page.getByRole("button", { name: "失業率", exact: true }).click();
  await expect(page.locator("#trends table")).toContainText("11.32");
  await page.getByRole("button", { name: "最低工資", exact: true }).click();
  await expect(page.locator("#trends table")).toContainText("28,590");
  await expect(page.locator("#trends .featured-value")).toContainText("29,500");
  await page.locator("#start-year").selectOption("2020");
  assert.equal(await page.locator("#trends tbody tr").count(), 6);
  await page.getByLabel("移工統計年度").selectOption("2012");
  await expect(page.locator(".mini-trend")).toContainText("2012 年以來");
  await page.getByLabel("移工統計年度").selectOption("2025");
  await page.getByRole("button", { name: "社福移工", exact: true }).click();
  await expect(page.locator(".nationality-panel")).toContainText("225,550");
  await page.getByRole("button", { name: "產業移工", exact: true }).click();
  await expect(page.locator(".nationality-panel")).toContainText("540,662");
  await page.getByLabel("產業工時年度").selectOption("2021");
  await expect(page.getByLabel("產業工時年度")).toHaveValue("2021");
  await expect(page.locator(".birth-statistics")).toContainText("4.62‰");
  await expect(page.locator(".birth-statistics")).toContainText("107,812");
  await page.getByRole("button", { name: "出生人數", exact: true }).click();
  await page.locator(".birth-panel details summary").click();
  await expect(page.locator(".birth-panel table")).toContainText("229,481");
  await expect(page.locator(".birth-panel table")).toContainText("9.86");
  const csv = await page.request.get(new URL("data/labor.csv", base).href);
  assert.equal(csv.status(), 200);
  const csvText = await csv.text();
  assert.match(csvText, /2025,annual,median,38407/);
  assert.match(csvText, /2025,annual,rate,4.62/);
  assert.match(csvText, /minimumPolicy,2026-01-01,effective-date,minimum,29500/);
  assert.doesNotMatch(csvText, /,monthly,/);
  await page.getByRole("button", { name: "近年新增" }).click();
  await expect(page.locator(".stories-count")).toContainText("12 則");
  await page.getByRole("button", { name: "再看 6 則故事" }).click();
  assert.equal(await page.locator(".story-card").count(), 12);
  const first = page.getByRole("button", { name: "閱讀：外送專法正式上路" });
  await first.focus();
  await page.keyboard.press("Enter");
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(page.getByRole("button", { name: "關閉故事", exact: true })).toBeFocused();
  assert.equal(
    await page.locator("main").evaluate((e) => e.inert || Boolean(e.closest("[inert]"))),
    true,
  );
  await page.keyboard.press("Shift+Tab");
  await expect(page.getByRole("button", { name: "讀完了，回到故事集" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "關閉故事", exact: true })).toBeFocused();
  await expect(dialog).toContainText("7 月 21 日施行");
  await page.screenshot({ path: "test-results/story-open.png" });
  await expect
    .poll(() =>
      page
        .locator(".story-body")
        .count()
        .then((count) =>
          count ? page.locator(".story-body").evaluate((e) => getComputedStyle(e).opacity) : "1",
        ),
    )
    .toBe("1");
  assert.deepEqual((await new AxeBuilder({ page }).analyze()).violations, []);
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(first).toBeFocused();
  await first.click();
  await expect(dialog).toBeVisible();
  await page.locator(".story-overlay").click({ position: { x: 3, y: 3 } });
  await expect(dialog).toHaveCount(0);
  await page.getByRole("button", { name: "原作故事" }).click();
  await expect(page.locator(".stories-count")).toContainText("19 則");
  while (await page.getByRole("button", { name: /再看.*則故事/ }).count())
    await page.getByRole("button", { name: /再看.*則故事/ }).click();
  assert.equal(await page.locator(".story-card").count(), 19);
  assert.deepEqual((await new AxeBuilder({ page }).analyze()).violations, []);
  await page.getByLabel("搜尋故事").fill("乾草");
  assert.equal(await page.locator(".story-card").count(), 1);
  await page.locator(".story-card").click();
  await expect(dialog).toContainText("1886.05.04");
  await dialog.getByText("閱讀原作全文", { exact: true }).click();
  await expect(dialog).toContainText("1866 / 5 / 1");
  await expect(dialog).toContainText("總有一日，我們的沈默");
  await dialog.evaluate((e) => {
    e.scrollTop = e.scrollHeight;
  });
  assert.ok(await dialog.evaluate((e) => e.scrollTop > 0));
  await page.getByRole("button", { name: "讀完了，回到故事集" }).click();
  await expect(dialog).toHaveCount(0);
  await page.getByLabel("搜尋故事").fill("無此事件XYZ");
  await expect(page.locator(".stories-empty")).toBeVisible();
  for (const width of [375, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(base, { waitUntil: "networkidle" });
    assert.ok(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      `Overflow at ${width}`,
    );
    assert.ok(
      await page
        .locator("img")
        .evaluateAll((images) => images.every((img) => img.complete && img.naturalWidth > 0)),
    );
    await page.screenshot({ path: `test-results/viewport-${width}.png`, fullPage: true });
  }
  await expect
    .poll(() =>
      page
        .locator(".story-body")
        .count()
        .then((count) =>
          count ? page.locator(".story-body").evaluate((e) => getComputedStyle(e).opacity) : "1",
        ),
    )
    .toBe("1");
  assert.deepEqual((await new AxeBuilder({ page }).analyze()).violations, []);
  await page.setViewportSize({ width: 375, height: 812 });
  await page.getByRole("button", { name: "開啟選單" }).click();
  await page.locator("#mobile-menu").getByRole("link", { name: "移工在台灣" }).click();
  assert.equal(await page.locator("#mobile-menu").count(), 0);
  assert.ok(page.url().endsWith("#migrants"));
  await page.emulateMedia({ reducedMotion: "reduce" });
  await first.click();
  await expect(dialog).toBeVisible();
  await expect.poll(() => dialog.evaluate((e) => getComputedStyle(e).transform)).toBe("none");
  assert.ok(await dialog.evaluate((e) => e.scrollWidth <= e.clientWidth));
  await page.screenshot({ path: "test-results/story-mobile-open.png" });
  await expect
    .poll(() =>
      page
        .locator(".story-body")
        .count()
        .then((count) =>
          count ? page.locator(".story-body").evaluate((e) => getComputedStyle(e).opacity) : "1",
        ),
    )
    .toBe("1");
  assert.deepEqual((await new AxeBuilder({ page }).analyze()).violations, []);
  await page.getByRole("button", { name: "關閉故事", exact: true }).click();
  await expect(dialog).toHaveCount(0);
  assert.equal(await page.locator("main").evaluate((e) => e.inert), false);
  assert.deepEqual(errors, []);
  console.log(
    "Browser checks passed: annual data, current minimum, births, filters, tables, CSV, story search and archive, modal focus/scroll/Escape/outside close, mobile, reduced motion, axe accessibility, no runtime errors.",
  );
} finally {
  await browser.close();
}
