import { useEffect, type RefObject } from "react";
import type { Pose, Route } from "../types";
import { reveal } from "../utils/animations";
import { ease } from "../utils/drive";

// Drive mode (iPhone and iPad): nothing about the bus follows the scroll by
// animation, which WebKit draws a little apart from the page. Along a hold
// a bus rides a sticky frame, still on screen, so the browser itself keeps
// it in step; everywhere else one bus drives by itself, a timed animation
// on the page that the trail draws along with. A drive plays when the
// scroll reaches it and plays back when the scroll returns. The two buses
// swap only where they meet, and if the scroll has run ahead of a drive,
// the held bus slides the rest of the way to its place.
export function useRouteDrive(ref: RefObject<HTMLElement | null>, route: Route | null) {
  useEffect(() => {
    const overlay = ref.current;
    const plan = route?.drive;
    const bus = overlay?.querySelector<HTMLElement>('.scroll-bus[data-frame="drive"]');
    if (!route || !overlay || !plan || !bus) return;
    const { drives, holds, pieces, screen, view } = plan;
    const held = holds.map((_, k) => overlay.querySelector<HTMLElement>(`[data-hold="${k}"]`)!);
    const trail = new Map(Array.from(overlay.querySelectorAll<HTMLElement>("[data-leg]"), (el) => [Number(el.dataset.leg), el]));
    const along = holds.map((_, k) => pieces.findIndex((piece) => piece.hold === k));
    const slides = along.map((j) => trail.get(j)!);
    const clips = slides.map((slide) => slide.closest<HTMLElement>(".trail-clip")!);
    const past = holds.map((_, k) => overlay.querySelector<HTMLElement>(`[data-leg="past-${k}"]`)!);
    const years = document.querySelectorAll(".route-pin");
    const pins = overlay.querySelectorAll(".scroll-stop");
    const jobs = document.querySelectorAll("#experience ol > li");
    const stops = [...route.jobs, ...route.stops];

    let done = 0; // drives completed
    let active: { i: number; dir: number; rate: number; animations: Animation[] } | null = null;
    let sliding: Animation[] = [];
    let through = -1; // the hold the held bus is sliding right through, if any
    let shown: HTMLElement | undefined;
    let frame = 0;

    const show = (el: HTMLElement) => {
      if (el === shown) return;
      if (shown) delete shown.dataset.show;
      el.dataset.show = "";
      shown = el;
    };
    const park = ([x, y, heading]: Pose) => {
      bus.style.translate = `${x}px ${y}px`;
      bus.style.rotate = `${heading}deg`;
    };
    const draw = (i: number, drawn: boolean) => {
      for (const [j] of drives[i].pieces) {
        const { leg } = pieces[j];
        trail.get(j)?.style.setProperty(...(reveal(leg, drawn ? leg.length : 0) as [string, string]));
      }
    };
    const stopSliding = () => {
      sliding.forEach((animation) => animation.cancel());
      sliding = [];
    };

    // Shows the bus held along hold k (or the driving bus, parked, if none).
    // `from` is the end of the hold the driving bus has just reached: if the
    // held bus isn't there because the scroll has moved on, it slides from
    // there to its place, and its trail with it, before anything drives on.
    const join = (k: number | undefined, from: "top" | "bottom", slide = true) => {
      if (k === undefined) return show(bus);
      const hold = holds[k];
      const y = window.scrollY;
      const here = hold[from] + route.top - y;
      let there = screen;
      if (y <= hold.start) there = hold.top + route.top - y;
      else if (y >= hold.end) there = hold.bottom + route.top - y;
      const off = here - there;
      show(held[k]);
      if (!slide || Math.abs(off) < 0.5) return;
      const timing = { duration: Math.min(200 + Math.abs(off) * 0.6, 700), easing: "ease-out" };
      const move = held[k].animate([{ translate: `${hold.x}px ${off}px` }, { translate: `${hold.x}px 0px` }], timing);
      // Run right through the hold (the scroll is past its far end): the
      // bus slides the length of it on the page, with the trail's plain copy
      // drawn along; otherwise the sliding trail slides with it.
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
    // Each hold's trail: sliding with its bus while it's held there, drawn in
    // full on the page once the bus is past it (a sliding one would drift
    // off its top further on), and none before. Each swaps where the two
    // look the same.
    const marked: string[] = [];
    const mark = () => {
      const here = held.indexOf(shown!);
      let place = 0;
      if (active) place = drives[active.i].from;
      else if (done) place = drives[done - 1].to;
      holds.forEach((hold, k) => {
        let state = "none";
        if (k === through) state = "through";
        else if (k === here) state = "on";
        else if (hold.to <= place + 0.5) state = "past";
        if (marked[k] === state) return;
        marked[k] = state;
        clips[k].toggleAttribute("data-on", state === "on");
        if (state === "through") return;
        const { leg } = pieces[along[k]];
        past[k].style.setProperty(...(reveal(leg, state === "past" ? leg.length : 0) as [string, string]));
      });
    };
    // Where the hold before drive i is, if it follows one.
    const before = (i: number) => (i > 0 ? drives[i - 1].hold : undefined);

    // How far the scroll has run ahead of the drive under way, in px: past
    // where the bus would next be held (or the next drive set off), or, going
    // back, back past where the hold before lets it go.
    const behind = (y: number) => {
      const { i, dir } = active!;
      if (dir > 0) {
        const k = drives[i].hold;
        return y - (k === undefined ? (drives[i + 1]?.forward ?? Infinity) : holds[k].start);
      }
      const k = before(i);
      return (k === undefined ? (drives[i - 1]?.back ?? -Infinity) : holds[k].end) - y;
    };
    // The further behind, the faster it drives (up to 6 times), so the bus
    // catches up without ever jumping.
    const pace = (y: number) => {
      if (!active) return;
      const rate = 1 + Math.min(Math.max(behind(y) / (0.4 * view), 0), 5);
      if (Math.abs(rate - active.rate) < 0.05) return;
      active.rate = rate;
      for (const animation of active.animations) animation.updatePlaybackRate(rate * active.dir);
    };
    const start = (i: number, dir: number) => {
      const drive = drives[i];
      park(dir > 0 ? drive.start : drive.end);
      show(bus);
      const timing: KeyframeAnimationOptions = { duration: drive.duration, fill: "both" };
      const animations = [bus.animate(drive.bus, timing), ...drive.pieces.map(([j, keys]) => trail.get(j)!.animate(keys, timing))];
      // Going back plays from the end; the rate first, so it never reads as finished.
      for (const animation of animations) {
        animation.playbackRate = dir;
        if (dir < 0) animation.currentTime = drive.duration;
      }
      active = { i, dir, rate: 1, animations };
      animations[0].onfinish = finish;
      pace(window.scrollY);
    };
    // The drive under way runs out: it stays where it ended, as styles.
    function finish() {
      if (!active) return;
      const { i, dir, animations } = active;
      draw(i, dir > 0);
      park(dir > 0 ? drives[i].end : drives[i].start);
      done = dir > 0 ? i + 1 : i;
      animations.forEach((animation) => animation.cancel());
      active = null;
      if (dir > 0) join(drives[i].hold, "top");
      else join(before(i), "bottom");
      tick();
    }

    // How many drives the scroll asks for: each from where it sets off, and
    // still while the scroll stays short of where it turns back.
    const wanted = (y: number) => {
      let holding = done;
      if (active) holding = active.dir > 0 ? active.i + 1 : active.i;
      let n = 0;
      while (n < drives.length && (y >= drives[n].forward || (n < holding && y >= drives[n].back))) n++;
      return n;
    };
    // The bus's place along the road, for lighting stops.
    const road = (y: number) => {
      if (active) {
        const drive = drives[active.i];
        const t = Math.min(Math.max(Number(active.animations[0].currentTime ?? 0) / drive.duration, 0), 1);
        return drive.from + (drive.to - drive.from) * ease(t);
      }
      const k = held.indexOf(shown!);
      if (k >= 0) return holds[k].from + Math.min(Math.max(y - holds[k].start, 0), holds[k].to - holds[k].from);
      return done ? drives[done - 1].to : drives[0].from;
    };
    const light = (at: number, resting: boolean) => {
      route.years.forEach((year, i) => years[i]?.toggleAttribute("data-lit", at >= year));
      stops.forEach((stop, i) => pins[i]?.toggleAttribute("data-lit", at >= stop.at));
      route.jobs.forEach((job, i) => jobs[i]?.toggleAttribute("data-reached", at >= job.at - route.lead));
      // As with the scroll bus: arriving starts the celebration, leaving
      // only hides it until scrolling comes to rest.
      const here = done === drives.length && !active;
      if (here || (resting && overlay.dataset.arrived !== undefined)) overlay.toggleAttribute("data-arrived", here);
      overlay.toggleAttribute("data-left", !here && overlay.dataset.arrived !== undefined);
    };
    // Turns the drive under way round, or sets the next one off, one at a
    // time: never while a held bus is still sliding to its place.
    const steer = (y: number) => {
      const n = wanted(y);
      if (active) {
        if ((active.dir > 0 && n <= active.i) || (active.dir < 0 && n > active.i)) {
          active.dir = -active.dir;
          active.rate = 0;
        }
        pace(y);
      } else if (!sliding.length && n > done) start(done, 1);
      else if (!sliding.length && n < done) start(done - 1, -1);
    };

    function tick(resting = false) {
      frame = 0;
      const y = window.scrollY;
      steer(y);
      mark();
      light(road(y), resting);
      if ((active || sliding.length) && !frame) frame = requestAnimationFrame(() => tick());
    }

    // As far along as the scroll is, without driving there.
    const y0 = window.scrollY;
    while (done < drives.length && y0 >= drives[done].forward) done++;
    drives.forEach((_, i) => draw(i, i < done));
    park(done ? drives[done - 1].end : drives[0].start);
    join(done ? drives[done - 1].hold : undefined, "top", false);

    let rest = 0;
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(() => tick());
      clearTimeout(rest);
      rest = window.setTimeout(() => tick(true), 150);
    };
    tick();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("scrollend", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(rest);
      active?.animations.forEach((animation) => animation.cancel());
      stopSliding();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("scrollend", onScroll);
    };
  }, [ref, route]);
}
