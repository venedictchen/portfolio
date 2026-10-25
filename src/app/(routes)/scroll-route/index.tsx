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
// the page (Safari too, since 26.4); without them it follows from the scroll
// handler, a frame late. ?route=js picks that path anyway, to compare.
const PICK = typeof location === "undefined" ? null : new URLSearchParams(location.search).get("route");
const TIMELINE =
  PICK !== "js" &&
  typeof CSS !== "undefined" &&
  CSS.supports("animation-timeline", "scroll()") &&
  CSS.supports("animation-range", "0px 1px");
// From the scroll handler, the bus shows a frame from a scroll position or
// two back; on iOS even scroll timelines are drawn a little apart from the
// scroll. On straights that run down the page the bus holds still on screen,
// so there a second bus rides a sticky frame that the browser keeps in step
// with the scroll, and a frame a little off barely moves it. Sticky needs
// the route's clip to be overflow: clip, not a scroll container.
const STICKY = typeof CSS !== "undefined" && CSS.supports("overflow", "clip");
// The trail's legs along those straights ride with it the same way, so
// their tips stay on it: from the scroll handler they're pinned (see pin),
// with scroll timelines they slide in a sticky frame like the bus's (see
// slides).
const PINNED = !TIMELINE && STICKY;
const SLIDING = TIMELINE && STICKY;
// How far a sliding leg's bar runs past either end of the leg.
const SLACK = 1000;

// pace: minimum scroll per px of road to the next point
type Point = { x: number; y: number; r: number; pace?: number };
// A straight or corner of the road: where it starts along the road and on
// screen and its heading there; corners also turn towards (nx, ny) with radius r.
type Leg = { s: number; length: number; x: number; y: number; dx: number; dy: number; r: number; nx: number; ny: number };
type Frame = [scroll: number, x: number, y: number, heading: number];
type Step = [scroll: number, u: number]; // u: px of a leg drawn by then

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
  road: string; // path without the hero line, which the hero draws itself
  length: number;
  legs: Leg[];
  roads: number[]; // distance along the road of each sample
  scroll: number[]; // scroll position at each sample
  top: number; // where the route starts on the page
  frames: Frame[]; // the bus's keyframes on the page
  stuck: number; // how far the sticky frame rides down the route
  screen: Frame[]; // the bus's keyframes in the sticky frame
  shown: [scroll: number, screen: number][]; // from where each bus shows (1: the sticky one)
  steady: boolean[]; // legs the sticky bus rides
  trail: Step[][]; // each leg's keyframes
  years: number[];
  jobs: Stop[];
  stops: Stop[];
};

// Rounds the corners of an axis-aligned polyline into an SVG path, sampling
// position, heading and pace every STEP along it.
function trace(corners: Point[]) {
  // On whole pixels, which layout and drawing both hold exactly, so the
  // trail's boxes line up with the road under it.
  const grid = corners.map((p) => ({ ...p, x: Math.round(p.x), y: Math.round(p.y) }));
  // Corners closer together than their radii share the gap, so the road
  // never doubles back.
  const gap = (i: number, j: number) => Math.abs(grid[j].x - grid[i].x) + Math.abs(grid[j].y - grid[i].y);
  const ends = grid.length - 1;
  const points = grid.map((p, i) => {
    if (i === 0 || i === ends) return p;
    const r = Math.min(p.r, gap(i - 1, i) / (i > 1 ? 2 : 1), gap(i, i + 1) / (i < ends - 1 ? 2 : 1));
    return { ...p, r: Math.floor(r) };
  });
  const roads: number[] = [];
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
    at: (u: number) => number[],
    [r, nx, ny] = [0, 0, 0]
  ) => {
    legs.push({ s, length, ...start, dx, dy, r, nx, ny });
    d += command;
    for (; next <= s + length; next += STEP) {
      const [x, y, heading] = at(next - s);
      const degrees = (heading * 180) / Math.PI;
      const prev = headings.at(-1) ?? 0;
      roads.push(next);
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
      },
      [r, nx, ny]
    );
  }
  // And the very end, past the last STEP.
  if (next - STEP < s) {
    roads.push(s);
    xs.push(points[ends].x);
    ys.push(points[ends].y);
    headings.push(headings[headings.length - 1]);
    paces.push(paces[paces.length - 1]);
  }
  return { road: heroEnd + d.slice(d.indexOf(" A ")), length: s, roads, xs, ys, headings, paces, runs, legs };
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

// Keyframes from samples taken at increasing scroll positions: the samples,
// less those that interpolating between their neighbours puts within
// tolerance in every series ([values, tolerance]).
function simplify(scroll: number[], series: [number[], number][]) {
  const keep = [0];
  for (let from = 0, to = 2; to < scroll.length; to++) {
    let fits = to - from < 256;
    for (let k = from + 1; fits && k < to; k++) {
      const t = (scroll[k] - scroll[from]) / (scroll[to] - scroll[from]);
      fits = series.every(([v, tolerance]) => Math.abs(v[from] + t * (v[to] - v[from]) - v[k]) <= tolerance);
    }
    if (!fits) keep.push((from = to - 1));
  }
  if (scroll.length > 1) keep.push(scroll.length - 1);
  return keep.map((i) => [scroll[i], ...series.map(([v]) => v[i])].map((v) => Math.round(v * 100) / 100));
}

// The bus's keyframes, to within a quarter pixel and half a degree.
function keyframes(scroll: number[], xs: number[], ys: number[], headings: number[]) {
  const frames = simplify(scroll, [[xs, 0.25], [ys, 0.25], [headings, 0.5]]) as Frame[];
  if (frames[0][0] > 0) frames.unshift([0, ...frames[0].slice(1)] as Frame);
  return frames;
}

// The bus's keyframes in the sticky frame: its place on the page less the
// frame's, which rides with the scroll from `start` for `stuck` px. Between
// keyframes both change linearly, but for where the frame sticks and unsticks.
function inFrame(frames: Frame[], start: number, stuck: number) {
  const ride = (at: number) => Math.min(Math.max(at - start, 0), stuck);
  const out: Frame[] = [];
  frames.forEach((frame, i) => {
    const prev = frames[i - 1];
    for (const kink of [start, start + stuck]) {
      if (!prev || kink <= prev[0] || kink >= frame[0]) continue;
      const t = (kink - prev[0]) / (frame[0] - prev[0]);
      out.push([kink, ...[1, 2, 3].map((k) => prev[k] + t * (frame[k] - prev[k]))] as Frame);
    }
    out.push(frame);
  });
  return out.map(([at, x, y, heading]): Frame => [at, x, Math.round((y - ride(at)) * 100) / 100, heading]);
}

// Each leg's keyframes, to within a quarter pixel: how much of it is drawn
// from the scroll where the bus reaches it to where it leaves.
function reveals(legs: Leg[], roads: number[], scroll: number[]) {
  const scrollAt = (at: number) => {
    let i = 0;
    for (let step = 1 << 15; step; step >>= 1) if (i + step < roads.length && roads[i + step] <= at) i += step;
    const j = Math.min(i + 1, roads.length - 1);
    return roads[j] > roads[i] ? scroll[i] + ((at - roads[i]) / (roads[j] - roads[i])) * (scroll[j] - scroll[i]) : scroll[i];
  };
  return legs.map(({ s, length }) => {
    const points: Step[] = [[scrollAt(s), 0]];
    roads.forEach((at, k) => {
      if (at > s && at < s + length && scroll[k] > points[points.length - 1][0]) points.push([scroll[k], at - s]);
    });
    const end = scrollAt(s + length);
    if (end > points[points.length - 1][0]) points.push([end, length]);
    else points[points.length - 1][1] = length;
    return simplify(points.map(([at]) => at), [[points.map(([, u]) => u), 0.25]]) as Step[];
  });
}

// A sliding leg's keyframes: where its bar's leading end sits in the sticky
// frame, which rides with the scroll from `top` for `stuck` px. On the leg
// it's on the bus, in that frame too, so the two are drawn together; off it
// it holds SLACK clear of the leg, so a frame drawn a little apart from the
// scroll still shows all of the leg or none.
function slides(leg: Leg, steps: Step[], top: number, stuck: number) {
  const ride = (at: number) => Math.min(Math.max(at - top, 0), stuck);
  const [from, to, end] = [steps[0][0], steps[steps.length - 1][0], top + stuck];
  const tips: Step[] = [
    [0, -SLACK],
    [top, -SLACK],
    [from - 0.01, -SLACK],
    ...steps,
    // Unless the road ends with it, and the bus stays on its end.
    ...(to < end ? [[to + 0.01, leg.length + 1 + SLACK] as Step, [end, leg.length + 1 + SLACK] as Step] : []),
  ];
  return tips
    .filter(([at], i) => at >= 0 && tips.slice(0, i).every(([before]) => before < at))
    .map(([at, u]): Step => [at, Math.round((leg.y + u - ride(at)) * 100) / 100]);
}

// Legs down the page along which the bus all but holds still on screen
// (screenY: its place on screen at each sample), for long enough to be worth
// riding the sticky frame. Where the route turns quickly (the hero, the photo
// lap) the bus moves on screen, and swapping between a late page bus and the
// sticky one would jump by however late it is.
function steadyLegs(legs: Leg[], roads: number[], scroll: number[], screenY: number[]) {
  return legs.map((leg) => {
    if (leg.r || leg.dx) return false;
    let [moved, span] = [0, 0];
    for (let k = 1; k < roads.length; k++) {
      if (roads[k - 1] < leg.s || roads[k] > leg.s + leg.length) continue;
      moved += Math.abs(screenY[k] - screenY[k - 1]);
      span += scroll[k] - scroll[k - 1];
    }
    return span >= 120 && moved <= 0.3 * span;
  });
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
  const { road, length, roads, xs, ys, headings: turns, paces, runs, legs } = trace(points);
  // The lap's scroll budget: the most the page can scroll while the photo's
  // bottom (after the right edge) stays above BOTTOM and its top (at the
  // end) below TOP. 90% of it, for slack.
  const toPage = origin.top + window.scrollY;
  // Aim within the viewport with toolbars shown, and arrive by the bottom of
  // the page with them hidden, when it scrolls least.
  const [view, large] = viewports(overlay);
  const last = document.documentElement.scrollHeight - large - 1;
  const sampleAt = (s: number) => Math.round(s / STEP);
  // The hero line from when the bus first shows on screen (on a phone it
  // starts below the fold), so it doesn't dash to catch up.
  const shows = { end: 1, to: Math.max(lineY + toPage - BOTTOM * view, 0) };
  const photoHeight = photo.bottom - photo.top;
  const share = photoHeight / (runs[7].s - runs[3].s);
  const room = (BOTTOM - TOP) * view - photoHeight;
  const lapScroll = Math.max((0.9 * room) / (1 - share), 60);
  const lapStart = photo.top + toPage - TOP * view - lapScroll - 10;
  const ramps = [
    shows,
    { end: sampleAt(runs[1].s), to: lineY + toPage - AIM * view },
    { end: sampleAt(runs[3].s), to: lapStart },
    { end: sampleAt(runs[7].s), to: lapStart + lapScroll },
  ];
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
    ramps,
    land,
    view,
    last
  );
  // The sticky frame rides from the top of the route to where the bus arrives.
  const stuck = Math.max(scroll[scroll.length - 1] - toPage, 0);
  const frames = keyframes(scroll, xs, ys, turns);
  const steady = steadyLegs(legs, roads, scroll, ys.map((y, i) => y + toPage - scroll[i]));
  const trail = reveals(legs, roads, scroll);
  // The sticky bus shows along steady legs, swapping halfway round the
  // corners either side; the page bus drives everywhere else. With scroll
  // timelines, which can draw the two buses a little apart, they swap where
  // the legs start and end instead, as their trail does (see slides).
  const shown: [number, number][] = [[scroll[0], 0]];
  if (SLIDING) {
    legs.forEach((_, i) => {
      if (!steady[i]) return;
      const steps = trail[i];
      shown.push([steps[0][0], 1]);
      if (steps[steps.length - 1][0] < scroll[scroll.length - 1]) shown.push([steps[steps.length - 1][0], 0]);
    });
  } else {
    let leg = 0;
    turns.forEach((heading, i) => {
      while (leg + 1 < legs.length && legs[leg + 1].s <= roads[i]) leg++;
      const upright = Math.abs(Math.sin((heading * Math.PI) / 180)) > Math.SQRT1_2;
      const straight = legs[leg].r ? [leg - 1, leg + 1].find((k) => legs[k] && !legs[k].r && !legs[k].dx) : leg;
      const sticky = Number(upright && straight !== undefined && steady[straight]);
      if (shown[shown.length - 1][1] !== sticky) shown.push([scroll[i], sticky]);
    });
  }

  return {
    height: end + 60,
    lead: mode === "phone" ? 0.25 * view : 0,
    pin: mode === "phone" ? 7 : 9,
    party: Math.min(Math.max((clearance + 8) / 60, 0.45), 1),
    road,
    length,
    legs,
    roads,
    scroll,
    top: toPage,
    frames,
    stuck,
    screen: inFrame(frames, toPage, stuck),
    shown,
    steady,
    trail,
    years: years.map((pin) => pin.x - startX),
    jobs: jobs.map((y) => on(jobsOn, y)),
    stops: [on(projectsOn, projectsH2.midY), on(writingOn, writingH2.midY), { at: length, x: endX, y: end }],
  };
}

// How a leg shows u px of itself, as [property, value]: a straight's bar
// scales out along it, a corner's half-ring turns into its quarter. Both
// animate on the compositor, and rest square to the pixel grid.
function reveal(leg: Leg, u: number) {
  // Keyframes round to hundredths, so within that of the end is the end.
  const f = u > leg.length - 0.01 ? 1 : Math.max(u / leg.length, 0);
  if (leg.r) return ["rotate", `${(f * 90 - 180).toFixed(2)}deg`];
  return ["scale", leg.dx ? `${f.toFixed(4)} 1` : `1 ${f.toFixed(4)}`];
}

// The bus and each leg of the trail on the page's scroll timeline. Every one
// spans the whole route, holding its first and last values out to the ends:
// Safari slips at the edges of an animation's range when scrolling back,
// leaving a leg drawn, or not, apart from the bus.
function animations(route: Route) {
  const end = route.scroll[route.scroll.length - 1];
  const rule = (name: string, selector: string, steps: [number, string][]) => {
    const whole: [number, string][] = [
      ...(steps[0][0] > 0 ? [[0, steps[0][1]] as [number, string]] : []),
      ...steps,
      ...(steps[steps.length - 1][0] < end ? [[end, steps[steps.length - 1][1]] as [number, string]] : []),
    ];
    const to = whole[whole.length - 1][0];
    if (to <= 0) return "";
    // Fine enough to keep steps 0.01px of scroll apart on the longest page.
    const frames = whole.map(([at, value]) => `${((at / to) * 100).toFixed(6)}%{${value}}`);
    return (
      `@keyframes ${name}{${frames.join("")}}` +
      `${selector}{animation:${name} auto linear both;animation-timeline:scroll(root);animation-range:0px ${to}px}`
    );
  };
  const drive = (frames: Frame[]) =>
    frames.map(([at, x, y, heading]): [number, string] => [at, `translate:${x}px ${y}px;rotate:${heading}deg`]);
  let css = rule("bus-page", '.scroll-bus[data-frame="page"]', drive(route.frames));
  if (STICKY) {
    css += rule("bus-screen", '.scroll-bus[data-frame="screen"]', drive(route.screen));
    // Each bus's face fades in and out in a step where the other takes over.
    for (const [which, frame] of ["page", "screen"].entries()) {
      const steps: [number, string][] = [];
      route.shown.forEach(([at, sticky], i) => {
        const opacity = `opacity:${Number(sticky === which)}`;
        if (i) steps.push([at - 0.01, steps[steps.length - 1][1]]);
        steps.push([at, opacity]);
      });
      steps.push([Math.max(end, steps[steps.length - 1][0] + 1), steps[steps.length - 1][1]]);
      css += rule(`bus-face-${frame}`, `[data-frame="${frame}"] > .bus-face`, steps);
    }
  }
  const legs = route.legs.map((leg, i) => {
    if (!(leg.length > 0)) return "";
    const steps: [number, string][] =
      SLIDING && route.steady[i]
        ? slides(leg, route.trail[i], route.top, route.stuck).map(([at, y]) => [at, `translate:0 ${y}px`])
        : route.trail[i].map(([at, u]) => [at, reveal(leg, u).join(":")]);
    return rule(`trail-${i}`, `[data-leg="${i}"]`, steps);
  });
  return css + legs.join("");
}

// Which bus shows at scroll y: 1 for the sticky one.
function showing(shown: Route["shown"], y: number) {
  let sticky = shown[0][1];
  for (const [at, which] of shown) if (at <= y) sticky = which;
  return sticky;
}

// A leg of the trail: for a straight, a bar 1px longer so it overlaps the
// corner after; for a corner, a half-ring (stroked like the road, so they
// line up) turning about the corner's centre inside its quarter, in a frame
// turned (and mirrored) so the corner runs clockwise from 0°.
function TrailLeg({ leg, index, ride, stuck }: { leg: Leg; index: number; ride?: "pin" | "slide"; stuck: number }) {
  const { x, y, dx, dy, r, nx, ny, length } = leg;
  if (ride === "slide") {
    // A leg down the page, sliding: a bar SLACK longer than the leg each way
    // slides in a sticky frame like the sticky bus's, clipped to the leg, so
    // its leading end (see slides) rides on that bus.
    const long = length + 1;
    return (
      <div className="trail-clip" style={{ left: x - 2, top: y, width: 4, height: long }}>
        <div className="trail-ride" style={{ top: -y, height: stuck }}>
          <div className="trail-frame">
            <div className="trail-slide" data-leg={index} style={{ top: -(long + 2 * SLACK), height: long + 2 * SLACK }} />
          </div>
        </div>
      </div>
    );
  }
  if (ride === "pin") {
    // A leg up or down the page, pinned: a bar as long as the leg slides in
    // a sticky track twice as long, clipped to the leg, so the sticky offset
    // (see pin) puts its leading end on the bus.
    const long = length + 1;
    return (
      <div className="trail-clip" style={{ left: x - 2, top: dy > 0 ? y : y - long, width: 4, height: long }}>
        <div className="trail-track" style={{ top: dy > 0 ? -long : 0, height: 2 * long }}>
          <div className="trail-pin" data-leg={index} style={{ height: long, top: dy > 0 ? -1e5 : 1e5 }} />
        </div>
      </div>
    );
  }
  if (!r) {
    const long = length + 1;
    const style = dx
      ? { left: dx > 0 ? x : x - long, top: y - 2, width: long, height: 4, transformOrigin: dx > 0 ? "left" : "right" }
      : { left: x - 2, top: dy > 0 ? y : y - long, width: 4, height: long, transformOrigin: dy > 0 ? "top" : "bottom" };
    return <div className="trail-bar" data-leg={index} style={style} />;
  }
  const outer = r + 2;
  const start = (Math.atan2(-ny, -nx) * 180) / Math.PI;
  return (
    <div className="trail-corner" style={{ left: x + nx * r, top: y + ny * r, rotate: `${start}deg`, scale: `1 ${Math.sign(ny * dx - nx * dy)}` }}>
      <div className="trail-quadrant" style={{ width: outer, height: outer }}>
        <div className="trail-rotor" data-leg={index}>
          <svg className="trail-half" style={{ left: -outer }} width={2 * outer} height={outer} viewBox={`${-outer} 0 ${2 * outer} ${outer}`}>
            <path d={`M ${r} 0 A ${r} ${r} 0 0 1 ${-r} 0`} />
          </svg>
        </div>
      </div>
    </div>
  );
}

// The bus's keyframes interpolated at scroll y: [x, y, heading].
function along(frames: Frame[], y: number) {
  let i = 0;
  for (let step = 1 << 15; step; step >>= 1) if (i + step < frames.length && frames[i + step][0] <= y) i += step;
  const [a, b] = [frames[i], frames[Math.min(i + 1, frames.length - 1)]];
  const t = b[0] > a[0] ? Math.min(Math.max((y - a[0]) / (b[0] - a[0]), 0), 1) : 0;
  return [1, 2, 3].map((k) => a[k] + t * (b[k] - a[k]));
}

// Without scroll timelines: the bus, placed from the scroll handler.
function place(bus: HTMLElement, frames: Frame[], y: number) {
  const [x, busY, heading] = along(frames, y);
  bus.style.translate = `${x}px ${busY}px`;
  bus.style.rotate = `${heading}deg`;
}

// A pinned leg's sticky offset: on the leg, its leading end sits where the
// bus is on screen (screenY); off it, far enough either way to hold the leg
// all drawn or not at all.
function pin(leg: Leg, at: number, screenY: number) {
  const down = leg.dy > 0;
  if (at <= leg.s) return down ? -1e5 : 1e5;
  if (at >= leg.s + leg.length) return down ? 1e5 : -1e5;
  return down ? screenY - (leg.length + 1) : screenY;
}

// HTML, not SVG, and animating only transform and opacity (see globals.css),
// so it runs on the compositor instead of repainting every frame.
function Celebration({ at, scale }: { at: Stop; scale: number }) {
  return (
    <div className="scroll-party" style={{ left: at.x, top: at.y, scale }}>
      <i className="party-ring" />
      <i className="party-ring" style={{ animationDelay: "1s" }} />
      {RAYS.map((angle) => (
        <i key={angle} className="party-ray" style={{ rotate: `${angle}deg` }} />
      ))}
      {TWINKLES.map(([angle, distance, delay]) => (
        <i
          key={angle}
          className="party-twinkle"
          style={{
            translate: `${Math.cos((angle * Math.PI) / 180) * distance}px ${Math.sin((angle * Math.PI) / 180) * distance}px`,
            animationDelay: `${delay}s`,
          }}
        />
      ))}
    </div>
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
    const bus = overlay.querySelector<HTMLElement>('.scroll-bus[data-frame="page"]');
    const stickyBus = overlay.querySelector<HTMLElement>('.scroll-bus[data-frame="screen"]');
    const faces = [bus, stickyBus].map((el) => el?.querySelector<HTMLElement>(".bus-face"));
    const legs = overlay.querySelectorAll<HTMLElement>("[data-leg]");
    const years = document.querySelectorAll(".route-pin");
    const pins = overlay.querySelectorAll(".scroll-stop");
    const jobs = document.querySelectorAll("#experience ol > li");
    const { roads, scroll, length } = route;
    const drawn: number[] = [];
    let frame = 0;
    const update = (resting = false) => {
      frame = 0;
      const y = window.scrollY;
      let at = length;
      // No layout reads here: one would force style and layout mid-frame.
      if (y < scroll[scroll.length - 1]) {
        let i = 0;
        for (let step = 1 << 15; step; step >>= 1)
          if (i + step < scroll.length && scroll[i + step] <= y) i += step;
        const j = Math.min(i + 1, scroll.length - 1);
        const between = j > i ? (y - scroll[i]) / (scroll[j] - scroll[i]) : 0;
        at = Math.min(Math.max(roads[i] + between * (roads[j] - roads[i]), 0), length);
      }
      // Without scroll timelines the bus and trail follow from here.
      if (!TIMELINE) {
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
      if (here || (resting && overlay.hasAttribute("data-arrived"))) overlay.toggleAttribute("data-arrived", here);
      overlay.toggleAttribute("data-left", !here && overlay.hasAttribute("data-arrived"));
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
    overlay.toggleAttribute("data-glide", !TIMELINE);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("scrollend", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(rest);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("scrollend", onScroll);
    };
  }, [route]);

  return (
    <div ref={ref} className="scroll-route" style={{ height: route?.height }} aria-hidden="true">
      {route && (
        <>
          <svg width="100%" height={route.height}>
            <path className="scroll-road" d={route.road} />
            {[...route.jobs, ...route.stops].map((stop) => (
              <circle key={stop.at} className="scroll-stop" cx={stop.x} cy={stop.y} r={route.pin} />
            ))}
          </svg>
          {/* Over the stops, but it only reaches each as it lights up amber too. */}
          <div className="scroll-trail">
            {route.legs.map(
              (leg, i) =>
                leg.length > 0 && (
                  <TrailLeg
                    key={leg.s}
                    leg={leg}
                    index={i}
                    ride={route.steady[i] ? (PINNED ? "pin" : SLIDING ? "slide" : undefined) : undefined}
                    stuck={route.stuck}
                  />
                )
            )}
          </div>
          <Celebration at={route.stops[route.stops.length - 1]} scale={route.party} />
          <div className="scroll-bus" data-frame="page">
            <div className="bus-face">
              <i className="bus-glow" />
              <Bus className="block w-full" />
            </div>
          </div>
          {STICKY && (
            <div className="bus-ride" style={{ height: route.stuck }}>
              <div className="bus-sticky">
                <div className="scroll-bus" data-frame="screen">
                  <div className="bus-face">
                    <i className="bus-glow" />
                    <Bus className="block w-full" />
                  </div>
                </div>
              </div>
            </div>
          )}
          {TIMELINE && <style>{animations(route)}</style>}
        </>
      )}
    </div>
  );
}
