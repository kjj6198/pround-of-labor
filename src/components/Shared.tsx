import type { ReactNode } from "react";
import { RiArrowRightUpLine, RiDownloadLine } from "@remixicon/react";
import { data } from "../lib/data";
export function Source({ id, children }: { id: string; children?: ReactNode }) {
  const source = data.sources.find((s) => s.id === id);
  return source ? (
    <a className="source-link" href={source.page} target="_blank" rel="noreferrer">
      {children ?? source.title}
      <RiArrowRightUpLine size={13} />
    </a>
  ) : null;
}
export function Chapter({
  number,
  english,
  title,
  description,
}: {
  number: string;
  english: string;
  title: string;
  description: string;
}) {
  return (
    <header className="chapter-heading">
      <div className="eyebrow">
        <span>{number}</span>
        {english}
      </div>
      <h2>{title}</h2>
      <p>{description}</p>
    </header>
  );
}
export function Table({
  headers,
  rows,
  caption,
}: {
  headers: string[];
  rows: (string | number)[][];
  caption: string;
}) {
  return (
    <details className="data-table">
      <summary>
        查看資料表 <span aria-hidden="true">＋</span>
      </summary>
      <div className="table-scroll" tabIndex={0} role="region" aria-label={caption}>
        <table>
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr>
              {headers.map((h) => (
                <th key={h} scope="col">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                {row.map((c, j) =>
                  j === 0 ? (
                    <th scope="row" key={j}>
                      {c}
                    </th>
                  ) : (
                    <td key={j}>{c}</td>
                  ),
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}
export function Download() {
  return (
    <a className="download-link" href={`${import.meta.env.BASE_URL}data/labor.csv`} download>
      <RiDownloadLine size={16} />
      下載資料 CSV
    </a>
  );
}
