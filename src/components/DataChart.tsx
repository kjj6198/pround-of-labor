import { useEffect, useRef, useState } from "react";
import type { Chart, ChartConfiguration } from "chart.js";

export type Series = { label: string; values: (number | null)[]; color: string; dashed?: boolean };
export function DataChart({
  labels,
  series,
  unit,
  kind = "line",
  label,
}: {
  labels: string[];
  series: Series[];
  unit: string;
  kind?: "line" | "bar";
  label: string;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let chart: Chart | undefined;
    let disposed = false;
    import("chart.js")
      .then(
        ({
          Chart,
          LineController,
          LineElement,
          PointElement,
          BarController,
          BarElement,
          CategoryScale,
          LinearScale,
          Tooltip,
          Legend,
        }) => {
          if (disposed || !canvas.current) return;
          Chart.register(
            LineController,
            LineElement,
            PointElement,
            BarController,
            BarElement,
            CategoryScale,
            LinearScale,
            Tooltip,
            Legend,
          );
          const config: ChartConfiguration = {
            type: kind,
            data: {
              labels,
              datasets: series.map((s) => ({
                label: s.label,
                data: s.values,
                borderColor: s.color,
                backgroundColor: s.color,
                borderWidth: kind === "bar" ? 0 : 2.5,
                borderDash: s.dashed ? [5, 5] : [],
                pointRadius: labels.length > 20 ? 0 : 3,
                pointHoverRadius: 6,
                tension: 0.15,
                maxBarThickness: 35,
              })),
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              animation: false,
              interaction: { mode: "index", intersect: false },
              plugins: {
                legend: { display: false },
                tooltip: {
                  backgroundColor: "oklch(0.286 0.008 128.764)",
                  padding: 12,
                  callbacks: {
                    label: (c) =>
                      `${c.dataset.label}：${c.parsed.y?.toLocaleString("zh-TW")} ${unit}`,
                  },
                },
              },
              scales: {
                x: {
                  grid: { display: false },
                  border: { display: false },
                  ticks: {
                    color: "oklch(0.51 0.012 112.616)",
                    maxTicksLimit: 7,
                    font: { family: "Space Grotesk", size: 11 },
                    maxRotation: 0,
                  },
                },
                y: {
                  beginAtZero: kind === "bar",
                  border: { display: false },
                  grid: { color: "oklch(0.891 0.015 94.215)" },
                  ticks: {
                    color: "oklch(0.51 0.012 112.616)",
                    font: { family: "Space Grotesk", size: 11 },
                    maxTicksLimit: 5,
                    callback: (v) => Number(v).toLocaleString("zh-TW"),
                  },
                },
              },
            },
          };
          chart = new Chart(canvas.current, config);
        },
      )
      .catch(() => {
        if (!disposed) setFailed(true);
      });
    return () => {
      disposed = true;
      chart?.destroy();
    };
  }, [labels, series, unit, kind]);
  return (
    <>
      <div className="chart-legend">
        {series.map((s) => (
          <span key={s.label}>
            <i style={{ backgroundColor: s.color }} />
            {s.label}
          </span>
        ))}
        <span className="ml-auto">單位：{unit}</span>
      </div>
      <div className="chart-frame">
        <canvas ref={canvas} role="img" aria-label={label} />
        {failed ? <p>圖表無法載入，請展開下方資料表。</p> : null}
      </div>
    </>
  );
}
