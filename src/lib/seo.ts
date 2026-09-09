import { data } from "./data";

/** Absolute address of the deployment. Set VITE_SITE_URL for the host that serves the site. */
const url: string =
  import.meta.env.VITE_SITE_URL || "https://kjj6198.github.io/pround-of-labor/app/";

export const seo = {
  url,
  name: "勞工大代誌",
  englishName: "Taiwan Labor Observatory",
  title: "勞工大代誌｜台灣勞動統計與勞動事件紀錄",
  description:
    "整理 2012 至 2025 年台灣的薪資、工時、失業率、移工與人口統計，收錄罷工、職災與勞動法制事件的經過及資料來源。",
  image: `${url}og.jpg`,
  imageAlt: "勞工大代誌：在台灣工作，是什麼樣子？握拳插畫與年薪 120 萬元的薪資分布試算圖。",
  author: "Kalan",
  twitter: "@kalanyei",
  locale: "zh_TW",
  language: "zh-Hant-TW",
};

const authorId = `${url}#author`;
const websiteId = `${url}#website`;
const datasetId = `${url}#dataset`;
const sourcePages = [...new Set(data.sources.map((source) => source.page))];

export const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": authorId,
      name: seo.author,
      url: "https://x.com/kalanyei",
      sameAs: [
        "https://x.com/kalanyei",
        "https://www.threads.com/@kalan_jp_log",
        "https://github.com/kjj6198",
      ],
    },
    {
      "@type": "WebSite",
      "@id": websiteId,
      url: seo.url,
      name: seo.name,
      alternateName: seo.englishName,
      description: seo.description,
      inLanguage: seo.language,
      publisher: { "@id": authorId },
    },
    {
      "@type": "WebPage",
      "@id": seo.url,
      url: seo.url,
      name: seo.title,
      description: seo.description,
      isPartOf: { "@id": websiteId },
      about: { "@id": datasetId },
      inLanguage: seo.language,
      dateModified: data.checkedAt,
      primaryImageOfPage: { "@type": "ImageObject", url: seo.image },
    },
    {
      "@type": "Dataset",
      "@id": datasetId,
      name: "台灣勞動統計資料集 2012–2025",
      description:
        "行政院主計總處、勞動部、內政部戶政司公布的薪資、工時、失業率、最低工資、移工人數、出生與人口年齡結構年度統計，經整理為單一資料集。",
      url: seo.url,
      inLanguage: seo.language,
      creator: { "@id": authorId },
      dateModified: data.checkedAt,
      temporalCoverage: "2012/2025",
      spatialCoverage: { "@type": "Place", name: "臺灣" },
      keywords: ["台灣勞動統計", "經常性薪資", "工時", "失業率", "最低工資", "移工", "出生率"],
      isBasedOn: sourcePages,
      distribution: [
        {
          "@type": "DataDownload",
          encodingFormat: "text/csv",
          contentUrl: `${seo.url}data/labor.csv`,
        },
        {
          "@type": "DataDownload",
          encodingFormat: "application/json",
          contentUrl: `${seo.url}data/labor.json`,
        },
      ],
    },
  ],
};
