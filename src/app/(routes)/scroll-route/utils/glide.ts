import type { Hold, Leg, Plan } from "../types";
import { split } from "./drive";

type Course = {
  legs: Leg[];
  steady: boolean[];
  roads: number[];
  scroll: number[];
  xs: number[];
  ys: number[];
  headings: number[];
  view: number;
  top: number; // where the route starts on the page
};

// Glide mode's plan (see useRouteGlide). The bus is held still on screen, as
// in drive mode, along each steady straight where the scroll timeline itself
// keeps it still: the longest run of the straight it rides at the scroll's
// own speed. Everywhere else it glides after the scroll's place along the
// road, so the plan keeps the road's places to glide through.
export function glide(c: Course): Plan {
  const { roads, scroll, ys } = c;
  const holds: Hold[] = [];
  c.legs.forEach((leg, i) => {
    if (!c.steady[i]) return;
    const first = roads.findIndex((at) => at >= leg.s);
    let [start, best, bestLength] = [-1, [0, 0], 0];
    for (let k = first; k + 1 < roads.length && roads[k + 1] <= leg.s + leg.length; k++) {
      const still = Math.abs(scroll[k + 1] - scroll[k] - (roads[k + 1] - roads[k])) <= 0.02;
      if (still && start < 0) start = k;
      if (still && roads[k + 1] - roads[start] > bestLength) [best, bestLength] = [[start, k + 1], roads[k + 1] - roads[start]];
      if (!still) start = -1;
    }
    if (bestLength < 0.3 * c.view) return;
    const [a, b] = best;
    holds.push({ from: roads[a], to: roads[b], top: ys[a], bottom: ys[b], start: scroll[a], end: scroll[b], x: leg.x, screen: ys[a] + c.top - scroll[a] });
  });
  return {
    kind: "glide",
    screen: 0,
    view: c.view,
    drives: [],
    holds,
    pieces: split(c.legs, [], holds),
    poses: { xs: c.xs, ys: c.ys, headings: c.headings },
  };
}
