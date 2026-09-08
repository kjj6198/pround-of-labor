import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  RiArrowDownLine,
  RiGithubLine,
  RiMenuLine,
  RiCloseLine,
  RiThreadsLine,
  RiTwitterXLine,
} from "@remixicon/react";
import { Stories } from "../components/Stories";
import { Brand } from "../components/Brand";
import { Trends, IndustryHours } from "../components/Trends";
import { Migrants, Aging } from "../components/People";
import { Chapter, SourceLink, Download } from "../components/Shared";
import {
  data,
  format,
  japanAging,
  periodLabel,
  sourcePage,
  latestWage,
  latestHours,
  latestUnemployment,
  currentMinimum,
} from "../lib/data";
export const Route = createFileRoute("/")({ component: Home });
const socials = [
  { href: "https://x.com/kalanyei", label: "X @kalanyei", Icon: RiTwitterXLine },
  {
    href: "https://www.threads.com/@kalan_jp_log",
    label: "Threads @kalan_jp_log",
    Icon: RiThreadsLine,
  },
  {
    href: "https://github.com/kjj6198/pround-of-labor",
    label: "GitHub 原始碼",
    Icon: RiGithubLine,
  },
];
const sources = [
  {
    href: sourcePage("wages.ods"),
    name: "經常性薪資平均數與中位數",
    agency: "行政院主計總處",
    range: "2012–2025；薪資中位數自 2020 年起",
  },
  {
    href: sourcePage("earnings.ods"),
    name: "每月總工時與正常工時",
    agency: "行政院主計總處",
    range: "2012–2025 年",
  },
  {
    href: sourcePage("hours.ods"),
    name: "各產業每月總工時",
    agency: "行政院主計總處",
    range: "2021–2025 年",
  },
  {
    href: sourcePage("unemployment.xls"),
    name: "失業率與青年失業率",
    agency: "勞動部統計月報",
    range: "2012–2025 年",
  },
  {
    href: sourcePage("minimum-wage.html"),
    name: "歷年最低工資調整",
    agency: "勞動部",
    range: "2026 年 1 月現行標準",
  },
  {
    href: sourcePage("migrants.xls"),
    name: "外籍移工在臺人數",
    agency: "勞動部",
    range: "2012–2025 年底",
  },
  {
    href: sourcePage("births.ods"),
    name: "出生人數與粗出生率",
    agency: "內政部戶政司",
    range: "2012–2025 年；按登記日期",
  },
  {
    href: sourcePage("population.html"),
    name: "戶籍人口年齡結構",
    agency: "內政部戶政司",
    range: "2025 年底",
  },
  {
    href: japanAging.href,
    name: japanAging.name,
    agency: japanAging.agency,
    range: japanAging.range,
  },
];
const chapters = [
  { id: "overview", label: "勞動現況" },
  { id: "trends", label: "薪資與工時" },
  { id: "migrants", label: "移工在台灣" },
  { id: "aging", label: "高齡化" },
  { id: "history", label: "勞動大事紀" },
];
function Home() {
  const [menu, setMenu] = useState(false);
  const [active, setActive] = useState("overview");
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setActive(entry.target.id);
      },
      { rootMargin: "-15% 0px -65% 0px" },
    );
    for (const chapter of chapters) {
      const element = document.getElementById(chapter.id);
      if (element) observer.observe(element);
    }
    return () => observer.disconnect();
  }, []);
  return (
    <>
      <a href="#overview" className="skip-link">
        跳至勞動現況
      </a>
      <header className="site-header">
        <div className="page-shell header-inner">
          <a href="#top" aria-label="勞工大代誌，回到頁首">
            <Brand />
          </a>
          <nav aria-label="網站導覽" className="header-links">
            <a
              href="https://github.com/kjj6198/pround-of-labor"
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub 原始碼"
            >
              <RiGithubLine size={21} />
            </a>
          </nav>
          <button
            className="menu-button"
            aria-label={menu ? "關閉選單" : "開啟選單"}
            aria-expanded={menu}
            aria-controls="mobile-menu"
            onClick={() => setMenu(!menu)}
          >
            {menu ? <RiCloseLine /> : <RiMenuLine />}
          </button>
        </div>
        {menu ? (
          <nav id="mobile-menu" className="mobile-menu" aria-label="章節導覽">
            {chapters.map((c) => (
              <a href={`#${c.id}`} key={c.id} onClick={() => setMenu(false)}>
                {c.label}
              </a>
            ))}
          </nav>
        ) : null}
      </header>
      <main id="top">
        <section className="hero">
          <div className="page-shell hero-inner">
            <div className="hero-main">
              <div className="hero-copy">
                <h1>
                  <Brand hero />
                </h1>
                <p className="hero-title">在台灣工作，是什麼樣子？</p>
                <p className="hero-description">
                  整理台灣的薪資、工時與就業統計，
                  <br />
                  也記錄罷工、職災與勞動權益的變化。
                </p>
              </div>
              <div className="hero-art" aria-label="原作握拳插畫" role="img">
                <div className="art-ring ring-one" />
                <div className="art-ring ring-two" />
                <div className="art-sun" />
                <div className="art-rules" />
                <img
                  src={`${import.meta.env.BASE_URL}brand/labor-hand.svg`}
                  alt=""
                  width="430"
                  height="365"
                />
              </div>
            </div>
          </div>
        </section>
        <div className="chapter-nav">
          <nav className="page-shell" aria-label="專題章節">
            {chapters.map((c, i) => (
              <a
                key={c.id}
                href={`#${c.id}`}
                aria-current={active === c.id ? "location" : undefined}
              >
                <span>0{i}</span>
                {c.label}
              </a>
            ))}
          </nav>
        </div>
        <section id="overview" className="section overview page-shell">
          <Chapter
            number="00"
            english="THE STATE OF WORK"
            title="台灣勞動現況"
            description="年度統計採 2025 年，最低工資為 2026 年 1 月起的現行標準。"
          />
          <div className="stats-strip">
            {[
              {
                label: "經常性薪資中位數",
                value: format(latestWage.median.value),
                unit: "元／月",
                period: latestWage.period,
                detail: "全體受僱員工・全年平均",
              },
              {
                label: "每人每月總工時",
                value: format(latestHours.hours.value, 1),
                unit: "小時",
                period: latestHours.period,
                detail: "工業及服務業・全年平均",
              },
              {
                label: "失業率",
                value: format(latestUnemployment.total.value, 2),
                unit: "%",
                period: latestUnemployment.period,
                detail: "戶籍人口・未季調",
              },
              {
                label: "現行最低工資",
                value: format(currentMinimum.minimum.value),
                unit: "元／月",
                period: "2026-01",
                detail: `時薪 ${currentMinimum.hourlyMinimum.value} 元`,
              },
            ].map((s, i) => (
              <article className="stat" key={s.label}>
                <div className="stat-label">
                  <span>{s.label}</span>
                  <span className="stat-index">0{i + 1}</span>
                </div>
                <p className="stat-value">
                  {s.value}
                  <small>{s.unit}</small>
                </p>
                <p className="caption">
                  {periodLabel(s.period)}
                  {i === 3 ? " 起" : ""}・{s.detail}
                </p>
              </article>
            ))}
          </div>
        </section>
        <Trends />
        <div className="page-shell pb-20">
          <IndustryHours />
        </div>
        <Migrants />
        <Aging />
        <Stories />
        <section id="sources" className="section page-shell sources-section">
          <Chapter
            number="05"
            english="OPEN DATA, CLEAR CONTEXT"
            title="資料來源與統計方法"
            description="列出各項統計的來源、期間與計算方式，也提供完整資料下載。"
          />
          <div className="sources-layout">
            <div>
              {sources.map((s, i) => (
                <div className="source-row" key={s.name}>
                  <span>0{i + 1}</span>
                  <div>
                    <h3>{s.name}</h3>
                    <p>
                      {s.agency}・{s.range}
                    </p>
                  </div>
                  <SourceLink href={s.href}>原始資料</SourceLink>
                </div>
              ))}
              <div className="flex flex-wrap gap-6 mt-7">
                <Download />
                <a
                  className="download-link"
                  href={`${import.meta.env.BASE_URL}data/labor.json`}
                  download
                >
                  下載完整 JSON
                  <RiArrowDownLine size={16} />
                </a>
              </div>
            </div>
            <div className="methodology">
              <h3>這些數字怎麼整理？</h3>
              <p>
                民國年轉為西元年。只提供 2012 年起的年度平均或年底人數；2026
                年尚未結束，不將累計值當作全年結果。
              </p>
              <p>
                薪資採全體受僱員工口徑。數值以本次官方修訂版本為準，初步值與修訂標記保留在下載檔。來源未提供的數值保留空白，不補成零。
              </p>
              <p>
                移工總人數包含有效及失效聘僱許可；國籍與工作類別僅涵蓋有效聘僱許可。人口統計採戶籍登記，與常住人口定義不同。
              </p>
              <p>
                出生率採全年粗出生率（‰），不以單月年化值代替。完整 CSV
                保留可取得數值的來源檔名、列與欄。原始檔、下載網址與 SHA-256 雜湊值收錄於專案。
              </p>
              <p>
                日本 65 歲以上人口比率引自總務省統計局人口推計（2025 年 9 月 15
                日），採推計人口口徑，與台灣的年底戶籍人口不同，只作規模參考。
              </p>
              <span className="caption">最後查核：{data.checkedAt}・資料不會自動即時更新</span>
            </div>
          </div>
        </section>
      </main>
      <footer className="page-shell site-footer">
        <Brand />
        <p>原作・Kalan　設計・Peter、Kalan</p>
        <nav className="footer-social" aria-label="作者社群連結">
          {socials.map(({ href, label, Icon }) => (
            <a key={href} href={href} target="_blank" rel="noreferrer" aria-label={label}>
              <Icon size={19} />
            </a>
          ))}
        </nav>
        <a href="#top">回到頁首 ↑</a>
      </footer>
    </>
  );
}
