# 勞工大代誌

台灣勞動資料專題，重新設計與實作的 2026 版。使用 React 19、TanStack Start、Tailwind CSS 4、Chart.js、Motion for React、Remix icons 與 Vite+。Nitro 提供開發與 Node 伺服器，TanStack Start 在建置時預先產生 HTML，亦可部署至靜態主機。

## 開發

Node.js 22.12 以上，建議 24。依賴以 `package-lock.json` 鎖定。

```sh
npm ci
npm run dev       # Vite+，http://localhost:3001
npm run check     # Vite+ 格式、lint、型別檢查
npm test          # Vite+ / Vitest 資料測試
npm run build    # Vite+ production build + prerender
npm run preview  # http://localhost:4173
```

已安裝全域 Vite+ CLI 時，亦可使用 `vp dev --port 3001`、`vp check`、`vp test run`、`vp build`。不需要全域安裝，npm scripts 會使用專案內鎖定的 Vite+。

瀏覽器驗證會操作真實 app，測試各指標、年度範圍切換、現行最低工資與出生率、移工類別、產業工時、CSV 下載、故事搜尋／原稿保留、彈窗鍵盤焦點／捲動／減少動態、axe 無障礙、手機選單與 375／768／1440px 排版。預設使用本機 Chromium，可用 `CHROMIUM_PATH` 指定執行檔。

```sh
node scripts/browser-check.mjs
TEST_URL=http://localhost:4173/ node scripts/browser-check.mjs
```

## 資料

查核日 **2026-09-08**。年度統計從 **2012 年**開始，完整年度至 **2025 年**。不提供月資料，不把 2026 年累計值當全年資料。現行最低工資獨立採 **2026-01-01 起月薪 29,500 元、時薪 196 元**；歷史圖表的 2025 年末標準仍為 28,590 元／190 元。

| 統計                 | 來源                                                                                                                                                   | 資料範圍                           |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------- |
| 經常性薪資           | [主計總處表 5](https://www.dgbas.gov.tw/News.aspx?_CSN=135&n=4437&sms=10980)、[主要勞動經濟指標](https://statdb.mol.gov.tw/html/mon/21010.htm)         | 平均數 2012–2025；中位數 2020–2025 |
| 工時                 | [主要勞動經濟指標](https://statdb.mol.gov.tw/html/mon/21010.htm)、主計總處表 10                                                                        | 全體 2012–2025；產業明細 2021–2025 |
| 失業率               | [勞動統計月報表 2-5](https://statdb.mol.gov.tw/html/mon/22050.htm)                                                                                     | 2012–2025 年平均                   |
| 最低工資、CPI 年增率 | [主要勞動經濟指標](https://statdb.mol.gov.tw/html/mon/21010.htm)、[最低工資公告](https://www.mol.gov.tw/1607/28162/28166/28180/70460/76761/76833/post) | 年度序列 2012–2025；現行標準 2026  |
| 移工人數             | [勞動統計月報表 12-3](https://statdb.mol.gov.tw/html/mon/212030.htm)                                                                                   | 2012–2025 年底                     |
| 戶籍人口年齡結構     | [內政部 2025 年 12 月戶口統計](https://www.moi.gov.tw/News_Content.aspx?n=9&s=335870&sms=9009)                                                         | 2025 年底                          |
| 出生人數、粗出生率   | [戶政司歷年出生統計下載](https://www.ris.gov.tw/info-popudata/app/awFastDownload/toMain_panel)「出生數及粗出生率」ODS                                  | 2012–2025，按登記日期              |

- `data/raw/` 保留官方原始檔，`data/sources.json` 保留網址、下載時間及 SHA-256。原始發布可能包含月資料，清理後只抽取完整年度。
- `data/clean.json` 是 app 使用的資料，`data/validation.json` 記錄檢核結果。
- `public/data/labor.csv` 與 `labor.json` 提供下載。CSV 的 `row`／`column` 為試算表 **1-based** 座標。未提供的值、座標留空；最低工資公告是 HTML，因此不設定假試算表座標。
- 薪資為工業及服務業全體受僱員工口徑，包含外國籍及部分工時員工，未做通膨調整。2012–2019 年平均數來自官方歷年指標；此版本的中位數表僅回溯至 2020 年，較早中位數以 `null`、`not-in-source` 保留，不能當零或自行插值。2019 年調查涵蓋產業擴增，長期比較需留意統計範圍。
- 工時是每一年度「每人每月總工時」的全年平均，單位為小時；不是一整年的工時總和。
- 最低工資年度值為年末標準，現行公告放在獨立 `currentMinimum` 中。CSV 以 `minimumPolicy`／`effective-date` 區分，年度圖表不混入未完成年份。
- 移工在臺總人數 = 有效聘僱許可 + 聘僱許可失效；國籍分類只涵蓋有效聘僱許可。每年驗證總數、產業別及國籍小計相符。
- 出生率採**全年粗出生率（‰）**，即全年出生登記人數除以年中人口乘 1,000；不是每位婦女平均生育子女數，也不是某月份折算年率。2025 年 107,812 人、4.62‰；2012 年登記數為 229,481 人，不能與按發生日期的 234,599 人混用。
- 人口分布是戶籍人口，不能解讀為就業人口分布。百分比以原始人數計算。

### 故事與原稿

`data/stories.json` 收錄 **31 則紀事**：原作 19 則與新增 12 則，近年更新範圍為 2018–2026；2018 事件已在原作中保留，新故事從 2019 年起延伸至 2026 年外送專法。

每則故事包含摘要、敘述、來源與查核日。原作故事另保存完整原文、原日期與圖片署名，在閱讀面板內可展開。`data/stories-original.json` 保留從舊版 CSV 取出的 19 筆原始記錄，只移除意外的控制字元。`public/data/stories.json` 為可下載的完整故事集，與編輯檔保持一致。

更正涵蓋乾草市場事件 1886/5/4、22K 方案 2009 年、復興航空 2016/11/22、國道事故 2018/4/23 等；無法確認的精確日期降為年份或期間，爭議主張與事實分開。原圖署名與網址保留於資料，卡面使用議題圖像，不冒充事件現場照片。

Motion 以卡片、封面、圖像和標題的 `layoutId` 連結展開／收合，支援長文捲動、Escape、背景點擊、焦點限制與回復、背景 inert、scroll lock。減少動態模式不啟用共享 layoutId，改用淡入淡出。

### 重建與更新

```sh
python -m venv .venv
.venv/bin/pip install -r scripts/requirements.txt
npm run data:build
npm test
```

`data:build` 完全離線且可重現。`data:fetch` 下載薪資列表中的最新 ODS、當期勞動統計月報，以及本次指定的人口與就業新聞稿。更新至新一期時，須同步更換人口／就業新聞稿 URL、查核日與發布值斷言，核對表頭及初步值後重建。這些斷言刻意避免新一期資料默默套入舊標示。

主計總處附件主機 `ws.dgbas.gov.tw` 在本次下載時有不完整 TLS 憑證鏈。抓取程式預設驗證 TLS；僅在重現此問題時，可明確傳入 `--allow-incomplete-dgbas-chain`，只略過該附件主機的驗證。原始檔的雜湊記錄用於版本重現，不代表獨立的來源簽章。

```sh
npm run data:fetch -- --allow-incomplete-dgbas-chain
npm run data:build
npm test
```

## 靜態部署

一般靜態主機可直接使用 `npm run build` 產生的 `.output/public/`。Node SSR 可執行 `node .output/server/index.mjs`。

GitHub Pages 原網址為 `/pround-of-labor/app/`。使用以下指令建置並整理至 `site/pround-of-labor/app/`，保留原網址。`.github/workflows/pages.yml` 只支援手動執行，不會在每次 push 自動發布。

```sh
npm run build:pages
python -m http.server 4174 --directory site
# 開啟 http://localhost:4174/pround-of-labor/app/
```

## 設計與原作

透過 Orca 檢視 `assault-vdata` 的實際頁面，參考其章節導覽、可互動統計、表格與來源說明。此版使用紙色底、深綠文字與朱紅重點，重新安排原作字標及握拳圖。

`public/brand/logo-1.svg` 至 `logo-5.svg` 與 `labor-hand.svg` 來自原作。第 3、4 字補上原檔缺少的 viewBox，路徑不變。字型為 LINE Seed TW，授權隨附於 `public/fonts/`。原始製作為 Kalan，設計為 Peter、Kalan。舊版程式及照片仍可在 Git 歷史找到；本版以新的年度資料取代過期統計，原作故事完整保留。舊 Webpack bundle 與第三方社群腳本不再載入。
