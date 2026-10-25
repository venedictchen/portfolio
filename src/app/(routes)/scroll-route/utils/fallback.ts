import type { Frame, Leg, Route } from "../types";

// Without scroll timelines, the bus and trail are placed from the scroll
// handler with these.

// Which bus shows at scroll y: 1 for the sticky one.
export function showing(shown: Route["shown"], y: number) {
  let sticky = shown[0][1];
  for (const [at, which] of shown) if (at <= y) sticky = which;
  return sticky;
}

// The bus's keyframes interpolated at scroll y: [x, y, heading].
export function along(frames: Frame[], y: number) {
  let i = 0;
  for (let step = 1 << 15; step; step >>= 1) if (i + step < frames.length && frames[i + step][0] <= y) i += step;
  const [a, b] = [frames[i], frames[Math.min(i + 1, frames.length - 1)]];
  const t = b[0] > a[0] ? Math.min(Math.max((y - a[0]) / (b[0] - a[0]), 0), 1) : 0;
  return [1, 2, 3].map((k) => a[k] + t * (b[k] - a[k]));
}

export function place(bus: HTMLElement, frames: Frame[], y: number) {
  const [x, busY, heading] = along(frames, y);
  bus.style.translate = `${x}px ${busY}px`;
  bus.style.rotate = `${heading}deg`;
}

// A pinned leg's sticky offset: on the leg, its leading end sits where the
// bus is on screen (screenY); off it, far enough either way to hold the leg
// all drawn or not at all.
export function pin(leg: Leg, at: number, screenY: number) {
  const down = leg.dy > 0;
  if (at <= leg.s) return down ? -1e5 : 1e5;
  if (at >= leg.s + leg.length) return down ? 1e5 : -1e5;
  return down ? screenY - (leg.length + 1) : screenY;
}
