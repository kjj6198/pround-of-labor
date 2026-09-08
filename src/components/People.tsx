import { useState } from "react";
import { data, format, periodLabel, latestMigrant, required, red, ink } from "../lib/data";
import { Chapter, Source, Table } from "./Shared";
import { DataChart } from "./DataChart";
const countries = [
  { key: "Indonesia", name: "印尼", en: "INDONESIA" },
  { key: "Vietnam", name: "越南", en: "VIETNAM" },
  { key: "Philippines", name: "菲律賓", en: "PHILIPPINES" },
  { key: "Thailand", name: "泰國", en: "THAILAND" },
  { key: "Other", name: "其他", en: "OTHERS" },
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
          title="一起工作的人，來自不同的地方。"
          description="從工廠、營建現場到家庭照顧，移工也是台灣勞動日常的一部分。"
        />
        <div className="migrant-layout">
          <div>
            <div className="migrant-total">
              <span>{format(record.total.value)}</span>
              <small>人</small>
            </div>
            <p>
              引進移工在臺人數{" "}
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
              右側國籍統計以有效聘僱許可移工為範圍。把分母說清楚，才能看見每一群人的真實處境。
            </p>
            <Source id="migrants.xls" />
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
            <div className="flex flex-wrap justify-between gap-4 items-end">
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
  return (
    <section id="aging" className="section page-shell">
      <Chapter
        number="03"
        english="A CHANGING WORKFORCE"
        title="當台灣變老，工作也需要改變。"
        description="更長的職涯、更重的照顧需求。人口結構的改變，已經發生在我們身邊。"
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
                style={{ flex: g.value, background: ["#9a762f", "#444c3f", red][i] }}
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
                  <i style={{ background: ["#9a762f", "#444c3f", red][i] }} />
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
          <Source id="population.html" />
        </div>
        <div className="aging-story">
          <p className="eyebrow">65 歲以上人口</p>
          <div className="featured-value">
            <span>{((senior.value / total) * 100).toFixed(2)}</span>
            <small>%</small>
          </div>
          <h3>
            每五個人，
            <br />
            就有一位已滿 65 歲。
          </h3>
          <p className="body-copy">
            職場能否容納不同年齡的工作者？照顧家人的人，能否保有自己的工作？高齡化不只是人口數字，也關乎工作設計與照顧支持。
          </p>
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
        <h3>新生命，正在變少。</h3>
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
        <p className="body-copy">
          粗出生率是當年出生登記人數除以年中人口數，再乘以 1,000。4.62‰ 相當於每千人口約 4.62
          位新生兒，或 0.462%；它與平均每位婦女生育子女數的「總生育率」不同。
        </p>
        <Source id="births.ods" />
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
        <p className="caption mt-4">
          2012–2025 年完整年度資料，按戶籍登記日期統計。未以單月折算年率代替全年數值。
        </p>
      </div>
    </div>
  );
}
