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
  const salary = page.locator("#salary");
  const amount = page.locator("#salary-amount");
  const downloadSalary = salary.getByRole("button", { name: "下載分享圖片" });
  await expect(downloadSalary).toBeDisabled();
  const salaryBar = salary.locator(".salary-bar").nth(3);
  await salaryBar.hover();
  await expect(salary.getByRole("tooltip")).toContainText("推估約 168.6 萬人");
  await amount.hover();
  await expect(salary.getByRole("tooltip")).toHaveCount(0);
  await salaryBar.focus();
  await expect(salary.getByRole("tooltip")).toContainText("30–40 萬元");
  await page.keyboard.press("Escape");
  await expect(salary.getByRole("tooltip")).toHaveCount(0);
  await salaryBar.click();
  await expect(salary.getByRole("tooltip")).toBeVisible();
  await expect(salary.locator(".salary-controls input")).toHaveCount(1);
  await expect(
    salary.locator(".salary-mode, .salary-share-actions input, .data-table"),
  ).toHaveCount(0);
  await expect(salary.locator(".salary-result")).toBeEmpty();
  await expect(salary.locator(".salary-card-heading")).toHaveText("2024 台灣薪資分布");
  await amount.fill("630000");
  await expect(salary.locator(".salary-percentile")).toHaveText("大約在 前 40%");
  for (const [value, range] of [
    ["599999", "50–60 萬元"],
    ["600000", "60–70 萬元"],
    ["1336000", "130–140 萬元"],
    ["0", "0–10 萬元"],
  ]) {
    await amount.fill(value);
    await expect(salary.locator(".salary-bar.is-current")).toHaveAttribute(
      "aria-label",
      new RegExp(range),
    );
    await expect(salary.locator(".salary-result")).not.toContainText("級距");
    await expect(salary.locator(".salary-marker")).toHaveCount(1);
  }
  await amount.fill("1999999");
  await expect(salary.locator(".salary-percentile")).toHaveText("大約在 前 3%");
  await amount.fill("2000000");
  await expect(salary.locator(".salary-percentile")).toHaveText("大約在 前 3%");
  await expect(salary.locator(".salary-result h3")).toHaveText("200 萬元／年");
  for (const value of ["2000001", "99999999"]) {
    await amount.fill(value);
    await expect(salary.locator(".salary-result h3")).toHaveText("超標");
    await expect(salary.locator(".salary-percentile")).toHaveText("你真是太厲害啦！");
    await expect(salary.locator(".salary-result")).not.toContainText("前");
    await expect(downloadSalary).toBeEnabled();
  }
  const overLimitDownload = page.waitForEvent("download");
  await downloadSalary.click();
  await (await overLimitDownload).saveAs("test-results/salary-share-over-limit.png");
  for (const invalid of ["-1", "abc", "1e6", "", "45,00"]) {
    await amount.fill(invalid);
    await expect(downloadSalary).toBeDisabled();
    await expect(salary.locator(".is-current")).toHaveCount(0);
  }
  await amount.fill("６００，０００");
  await expect(salary.locator(".salary-result")).toContainText("60 萬元／年");
  await expect(salary.locator(".salary-percentile")).toHaveText("大約在 前 43%");
  await expect(salary.locator(".salary-marker")).toContainText("60 萬元");
  const imageDownload = page.waitForEvent("download");
  await downloadSalary.click();
  const exported = await imageDownload;
  assert.equal(exported.suggestedFilename(), "taiwan-salary-2024.png");
  await exported.saveAs("test-results/salary-share.png");
  await expect(salary.locator(".salary-export-status")).toContainText("已下載");
  for (const width of [320, 375, 768, 1043, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await salary.scrollIntoViewIfNeeded();
    assert.ok(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      `Salary overflow at ${width}`,
    );
    const axe = await new AxeBuilder({ page }).include("#salary").analyze();
    assert.deepEqual(axe.violations, [], `Salary accessibility at ${width}`);
    await salary.screenshot({ path: `test-results/salary-${width}.png` });
    if (width === 375) {
      const mobileDownload = page.waitForEvent("download");
      await downloadSalary.click();
      await (await mobileDownload).saveAs("test-results/salary-share-mobile.png");
    }
  }
  await page.goto(base, { waitUntil: "networkidle" });
  async function verifyStoryCards(columns) {
    const cards = page.locator(".story-card");
    for (const card of await cards.all()) {
      await card.scrollIntoViewIfNeeded();
      await expect
        .poll(() => card.locator("img").evaluate((img) => img.complete && img.naturalWidth > 0))
        .toBe(true);
    }
    const boxes = await cards.evaluateAll((elements) =>
      elements.map((element) => {
        const { x, y, width, height } = element.getBoundingClientRect();
        return { x, y, width, height };
      }),
    );
    assert.equal(boxes.filter((box) => Math.abs(box.y - boxes[0].y) < 1).length, columns);
    assert.ok(
      boxes.every((box) => Math.abs(box.width - boxes[0].width) < 1),
      "Equal card widths",
    );
    if (columns > 1)
      assert.ok(
        boxes.every((box) => Math.abs(box.height - boxes[0].height) < 1),
        "Equal card heights",
      );
    assert.ok(
      await page
        .locator(".story-title")
        .evaluateAll((elements) =>
          elements.every(
            (element) =>
              element.scrollHeight <= element.clientHeight &&
              element.scrollWidth <= element.clientWidth,
          ),
        ),
      "Unclipped card titles",
    );
  }
  await verifyStoryCards(3);
  await expect(page.locator(".stats-strip")).toContainText("29,500");
  await expect(page.locator(".stats-strip")).toContainText("時薪 196 元");
  assert.equal(await page.locator("#frequency").count(), 0);
  assert.equal(await page.locator("#start-year").count(), 0);
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
  assert.equal(await page.locator("#trends tbody tr").count(), 14);
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
  assert.equal(await page.locator(".story-card").count(), 10);
  await expect(page.locator(".story-card h3")).toHaveText([
    "外送專法正式上路",
    "最低工資有了專法",
    "明揚工廠爆炸事故",
    "勞動事件法上路",
    "華航空服員罷工",
    "求職天眼通插件推出",
    "國道收費員的工作轉型抗爭",
    "捷運工人的潛水夫症",
    "台鐵司機員罷工",
    "勞動基準法公布",
  ]);
  await verifyStoryCards(3);
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
  await expect(page.getByRole("button", { name: "回到故事列表" })).toBeFocused();
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
  await page.getByRole("button", { name: "閱讀：勞動基準法公布" }).click();
  await expect(dialog).toContainText("1984.07.30");
  await dialog.getByText("閱讀原作全文", { exact: true }).click();
  await expect(dialog).toContainText("1984 / 7 / 30");
  await expect(dialog).toContainText("平均每月工時都在 200 小時以上");
  await dialog.evaluate((e) => {
    e.scrollTop = e.scrollHeight;
  });
  assert.ok(await dialog.evaluate((e) => e.scrollTop > 0));
  await page.getByRole("button", { name: "回到故事列表" }).click();
  await expect(dialog).toHaveCount(0);
  for (const width of [375, 540, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(base, { waitUntil: "networkidle" });
    await verifyStoryCards(width <= 540 ? 1 : width <= 800 ? 2 : 3);
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
    "Browser checks passed: annual data, current minimum, births, filters, tables, CSV, story archive, modal focus/scroll/Escape/outside close, mobile, reduced motion, axe accessibility, no runtime errors.",
  );
} finally {
  await browser.close();
}
