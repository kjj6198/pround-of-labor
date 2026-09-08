import { HeadContent, Scripts, Outlet, createRootRoute } from "@tanstack/react-router";
import stylesheet from "../styles.css?url";
const base = import.meta.env.BASE_URL;
export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "勞工大代誌｜工作，值得更好的日常" },
      {
        name: "description",
        content: "從薪資、工時到移工與高齡勞動，用最新官方統計，看見台灣工作的真實樣貌。",
      },
    ],
    links: [
      { rel: "stylesheet", href: stylesheet },
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
