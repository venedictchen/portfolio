 import { SLACK } from "../constants";
import type { Frame, Leg, Step } from "../types";

// Keyframes from samples taken at increasing scroll positions: the samples,
// less those that interpolating between their neighbours puts within
// tolerance in every series ([values, tolerance]).
function simplify(scroll: number[], series: [number[], number][]) {
  const keep = [0];
  for (let from = 0, to = 2; to < scroll.length; to++) {
    let fits = to - from < 256;
    for (let k = from + 1; fits && k < to; k++) {
      const t = (scroll[k] - scroll[from]) / (scroll[to] - scroll[from]);
      fits = series.every(([v, tolerance]) => Math.abs(v[from] + t * (v[to] - v[from]) - v[k]) <= tolerance);
    }
    if (!fits) {
      from = to - 1;
      keep.push(from);
    }
  }
  if (scroll.length > 1) keep.push(scroll.length - 1);
  return keep.map((i) => [scroll[i], ...series.map(([v]) => v[i])].map((v) => Math.round(v * 100) / 100));
}

export function keyframes(scroll: number[], xs: number[], ys: number[], headings: number[]) {
  const frames = simplify(scroll, [[xs, 0.25], [ys, 0.25], [headings, 0.5]]) as Frame[];
  if (frames[0][0] > 0) frames.unshift([0, ...frames[0].slice(1)] as Frame);
  return frames;
}

// The bus's keyframes in the sticky frame: its place on the page less the
// frame's, which rides with the scroll from `start` for `stuck` px. Between
// keyframes both change linearly, but for where the frame sticks and unsticks.
export function inFrame(frames: Frame[], start: number, stuck: number) {
  const ride = (at: number) => Math.min(Math.max(at - start, 0), stuck);
  const out: Frame[] = [];
  frames.forEach((frame, i) => {
    const prev = frames[i - 1];
    for (const kink of [start, start + stuck]) {
      if (!prev || kink <= prev[0] || kink >= frame[0]) continue;
      const t = (kink - prev[0]) / (frame[0] - prev[0]);
      out.push([kink, ...[1, 2, 3].map((k) => prev[k] + t * (frame[k] - prev[k]))] as Frame);
    }
    out.push(frame);
  });
  return out.map(([at, x, y, heading]): Frame => [at, x, Math.round((y - ride(at)) * 100) / 100, heading]);
}

// Each leg's keyframes, to within a quarter pixel: how much of it is drawn
// from the scroll where the bus reaches it to where it leaves.
export function reveals(legs: Leg[], roads: number[], scroll: number[]) {
  const scrollAt = (at: number) => {
    let i = 0;
    for (let step = 1 << 15; step; step >>= 1) if (i + step < roads.length && roads[i + step] <= at) i += step;
    const j = Math.min(i + 1, roads.length - 1);
    return roads[j] > roads[i] ? scroll[i] + ((at - roads[i]) / (roads[j] - roads[i])) * (scroll[j] - scroll[i]) : scroll[i];
  };
  return legs.map(({ s, length }) => {
    const points: Step[] = [[scrollAt(s), 0]];
    roads.forEach((at, k) => {
      if (at > s && at < s + length && scroll[k] > points.at(-1)![0]) points.push([scroll[k], at - s]);
    });
    const end = scrollAt(s + length);
    if (end > points.at(-1)![0]) points.push([end, length]);
    else points.at(-1)![1] = length;
    return simplify(points.map(([at]) => at), [[points.map(([, u]) => u), 0.25]]) as Step[];
  });
}

// A sliding leg's keyframes: where its bar's leading end sits in the sticky
// frame, which rides with the scroll from `top` for `stuck` px. On the leg
// it's on the bus, in that frame too, so the two are drawn together; off it
// it holds SLACK clear of the leg, so a frame drawn a little apart from the
// scroll still shows all of the leg or none.
export function slides(leg: Leg, steps: Step[], top: number, stuck: number) {
  const ride = (at: number) => Math.min(Math.max(at - top, 0), stuck);
  const [from, to, end] = [steps[0][0], steps.at(-1)![0], top + stuck];
  const tips: Step[] = [
    [0, -SLACK],
    [top, -SLACK],
    [from - 0.01, -SLACK],
    ...steps,
    // Unless the road ends with it, and the bus stays on its end.
    ...(to < end ? [[to + 0.01, leg.length + 1 + SLACK] as Step, [end, leg.length + 1 + SLACK] as Step] : []),
  ];
  return tips
    .filter(([at], i) => at >= 0 && tips.slice(0, i).every(([before]) => before < at))
    .map(([at, u]): Step => [at, Math.round((leg.y + u - ride(at)) * 100) / 100]);
}

// Legs down the page along which the bus all but holds still on screen
// (screenY: its place on screen at each sample), for long enough to be worth
// riding the sticky frame. Where the route turns quickly (the hero, the photo
// lap) the bus moves on screen, and swapping between a late page bus and the
// sticky one would jump by however late it is.
export function steadyLegs(legs: Leg[], roads: number[], scroll: number[], screenY: number[]) {
  return legs.map((leg) => {
    if (leg.r || leg.dx) return false;
    let [moved, span] = [0, 0];
    for (let k = 1; k < roads.length; k++) {
      if (roads[k - 1] < leg.s || roads[k] > leg.s + leg.length) continue;
      moved += Math.abs(screenY[k] - screenY[k - 1]);
      span += scroll[k] - scroll[k - 1];
    }
    return span >= 120 && moved <= 0.3 * span;
  });
}
