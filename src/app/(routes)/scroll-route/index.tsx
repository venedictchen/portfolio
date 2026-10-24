"use client";

import { useEffect, useRef, useState } from "react";
import { Bus } from "@/components";

type Mode = "desktop" | "tablet" | "phone";
const DESKTOP = "(min-width: 85rem)";
const TABLET = "(min-width: 48rem)";
const TURN = 40;
const FRAME = 16; // matches the photo's rounded-2xl
const STEP = 4;
// Scroll-driven CSS animations move the bus on the compositor, in step with
// the page; without them it follows from the scroll handler, which on phones
// lands a frame late and shakes.
const TIMELINE =
  typeof CSS !== "undefined" &&
  CSS.supports("animation-timeline", "scroll()") &&
  CSS.supports("animation-range", "0px 1px");

// pace: minimum scroll per px of road to the next point
type Point = { x: number; y: number; r: number; pace?: number };
// A straight or corner of the road: where it starts along the road and on
// screen, its heading there, and where its command sits in the path.
type Leg = { s: number; length: number; x: number; y: number; dx: number; dy: number; from: number; to: number };
type Frame = [scroll: number, x: number, y: number, heading: number];

const RAYS = Array.from({ length: 12 }, (_, i) => i * 30);
// [angle in degrees, distance, delay in seconds]
const TWINKLES = [
  [20, 58, 0.15], [75, 46, 0.35], [130, 62, 0.05], [185, 50, 0.4],
  [240, 60, 0.2], [300, 48, 0.3], [345, 66, 0.5], [105, 72, 0.6],
];
type Stop = { at: number; x: number; y: number }; // at: distance along the road

type Route = {
  height: number;
  lead: number; // px of road before a job's stop at which it appears
  pin: number;
  party: number; // celebration scale
  path: string;
  road: string; // path without the hero line, which the hero draws itself
  length: number;
  legs: Leg[];
  scroll: number[]; // scroll position for each STEP of road
  frames: Frame[]; // the bus's keyframes
  years: number[];
  jobs: Stop[];
  stops: Stop[];
};

// Rounds the corners of an axis-aligned polyline into an SVG path, sampling
// position, heading and pace every STEP along it.
function trace(corners: Point[]) {
  // Corners closer together than their radii share the gap, so the road
  // never doubles back.
  const gap = (i: number, j: number) =>
    Math.abs(corners[j].x - corners[i].x) + Math.abs(corners[j].y - corners[i].y);
  const ends = corners.length - 1;
  const points = corners.map((p, i) =>
    i === 0 || i === ends ? p : { ...p, r: Math.min(p.r, gap(i - 1, i) / (i > 1 ? 2 : 1), gap(i, i + 1) / (i < ends - 1 ? 2 : 1)) }
  );
  const xs: number[] = [];
  const ys: number[] = [];
  const headings: number[] = []; // degrees, unwrapped so turns interpolate the short way
  const paces: number[] = [];
  const runs: { s: number; x: number; y: number }[] = [];
  const legs: Leg[] = [];
  let d = `M ${points[0].x} ${points[0].y}`;
  let heroEnd = "";
  let s = 0;
  let next = 0;
  // at(u): [x, y, heading in radians] u px along the leg
  const leg = (
    command: string,
    start: { x: number; y: number },
    [dx, dy]: number[],
    length: number,
    pace: number,
    at: (u: number) => number[]
  ) => {
    legs.push({ s, length, ...start, dx, dy, from: d.length, to: d.length + command.length });
    d += command;
    for (; next <= s + length; next += STEP) {
      const [x, y, heading] = at(next - s);
      const degrees = (heading * 180) / Math.PI;
      const prev = headings.at(-1) ?? 0;
      xs.push(x);
      ys.push(y);
      headings.push(degrees + 360 * Math.round((prev - degrees) / 360));
      paces.push(pace * STEP);
    }
    s += length;
  };

  for (let i = 0; i < points.length - 1; i++) {
    const [a, b, c] = [points[i], points[i + 1], points[i + 2]];
    const dx = Math.sign(b.x - a.x);
    const dy = Math.sign(b.y - a.y);
    const cutStart = i === 0 ? 0 : a.r;
    const cutEnd = c ? b.r : 0;
    const start = { x: a.x + dx * cutStart, y: a.y + dy * cutStart };
    const end = { x: b.x - dx * cutEnd, y: b.y - dy * cutEnd };
    const heading = Math.atan2(dy, dx);
    runs.push({ s, ...start });
    leg(
      ` L ${end.x} ${end.y}`,
      start,
      [dx, dy],
      Math.abs(b.x - a.x) + Math.abs(b.y - a.y) - cutStart - cutEnd,
      a.pace ?? (dy < 0 ? 0.06 : 0.25),
      (u) => [start.x + dx * u, start.y + dy * u, heading]
    );
    if (i === 0) heroEnd = `M ${end.x} ${end.y}`;
    if (!c) break;

    const nx = Math.sign(c.x - b.x);
    const ny = Math.sign(c.y - b.y);
    const r = b.r;
    const [cx, cy] = [end.x + nx * r, end.y + ny * r];
    leg(
      ` A ${r} ${r} 0 0 ${dx * ny - dy * nx > 0 ? 1 : 0} ${b.x + nx * r} ${b.y + ny * r}`,
      end,
      [dx, dy],
      (Math.PI * r) / 2,
      0.15,
      (u) => {
        const [cos, sin] = [Math.cos(u / r), Math.sin(u / r)];
        return [
          cx - nx * r * cos + dx * r * sin,
          cy - ny * r * cos + dy * r * sin,
          Math.atan2(dy * cos + ny * sin, dx * cos + nx * sin),
        ];
      }
    );
  }
  // And the very end, past the last STEP.
  if (next - STEP < s) {
    xs.push(points[ends].x);
    ys.push(points[ends].y);
    headings.push(headings[headings.length - 1]);
    paces.push(paces[paces.length - 1]);
  }
  return { d, road: heroEnd + d.slice(d.indexOf(" A ")), length: s, xs, ys, headings, paces, runs, legs };
}

// Bus position on screen, as fractions of the viewport height.
const [TOP, AIM, BOTTOM] = [0.1, 0.6, 0.9];

// Keeps the bus near AIM, clamped between TOP and BOTTOM with lookahead so
// climbs can't leave the screen, and never faster than its pace. `ramps`
// replace the aim with linear stretches at the start of the road. From
// `land` the aim is a linear stretch from wherever the bus is to the bottom of
// the page (`last`) instead, so it eases down the screen and arrives as the page runs out.
function timetable(
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

// The bus's keyframes: the samples, less those that interpolating between
// their neighbours puts within a quarter pixel and half a degree.
function keyframes(scroll: number[], xs: number[], ys: number[], headings: number[]): Frame[] {
  const near = (v: number[], from: number, to: number, k: number, t: number, tolerance: number) =>
    Math.abs(v[from] + t * (v[to] - v[from]) - v[k]) <= tolerance;
  const keep = [0];
  for (let from = 0, to = 2; to < scroll.length; to++) {
    let fits = to - from < 256;
    for (let k = from + 1; fits && k < to; k++) {
      const t = (scroll[k] - scroll[from]) / (scroll[to] - scroll[from]);
      fits = near(xs, from, to, k, t, 0.25) && near(ys, from, to, k, t, 0.25) && near(headings, from, to, k, t, 0.5);
    }
    if (!fits) keep.push((from = to - 1));
  }
  keep.push(scroll.length - 1);
  const frames = keep.map((i) => [scroll[i], xs[i], ys[i], headings[i]].map((v) => Math.round(v * 100) / 100) as Frame);
  if (frames[0][0] > 0) frames.unshift([0, ...frames[0].slice(1)] as Frame);
  return frames;
}

// Mobile toolbars change innerHeight as they slide in and out on scroll; the
// small (toolbars shown) and large (hidden) viewports stay put.
function viewports(overlay: HTMLElement) {
  const probe = document.createElement("div");
  probe.style.cssText = "position:absolute;visibility:hidden;height:100svh";
  overlay.append(probe);
  const small = probe.offsetHeight;
  probe.style.height = "100lvh";
  const large = probe.offsetHeight;
  probe.remove();
  return [small || window.innerHeight, large || window.innerHeight];
}

function measure(overlay: HTMLElement, mode: Mode): Route | null {
  const origin = overlay.getBoundingClientRect();
  const box = (selector: string) => {
    const rect = document.querySelector(selector)?.getBoundingClientRect();
    return rect && {
      left: rect.left - origin.left,
      right: rect.right - origin.left,
      top: rect.top - origin.top,
      bottom: rect.bottom - origin.top,
      midY: rect.top + rect.height / 2 - origin.top,
    };
  };
  const all = (selector: string) =>
    Array.from(document.querySelectorAll(selector), (el) => {
      const rect = el.getBoundingClientRect();
      return { x: rect.left + rect.width / 2 - origin.left, y: rect.top + rect.height / 2 - origin.top };
    });

  const years = all(".route-pin");
  const heroBus = box(".route-bus");
  const content = document.querySelector("#about > div");
  const photo = box(".photo-lap");
  const aboutText = box("#about h2");
  // Level with each job's logo, minus any reveal slide-in still applied.
  const jobs = Array.from(document.querySelectorAll("#experience ol > li > :last-child"), (details) => {
    const logo = details.firstElementChild!.getBoundingClientRect();
    const slide = Number.parseFloat(getComputedStyle(details).translate.split(" ")[1] ?? "0");
    return logo.top + logo.height / 2 - origin.top - slide;
  });
  const date = box("#experience ol > li > :first-child");
  const details = box("#experience ol > li > :last-child");
  const list = box("#experience ol");
  const sections = ["#about", "#projects", "#writing", "#contact"].map(box);
  const headings = ["#projects h2", "#writing h2"].map(box);
  const contactBody = box("#contact > div");
  if (!years.length || !heroBus || !content || !photo || !aboutText || !date || !details || !list) return null;
  const [about, projects, writing, contact] = sections;
  if (!about || !projects || !writing || !contact || !contactBody || headings.some((h) => !h)) return null;
  const [projectsH2, writingH2] = headings as NonNullable<(typeof headings)[number]>[];

  const style = getComputedStyle(content);
  const contentRect = content.getBoundingClientRect();
  const contentLeft = contentRect.left + Number.parseFloat(style.paddingLeft) - origin.left;
  const contentRight = contentRect.right - Number.parseFloat(style.paddingRight) - origin.left;
  const viewRight = document.documentElement.clientWidth - origin.left;
  const leftX = contentLeft / 2;
  const rightX = (contentRight + viewRight) / 2;
  const lineY = years[0].y;
  const busLength = heroBus.right - heroBus.left;
  const startX = Math.max(years[0].x - busLength, busLength / 2 + 4);
  const aboveY = (about.top + photo.top) / 2;
  const end = contactBody.bottom; // level with the bottom of the form

  const corner = (x: number, y: number, r = TURN, pace?: number) => ({ x, y, r, pace });
  const lap = 0.06;
  let points: Point[];
  let endX: number;
  // [index of the run of road the stops sit on, their x]
  let jobsOn: [number, number];
  let projectsOn: [number, number];
  let writingOn: [number, number];

  if (mode === "phone") {
    // Anticlockwise round the photo, so it leaves towards the rail.
    const lastYear = Math.max(
      ...Array.from(document.querySelectorAll(".route-stop:last-child :is(.route-year, .route-label)"), (el) => {
        const range = document.createRange();
        range.selectNodeContents(el);
        return range.getBoundingClientRect().right - origin.left;
      })
    );
    const turnX = (lastYear + viewRight) / 2;
    endX = leftX;
    points = [
      corner(startX, lineY),
      corner(turnX, lineY, 20),
      corner(turnX, aboveY),
      corner(photo.left, aboveY, TURN, lap),
      corner(photo.left, photo.bottom, FRAME, lap),
      corner(photo.right, photo.bottom, FRAME, lap),
      corner(photo.right, photo.top, FRAME, lap),
      corner(leftX, photo.top),
      corner(leftX, end),
    ];
    jobsOn = projectsOn = writingOn = [7, leftX];
  } else {
    const besideX = (photo.right + aboutText.left) / 2;
    const timelineX = (date.right + details.left) / 2;
    endX = rightX;
    points = [
      corner(startX, lineY),
      corner(rightX, lineY),
      corner(rightX, aboveY),
      corner(photo.right, aboveY, TURN, lap),
      corner(photo.right, photo.bottom, FRAME, lap),
      corner(photo.left, photo.bottom, FRAME, lap),
      corner(photo.left, photo.top, FRAME, lap),
      corner(besideX, photo.top),
      corner(besideX, list.top),
      corner(timelineX, list.top),
      corner(timelineX, projects.top),
      corner(rightX, projects.top),
      corner(rightX, writing.top),
      corner(leftX, writing.top),
      corner(leftX, contact.top),
      corner(rightX, contact.top),
      corner(rightX, end),
    ];
    jobsOn = [9, timelineX];
    projectsOn = [11, rightX];
    writingOn = [13, leftX];
  }
  const { d, road, length, xs, ys, headings: turns, paces, runs, legs } = trace(points);
  // The lap's scroll budget: the most the page can scroll while the photo's
  // bottom (after the right edge) stays above BOTTOM and its top (at the
  // end) below TOP. 90% of it, for slack.
  const toPage = origin.top + window.scrollY;
  // Aim within the viewport with toolbars shown, and arrive by the bottom of
  // the page with them hidden, when it scrolls least.
  const [view, large] = viewports(overlay);
  const last = document.documentElement.scrollHeight - large - 1;
  const sampleAt = (s: number) => Math.round(s / STEP);
  const photoHeight = photo.bottom - photo.top;
  const share = photoHeight / (runs[7].s - runs[3].s);
  const room = (BOTTOM - TOP) * view - photoHeight;
  const lapScroll = Math.max((0.9 * room) / (1 - share), 60);
  const lapStart = photo.top + toPage - TOP * view - lapScroll - 10;
  // Where the final run down enters the Contact section.
  const lastRun = sampleAt(runs[runs.length - 1].s);
  const land = ys.findIndex((y, i) => i >= lastRun && y >= contact.top);

  const on = ([run, x]: [number, number], y: number): Stop => ({
    at: runs[run].s + Math.abs(x - runs[run].x) + Math.abs(y - runs[run].y),
    x,
    y,
  });
  const clearance = mode === "phone" ? contentLeft - endX : endX - contentRight;
  const scroll = timetable(
    ys.map((y) => y + toPage),
    paces,
    [
      { end: sampleAt(runs[1].s), to: lineY + toPage - AIM * view },
      { end: sampleAt(runs[3].s), to: lapStart },
      { end: sampleAt(runs[7].s), to: lapStart + lapScroll },
    ],
    land,
    view,
    last
  );

  return {
    height: end + 60,
    lead: mode === "phone" ? 0.25 * view : 0,
    pin: mode === "phone" ? 7 : 9,
    party: Math.min(Math.max((clearance + 8) / 60, 0.45), 1),
    path: d,
    road,
    length,
    legs,
    scroll,
    frames: keyframes(scroll, xs, ys, turns),
    years: years.map((pin) => pin.x - startX),
    jobs: jobs.map((y) => on(jobsOn, y)),
    stops: [on(projectsOn, projectsH2.midY), on(writingOn, writingH2.midY), { at: length, x: endX, y: end }],
  };
}

// The bus's keyframes on the page's scroll timeline.
function busAnimation(frames: Frame[]) {
  const end = frames[frames.length - 1][0];
  const steps = frames.map(
    ([scroll, x, y, heading]) => `${((scroll / end) * 100).toFixed(4)}%{translate:${x}px ${y}px;rotate:${heading}deg}`
  );
  return (
    `@keyframes scroll-bus{${steps.join("")}}` +
    `.scroll-bus{animation:scroll-bus auto linear both;animation-timeline:scroll(root);animation-range:0px ${end}px}`
  );
}

// Without scroll timelines: the bus's keyframes, interpolated at scroll y.
function place(bus: HTMLElement, frames: Frame[], y: number) {
  let i = 0;
  for (let step = 1 << 15; step; step >>= 1) if (i + step < frames.length && frames[i + step][0] <= y) i += step;
  const [a, b] = [frames[i], frames[Math.min(i + 1, frames.length - 1)]];
  const t = b[0] > a[0] ? Math.min(Math.max((y - a[0]) / (b[0] - a[0]), 0), 1) : 0;
  const [x, busY, heading] = [1, 2, 3].map((k) => a[k] + t * (b[k] - a[k]));
  bus.style.translate = `${x}px ${busY}px`;
  bus.style.rotate = `${heading}deg`;
}

function Celebration({ at, scale }: { at: Stop; scale: number }) {
  return (
    <g className="scroll-party" transform={`translate(${at.x} ${at.y}) scale(${scale})`}>
      <circle className="party-ring" r="14" />
      <circle className="party-ring" r="14" style={{ animationDelay: "1s" }} />
      {RAYS.map((angle) => (
        <line key={angle} className="party-ray" x1="24" x2="36" style={{ rotate: `${angle}deg` }} />
      ))}
      {TWINKLES.map(([angle, distance, delay]) => (
        <circle
          key={angle}
          className="party-twinkle"
          cx={Math.cos((angle * Math.PI) / 180) * distance}
          cy={Math.sin((angle * Math.PI) / 180) * distance}
          r="3"
          style={{ animationDelay: `${delay}s` }}
        />
      ))}
    </g>
  );
}

export default function ScrollRoute() {
  const ref = useRef<HTMLDivElement>(null);
  const [route, setRoute] = useState<Route | null>(null);

  useEffect(() => {
    const overlay = ref.current;
    if (!overlay) return;
    const desktop = window.matchMedia(DESKTOP);
    const tablet = window.matchMedia(TABLET);
    const remeasure = () => {
      let mode: Mode = "phone";
      if (desktop.matches) mode = "desktop";
      else if (tablet.matches) mode = "tablet";
      document.documentElement.dataset.scrollRoute = mode;
      const next = measure(overlay, mode);
      setRoute((prev) => (JSON.stringify(prev) === JSON.stringify(next) ? prev : next));
    };
    const observer = new ResizeObserver(remeasure);
    observer.observe(document.body);
    desktop.addEventListener("change", remeasure);
    tablet.addEventListener("change", remeasure);
    return () => {
      observer.disconnect();
      desktop.removeEventListener("change", remeasure);
      tablet.removeEventListener("change", remeasure);
      delete document.documentElement.dataset.scrollRoute;
    };
  }, []);

  useEffect(() => {
    const overlay = ref.current;
    if (!route || !overlay) return;
    const bus = overlay.querySelector<HTMLElement>(".scroll-bus");
    // The legs behind the bus in one path and the one it's on in another, so
    // a frame repaints only the leg, not a trail the size of the page.
    const [done, tip] = overlay.querySelectorAll(".scroll-trail");
    const years = document.querySelectorAll(".route-pin");
    const pins = overlay.querySelectorAll(".scroll-stop");
    const jobs = document.querySelectorAll("#experience ol > li");
    const { scroll, length, legs, path } = route;
    let frame = 0;
    let shown = -1;
    const draw = (at: number) => {
      let i = legs.length - 1;
      while (i > 0 && legs[i].s > at) i--;
      const leg = legs[i];
      if (i !== shown) {
        shown = i;
        // From 1px back, overlapping the legs behind so no seam shows.
        const lead = i ? 1 : 0;
        done.setAttribute("d", path.slice(0, i ? leg.from : 0));
        tip.setAttribute(
          "d",
          `M ${leg.x - leg.dx * lead} ${leg.y - leg.dy * lead} L ${leg.x} ${leg.y}${path.slice(leg.from, leg.to)}`
        );
        tip.setAttribute("stroke-dasharray", `${lead + leg.length}`);
      }
      tip.setAttribute("stroke-dashoffset", `${leg.length - Math.min(at - leg.s, leg.length)}`);
    };
    const update = () => {
      frame = 0;
      const y = window.scrollY;
      let at = length;
      // No layout reads here: one would force style and layout mid-frame.
      if (y < scroll[scroll.length - 1]) {
        let i = 0;
        for (let step = 1 << 15; step; step >>= 1)
          if (i + step < scroll.length && scroll[i + step] <= y) i += step;
        const between = i + 1 < scroll.length ? (y - scroll[i]) / (scroll[i + 1] - scroll[i]) : 0;
        at = Math.min(Math.max((i + between) * STEP, 0), length);
      }
      if (!TIMELINE && bus) place(bus, route.frames, y);
      draw(at);
      route.years.forEach((year, i) => years[i]?.toggleAttribute("data-lit", at >= year));
      [...route.jobs, ...route.stops].forEach((stop, i) => pins[i]?.toggleAttribute("data-lit", at >= stop.at));
      route.jobs.forEach((job, i) => jobs[i]?.toggleAttribute("data-reached", at >= job.at - route.lead));
      overlay.toggleAttribute("data-arrived", at >= length - 1);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, [route]);

  return (
    <div ref={ref} className="scroll-route" style={{ height: route?.height }} aria-hidden="true">
      {route && (
        <>
          <svg width="100%" height={route.height}>
            <path className="scroll-road" d={route.road} />
            <path className="scroll-trail" />
            <path className="scroll-trail" />
            {[...route.jobs, ...route.stops].map((stop) => (
              <circle key={stop.at} className="scroll-stop" cx={stop.x} cy={stop.y} r={route.pin} />
            ))}
            <Celebration at={route.stops[route.stops.length - 1]} scale={route.party} />
          </svg>
          <div className="scroll-bus">
            <Bus className="block w-full" />
          </div>
          {TIMELINE && <style>{busAnimation(route.frames)}</style>}
        </>
      )}
    </div>
  );
}
