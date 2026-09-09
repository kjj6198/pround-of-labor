import { chromium } from "@playwright/test";
import { readFile } from "node:fs/promises";

const dataUri = async (path, type) =>
  `data:${type};base64,${(await readFile(path)).toString("base64")}`;
const font = await dataUri("public/fonts/LINESeedTW-Bold.woff2", "font/woff2");
const regular = await dataUri("public/fonts/LINESeedTW-Regular.woff2", "font/woff2");
const numeric = await dataUri("public/fonts/SpaceGrotesk-Variable.woff2", "font/woff2");
const hand = await dataUri("public/brand/labor-hand.svg", "image/svg+xml");
// Each wordmark SVG is cropped to its own ink bounds, so heights are scaled back to a shared em box.
const em = 131;
const glyphs = [
  { file: "logo-1.svg", height: 129 },
  { file: "logo-2.svg", height: 122 },
  { file: "logo-3.svg", height: 131 },
  { file: "logo-4.svg", height: 128 },
  { file: "logo-5.svg", height: 130 },
];
const wordmark = await Promise.all(
  glyphs.map(async (glyph) => {
    const source = await dataUri(`public/brand/${glyph.file}`, "image/svg+xml");
    return `<img src="${source}" style="height:${(glyph.height / em) * 100}%">`;
  }),
);

const html = `<!doctype html><html lang="zh-Hant-TW"><meta charset="utf-8"><style>
@font-face { font-family: "LINE Seed TW"; src: url(${regular}) format("woff2"); font-weight: 400 }
@font-face { font-family: "LINE Seed TW"; src: url(${font}) format("woff2"); font-weight: 700 }
@font-face { font-family: "Space Grotesk"; src: url(${numeric}) format("woff2"); font-weight: 300 700 }
* { margin: 0; box-sizing: border-box }
body { width: 1200px; height: 630px; display: flex; font-family: "Space Grotesk", "LINE Seed TW", sans-serif;
  color: oklch(0.34 0.016 137.846); background: oklch(0.943 0.017 91.555); padding: 60px 64px; gap: 32px; align-items: center }
.copy { flex: 1; display: flex; flex-direction: column; gap: 26px }
.eyebrow { font-size: 20px; letter-spacing: 0.32em; color: oklch(0.507 0.012 112.62) }
.wordmark { display: flex; align-items: flex-end; gap: 14px; height: 116px }
.wordmark img { display: block; width: auto;
  filter: brightness(0) saturate(100%) invert(23%) sepia(8%) saturate(888%) hue-rotate(41deg) brightness(96%) contrast(88%) }
.tagline { font-size: 50px; white-space: nowrap; font-weight: 700; letter-spacing: 0.02em }
.description { font-size: 24px; line-height: 1.7; color: oklch(0.507 0.012 112.62) }
.footer { margin-top: 10px; display: flex; gap: 20px; font: 19px "Space Grotesk", "LINE Seed TW", sans-serif; color: oklch(0.507 0.012 112.62);
  border-top: 2px solid oklch(0.859 0.016 99.029); padding-top: 22px }
.art { position: relative; flex: none; width: 350px; height: 350px; display: grid; place-items: center }
.sun { position: absolute; inset: 26px; border-radius: 50%; background: oklch(0.878 0.033 93.548) }
.ring { position: absolute; inset: 0; border-radius: 50%; border: 2px dashed oklch(0.835 0.029 93.796) }
.art img { position: relative; width: 290px }
</style>
<body>
  <div class="copy">
    <p class="eyebrow">TAIWAN LABOR OBSERVATORY</p>
    <div class="wordmark">${wordmark.join("")}</div>
    <p class="tagline">在台灣工作，是什麼樣子？</p>
    <p class="description">薪資、工時、失業率、移工與人口統計，<br>以及罷工、職災與勞動法制的事件紀錄。</p>
    <div class="footer"><span>2012–2025 年度統計</span><span>vdata.labor.kalan.blog</span></div>
  </div>
  <div class="art"><div class="ring"></div><div class="sun"></div><img src="${hand}"></div>
</body></html>`;

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
  headless: true,
  args: ["--no-sandbox"],
});
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.setContent(html, { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: "public/og-cover.png" });
await browser.close();
console.log("Wrote public/og-cover.png");
