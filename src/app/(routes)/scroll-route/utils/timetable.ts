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
