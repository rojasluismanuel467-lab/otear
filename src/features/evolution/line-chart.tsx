"use client";

import { useEffect, useRef, useState } from "react";
import { formatDate } from "@/lib/format";
import styles from "./line-chart.module.css";

export interface ChartSeries {
  id: string;
  name: string;
  color: string;
  points: { date: string; value: number }[];
  dashed?: boolean;
}

const HEIGHT = 240;
const COMPACT_HEIGHT = 150;
const PAD = { top: 14, right: 26, bottom: 40, left: 46 };
/** Minimum distance between two date labels so they never touch. */
const MIN_LABEL_GAP = 60;
const DAY_MS = 86_400_000;
const time = (date: string) => new Date(`${date}T12:00:00`).getTime();

/**
 * Plain SVG line chart measured in real pixels, so axis text keeps its size.
 * The same numbers are available as a table for screen readers.
 */
export function LineChart({
  label,
  series,
  xDomain,
  yDomain,
  cursor,
  format,
  highlightId,
  tickCount = 4,
  compact = false,
}: {
  label: string;
  series: ChartSeries[];
  xDomain: [string, string];
  yDomain: [number, number];
  cursor?: string;
  format: (value: number) => string;
  highlightId?: string;
  /** Number of gaps between horizontal grid lines. */
  tickCount?: number;
  /** Shorter chart without legend, for small panels. */
  compact?: boolean;
}) {
  const box = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(640);

  useEffect(() => {
    const node = box.current;
    if (!node) return;
    const observer = new ResizeObserver(([entry]) =>
      setWidth(Math.max(280, Math.round(entry.contentRect.width))),
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const height = compact ? COMPACT_HEIGHT : HEIGHT;
  const [x0, x1] = [
    time(xDomain[0]),
    Math.max(time(xDomain[1]), time(xDomain[0]) + DAY_MS),
  ];
  const [y0, y1] = yDomain;
  const inner = {
    w: width - PAD.left - PAD.right,
    h: height - PAD.top - PAD.bottom,
  };
  const x = (date: string) =>
    PAD.left + ((time(date) - x0) / (x1 - x0)) * inner.w;
  const y = (value: number) =>
    PAD.top + (1 - (value - y0) / (y1 - y0)) * inner.h;
  const ticks = Array.from(
    { length: tickCount + 1 },
    (_, i) => y0 + ((y1 - y0) * i) / tickCount,
  );
  const dates = [
    ...new Set(series.flatMap((item) => item.points.map((p) => p.date))),
  ].sort();
  const axisDates = pickAxisDates(
    [...new Set([xDomain[0], xDomain[1], ...dates])].sort(),
    x,
  );

  return (
    <figure className={styles.figure}>
      <div ref={box} className={styles.box}>
        <svg
          width={width}
          height={height}
          role="img"
          aria-label={`${label}. Los mismos datos están en la tabla que sigue.`}
        >
          {ticks.map((tick) => (
            <g key={tick}>
              <line
                x1={PAD.left}
                x2={width - PAD.right}
                y1={y(tick)}
                y2={y(tick)}
                className={styles.grid}
              />
              <text
                x={PAD.left - 8}
                y={y(tick) + 4}
                textAnchor="end"
                className={styles.tick}
              >
                {format(tick)}
              </text>
            </g>
          ))}
          {axisDates.map((date, i) => {
            const year = date.slice(0, 4);
            const showYear = i === 0 || year !== axisDates[i - 1].slice(0, 4);
            return (
              <text
                key={date}
                x={x(date)}
                y={height - (showYear ? 22 : 8)}
                textAnchor="middle"
                className={styles.tick}
              >
                {formatDate(date, { day: "numeric", month: "short" }).replace(
                  / de /g,
                  " ",
                )}
                {showYear && (
                  <tspan x={x(date)} dy={15} className={styles.tickYear}>
                    {year}
                  </tspan>
                )}
              </text>
            );
          })}
          {cursor && (
            <line
              x1={x(cursor)}
              x2={x(cursor)}
              y1={PAD.top}
              y2={PAD.top + inner.h}
              className={styles.cursor}
            />
          )}
          {series.map((item) => {
            if (!item.points.length) return null;
            const faded = highlightId && highlightId !== item.id;
            const path = item.points
              .map(
                (p, i) =>
                  `${i ? "L" : "M"}${x(p.date).toFixed(1)} ${y(p.value).toFixed(1)}`,
              )
              .join(" ");
            return (
              <g key={item.id} opacity={faded ? 0.28 : 1}>
                <path
                  d={path}
                  fill="none"
                  stroke={item.color}
                  strokeWidth={item.dashed ? 2 : 3}
                  strokeDasharray={item.dashed ? "6 6" : undefined}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {!item.dashed &&
                  item.points.map((p) => (
                    <circle
                      key={p.date}
                      cx={x(p.date)}
                      cy={y(p.value)}
                      r={p.date === cursor ? 5.5 : 3.5}
                      fill="#fff"
                      stroke={item.color}
                      strokeWidth={2.5}
                    />
                  ))}
              </g>
            );
          })}
        </svg>
      </div>
      {!compact && (
        <ul className={styles.legend}>
          {series.map((item) => (
            <li key={item.id}>
              <span
                aria-hidden="true"
                className={item.dashed ? styles.swatchDashed : styles.swatch}
                style={{ "--swatch": item.color } as React.CSSProperties}
              />
              {item.name}
            </li>
          ))}
        </ul>
      )}
      <div className={styles.srOnly}>
        <table>
          <caption>{label}</caption>
          <thead>
            <tr>
              <th scope="col">Fecha</th>
              {series.map((item) => (
                <th key={item.id} scope="col">
                  {item.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dates.map((date) => (
              <tr key={date}>
                <th scope="row">{formatDate(date)}</th>
                {series.map((item) => {
                  const point = item.points.find((p) => p.date === date);
                  return (
                    <td key={item.id}>{point ? format(point.value) : "—"}</td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  );
}

/**
 * Dates that get a label: left to right, keeping the first and last, and
 * dropping any whose neighbour is closer than MIN_LABEL_GAP pixels.
 */
function pickAxisDates(dates: string[], x: (date: string) => number) {
  if (dates.length <= 2) return dates;
  const last = dates[dates.length - 1];
  const kept = [dates[0]];
  for (const date of dates.slice(1, -1)) {
    if (
      x(date) - x(kept[kept.length - 1]) >= MIN_LABEL_GAP &&
      x(last) - x(date) >= MIN_LABEL_GAP
    ) {
      kept.push(date);
    }
  }
  kept.push(last);
  return kept;
}
