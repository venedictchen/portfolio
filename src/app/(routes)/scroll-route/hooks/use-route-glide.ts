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
// (at most every GAP ms), or at once if the forecast runs AHEAD px past it.
const TAU = 250;
const TOL = 5;
const GAP = 100;
const AHEAD = 1;
// ms of scroll its speed is measured over
const WINDOW = 70;

// A glide: from `start`, on the forecast from scroll y at speed v, the two
// stages a ms at a time, and the road it ends at.
type Glide = { start: number; y: number; v: number; s1: number[]; s2: number[]; to: number; animations: Animation[] };
type Free = { leg: Leg; el: HTMLElement; hold?: number };

// Glide mode (?route=glide): held still on screen along the long straights
// as in drive mode, natively; everywhere else the bus glides after the
// scroll in timed animations planned ahead, each taking over from the one
// before at the same place and speed. Nothing is changed while one runs, so
// WebKit only ever plays plain timed animations. Once the bus comes to rest
// on a straight, it swaps for the held bus, in the same place.
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
    const clips = holds.map((_, k) => trail.get(String(pieces.findIndex((piece) => piece.hold === k)))!.closest<HTMLElement>(".trail-clip")!);
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

    let [s1, s2] = [within(window.scrollY), within(window.scrollY)]; // the two stages, while at rest
    let glide: Glide | null = null;
    let planned = -Infinity;
    let here = -1; // the hold it's held along, if any
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
      const times = [0];
      for (let d = 1; d <= duration; d++) if (d === duration || d - times.at(-1)! >= 8 || Math.abs(road[d] - road[times.at(-1)!]) >= 6) times.push(d);
      const timing: KeyframeAnimationOptions = { duration, fill: "forwards" };
      const animations = [
        bus.animate(
          times.map((d) => {
            const [x, y, heading] = pose(course, road[d]);
            return { offset: d / duration, translate: `${x}px ${y}px`, rotate: `${heading}deg` };
          }),
          timing
        ),
      ];
      const [lo, hi] = [Math.min(...road), Math.max(...road)];
      for (const { leg, el } of free) {
        if (leg.s + leg.length <= lo || leg.s >= hi) continue;
        const keys = times.map((d) => {
          const [property, value] = reveal(leg, Math.min(Math.max(road[d] - leg.s, 0), leg.length));
          return { offset: d / duration, [property]: value };
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
    // Held along hold j, where the gliding bus has come to rest.
    const join = (j: number) => {
      here = j;
      show(held[j]);
    };
    // Off the hold once the scroll leaves it, gliding on from its end at the
    // scroll's speed, as the held bus went.
    const leave = (now: number, y: number, v: number) => {
      const hold = holds[here];
      if (y >= hold.start - 1 && y <= hold.end + 1) return;
      s2 = y < hold.start ? hold.start : hold.end;
      s1 = s2 + v * LAG;
      here = -1;
      rest(roadAt(route, s2));
      show(bus);
      start(now, y, v);
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
      else if (glide) {
        const err = y - forecast(glide.y, glide.v, now - glide.start);
        const ahead = err * Math.sign(glide.v || err) < 0;
        if ((Math.abs(err) > TOL && now - planned >= GAP) || (ahead && Math.abs(err) > AHEAD)) start(now, y, v);
        else if (now >= glide.start + glide.s2.length - 1) stop(now);
      } else if (Math.abs(y - s2) > 0.05) start(now, y, v);
      if (here < 0 && !glide) {
        const j = holds.findIndex((hold) => y >= hold.start && y <= hold.end);
        if (j >= 0 && Math.abs(roadAt(route, s2) - roadAt(route, y)) < 0.5) join(j);
      }
      mark();
      const hold = holds[here];
      if (hold) light(hold.from + Math.min(Math.max(y - hold.start, 0), hold.to - hold.from), resting);
      else light(roadAt(route, glide ? state(glide, now)[1] : s2), resting);
      if ((glide || now - moved < 200) && !frame) frame = requestAnimationFrame(() => tick());
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
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("scrollend", onScroll);
    };
  }, [ref, route]);
}
