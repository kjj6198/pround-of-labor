import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  RiArrowDownLine,
  RiArrowRightLine,
  RiArrowRightUpLine,
  RiGithubLine,
  RiMenuLine,
  RiCloseLine,
} from "@remixicon/react";
import { Stories } from "../components/Stories";
import { Brand } from "../components/Brand";
import { Trends, IndustryHours } from "../components/Trends";
import { Migrants, Aging } from "../components/People";
import { Chapter, Source, Download } from "../components/Shared";
import {
  data,
  format,
  periodLabel,
  latestWage,
  latestHours,
  latestUnemployment,
  currentMinimum,
} from "../lib/data";
export const Route = createFileRoute("/")({ component: Home });
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
          <span className="header-description">台灣勞動觀察・資料專題</span>
          <nav aria-label="網站導覽" className="header-links">
            <a href="#sources">
              資料與方法 <RiArrowRightUpLine size={14} />
            </a>
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
            <a href="#sources" onClick={() => setMenu(false)}>
              資料與方法
            </a>
          </nav>
        ) : null}
      </header>
      <main id="top">
        <section className="hero">
          <div className="page-shell hero-inner">
            <div className="hero-topline">
              <span>TAIWAN LABOR OBSERVATORY</span>
              <span>
                2026 更新版 <i />
              </span>
            </div>
            <div className="hero-main">
              <div className="hero-copy">
                <p className="hero-kicker">每一份工作，都值得被好好對待。</p>
                <h1>
                  <Brand hero />
                </h1>
                <p className="hero-title">工作，值得更好的日常。</p>
                <p className="hero-description">
                  薪水、工時、生活，都是我們的大代誌。
                  <br />
                  從數字出發，看見台灣勞動的真實樣貌。
                </p>
                <a href="#overview" className="hero-cta">
                  一起看見勞動現場 <RiArrowDownLine size={18} />
                </a>
              </div>
              <div className="hero-art" aria-label="原作握拳插畫" role="img">
                <div className="art-ring ring-one" />
                <div className="art-ring ring-two" />
                <div className="art-sun" />
                <div className="art-rules" />
                <span className="art-vertical">勞動有價・生活有尊嚴</span>
                <img
                  src={`${import.meta.env.BASE_URL}brand/labor-hand.svg`}
                  alt=""
                  width="430"
                  height="365"
                />
                <span className="art-caption">OUR WORK. OUR LIVES.</span>
              </div>
            </div>
            <div className="hero-bottom">
              <span>自 2017 年起，記錄台灣勞動的大小事。</span>
              <span>
                資料查核{" "}
                <time dateTime={data.checkedAt}>{data.checkedAt.replaceAll("-", ".")}</time>
              </span>
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
            <a href="#sources" className="sources-nav">
              資料來源
              <RiArrowRightUpLine size={15} />
            </a>
          </nav>
        </div>
        <section id="overview" className="overview page-shell">
          <div className="overview-title">
            <h2>先看看，現在的勞動現場。</h2>
            <span className="caption">2025 年度統計・最低工資為 2026 現行標準</span>
          </div>
          <div className="stats-strip">
            {[
              {
                label: "經常性薪資中位數",
                value: format(latestWage.median.value),
                unit: "元／月",
                period: latestWage.period,
                detail: "全體受僱員工・全年平均",
                source: "wages.ods",
              },
              {
                label: "每人每月總工時",
                value: format(latestHours.hours.value, 1),
                unit: "小時",
                period: latestHours.period,
                detail: "工業及服務業・全年平均",
                source: "earnings.ods",
              },
              {
                label: "失業率",
                value: format(latestUnemployment.total.value, 2),
                unit: "%",
                period: latestUnemployment.period,
                detail: "戶籍人口・未季調",
                source: "unemployment.xls",
              },
              {
                label: "現行最低工資",
                value: format(currentMinimum.minimum.value),
                unit: "元／月",
                period: "2026-01",
                detail: `時薪 ${currentMinimum.hourlyMinimum.value} 元`,
                source: "minimum-wage.html",
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
                <Source id={s.source}>查看來源</Source>
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
            title="數字有出處，理解有依據。"
            description="資料可以下載，口徑可以核對。每一次閱讀，都從知道數字怎麼來開始。"
          />
          <div className="sources-layout">
            <div>
              {[
                {
                  id: "wages.ods",
                  name: "薪資與工時",
                  agency: "行政院主計總處",
                  range: "2012–2025；薪資中位數自 2020 年起",
                },
                {
                  id: "unemployment.xls",
                  name: "失業率與物價",
                  agency: "主計總處・勞動部統計月報",
                  range: "2012–2025 年",
                },
                {
                  id: "migrants.xls",
                  name: "引進移工在臺人數",
                  agency: "勞動部",
                  range: "2012–2025 年底",
                },
                {
                  id: "births.ods",
                  name: "出生人數與粗出生率",
                  agency: "內政部戶政司",
                  range: "2012–2025 年；按登記日期",
                },
                {
                  id: "population.html",
                  name: "戶籍人口年齡結構",
                  agency: "內政部戶政司",
                  range: "2025 年底",
                },
              ].map((s, i) => (
                <div className="source-row" key={s.id}>
                  <span>0{i + 1}</span>
                  <div>
                    <h3>{s.name}</h3>
                    <p>
                      {s.agency}・{s.range}
                    </p>
                  </div>
                  <Source id={s.id}>原始資料</Source>
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
              <h3>閱讀之前，先知道這些事。</h3>
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
              <span className="caption">最後查核：{data.checkedAt}・資料不會自動即時更新</span>
            </div>
          </div>
        </section>
        <section className="closing">
          <div className="page-shell flex flex-wrap items-center justify-between gap-8">
            <div>
              <p className="eyebrow">THE STORY CONTINUES</p>
              <h2>
                讓每一份努力，
                <br />
                都能換來有尊嚴的生活。
              </h2>
            </div>
            <a href="https://www.mol.gov.tw/" target="_blank" rel="noreferrer">
              認識你的勞動權益
              <RiArrowRightLine size={23} />
            </a>
          </div>
        </section>
      </main>
      <footer className="page-shell site-footer">
        <Brand />
        <p>
          原作・Kalan　設計・Peter、Kalan
          <br />
          <span>保留原作字標與握拳插畫，重新整理資料與呈現。</span>
        </p>
        <a href="#top">回到頁首 ↑</a>
      </footer>
    </>
  );
}
