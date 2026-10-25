import { useEffect, type RefObject } from "react";
import type { Hold, Route } from "../types";
import { reveal } from "../utils/animations";
import { pose } from "../utils/drive";
import { roadAt } from "../utils/road";

// ms a glide step takes while the scroll keeps moving: about how far behind
// it the bus runs.
const STEP = 60;
// The fastest the bus glides, in road px per ms.
const FASTEST = 5;

type Glide = { to: number; end: number; animations: Animation[] };

// Glide mode (?route=glide): held still on screen along the long straights
// as in drive mode, natively; everywhere else the bus glides after the
// scroll's place along the road in short timed steps, each an ordinary
// timed animation that starts exactly where and when the one before ends.
// Nothing is changed while a step runs, so WebKit only ever plays plain
// timed animations; once the scroll stops, a last, eased step glides the bus
// to where it would be.
export function useRouteGlide(ref: RefObject<HTMLElement | null>, route: Route | null) {
  useEffect(() => {
    const overlay = ref.current;
    const plan = route?.drive;
    const bus = overlay?.querySelector<HTMLElement>('.scroll-bus[data-frame="drive"]');
    if (!route || !overlay || plan?.kind !== "glide" || !plan.poses || !bus) return;
    const { holds, pieces } = plan;
    const course = { roads: route.roads, ...plan.poses };
    const held = holds.map((_, k) => overlay.querySelector<HTMLElement>(`[data-hold="${k}"]`)!);
    const trail = new Map(Array.from(overlay.querySelectorAll<HTMLElement>("[data-leg]"), (el) => [Number(el.dataset.leg), el]));
    const along = holds.map((_, k) => pieces.findIndex((piece) => piece.hold === k));
    const slides = along.map((j) => trail.get(j)!);
    const clips = slides.map((slide) => slide.closest<HTMLElement>(".trail-clip")!);
    const past = holds.map((_, k) => overlay.querySelector<HTMLElement>(`[data-leg="past-${k}"]`)!);
    const free = pieces.flatMap((piece, j) => (piece.hold === undefined ? [j] : []));
    const years = document.querySelectorAll(".route-pin");
    const pins = overlay.querySelectorAll(".scroll-stop");
    const jobs = document.querySelectorAll("#experience ol > li");
    const stops = [...route.jobs, ...route.stops];

    let p = 0; // where along the road the bus is once the steps planned end
    let here = -1; // the hold it's held along, if any
    const glides: Glide[] = []; // the step running and the one after it
    let sliding: Animation[] = [];
    let through = -1;
    let shown: HTMLElement | undefined;
    let frame = 0;
    let [lastY, moved] = [window.scrollY, 0];
    const drawn: string[] = [];
    const marked: string[] = [];

    const show = (el: HTMLElement) => {
      if (el === shown) return;
      if (shown) delete shown.dataset.show;
      el.dataset.show = "";
      shown = el;
    };
    // The bus and the trail as styles, at road `at`.
    const rest = (at: number) => {
      const [x, y, heading] = pose(course, at);
      bus.style.translate = `${x}px ${y}px`;
      bus.style.rotate = `${heading}deg`;
      for (const j of free) {
        const { leg } = pieces[j];
        const [property, value] = reveal(leg, Math.min(Math.max(at - leg.s, 0), leg.length));
        if (drawn[j] === value) continue;
        drawn[j] = value;
        trail.get(j)?.style.setProperty(property, value);
      }
    };
    const mark = () => {
      holds.forEach((hold, k) => {
        let state = "none";
        if (k === through) state = "through";
        else if (k === here) state = "on";
        else if (hold.to <= p + 0.5) state = "past";
        if (marked[k] === state) return;
        marked[k] = state;
        clips[k].toggleAttribute("data-on", state === "on");
        if (state === "through") return;
        const { leg } = pieces[along[k]];
        past[k].style.setProperty(...(reveal(leg, state === "past" ? leg.length : 0) as [string, string]));
      });
    };
    // As in drive mode: shows the bus held along hold k, sliding it there
    // from the end of the hold the gliding bus has reached if the scroll has
    // moved on.
    const join = (k: number, from: "top" | "bottom") => {
      const hold = holds[k];
      const screen = hold.screen ?? 0;
      const y = window.scrollY;
      const at = hold[from] + route.top - y;
      let there = screen;
      if (y <= hold.start) there = hold.top + route.top - y;
      else if (y >= hold.end) there = hold.bottom + route.top - y;
      const off = at - there;
      here = k;
      show(held[k]);
      if (Math.abs(off) < 0.5) return;
      const timing = { duration: Math.min(200 + Math.abs(off) * 0.6, 700), easing: "ease-out" };
      const move = held[k].animate([{ translate: `${hold.x}px ${off}px` }, { translate: `${hold.x}px 0px` }], timing);
      if (from === "top" ? y >= hold.end : y <= hold.start) {
        through = k;
        const { leg } = pieces[along[k]];
        const ends = [reveal(leg, 0), reveal(leg, leg.length)];
        if (from === "bottom") ends.reverse();
        sliding = [move, past[k].animate(ends.map(([property, value]) => ({ [property]: value })), timing)];
      } else sliding = [move, slides[k].animate([{ translate: `0 ${screen + off}px` }, { translate: `0 ${screen}px` }], timing)];
      sliding[0].onfinish = () => {
        sliding = [];
        through = -1;
        tick();
      };
    };

    // Where the scroll would have the bus, short of the holds either side.
    const aim = (y: number): [number, Hold | undefined] => {
      const target = roadAt(route, y);
      const ahead = holds.find((hold) => hold.from >= p - 0.5);
      if (ahead && target >= ahead.from) return [ahead.from, ahead];
      const behind = holds.findLast((hold) => hold.to <= p + 0.5);
      if (behind && target <= behind.to) return [behind.to, behind];
      return [target, undefined];
    };
    // A step from p toward `to`, starting at `start`: quick and even while
    // the scroll moves, eased out once it has stopped.
    const step = (to: number, start: number, moving: boolean) => {
      const duration = moving ? STEP : Math.min(Math.max(160 + Math.abs(to - p) * 0.4, 160), 450);
      const d = Math.min(Math.max(to - p, -FASTEST * duration), FASTEST * duration);
      const n = Math.max(2, Math.ceil(Math.abs(d) / 6));
      const at = Array.from({ length: n + 1 }, (_, k) => p + (d * k) / n);
      const timing: KeyframeAnimationOptions = { duration, easing: moving ? "linear" : "ease-out", fill: "forwards" };
      const animations = [
        bus.animate(
          at.map((q, k) => {
            const [x, y, heading] = pose(course, q);
            return { offset: k / n, translate: `${x}px ${y}px`, rotate: `${heading}deg` };
          }),
          timing
        ),
      ];
      const [lo, hi] = [Math.min(p, p + d), Math.max(p, p + d)];
      for (const j of free) {
        const { leg } = pieces[j];
        if (leg.s + leg.length <= lo || leg.s >= hi) continue;
        const keys = at.map((q, k) => {
          const [property, value] = reveal(leg, Math.min(Math.max(q - leg.s, 0), leg.length));
          return { offset: k / n, [property]: value };
        });
        animations.push(trail.get(j)!.animate(keys, timing));
      }
      for (const animation of animations) animation.startTime = start;
      p += d;
      glides.push({ to: p, end: start + duration, animations });
    };

    const light = (at: number, resting: boolean) => {
      route.years.forEach((year, i) => years[i]?.toggleAttribute("data-lit", at >= year));
      stops.forEach((stop, i) => pins[i]?.toggleAttribute("data-lit", at >= stop.at));
      route.jobs.forEach((job, i) => jobs[i]?.toggleAttribute("data-reached", at >= job.at - route.lead));
      const arrived = at >= route.length - 1;
      if (arrived || (resting && overlay.dataset.arrived !== undefined)) overlay.toggleAttribute("data-arrived", arrived);
      overlay.toggleAttribute("data-left", !arrived && overlay.dataset.arrived !== undefined);
    };
    // Leaves the hold once the scroll does, where the held bus has stopped.
    const leave = (y: number) => {
      const hold = holds[here];
      if (sliding.length || (y >= hold.start - 1 && y <= hold.end + 1)) return;
      p = y < hold.start ? hold.from : hold.to;
      here = -1;
      rest(p);
      show(bus);
    };
    // The next step, once the one running is all but done.
    const next = (y: number, now: number, moving: boolean) => {
      const last = glides.at(-1);
      if (sliding.length || glides.length > 1 || (last && last.end - now > 20)) return;
      const [to, hold] = aim(y);
      if (Math.abs(to - p) > 0.3) step(to, last ? last.end : now, moving);
      else if (!last && hold) join(holds.indexOf(hold), hold.from === to ? "top" : "bottom");
    };

    function tick(resting = false) {
      frame = 0;
      const now = Number(document.timeline.currentTime ?? performance.now());
      const y = window.scrollY;
      if (y !== lastY) [lastY, moved] = [y, now];
      while (glides.length && now >= glides[0].end) {
        // Its end as styles (under the next step, if one runs) before it goes.
        const done = glides.shift()!;
        rest(done.to);
        done.animations.forEach((animation) => animation.cancel());
      }
      if (here >= 0) leave(y);
      if (here < 0) next(y, now, now - moved < 80);
      mark();
      if (here >= 0) light(holds[here].from + Math.min(Math.max(y - holds[here].start, 0), holds[here].to - holds[here].from), resting);
      else light(p, resting);
      if ((glides.length || sliding.length || now - moved < 200) && !frame) frame = requestAnimationFrame(() => tick());
    }

    // Where the scroll is, without gliding there.
    const y0 = window.scrollY;
    p = roadAt(route, y0);
    rest(p);
    const k0 = holds.findIndex((hold) => y0 >= hold.start && y0 <= hold.end);
    if (k0 >= 0) {
      here = k0;
      show(held[k0]);
    } else show(bus);

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
      glides.forEach((glide) => glide.animations.forEach((animation) => animation.cancel()));
      sliding.forEach((animation) => animation.cancel());
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("scrollend", onScroll);
    };
  }, [ref, route]);
}
