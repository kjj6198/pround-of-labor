import { useState } from "react";
import {
  data,
  format,
  japanAging,
  periodLabel,
  latestMigrant,
  required,
  red,
  ink,
} from "../lib/data";
import { Chapter, Table } from "./Shared";
import { DataChart } from "./DataChart";
const countries = [
  { key: "Indonesia", name: "印尼", en: "INDONESIA", flag: "\u{1F1EE}\u{1F1E9}" },
  { key: "Vietnam", name: "越南", en: "VIETNAM", flag: "\u{1F1FB}\u{1F1F3}" },
  { key: "Philippines", name: "菲律賓", en: "PHILIPPINES", flag: "\u{1F1F5}\u{1F1ED}" },
  { key: "Thailand", name: "泰國", en: "THAILAND", flag: "\u{1F1F9}\u{1F1ED}" },
  { key: "Other", name: "其他", en: "OTHERS", flag: "\u{1F30F}" },
];
export function Migrants() {
  const [period, setPeriod] = useState(latestMigrant.period);
  const [sector, setSector] = useState("all");
  const record = required(data.migrants.find((r) => r.period === period));
  const values = [
    { industry: record.industryIndonesia.value, welfare: record.welfareIndonesia.value },
    { industry: record.industryVietnam.value, welfare: record.welfareVietnam.value },
    { industry: record.industryPhilippines.value, welfare: record.welfarePhilippines.value },
    { industry: record.industryThailand.value, welfare: record.welfareThailand.value },
    { industry: record.industryOther.value, welfare: record.welfareOther.value },
  ];
  const totals = values.map((v) =>
    sector === "industry" ? v.industry : sector === "welfare" ? v.welfare : v.industry + v.welfare,
  );
  const total = totals.reduce((sum, v) => sum + v, 0);
  const annual = data.migrants.filter((r) => r.frequency === "annual" && Number(r.period) >= 2012);
  return (
    <section id="migrants" className="section migrant-section">
      <div className="page-shell">
        <Chapter
          number="02"
          english="PEOPLE BEHIND THE WORK"
          title="在台灣工作的移工"
          description="查看歷年移工人數，以及產業、社福移工的國籍分布。"
        />
        <div className="migrant-layout">
          <div>
            <div className="migrant-total">
              <span>{format(record.total.value)}</span>
              <small>人</small>
            </div>
            <p>
              外籍移工在臺人數{" "}
              <span className="caption">
                ／ {periodLabel(period)}
                {record.frequency === "annual" ? "底" : ""}
              </span>
            </p>
            <div className="permit-breakdown">
              <p>
                <span>有效聘僱許可</span>
                <strong>{format(record.valid.value)} 人</strong>
              </p>
              <p>
                <span>聘僱許可失效</span>
                <strong>{format(record.invalid.value)} 人</strong>
              </p>
            </div>
            <p className="body-copy">
              國籍統計僅計入持有效聘僱許可的移工，因此人數會少於在臺總人數。
            </p>
            <div className="mini-trend">
              <h3>2012 年以來的變化</h3>
              <DataChart
                labels={annual.map((r) => r.period)}
                series={[
                  { label: "有效聘僱許可", values: annual.map((r) => r.valid.value), color: ink },
                  { label: "在臺總人數", values: annual.map((r) => r.total.value), color: red },
                ]}
                unit="人"
                label="2012 至 2025 年底移工人數"
              />
              <Table
                caption="歷年移工人數"
                headers={["年底", "有效聘僱許可", "在臺總人數"]}
                rows={annual.map((r) => [r.period, format(r.valid.value), format(r.total.value)])}
              />
            </div>
          </div>
          <div className="nationality-panel">
            <div className="flex flex-wrap justify-between gap-4 items-start">
              <h3>他們從哪裡來？</h3>
              <label className="select-inline">
                統計年度
                <select
                  aria-label="移工統計年度"
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                >
                  {data.migrants.toReversed().map((r) => (
                    <option key={r.period} value={r.period}>
                      {periodLabel(r.period)}
                      {r.frequency === "annual" ? "底" : ""}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="segment-control" role="group" aria-label="移工工作類型">
              {[
                { id: "all", name: "全部" },
                { id: "industry", name: "產業移工" },
                { id: "welfare", name: "社福移工" },
              ].map((s) => (
                <button key={s.id} aria-pressed={sector === s.id} onClick={() => setSector(s.id)}>
                  {s.name}
                </button>
              ))}
            </div>
            <p className="caption mb-7" aria-live="polite">
              有效聘僱許可・共 {format(total)} 人
            </p>
            {countries.map((country, i) => (
              <div className="country-row" key={country.key}>
                <div>
                  <h4>
                    <span className="country-flag" aria-hidden="true">
                      {country.flag}
                    </span>
                    {country.name}
                    <small>{country.en}</small>
                  </h4>
                  <span>
                    {format(totals[i] ?? null)} <small>人</small>
                  </span>
                </div>
                <div className="country-track">
                  <div style={{ width: `${((totals[i] ?? 0) / total) * 100}%` }} />
                </div>
                <p>{(((totals[i] ?? 0) / total) * 100).toFixed(2)}%</p>
              </div>
            ))}
            <p className="caption mt-6">占比以所選類別的有效聘僱許可人數計算，保留「其他」國籍。</p>
          </div>
        </div>
      </div>
    </section>
  );
}
export function Aging() {
  const { groups, total, period } = data.population;
  const senior = required(groups.find((g) => g.label === "65歲以上"));
  const seniorShare = (senior.value / total) * 100;
  return (
    <section id="aging" className="section page-shell">
      <Chapter
        number="03"
        english="A CHANGING WORKFORCE"
        title="台灣人口的年齡分布"
        description="65 歲以上人口占多少？以下依戶籍統計，呈現各年齡層人數與出生趨勢。"
      />
      <div className="aging-layout">
        <div className="population-visual">
          <div className="flex justify-between caption">
            <span>台灣戶籍人口年齡結構</span>
            <span>{periodLabel(period)}底</span>
          </div>
          <div
            className="population-bar"
            role="img"
            aria-label={groups.map((g) => `${g.label} ${format(g.value)}人`).join("，")}
          >
            {groups.map((g, i) => (
              <div
                key={g.label}
                style={{
                  flex: g.value,
                  background: ["oklch(0.588 0.099 81.518)", "oklch(0.405 0.024 133.356)", red][i],
                }}
              >
                <span>
                  {((g.value / total) * 100).toFixed(1)}
                  <small>%</small>
                </span>
              </div>
            ))}
          </div>
          <div className="population-labels">
            {groups.map((g, i) => (
              <div key={g.label}>
                <p>
                  <i
                    style={{
                      background: ["oklch(0.588 0.099 81.518)", "oklch(0.405 0.024 133.356)", red][
                        i
                      ],
                    }}
                  />
                  {g.label}
                </p>
                <strong>
                  {format(g.value)}
                  <small> 人</small>
                </strong>
              </div>
            ))}
          </div>
          <p className="caption mt-8">
            戶籍人口共 {format(total)}{" "}
            人。此處為人口年齡分布，不是就業人口分布。百分比由原始人數計算後四捨五入。
          </p>
        </div>
        <div className="aging-story">
          <p className="eyebrow">65 歲以上人口</p>
          <div className="featured-value">
            <span>{seniorShare.toFixed(2)}</span>
            <small>%</small>
          </div>
          <h3>
            每五個人，
            <br />
            就有一位已滿 65 歲。
          </h3>
          <p className="body-copy">
            年長者繼續工作，需要合適的工時與工作安排。照顧家人的工作者，也需要請假與托顧支援。
          </p>
          <div className="aging-compare">
            <p className="eyebrow">與日本比較</p>
            <div className="compare-rows">
              <div>
                <p>
                  <span className="compare-flag" aria-hidden="true">
                    {"\u{1F1F9}\u{1F1FC}"}
                  </span>
                  台灣
                </p>
                <div className="compare-track">
                  <div style={{ width: `${(seniorShare / japanAging.share) * 100}%` }} />
                </div>
                <strong>{seniorShare.toFixed(1)}%</strong>
              </div>
              <div>
                <p>
                  <span className="compare-flag" aria-hidden="true">
                    {"\u{1F1EF}\u{1F1F5}"}
                  </span>
                  日本
                </p>
                <div className="compare-track">
                  <div style={{ width: "100%" }} />
                </div>
                <strong>{japanAging.share.toFixed(1)}%</strong>
              </div>
            </div>
            <p className="caption">
              日本 65 歲以上人口占 {japanAging.share}%，是人口 4,000 萬以上國家中最高的。台灣採 2025
              年底戶籍人口，日本採 2025 年 9 月 15 日人口推計，兩者口徑不同。
            </p>
          </div>
        </div>
      </div>
      <Births />
    </section>
  );
}

function Births() {
  const [metric, setMetric] = useState("rate");
  const latest = required(data.births.at(-1));
  const rate = metric === "rate";
  return (
    <div className="birth-panel">
      <div className="birth-intro">
        <p className="eyebrow">FEWER BIRTHS, CHANGING LIVES</p>
        <h3>每年有多少孩子出生？</h3>
        <div className="birth-statistics">
          <div>
            <span>
              {format(latest.rate.value, 2)}
              <small>‰</small>
            </span>
            <p>2025 年粗出生率</p>
          </div>
          <div>
            <span>
              {format(latest.births.value)}
              <small>人</small>
            </span>
            <p>2025 年出生登記人數</p>
          </div>
        </div>
      </div>
      <div className="birth-chart">
        <div className="segment-control" role="group" aria-label="出生統計指標">
          <button aria-pressed={rate} onClick={() => setMetric("rate")}>
            粗出生率
          </button>
          <button aria-pressed={!rate} onClick={() => setMetric("births")}>
            出生人數
          </button>
        </div>
        <DataChart
          labels={data.births.map((r) => r.period)}
          series={[
            {
              label: rate ? "粗出生率" : "出生登記人數",
              values: data.births.map((r) => (rate ? r.rate.value : r.births.value)),
              color: red,
            },
          ]}
          unit={rate ? "‰" : "人"}
          kind={rate ? "line" : "bar"}
          label={`2012 至 2025 年${rate ? "粗出生率" : "出生登記人數"}`}
        />
        <Table
          caption="歷年出生人數與粗出生率"
          headers={["年度", "出生登記人數（人）", "粗出生率（‰）"]}
          rows={data.births.map((r) => [r.period, format(r.births.value), format(r.rate.value, 2)])}
        />
      </div>
    </div>
  );
}
