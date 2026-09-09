import { useRef, useState } from "react";
import { RiDownloadLine, RiShieldCheckLine } from "@remixicon/react";
import { Chapter, SourceLink } from "./Shared";
import {
  salaryDistribution,
  salaryBins,
  parseSalaryInput,
  findSalaryBin,
  salaryBinLabel,
  salaryPeople,
  salaryWan,
  salaryStanding,
} from "../lib/salary";

function SalaryChart({ annual }: { annual: number | null }) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const hovered = hoveredIndex === null ? null : salaryBins[hoveredIndex];
  const bin = annual === null ? null : findSalaryBin(annual);

  const left = 65;
  const step = 43;
  const baseline = 340;
  const medianX = left + (salaryDistribution.summary.medianAnnualTwd / 100000) * step;
  const meanX = left + (salaryDistribution.summary.meanAnnualTwd / 100000) * step;
  const markerX = annual === null ? null : left + Math.min(annual / 100000, 20.5) * step;
  const markerLabel = annual === null ? "" : `${salaryWan(annual)} 萬元`;
  return (
    <div
      className="salary-chart-scroll"
      tabIndex={0}
      role="region"
      aria-label="薪資人數分布圖，可左右捲動"
      onPointerLeave={() => setHoveredIndex(null)}
      onKeyDown={(event) => {
        if (event.key === "Escape") setHoveredIndex(null);
      }}
    >
      <svg
        className="salary-chart"
        viewBox="0 0 1000 440"
        role="group"
        aria-label={`2024 年全年總薪資分布，X 軸為年薪萬元，Y 軸為推估人數萬人。${bin ? `目前薪資位於 ${salaryBinLabel(bin)}，${salaryPeople(bin.estimatedCount)}。` : "年薪 30–40 萬元的人數最多。"}`}
      >
        <text x="65" y="26" className="salary-chart-caption salary-people-caption">
          人數／萬人，推估
        </text>
        {[0, 40, 80, 120, 160, 200].map((value) => (
          <g key={value}>
            <line
              x1={left}
              x2="976"
              y1={baseline - value * 1.35}
              y2={baseline - value * 1.35}
              className="salary-gridline"
            />
            <text x="52" y={baseline - value * 1.35 + 5} textAnchor="end" className="salary-axis">
              {value}
            </text>
          </g>
        ))}
        {salaryBins.map((item, index) => {
          const x = left + index * step;
          const height = (item.estimatedCount / 10000) * 1.35;
          const active = item === bin;
          return (
            <g
              key={item.lower}
              className={active ? "salary-bar is-current" : "salary-bar"}
              tabIndex={0}
              role="button"
              aria-label={`${salaryBinLabel(item)}：推估${salaryPeople(item.estimatedCount)}`}
              onPointerEnter={() => setHoveredIndex(index)}
              onFocus={() => setHoveredIndex(index)}
              onBlur={() => setHoveredIndex(null)}
              onClick={() => setHoveredIndex(index)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setHoveredIndex(index);
                }
              }}
            >
              <rect x={x + 4} y={baseline - height} width={step - 8} height={height} rx="3" />
              <rect className="salary-bar-hit" x={x} y="120" width={step} height="220" />
              <text
                transform={`translate(${x + step / 2}, 363) rotate(-45)`}
                textAnchor="end"
                className="salary-group-label"
              >
                {item.upper === null ? "200 以上" : `${item.lower / 10000}–${item.upper / 10000}`}
              </text>
            </g>
          );
        })}
        <line x1={medianX} x2={medianX} y1="64" y2={baseline} className="salary-median-line" />
        <text x={medianX - 8} y="82" textAnchor="end" className="salary-reference-label">
          中位數 {salaryWan(salaryDistribution.summary.medianAnnualTwd)} 萬
        </text>
        <line x1={meanX} x2={meanX} y1="96" y2={baseline} className="salary-mean-line" />
        <text x={meanX + 8} y="110" className="salary-reference-label">
          平均數 {salaryWan(salaryDistribution.summary.meanAnnualTwd)} 萬
        </text>
        {markerX !== null ? (
          <g className="salary-marker">
            <line x1={markerX} x2={markerX} y1="54" y2={baseline} />
            <rect
              x={Math.min(830, Math.max(65, markerX - 66))}
              y="30"
              width="140"
              height="29"
              rx="3"
            />
            <text x={Math.min(830, Math.max(65, markerX - 66)) + 70} y="50" textAnchor="middle">
              {markerLabel}
            </text>
          </g>
        ) : null}
        <text x="520" y="432" textAnchor="middle" className="salary-chart-caption">
          全年總薪資／新台幣萬元
        </text>
        {hovered && hoveredIndex !== null ? (
          <g
            className="salary-tooltip"
            role="tooltip"
            transform={`translate(${Math.min(760, Math.max(65, left + hoveredIndex * step - 70))}, ${Math.max(125, baseline - (hovered.estimatedCount / 10000) * 1.35 - 76)})`}
          >
            <rect width="215" height="66" rx="5" />
            <text x="14" y="25">
              {salaryBinLabel(hovered)}
            </text>
            <text x="14" y="49">
              推估{salaryPeople(hovered.estimatedCount)}
            </text>
          </g>
        ) : null}
      </svg>
    </div>
  );
}

export function SalaryCalculator() {
  const [yearly, setYearly] = useState("");
  const [exporting, setExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState("");
  const capture = useRef<HTMLDivElement>(null);
  const exportLock = useRef(false);
  const salary = parseSalaryInput(yearly);
  const annual = salary.kind === "valid" ? salary.value : null;
  const bin = annual === null ? null : findSalaryBin(annual);
  const standing = annual === null ? null : salaryStanding(annual);

  async function downloadImage() {
    if (!capture.current || !bin || exportLock.current) return;
    exportLock.current = true;
    setExporting(true);
    setExportMessage("");
    // Freeze this click's result while fonts and the lazy exporter load.
    const frozen = capture.current.cloneNode(true);
    if (!(frozen instanceof HTMLElement)) {
      exportLock.current = false;
      setExporting(false);
      return;
    }
    frozen.querySelector(".salary-tooltip")?.remove();
    const holder = document.createElement("div");
    holder.setAttribute("aria-hidden", "true");
    holder.style.cssText = "position:fixed;left:-10000px;top:0;pointer-events:none;";
    frozen.style.width = "1100px";
    holder.append(frozen);
    document.body.append(holder);
    try {
      // SVG children need presentation attributes: the exporter does not copy
      // their computed styles in every browser, losing colors and typefaces.
      for (const element of frozen.querySelectorAll("svg text, svg rect, svg line, svg path")) {
        const style = getComputedStyle(element);
        for (const property of [
          "fill",
          "stroke",
          "stroke-width",
          "stroke-dasharray",
          "stroke-linejoin",
          "paint-order",
          "font-family",
          "font-size",
          "font-weight",
        ]) {
          element.setAttribute(property, style.getPropertyValue(property));
        }
      }
      const [{ toPng }] = await Promise.all([import("html-to-image"), document.fonts.ready]);
      const url = await toPng(frozen, { pixelRatio: 2, preferredFontFormat: "woff2" });
      const link = document.createElement("a");
      link.download = `taiwan-salary-${salaryDistribution.year}.png`;
      link.href = url;
      link.click();
      setExportMessage("分享圖片已下載，可傳到社群或聊天。");
    } catch {
      setExportMessage("圖片未能產生，請再試一次，或直接截取下方結果。");
    } finally {
      holder.remove();
      exportLock.current = false;
      setExporting(false);
    }
  }

  return (
    <section id="salary" className="section page-shell salary-section">
      <Chapter
        number="02"
        english="WHERE YOUR PAY STANDS"
        title="你的薪水落在哪一段？"
        description="輸入稅前薪資，看看自己在台灣受僱員工的薪資分布中，大約在前幾%。"
      />
      <div className="salary-workspace">
        <div className="salary-controls">
          <label className="salary-field" htmlFor="salary-amount">
            全年稅前總薪資
            <span className="salary-input-wrap">
              <input
                id="salary-amount"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                placeholder="例如 600,000"
                value={yearly}
                aria-invalid={salary.kind === "invalid"}
                aria-describedby="salary-amount-help"
                onChange={(event) => {
                  setYearly(event.target.value);
                  setExportMessage("");
                }}
              />
              <span>元</span>
            </span>
          </label>
          <p
            id="salary-amount-help"
            className={salary.kind === "invalid" ? "salary-error" : "salary-help"}
          >
            {salary.kind === "invalid" ? salary.message : "含全年薪資、加班費、年終與其他獎金。"}
          </p>
          <div className="salary-examples">
            <span>試算年薪</span>
            {[400000, 600000, 1000000].map((value) => (
              <button
                type="button"
                key={value}
                onClick={() => {
                  setYearly(String(value));
                  setExportMessage("");
                }}
              >
                {salaryWan(value)} 萬
              </button>
            ))}
          </div>
          <p className="salary-privacy">
            <RiShieldCheckLine size={16} aria-hidden="true" />
            只在你的瀏覽器計算，不儲存薪資。
          </p>
        </div>
        <div className="salary-output">
          <div className="salary-share-card" ref={capture}>
            <div className="salary-card-heading">
              <span>{salaryDistribution.year} 台灣薪資分布</span>
            </div>
            <div
              className={annual === null ? "salary-result is-empty" : "salary-result"}
              role="status"
              aria-atomic="true"
            >
              {bin && annual !== null ? (
                <>
                  <p className="salary-result-kicker">
                    {standing?.kind === "over-limit" ? "年薪超過 200 萬元" : "我的全年總薪資"}
                  </p>
                  <h3>
                    {standing?.kind === "over-limit" ? (
                      <strong>超標</strong>
                    ) : (
                      <>
                        <strong>{salaryWan(annual)}</strong>
                        <span> 萬元／年</span>
                      </>
                    )}
                  </h3>
                  {standing?.kind === "over-limit" ? (
                    <p className="salary-percentile">你真是太厲害啦！</p>
                  ) : standing?.kind === "estimated" ? (
                    <div className="salary-ranking">
                      <p className="salary-percentile">
                        大約在 <strong>前 {standing.topPercent}%</strong>
                      </p>
                    </div>
                  ) : null}
                </>
              ) : null}
            </div>
            <div className="salary-chart-legend">
              <span>
                <i className="salary-legend-bar" />
                受僱員工人數
              </span>
              <span>
                <i className="salary-legend-line" />
                我的薪資
              </span>
              <span>
                <i className="salary-legend-median" />
                中位數 {salaryWan(salaryDistribution.summary.medianAnnualTwd)} 萬
              </span>
              <span>
                <i className="salary-legend-mean" />
                平均數 {salaryWan(salaryDistribution.summary.meanAnnualTwd)} 萬
              </span>
            </div>
            <SalaryChart annual={annual} />
            <p className="salary-chart-note">
              每 10 萬元一組，200
              萬元以上合併。人數依官方區間占比與同年平均受僱員工人數換算，為推估值。 排名依 Excel
              十分位分界插值；133.6 萬以上參考薪情平臺高薪分布推估。
            </p>
            <div className="salary-benchmarks">
              <span>
                平均年薪 <strong>{salaryWan(salaryDistribution.summary.meanAnnualTwd)}</strong> 萬元
              </span>
              <span>
                年薪中位數 <strong>{salaryWan(salaryDistribution.summary.medianAnnualTwd)}</strong>{" "}
                萬元
              </span>
            </div>
            <div className="salary-card-source">
              <p>資料：行政院主計總處 2024 年薪資統計 Excel 表 1、表 2、薪情平臺</p>
              <p>工業及服務業全體受僱員工，含本國籍、外國籍的全時與部分工時員工。</p>
            </div>
          </div>
          <div className="salary-share-actions">
            <button
              type="button"
              className="salary-download"
              disabled={!bin || exporting}
              onClick={() => void downloadImage()}
            >
              <RiDownloadLine size={18} aria-hidden="true" />
              {exporting ? "正在產生圖片…" : "下載分享圖片"}
            </button>
          </div>
          <p className="salary-export-status" role="status">
            {exportMessage}
          </p>
        </div>
      </div>
      <details className="salary-method">
        <summary>資料來源與計算方式</summary>
        <p>
          平均年薪 73.2 萬元、中位數 54.6 萬元，直接取自你可下載的官方 Excel 表 1，113 年那一列。表
          2 提供十分位分界；這兩份檔案皆未提供固定薪資區間的人數。
        </p>
        <p>
          圖中年薪每 10 萬元一組，合併主計總處薪情平臺的每 5 萬元人數占比，再乘以 2024
          年平均受僱員工 845.7 萬人，得到推估人數。200
          萬元以上合併為一組，沒有再拆分或補造資料。金額範圍含下限、不含上限；表內人數四捨五入，合計可能有尾差。
        </p>
        <p>
          「大約在前幾%」以表 2 的 D1–D9 為基準，分界間採線性插值，0 至 33 萬元則從前 100% 插值至前
          90%。超過 133.6 萬元，以前 10% 乘上薪情平臺「高於輸入薪資占比 ÷ 高於 133.6
          萬元占比」推估，平台區間內假設均勻分布。結果四捨五入至整數百分比，並非精確排名。年薪達 200
          萬元仍估算排名；超過 200 萬元時顯示「超標」，不再估算排名。
        </p>
        <p>
          全年總薪資包含經常性薪資、加班費與獎金，與上方的每月經常性薪資不同。統計不含農林漁牧業、政府機關及小學以上各級學校等。官方以投保天數加權，工作未滿一年者與此全年分布比較須留意期間差異。
        </p>
        <p>
          資料年度為 2024 年，Excel 發布於 {salaryDistribution.publishedAt}，最後查核{" "}
          {salaryDistribution.checkedAt}，未調整後續物價與調薪。
        </p>
        <div className="salary-source-links">
          <SourceLink href={salaryDistribution.summary.sourceFile}>
            表 1：平均數與中位數 Excel
          </SourceLink>
          <SourceLink href={salaryDistribution.sourceFile}>表 2：薪資分界 Excel</SourceLink>
          <SourceLink href={salaryDistribution.frequency.sourcePage}>薪情平臺區間占比</SourceLink>
          <SourceLink href={salaryDistribution.frequency.populationSourcePage}>
            2024 年受僱員工人數
          </SourceLink>
          <a
            className="download-link"
            href={`${import.meta.env.BASE_URL}data/salary-distribution.json`}
            download
          >
            下載圖表資料 JSON
          </a>
          <SourceLink href="https://kjj6198.github.io/playground-chart/">互動參考</SourceLink>
        </div>
      </details>
    </section>
  );
}
