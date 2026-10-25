import { AIM, BOTTOM, EASE, FRAME, SLIDING, STEP, TOP, TURN } from "../constants";
import type { Mode, Point, Route, Stop } from "../types";
import { inFrame, keyframes, reveals, steadyLegs } from "./keyframes";
import { trace } from "./road";
import { ease, timetable } from "./timetable";

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

export function measure(overlay: HTMLElement, mode: Mode): Route | null {
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
  const toPage = origin.top + window.scrollY;
  // Aim within the viewport with toolbars shown, and arrive by the bottom of
  // the page with them hidden, when it scrolls least.
  const [view, large] = viewports(overlay);
  const last = document.documentElement.scrollHeight - large - 1;
  const sampleAt = (s: number) => Math.round(s / STEP);
  // The hero line from when the bus first shows on screen (on a phone it
  // starts below the fold), so it doesn't dash to catch up.
  const shows = { end: 1, to: Math.max(lineY + toPage - BOTTOM * view, 0) };
  // The lap's scroll budget: the most the page can scroll while the photo's
  // bottom (after the right edge) stays above BOTTOM and its top (at the
  // end) below TOP. 95% of it, for slack. On a short screen it's small, and
  // the lap the fastest stretch of the road.
  const photoHeight = photo.bottom - photo.top;
  const share = photoHeight / (runs[7].s - runs[3].s);
  const room = (BOTTOM - TOP) * view - photoHeight;
  const lapScroll = Math.max((0.95 * room) / (1 - share), 60);
  // It ends with the photo's top a little below TOP, clear of the navbar
  // even where easing carries the bus a touch further.
  const lapStart = photo.top + toPage - TOP * view - lapScroll - 24;
  // Where the final run down enters the Contact section.
  const lastRun = sampleAt(runs.at(-1)!.s);
  const land = ys.findIndex((y, i) => i >= lastRun && y >= contact.top);
  // After the lap the bus drops from TOP back down to AIM over twice as much
  // road as that drop, so at about twice the scroll's speed, not in a dash.
  const settle = Math.min(sampleAt(runs[7].s + 2 * (AIM - TOP) * view), land);
  // From the hero line to the lap at one even speed.
  const ramps = [
    shows,
    { end: sampleAt(runs[3].s), to: lapStart },
    { end: sampleAt(runs[7].s), to: lapStart + lapScroll },
    { end: settle, to: ys[settle] + toPage - AIM * view },
  ];

  const on = ([run, x]: [number, number], y: number): Stop => ({
    at: runs[run].s + Math.abs(x - runs[run].x) + Math.abs(y - runs[run].y),
    x,
    y,
  });
  const clearance = mode === "phone" ? contentLeft - endX : endX - contentRight;
  const scroll = ease(
    timetable(
      ys.map((y) => y + toPage),
      paces,
      ramps,
      land,
      view,
      last
    ),
    roads,
    EASE
  );
  const stuck = Math.max(scroll.at(-1)! - toPage, 0);
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
      if (steps.at(-1)![0] < scroll.at(-1)!) shown.push([steps.at(-1)![0], 0]);
    });
  } else {
    let leg = 0;
    turns.forEach((heading, i) => {
      while (leg + 1 < legs.length && legs[leg + 1].s <= roads[i]) leg++;
      const upright = Math.abs(Math.sin((heading * Math.PI) / 180)) > Math.SQRT1_2;
      const straight = legs[leg].r ? [leg - 1, leg + 1].find((k) => legs[k] && !legs[k].r && !legs[k].dx) : leg;
      const sticky = Number(upright && straight !== undefined && steady[straight]);
      if (shown.at(-1)![1] !== sticky) shown.push([scroll[i], sticky]);
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
