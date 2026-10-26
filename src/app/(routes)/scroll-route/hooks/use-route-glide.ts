import { useEffect, type RefObject } from "react";
import type { Leg, Route } from "../types";
import { reveal } from "../utils/animations";
import { pose } from "../utils/drive";
import { roadAt } from "../utils/road";

// The bus follows the scroll smoothed in two stages, each LAG ms behind the
// one before: critically damped, so it eases along with its speed changing
// smoothly and never runs past where the scroll has got to.
const LAG = 35;
// Each glide is planned ahead on a forecast of the scroll, its speed dying
// away over TAU ms, and planned again once the scroll strays TOL px from it
// (at most every GAP ms), or soon after if the forecast runs AHEAD px past
// it (at most every SOONEST ms).
const TAU = 250;
const TOL = 5;
const GAP = 100;
const AHEAD = 1;
const SOONEST = 30;
// ms of scroll its speed is measured over
const WINDOW = 70;

// A glide: from `start`, on the forecast from scroll y at speed v, the two
// stages a ms at a time, and the road it ends at.
type Glide = { start: number; y: number; v: number; s1: number[]; s2: number[]; to: number; animations: Animation[] };
type Free = { leg: Leg; el: HTMLElement; hold?: number };

// When to put keyframes along a glide's road, given a ms at a time: far
// enough apart for straight lines between them to keep within 0.2px of it
// (6px at most round corners, which they'd cut), and either side of where it
// crosses an edge of a piece of trail, so each starts and stops exactly.
function keyTimes(road: number[], corners: [number, number][], edges: number[]) {
  const times = [0];
  let t = 0;
  const fits = (e: number) => {
    const [a, b] = [road[t], road[e]];
    const [lo, hi] = [Math.min(a, b), Math.max(a, b)];
    if (e - t > 48 || edges.some((s) => s > lo && s < hi)) return false;
    if (hi - lo > 6 && corners.some(([c0, c1]) => lo < c1 && hi > c0)) return false;
    for (let i = t + 1; i < e; i++) if (Math.abs(road[i] - a - ((b - a) * (i - t)) / (e - t)) > 0.2) return false;
    return true;
  };
  for (let e = 1; e < road.length; e++) {
    if (fits(e)) continue;
    if (e - 1 > t) times.push((t = e - 1));
    if (!fits(e)) times.push((t = e));
  }
  if (times.at(-1) !== road.length - 1) times.push(road.length - 1);
  return times;
}

// Glide mode (?route=glide): held still on screen along the long straights
// as in drive mode, natively; everywhere else the bus glides after the
// scroll in timed animations planned ahead, each taking over from the one
// before at the same place and speed. Nothing is changed while one runs, so
// WebKit only ever plays plain timed animations. Safari plays those at 60fps
// even on a 120Hz screen, beside the page scrolling at 120, so the gliding
// bus swaps for the held one as soon as it reaches a straight the scroll is
// on, easing into place from where and how fast it was going.
export function useRouteGlide(ref: RefObject<HTMLElement | null>, route: Route | null) {
  useEffect(() => {
    const overlay = ref.current;
    const plan = route?.drive;
    const bus = overlay?.querySelector<HTMLElement>('.scroll-bus[data-frame="drive"]');
    if (!route || !overlay || plan?.kind !== "glide" || !plan.poses || !bus) return;
    const { holds, pieces } = plan;
    const course = { roads: route.roads, ...plan.poses };
    const held = holds.map((_, k) => overlay.querySelector<HTMLElement>(`[data-hold="${k}"]`)!);
    const trail = new Map(Array.from(overlay.querySelectorAll<HTMLElement>("[data-leg]"), (el) => [el.dataset.leg!, el]));
    const slides = holds.map((_, k) => trail.get(String(pieces.findIndex((piece) => piece.hold === k)))!);
    const clips = slides.map((slide) => slide.closest<HTMLElement>(".trail-clip")!);
    // The trail on the page: the pieces between the holds, and a plain copy
    // of each hold's piece, drawn while the bus isn't held along it.
    const free: Free[] = pieces.flatMap((piece, j): Free[] => {
      if (piece.hold === undefined) return [{ leg: piece.leg, el: trail.get(String(j))! }];
      return [{ leg: piece.leg, el: trail.get(`past-${piece.hold}`)!, hold: piece.hold }];
    });
    const years = document.querySelectorAll(".route-pin");
    const pins = overlay.querySelectorAll(".scroll-stop");
    const jobs = document.querySelectorAll("#experience ol > li");
    const stops = [...route.jobs, ...route.stops];
    const [first, last] = [route.scroll[0], route.scroll.at(-1)!];
    const within = (y: number) => Math.min(Math.max(y, first), last);
    const forecast = (y: number, v: number, d: number) => within(y + v * TAU * (1 - Math.exp(-d / TAU)));
    const k = 1 - Math.exp(-1 / LAG);
    const corners = route.legs.filter((leg) => leg.r).map((leg): [number, number] => [leg.s, leg.s + leg.length]);
    const edges = free.flatMap(({ leg }) => [leg.s, leg.s + leg.length]);

    let [s1, s2] = [within(window.scrollY), within(window.scrollY)]; // the two stages, while at rest
    let glide: Glide | null = null;
    let planned = -Infinity;
    let here = -1; // the hold it's held along, if any
    let sliding: Animation[] = []; // the held bus and its trail easing into place
    let shown: HTMLElement | undefined;
    let frame = 0;
    let moved = -Infinity;
    const samples: [number, number][] = [];
    const drawn = new Map<HTMLElement, string>();

    const show = (el: HTMLElement) => {
      if (el === shown) return;
      if (shown) delete shown.dataset.show;
      el.dataset.show = "";
      shown = el;
    };
    const paint = (el: HTMLElement, leg: Leg, u: number) => {
      const [property, value] = reveal(leg, u);
      if (drawn.get(el) === value) return;
      drawn.set(el, value);
      el.style.setProperty(property, value);
    };
    // The bus and the trail as styles, at road `at`.
    const rest = (at: number) => {
      const [x, y, heading] = pose(course, at);
      bus.style.translate = `${x}px ${y}px`;
      bus.style.rotate = `${heading}deg`;
      for (const { leg, el, hold } of free) if (hold !== here) paint(el, leg, Math.min(Math.max(at - leg.s, 0), leg.length));
    };
    // Along the hold it's held on, the trail rides with the held bus.
    const mark = () =>
      holds.forEach((_, j) => {
        clips[j].toggleAttribute("data-on", j === here);
        const copy = free.find((piece) => piece.hold === j)!;
        if (j === here) paint(copy.el, copy.leg, 0);
      });
    // The two stages at `now` along a glide.
    const state = (g: Glide, now: number) => {
      const d = Math.min(Math.max(now - g.start, 0), g.s2.length - 1);
      const i = Math.floor(d);
      const j = Math.min(i + 1, g.s2.length - 1);
      const f = d - i;
      return [g.s1[i] + f * (g.s1[j] - g.s1[i]), g.s2[i] + f * (g.s2[j] - g.s2[i])];
    };
    const stop = (now: number) => {
      if (!glide) return;
      [s1, s2] = state(glide, now);
      rest(roadAt(route, s2));
      glide.animations.forEach((animation) => animation.cancel());
      glide = null;
    };

    // From where the bus is at `now`, its glide on the forecast from scroll
    // y at speed v until it comes to rest: keyframes every 8ms, or 6px of
    // road, for the bus and each piece of trail it passes.
    const start = (now: number, y: number, v: number) => {
      if (glide) [s1, s2] = state(glide, now);
      const a1 = [s1];
      const a2 = [s2];
      let [x1, x2] = [s1, s2];
      for (let d = 1; d < 4000; d++) {
        const to = forecast(y, v, d);
        x1 += (to - x1) * k;
        x2 += (x1 - x2) * k;
        a1.push(x1);
        a2.push(x2);
        if (Math.abs(x1 - to) < 0.02 && Math.abs(x2 - to) < 0.02 && Math.abs(forecast(y, v, d + 1) - to) < 0.001) break;
      }
      const road = a2.map((s) => roadAt(route, s));
      const duration = road.length - 1;
      stop(now);
      [s1, s2] = [a1.at(-1)!, a2.at(-1)!];
      planned = now;
      if (duration < 1) return rest(road[0]);
      const times = keyTimes(road, corners, edges);
      const timing: KeyframeAnimationOptions = { duration, fill: "forwards" };
      const animations = [
        bus.animate(
          times.map((d) => {
            const [x, y, heading] = pose(course, road[d]);
            return { offset: d / duration, translate: `${x.toFixed(2)}px ${y.toFixed(2)}px`, rotate: `${heading.toFixed(2)}deg` };
          }),
          timing
        ),
      ];
      const [lo, hi] = [Math.min(...road), Math.max(...road)];
      for (const { leg, el } of free) {
        if (leg.s + leg.length <= lo || leg.s >= hi) continue;
        // Only either side of a step that runs over it: it's still otherwise.
        const over = (a: number, b: number) =>
          Math.min(road[a], road[b]) < leg.s + leg.length + 0.01 && Math.max(road[a], road[b]) > leg.s - 0.01;
        const keys = times.flatMap((d, i) => {
          if (i > 0 && i < times.length - 1 && !over(times[i - 1], d) && !over(d, times[i + 1])) return [];
          const [property, value] = reveal(leg, Math.min(Math.max(road[d] - leg.s, 0), leg.length));
          return [{ offset: d / duration, [property]: value }];
        });
        animations.push(el.animate(keys, timing));
      }
      for (const animation of animations) animation.startTime = now;
      glide = { start: now, y, v, s1: a1, s2: a2, to: road.at(-1)!, animations };
    };

    // The scroll's speed: the slope through its last WINDOW ms.
    const speed = () => {
      if (samples.length < 2) return 0;
      const n = samples.length;
      const [mt, my] = samples.reduce(([a, b], [t, y]) => [a + t / n, b + y / n], [0, 0]);
      let [num, den] = [0, 0];
      for (const [t, y] of samples) {
        num += (t - mt) * (y - my);
        den += (t - mt) ** 2;
      }
      return den ? num / den : 0;
    };
    const light = (at: number, resting: boolean) => {
      route.years.forEach((year, i) => years[i]?.toggleAttribute("data-lit", at >= year));
      stops.forEach((stop, i) => pins[i]?.toggleAttribute("data-lit", at >= stop.at));
      route.jobs.forEach((job, i) => jobs[i]?.toggleAttribute("data-reached", at >= job.at - route.lead));
      const arrived = at >= route.length - 1;
      if (arrived || (resting && overlay.dataset.arrived !== undefined)) overlay.toggleAttribute("data-arrived", arrived);
      overlay.toggleAttribute("data-left", !arrived && overlay.dataset.arrived !== undefined);
    };
    // Held along hold j, off px down the screen from its place there and
    // moving u px/ms: the held bus and its trail ease from there into place,
    // setting off as fast as the gliding bus was going.
    const join = (j: number, now: number, off: number, u: number) => {
      const hold = holds[j];
      const screen = hold.screen ?? 0;
      here = j;
      show(held[j]);
      if (Math.abs(off) < 0.5 && Math.abs(u) < 0.01) return;
      // Heading into place, soon enough not to slow down first.
      let duration = Math.min(Math.max(200 + Math.abs(off) * 1.2, 200), 700);
      if (u * off < 0) duration = Math.min(duration, (3 * Math.abs(off)) / Math.abs(u));
      const n = Math.ceil(duration / 8);
      const at = Array.from({ length: n + 1 }, (_, i) => {
        const s = i / n;
        return off * (2 * s ** 3 - 3 * s ** 2 + 1) + u * duration * (s ** 3 - 2 * s ** 2 + s);
      });
      sliding = [
        held[j].animate(at.map((o, i) => ({ offset: i / n, translate: `${hold.x}px ${o}px` })), duration),
        slides[j].animate(at.map((o, i) => ({ offset: i / n, translate: `0 ${screen + o}px` })), duration),
      ];
      for (const animation of sliding) animation.startTime = now;
      sliding[0].onfinish = () => {
        sliding = [];
        tick();
      };
    };
    // Onto the hold the scroll is on, once the bus has reached it, and isn't
    // still closing in on its place there too fast to ease into it.
    const reach = (now: number, y: number, v: number) => {
      const q = roadAt(route, glide ? state(glide, now)[1] : s2);
      const j = holds.findIndex((hold) => y >= hold.start && y <= hold.end && q >= hold.from - 0.5 && q <= hold.to + 0.5);
      if (j < 0) return;
      const off = q - holds[j].from - (y - holds[j].start);
      const u = (glide ? roadAt(route, state(glide, now + 1)[1]) - q : 0) - v;
      if (u * off < 0 && Math.abs(u) * 120 > 3 * Math.abs(off)) return;
      stop(now);
      join(j, now, off, u);
    };
    // Off the hold once the scroll leaves it, gliding on from the scroll's
    // place at its speed, as the held bus went.
    const leave = (now: number, y: number, v: number) => {
      const hold = holds[here];
      if (sliding.length || (y >= hold.start - 1 && y <= hold.end + 1)) return;
      s2 = y;
      s1 = s2 + v * LAG;
      here = -1;
      rest(roadAt(route, s2));
      show(bus);
      start(now, y, v);
    };

    // Glides again once the scroll strays from the forecast, and stops at
    // the end of the glide.
    const follow = (now: number, y: number, v: number) => {
      if (!glide) {
        if (Math.abs(y - s2) > 0.05) start(now, y, v);
        return;
      }
      const err = y - forecast(glide.y, glide.v, now - glide.start);
      const ahead = err * Math.sign(glide.v || err) < 0;
      if ((Math.abs(err) > TOL && now - planned >= GAP) || (ahead && Math.abs(err) > AHEAD && now - planned >= SOONEST)) start(now, y, v);
      else if (now >= glide.start + glide.s2.length - 1) stop(now);
    };

    const tick = (resting = false) => {
      frame = 0;
      const now = Number(document.timeline.currentTime ?? performance.now());
      const y = within(window.scrollY);
      if (samples.length && y !== samples.at(-1)![1]) moved = now;
      if (!samples.length || now > samples.at(-1)![0]) samples.push([now, y]);
      while (samples[0][0] < now - WINDOW) samples.shift();
      const v = speed();
      if (here >= 0) leave(now, y, v);
      else follow(now, y, v);
      if (here < 0) reach(now, y, v);
      mark();
      const hold = holds[here];
      if (hold) light(hold.from + Math.min(Math.max(y - hold.start, 0), hold.to - hold.from), resting);
      else light(roadAt(route, glide ? state(glide, now)[1] : s2), resting);
      if ((glide || sliding.length || now - moved < 200) && !frame) frame = requestAnimationFrame(() => tick());
    };

    // Where the scroll is, without gliding there.
    rest(roadAt(route, s2));
    show(bus);
    let rest0 = 0;
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(() => tick());
      clearTimeout(rest0);
      rest0 = window.setTimeout(() => tick(true), 150);
    };
    tick();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("scrollend", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(rest0);
      glide?.animations.forEach((animation) => animation.cancel());
      sliding.forEach((animation) => animation.cancel());
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("scrollend", onScroll);
    };
  }, [ref, route]);
}
