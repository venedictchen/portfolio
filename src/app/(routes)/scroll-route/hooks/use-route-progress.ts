import { useEffect, type RefObject } from "react";
import { PLACED } from "../constants";
import type { Route } from "../types";
import { reveal } from "../utils/animations";
import { along, pin, place, showing } from "../utils/fallback";
import { roadAt } from "../utils/road";

// Follows the scroll: lights the years, stops and jobs the bus has reached,
// starts and stops the celebration, and without scroll timelines drives the
// bus and trail too.
export function useRouteProgress(ref: RefObject<HTMLElement | null>, route: Route | null) {
  useEffect(() => {
    const overlay = ref.current;
    // Drive mode does all this itself (see useRouteDrive).
    if (!route || !overlay || route.drive) return;
    const bus = overlay.querySelector<HTMLElement>('.scroll-bus[data-frame="page"]');
    const stickyBus = overlay.querySelector<HTMLElement>('.scroll-bus[data-frame="screen"]');
    const faces = [bus, stickyBus].map((el) => el?.querySelector<HTMLElement>(".bus-face"));
    const legs = overlay.querySelectorAll<HTMLElement>("[data-leg]");
    const years = document.querySelectorAll(".route-pin");
    const pins = overlay.querySelectorAll(".scroll-stop");
    const jobs = document.querySelectorAll("#experience ol > li");
    const { length } = route;
    const drawn: number[] = [];
    let frame = 0;
    const update = (resting = false) => {
      frame = 0;
      const y = window.scrollY;
      // No layout reads here: one would force style and layout mid-frame.
      const at = roadAt(route, y);
      if (PLACED) {
        if (bus) place(bus, route.frames, y);
        if (stickyBus) {
          place(stickyBus, route.screen, y);
          const sticky = showing(route.shown, y);
          faces.forEach((face, which) => face?.style.setProperty("opacity", `${Number(sticky === which)}`));
        }
        // Where the bus is on screen, for the pinned legs: steady along most
        // of them, so a late frame still puts their tips on the sticky bus.
        const screenY = along(route.frames, y)[1] + route.top - y;
        legs.forEach((el) => {
          const i = Number(el.dataset.leg);
          const leg = route.legs[i];
          const pinned = el.classList.contains("trail-pin");
          const u = pinned ? pin(leg, at, screenY) : Math.min(Math.max(at - leg.s, 0), leg.length);
          if (drawn[i] === u) return;
          drawn[i] = u;
          if (pinned) el.style.top = `${u}px`;
          else el.style.setProperty(...(reveal(leg, u) as [string, string]));
        });
      }
      route.years.forEach((year, i) => years[i]?.toggleAttribute("data-lit", at >= year));
      [...route.jobs, ...route.stops].forEach((stop, i) => pins[i]?.toggleAttribute("data-lit", at >= stop.at));
      route.jobs.forEach((job, i) => jobs[i]?.toggleAttribute("data-reached", at >= job.at - route.lead));
      // Arriving starts the celebration; leaving only hides it (data-left)
      // until scrolling comes to rest, as stopping its animations mid-scroll
      // can hitch.
      const here = at >= length - 1;
      if (here || (resting && overlay.dataset.arrived !== undefined)) overlay.toggleAttribute("data-arrived", here);
      overlay.toggleAttribute("data-left", !here && overlay.dataset.arrived !== undefined);
    };
    // Once scrolling stops, update from where it came to rest, in case the
    // last scroll event came before the last of the momentum.
    let rest = 0;
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(() => update());
      clearTimeout(rest);
      rest = window.setTimeout(() => update(true), 150);
    };
    update();
    // From the scroll handler, which Safari runs at most 60 times a second,
    // the page bus and trail glide to each new place (see globals.css) once
    // placed; the layout read lands this first place before gliding starts.
    overlay.getBoundingClientRect();
    overlay.toggleAttribute("data-glide", PLACED);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("scrollend", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(rest);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("scrollend", onScroll);
    };
  }, [ref, route]);
}
