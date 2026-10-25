import { STEP } from "../constants";
import type { Leg, Point, Route } from "../types";

// Rounds the corners of an axis-aligned polyline into an SVG path, sampling
// position, heading and pace every STEP along it.
export function trace(corners: Point[]) {
  // On whole pixels, which layout and drawing both hold exactly, so the
  // trail's boxes line up with the road under it.
  const grid = corners.map((p) => ({ ...p, x: Math.round(p.x), y: Math.round(p.y) }));
  // Corners closer together than their radii share the gap, so the road
  // never doubles back.
  const gap = (i: number, j: number) => Math.abs(grid[j].x - grid[i].x) + Math.abs(grid[j].y - grid[i].y);
  const ends = grid.length - 1;
  const points = grid.map((p, i) => {
    if (i === 0 || i === ends) return p;
    const r = Math.min(p.r, gap(i - 1, i) / (i > 1 ? 2 : 1), gap(i, i + 1) / (i < ends - 1 ? 2 : 1));
    return { ...p, r: Math.floor(r) };
  });
  const roads: number[] = [];
  const xs: number[] = [];
  const ys: number[] = [];
  const headings: number[] = []; // degrees, unwrapped so turns interpolate the short way
  const paces: number[] = [];
  const runs: { s: number; x: number; y: number }[] = [];
  const legs: Leg[] = [];
  let d = `M ${points[0].x} ${points[0].y}`;
  let heroEnd = "";
  let s = 0;
  let next = 0;
  // at(u): [x, y, heading in radians] u px along the leg
  const leg = (
    command: string,
    start: { x: number; y: number },
    [dx, dy]: number[],
    length: number,
    pace: number,
    at: (u: number) => number[],
    [r, nx, ny] = [0, 0, 0]
  ) => {
    legs.push({ s, length, ...start, dx, dy, r, nx, ny });
    d += command;
    for (; next <= s + length; next += STEP) {
      const [x, y, heading] = at(next - s);
      const degrees = (heading * 180) / Math.PI;
      const prev = headings.at(-1) ?? 0;
      roads.push(next);
      xs.push(x);
      ys.push(y);
      headings.push(degrees + 360 * Math.round((prev - degrees) / 360));
      paces.push(pace * STEP);
    }
    s += length;
  };

  for (let i = 0; i < points.length - 1; i++) {
    const [a, b, c] = [points[i], points[i + 1], points[i + 2]];
    const dx = Math.sign(b.x - a.x);
    const dy = Math.sign(b.y - a.y);
    const cutStart = i === 0 ? 0 : a.r;
    const cutEnd = c ? b.r : 0;
    const start = { x: a.x + dx * cutStart, y: a.y + dy * cutStart };
    const end = { x: b.x - dx * cutEnd, y: b.y - dy * cutEnd };
    const heading = Math.atan2(dy, dx);
    runs.push({ s, ...start });
    leg(
      ` L ${end.x} ${end.y}`,
      start,
      [dx, dy],
      Math.abs(b.x - a.x) + Math.abs(b.y - a.y) - cutStart - cutEnd,
      a.pace ?? (dy < 0 ? 0.06 : 0.25),
      (u) => [start.x + dx * u, start.y + dy * u, heading]
    );
    if (i === 0) heroEnd = `M ${end.x} ${end.y}`;
    if (!c) break;

    const nx = Math.sign(c.x - b.x);
    const ny = Math.sign(c.y - b.y);
    const r = b.r;
    const [cx, cy] = [end.x + nx * r, end.y + ny * r];
    leg(
      ` A ${r} ${r} 0 0 ${dx * ny - dy * nx > 0 ? 1 : 0} ${b.x + nx * r} ${b.y + ny * r}`,
      end,
      [dx, dy],
      (Math.PI * r) / 2,
      0.15,
      (u) => {
        const [cos, sin] = [Math.cos(u / r), Math.sin(u / r)];
        return [
          cx - nx * r * cos + dx * r * sin,
          cy - ny * r * cos + dy * r * sin,
          Math.atan2(dy * cos + ny * sin, dx * cos + nx * sin),
        ];
      },
      [r, nx, ny]
    );
  }
  // And the very end, past the last STEP.
  if (next - STEP < s) {
    roads.push(s);
    xs.push(points[ends].x);
    ys.push(points[ends].y);
    headings.push(headings.at(-1)!);
    paces.push(paces.at(-1)!);
  }
  return { road: heroEnd + d.slice(d.indexOf(" A ")), length: s, roads, xs, ys, headings, paces, runs, legs };
}

// How far along the road the bus is at scroll y.
export function roadAt({ roads, scroll, length }: Route, y: number) {
  if (y < scroll.at(-1)!) {
    let i = 0;
    for (let step = 1 << 15; step; step >>= 1)
      if (i + step < scroll.length && scroll[i + step] <= y) i += step;
    const j = Math.min(i + 1, scroll.length - 1);
    const between = j > i ? (y - scroll[i]) / (scroll[j] - scroll[i]) : 0;
    return Math.min(Math.max(roads[i] + between * (roads[j] - roads[i]), 0), length);
  }
  return length;
}
