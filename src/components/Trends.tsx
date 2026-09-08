import { useState } from "react";
import { RiArrowRightUpLine, RiInformationLine } from "@remixicon/react";
import {
  data,
  format,
  periodLabel,
  red,
  ink,
  gold,
  required,
  latestWage,
  latestHours,
  latestUnemployment,
  currentMinimum,
} from "../lib/data";
import { DataChart } from "./DataChart";
import { Chapter, Table, Source, Download } from "./Shared";
const metrics = [
  { id: "wages", label: "薪資" },
  { id: "hours", label: "工時" },
  { id: "unemployment", label: "失業率" },
  { id: "minimum", label: "最低工資" },
];
export function Trends() {
  const [metric, setMetric] = useState("wages");
  const [startYear, setStartYear] = useState("2012");
  const filter = (r: { period: string; frequency: string }) =>
    r.frequency === "annual" && Number(r.period.slice(0, 4)) >= Number(startYear);
  const wages = data.wages.filter(filter);
  const indicators = data.indicators.filter(filter);
  const unemployment = data.unemployment.filter(filter);
  const rows = metric === "wages" ? wages : metric === "unemployment" ? unemployment : indicators;
  const labels = rows.map((r) => r.period);
  const series =
    metric === "wages"
      ? [
          { label: "經常性薪資平均數", values: wages.map((r) => r.mean.value), color: ink },
          { label: "經常性薪資中位數", values: wages.map((r) => r.median.value), color: red },
        ]
      : metric === "hours"
        ? [
            { label: "每月總工時", values: indicators.map((r) => r.hours.value), color: red },
            {
              label: "每月正常工時",
              values: indicators.map((r) => r.normalHours.value),
              color: ink,
              dashed: true,
            },
          ]
        : metric === "unemployment"
          ? [
              { label: "全體失業率", values: unemployment.map((r) => r.total.value), color: ink },
              {
                label: "15 至 24 歲失業率",
                values: unemployment.map((r) => r.youth.value),
                color: red,
              },
            ]
          : [{ label: "每月最低工資", values: indicators.map((r) => r.minimum.value), color: red }];
  const unit = metric === "hours" ? "小時" : metric === "unemployment" ? "%" : "元";
  const title =
    metric === "wages"
      ? "薪水漲了，日子有比較好嗎？"
      : metric === "hours"
        ? "下班之後，還剩多少自己的時間？"
        : metric === "unemployment"
          ? "走進職場，年輕人面對更多門檻。"
          : "一份工作的起點，慢慢往上走。";
  const details =
    metric === "wages"
      ? "平均數容易受到高薪者影響。中位數把薪資由低到高排列，代表位在中間的那一個數字。兩者都不含獎金與加班費。"
      : metric === "hours"
        ? "總工時包括正常工時與加班工時。圖表呈現各年度的每月平均，減少工作日數與春節造成的單月波動。"
        : metric === "unemployment"
          ? "失業率的分母是勞動力人口。青年失業率涵蓋正在工作或積極找工作的 15 至 24 歲人口，不包含所有在學青年。"
          : "最低工資是法定標準，與實際薪資統計的意義不同。圖表採各年末標準，完整年度至 2025 年。";
  return (
    <section id="trends" className="section page-shell">
      <Chapter
        number="01"
        english="THE EVERYDAY NUMBERS"
        title="工作的日常，數字怎麼說？"
        description="把每一份努力，放回薪資與時間的座標裡。"
      />
      <div className="metric-tabs" role="group" aria-label="選擇統計指標">
        {metrics.map((m) => (
          <button key={m.id} aria-pressed={metric === m.id} onClick={() => setMetric(m.id)}>
            {m.label}
            <RiArrowRightUpLine size={16} />
          </button>
        ))}
      </div>
      <div className="trend-layout">
        <div className="trend-story">
          <span className="eyebrow">
            {metric === "minimum" ? "2026 現行標準" : "2025 完整年度"}
          </span>
          <h3>{title}</h3>
          <p>{details}</p>
          <div className="featured-value">
            <span>
              {metric === "wages"
                ? format(latestWage.median.value)
                : metric === "hours"
                  ? format(latestHours.hours.value, 1)
                  : metric === "unemployment"
                    ? format(latestUnemployment.total.value, 2)
                    : format(currentMinimum.minimum.value)}
            </span>
            <small>
              {unit}
              {metric === "wages" || metric === "minimum" ? "／月" : ""}
            </small>
          </div>
          <p className="caption">
            {metric === "wages"
              ? `${periodLabel(latestWage.period)}・經常性薪資中位數・全年平均`
              : metric === "hours"
                ? `${periodLabel(latestHours.period)}・每月總工時・全年平均`
                : metric === "unemployment"
                  ? `${periodLabel(latestUnemployment.period)}・未季調`
                  : "2026 年 1 月 1 日起施行"}
          </p>
          <Source
            id={
              metric === "wages"
                ? "wages.ods"
                : metric === "unemployment"
                  ? "unemployment.xls"
                  : metric === "minimum"
                    ? "minimum-wage.html"
                    : "earnings.ods"
            }
          />
        </div>
        <div className="chart-panel">
          <div className="chart-toolbar">
            <div>
              <label htmlFor="start-year">起始年份</label>
              <select
                id="start-year"
                value={startYear}
                onChange={(e) => setStartYear(e.target.value)}
              >
                {[2012, 2015, 2020, 2023, 2025].map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
            <Download />
          </div>
          <p className="caption mt-5 mb-4">
            完整年度至 2025 年；最低工資採年末標準。薪資中位數從 2020 年起提供，較早年份保留空白。
          </p>
          <DataChart
            labels={labels}
            series={series}
            unit={unit}
            label={`${title} ${labels[0]} 至 ${labels.at(-1)}`}
          />
          <Table
            caption={title}
            headers={["期間", ...series.map((s) => `${s.label}（${unit}）`)]}
            rows={labels.map((label, i) => [
              label,
              ...series.map((s) =>
                format(
                  s.values[i] ?? null,
                  metric === "unemployment" ? 2 : metric === "hours" ? 1 : 0,
                ),
              ),
            ])}
          />
        </div>
      </div>
      <div className="reading-note">
        <RiInformationLine size={18} />
        <p>
          薪資與工時涵蓋工業及服務業全體受僱員工，含外國籍與部分工時員工。2019
          年調查涵蓋產業擴增，跨年比較需留意範圍變動。薪資為名目金額，未扣除物價變動。
        </p>
      </div>
    </section>
  );
}
export function IndustryHours() {
  const periods = [
    ...new Set(data.industries.filter((r) => r.frequency === "annual").map((r) => r.period)),
  ];
  const [period, setPeriod] = useState(required(periods.at(-1)));
  const rows = data.industries
    .filter((r) => r.period === period)
    .toSorted((a, b) => (b.hours.value ?? 0) - (a.hours.value ?? 0));
  return (
    <div className="industry-panel">
      <div className="flex flex-wrap justify-between gap-4 items-end">
        <div>
          <p className="eyebrow">WORKING HOURS</p>
          <h3>不同產業，不同的下班時間。</h3>
        </div>
        <label className="select-inline">
          統計年度
          <select
            aria-label="產業工時年度"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          >
            {periods.toReversed().map((p) => (
              <option key={p} value={p}>
                {periodLabel(p)}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="industry-bars">
        {rows.slice(0, 6).map((r, i) => (
          <div className="industry-row" key={r.industry}>
            <span className="rank">0{i + 1}</span>
            <span>{r.industry}</span>
            <div className="bar-track">
              <div
                style={{
                  width: `${((r.hours.value ?? 0) / 200) * 100}%`,
                  background: i === 0 ? red : gold,
                }}
              />
            </div>
            <span className="tabular-nums">
              {format(r.hours.value, 1)} <small>小時</small>
            </span>
          </div>
        ))}
      </div>
      <p className="caption">
        各年度每人每月總工時平均，顯示最高 6 項；本次來源提供 2021–2025 年產業明細。
      </p>
      <Source id="hours.ods" />
      <Table
        caption="各產業每月總工時"
        headers={["產業", "每月總工時（小時）"]}
        rows={rows.map((r) => [r.industry, format(r.hours.value, 1)])}
      />
    </div>
  );
}
