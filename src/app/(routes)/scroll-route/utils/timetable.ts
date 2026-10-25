import { AIM, BOTTOM, TOP } from "../constants";

// Keeps the bus near AIM, clamped between TOP and BOTTOM with lookahead so
// climbs can't leave the screen, and never faster than its pace. `ramps`
// replace the aim with linear stretches at the start of the road. From
// `land` the aim is a linear stretch from wherever the bus is to the bottom of
// the page (`last`) instead, so it eases down the screen and arrives as the page runs out.
export function timetable(
  ys: number[],
  pace: number[],
  ramps: { end: number; to: number }[],
  land: number,
  view: number,
  last: number
) {
  const scroll: number[] = [];
  const want = (y: number, i: number) => {
    let [from, start] = [0, 0];
    for (const ramp of ramps) {
      if (i < ramp.end) return from + ((i - start) / (ramp.end - start)) * (ramp.to - from);
      [from, start] = [ramp.to, ramp.end];
    }
    if (i > land) return scroll[land] + ((i - land) / (ys.length - 1 - land)) * (last - scroll[land]);
    return y - AIM * view;
  };
  const [top, bottom] = [TOP * view, BOTTOM * view];

  const lo: number[] = [];
  ys.forEach((y, i) => lo.push(Math.max(y - bottom, i ? lo[i - 1] + pace[i] : 0)));
  const hi: number[] = new Array(ys.length);
  for (let i = ys.length - 1; i >= 0; i--)
    hi[i] = Math.min(ys[i] - top, i < ys.length - 1 ? hi[i + 1] - pace[i + 1] : last);

  ys.forEach((y, i) => {
    const t = Math.min(Math.max(want(y, i), lo[i]), hi[i]);
    scroll.push(Math.round(Math.max(t, i ? scroll[i - 1] + pace[i] : 0) * 100) / 100);
  });
  return scroll;
}

// Eases the bus between stretches of different speed, which otherwise change
// in a step and read as a jolt: the road as a function of scroll, averaged
// over `spread` px of scroll either side, twice, so the speed ramps instead.
// The road's ends stay put, so the bus still arrives as the page runs out.
// roads: road at each sample.
export function ease(scroll: number[], roads: number[], spread: number) {
  const GRID = 2;
  const end = scroll.at(-1)!;
  const n = Math.ceil(end / GRID);
  const road: number[] = [];
  for (let k = 0, j = 0; k <= n; k++) {
    const at = Math.min(k * GRID, end);
    while (j + 2 < scroll.length && scroll[j + 1] <= at) j++;
    const t = scroll[j + 1] > scroll[j] ? (at - scroll[j]) / (scroll[j + 1] - scroll[j]) : 0;
    road.push(roads[j] + Math.min(Math.max(t, 0), 1) * (roads[j + 1] - roads[j]));
  }
  // Each point averaged with its neighbours up to w either side, fewer by
  // the ends so they keep their value.
  const average = (v: number[], w: number) => {
    const sums = [0];
    for (const x of v) sums.push(sums.at(-1)! + x);
    return v.map((_, k) => {
      const r = Math.min(w, k, v.length - 1 - k);
      return (sums[k + r + 1] - sums[k - r]) / (2 * r + 1);
    });
  };
  const w = Math.round(spread / GRID);
  const eased = average(average(road, w), w);
  return roads.map((at, i) => {
    if (i === roads.length - 1) return end;
    let k = 0;
    for (let step = 1 << 15; step; step >>= 1) if (k + step < n && eased[k + step] < at) k += step;
    const t = eased[k + 1] > eased[k] ? (at - eased[k]) / (eased[k + 1] - eased[k]) : 0;
    return Math.round(Math.min((k + t) * GRID, end) * 100) / 100;
  });
}
