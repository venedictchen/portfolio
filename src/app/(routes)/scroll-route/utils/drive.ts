import { AIM } from "../constants";
import type { Drive, Hold, Leg, Piece, Plan, Pose } from "../types";
import { reveal } from "./animations";
import { simplify } from "./keyframes";

// Road px per ms the bus averages when it drives by itself.
const SPEED = 1.1;
// px of scroll a drive's trigger holds either side, so it can't flicker.
const HYSTERESIS = 24;

// A drive's share of its road covered at share t of its time: eased in and out.
export const ease = (t: number) => (1 - Math.cos(Math.PI * t)) / 2;

type Course = {
  legs: Leg[];
  roads: number[];
  xs: number[];
  ys: number[];
  headings: number[];
  lap: [number, number]; // where the photo lap starts and ends along the road
  view: number;
  top: number; // where the route starts on the page
  last: number; // the furthest the page is sure to scroll
  length: number;
};

// The bus's place at road p.
function pose({ roads, xs, ys, headings }: Course, p: number): Pose {
  let i = 0;
  for (let step = 1 << 15; step; step >>= 1) if (i + step < roads.length && roads[i + step] <= p) i += step;
  const j = Math.min(i + 1, roads.length - 1);
  const t = roads[j] > roads[i] ? Math.min(Math.max((p - roads[i]) / (roads[j] - roads[i]), 0), 1) : 0;
  return [xs[i] + t * (xs[j] - xs[i]), ys[i] + t * (ys[j] - ys[i]), headings[i] + t * (headings[j] - headings[i])];
}

// u0 to u1 px along a straight, as a leg of its own.
const part = (leg: Leg, u0: number, u1: number): Leg =>
  leg.r ? leg : { ...leg, s: leg.s + u0, length: u1 - u0, x: leg.x + leg.dx * u0, y: leg.y + leg.dy * u0 };

type Stretch = { from: number; to: number; forward: number; hold?: number };

const ridable = (c: Course, leg: Leg) =>
  !leg.r && !leg.dx && leg.dy > 0 && leg.s >= c.lap[1] - 0.01 && leg.length >= 0.5 * c.view;

// Lays the road out into drives and holds. The bus is held at AIM on screen
// along straights down the page after the lap, long enough to be worth it,
// and drives the rest. Each drive sets off once its lowest point is 90% down
// the screen, so the bus stays in view while it drives; it drops down the
// straight it ends in far enough to reach AIM after a quarter screen more of
// scroll, giving it time to get there first. The drive into the lap ends
// where the lap starts, so the lap plays once the photo is on screen, and a
// drive that would no longer fit on screen stops short and waits.
function layout(c: Course) {
  const { roads, ys, view, top, last } = c;
  const screen = AIM * view;
  const wait = 0.12 * view; // scroll the bus stays at a hold's end before driving on
  const lastHold = last - 0.05 * view - wait;
  const stretches: Stretch[] = [];
  const holds: Hold[] = [];
  let from = 0;
  let earliest = 2 * HYSTERESIS;
  let [high, low] = [ys[0], ys[0]];
  let next = 0;
  // Takes the road up to `to` into the drive being laid out.
  const reach = (to: number) => {
    for (; next < roads.length && roads[next] <= to; next++) [high, low] = [Math.min(high, ys[next]), Math.max(low, ys[next])];
  };
  const due = () => Math.max(earliest, low + top - 0.9 * view);
  const cut = (to: number, forward: number, hold?: number) => {
    stretches.push({ from, to, forward, hold });
    from = to;
    earliest = forward + HYSTERESIS;
    const y = pose(c, to)[1];
    [high, low] = [y, y];
  };
  // Holds the bus along a straight if there's enough of it left once the
  // drive has dropped down it.
  const holdOn = (leg: Leg) => {
    reach(leg.s);
    const forward = Math.max(due(), leg.y + top - 0.85 * view);
    const joins = Math.max(leg.y, forward - top + 0.85 * view);
    const leaves = Math.min(leg.y + leg.length, lastHold - top + screen);
    if (leaves - joins < 0.25 * view) return false;
    const at = leg.s + joins - leg.y;
    reach(at);
    cut(at, forward, holds.length);
    const held = { from: at, to: leg.s + leaves - leg.y, top: joins, bottom: leaves, start: joins + top - screen, end: leaves + top - screen, x: leg.x };
    holds.push(held);
    from = held.to;
    earliest = held.end + wait;
    while (next < roads.length && roads[next] < from) next++;
    [high, low] = [leaves, leaves];
    reach(leg.s + leg.length);
    return true;
  };
  // Stops the drive short of a leg that would no longer let it fit on screen.
  const fit = (leg: Leg) => {
    const inLap = leg.s >= c.lap[0] - 0.01 && leg.s < c.lap[1] - 0.01;
    if (from >= leg.s || inLap) return;
    let [legHigh, legLow] = [high, low];
    for (let k = next; k < roads.length && roads[k] <= leg.s + leg.length; k++) [legHigh, legLow] = [Math.min(legHigh, ys[k]), Math.max(legLow, ys[k])];
    if (legLow - legHigh <= 0.75 * view) return;
    reach(leg.s);
    cut(leg.s, due());
  };

  for (const leg of c.legs) {
    if (leg.length <= 0) continue;
    if (from < c.lap[0] && leg.s >= c.lap[0] - 0.01) {
      reach(leg.s);
      cut(leg.s, due());
    }
    if (ridable(c, leg) && holdOn(leg)) continue;
    fit(leg);
    reach(leg.s + leg.length);
  }
  cut(c.length, due());
  return { stretches, holds };
}

// The trail's pieces: each leg, split where holds start and end.
function split(legs: Leg[], stretches: Stretch[], holds: Hold[]) {
  const pieces: Piece[] = [];
  for (const leg of legs) {
    if (leg.length <= 0) continue;
    const end = leg.s + leg.length;
    const cuts = [leg.s, ...holds.flatMap((h) => [h.from, h.to]).filter((at) => at > leg.s + 0.01 && at < end - 0.01), end];
    cuts.sort((a, b) => a - b);
    for (let k = 0; k + 1 < cuts.length; k++) {
      const [a, b] = [cuts[k], cuts[k + 1]];
      const hold = holds.findIndex((h) => a >= h.from - 0.01 && b <= h.to + 0.01);
      if (hold >= 0) pieces.push({ leg: part(leg, a - leg.s, b - leg.s), hold });
      else pieces.push({ leg: part(leg, a - leg.s, b - leg.s), drive: stretches.findIndex((d) => (a + b) / 2 < d.to) });
    }
  }
  return pieces;
}

// Drive i's timing and keyframes: the bus along it, eased in and out, and
// each piece of trail along it drawn up to the bus.
function drive(c: Course, d: Stretch, i: number, pieces: Piece[]): Drive {
  const duration = Math.round(Math.min(Math.max((d.to - d.from) / SPEED, 450), 2600));
  const n = Math.max(2, Math.ceil(duration / 8));
  const [times, at, xs, ys, headings] = [[], [], [], [], []] as number[][];
  for (let k = 0; k <= n; k++) {
    const p = d.from + (d.to - d.from) * ease(k / n);
    const [x, y, heading] = pose(c, p);
    times.push((k / n) * duration);
    at.push(p);
    xs.push(x);
    ys.push(y);
    headings.push(heading);
  }
  const bus = simplify(times, [[xs, 0.25], [ys, 0.25], [headings, 0.5]]).map(([t, x, y, heading]): Keyframe => ({
    offset: Math.min(t / duration, 1),
    translate: `${x}px ${y}px`,
    rotate: `${heading}deg`,
  }));
  const parts = pieces.flatMap((piece, j): Drive["pieces"] => {
    if (piece.drive !== i) return [];
    const u = at.map((p) => Math.min(Math.max(p - piece.leg.s, 0), piece.leg.length));
    // Exactly, so a piece behind the bus is all drawn and one ahead of it none.
    const keys = simplify(times, [[u, 0.01]]).map(([t, v]): Keyframe => {
      const [property, value] = reveal(piece.leg, v);
      return { offset: Math.min(t / duration, 1), [property]: value };
    });
    return [[j, keys]];
  });
  return { ...d, back: d.forward - HYSTERESIS, duration, start: pose(c, d.from), end: pose(c, d.to), bus, pieces: parts };
}

export function plan(c: Course): Plan {
  const { stretches, holds } = layout(c);
  const pieces = split(c.legs, stretches, holds);
  const drives = stretches.map((d, i) => drive(c, d, i, pieces));
  return { screen: AIM * c.view, view: c.view, drives, holds, pieces };
}
