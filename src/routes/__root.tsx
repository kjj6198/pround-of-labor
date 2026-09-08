import { HeadContent, Scripts, Outlet, createRootRoute } from "@tanstack/react-router";
import stylesheet from "../styles.css?url";
import { seo, structuredData } from "../lib/seo";
const base = import.meta.env.BASE_URL;
const jsonLd = JSON.stringify(structuredData).replaceAll("<", "\\u003c");
export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: seo.title },
      { name: "description", content: seo.description },
      { name: "author", content: seo.author },
      { name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1" },
      { name: "theme-color", content: "oklch(0.966 0.015 94.198)" },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: seo.name },
      { property: "og:locale", content: seo.locale },
      { property: "og:url", content: seo.url },
      { property: "og:title", content: seo.title },
      { property: "og:description", content: seo.description },
      { property: "og:image", content: seo.image },
      { property: "og:image:type", content: "image/png" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: seo.imageAlt },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: seo.twitter },
      { name: "twitter:creator", content: seo.twitter },
      { name: "twitter:title", content: seo.title },
      { name: "twitter:description", content: seo.description },
      { name: "twitter:image", content: seo.image },
      { name: "twitter:image:alt", content: seo.imageAlt },
    ],
    links: [
      { rel: "stylesheet", href: stylesheet },
      { rel: "canonical", href: seo.url },
      { rel: "icon", href: `${base}brand/labor-hand.svg`, type: "image/svg+xml" },
      {
        rel: "preload",
        href: `${base}fonts/LINESeedTW-Regular.woff2`,
        as: "font",
        type: "font/woff2",
        crossOrigin: "anonymous",
      },
    ],
  }),
  component: () => (
    <html lang="zh-Hant-TW">
      <head>
        <HeadContent />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      </head>
      <body>
        <Outlet />
        <Scripts />
      </body>
    </html>
  ),
  notFoundComponent: () => (
    <main className="page-shell py-24">
      <h1 className="text-4xl font-bold">找不到這一頁</h1>
      <a className="text-link" href={base}>
        回到勞工大代誌
      </a>
    </main>
  ),
  errorComponent: ({ reset }) => (
    <main className="page-shell py-24">
      <h1 className="text-4xl font-bold">頁面暫時無法顯示</h1>
      <button className="button" onClick={reset}>
        重新載入
      </button>
    </main>
  ),
});
