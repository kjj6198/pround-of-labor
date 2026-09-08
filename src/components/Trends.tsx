import { useState } from "react";
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
import { Chapter, Table } from "./Shared";
const metrics = [
  { id: "wages", label: "薪資" },
  { id: "hours", label: "工時" },
  { id: "unemployment", label: "失業率" },
  { id: "minimum", label: "最低工資" },
];
export function Trends() {
  const [metric, setMetric] = useState("wages");
  const filter = (r: { frequency: string }) => r.frequency === "annual";
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
      ? "平均薪資與中位數，差多少？"
      : metric === "hours"
        ? "每月工作幾小時？"
        : metric === "unemployment"
          ? "青年與全體失業率比較"
          : "歷年最低工資調整";
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
        title="薪資、工時與失業率的變化"
        description="選擇指標，比較 2012 年以來各年的統計結果。"
      />
      <div className="metric-tabs" role="group" aria-label="選擇統計指標">
        {metrics.map((m) => (
          <button key={m.id} aria-pressed={metric === m.id} onClick={() => setMetric(m.id)}>
            {m.label}
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
        </div>
        <div className="chart-panel">
          <p className="caption mb-4">
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
          <h3>哪些產業的月工時最長？</h3>
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
      <Table
        caption="各產業每月總工時"
        headers={["產業", "每月總工時（小時）"]}
        rows={rows.map((r) => [r.industry, format(r.hours.value, 1)])}
      />
    </div>
  );
}
