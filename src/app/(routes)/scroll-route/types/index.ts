export type Mode = "desktop" | "tablet" | "phone";

// pace: minimum scroll per px of road to the next point
export type Point = { x: number; y: number; r: number; pace?: number };
// A straight or corner of the road: where it starts along the road and on
// screen and its heading there; corners also turn towards (nx, ny) with radius r.
export type Leg = { s: number; length: number; x: number; y: number; dx: number; dy: number; r: number; nx: number; ny: number };
export type Frame = [scroll: number, x: number, y: number, heading: number];
export type Step = [scroll: number, u: number]; // u: px of a leg drawn by then
export type Stop = { at: number; x: number; y: number }; // at: distance along the road
// How a leg along a steady straight rides with the sticky bus.
export type Ride = "pin" | "slide";
export type Pose = [x: number, y: number, heading: number];

// Drive mode (see useRouteDrive). A stretch the bus drives by itself: its
// road, the scroll that sets it off forwards and sends it back, how long it
// takes in ms, the hold it ends in, and keyframes for the bus and for each
// piece of trail along it.
export type Drive = {
  from: number;
  to: number;
  forward: number;
  back: number;
  duration: number;
  hold?: number;
  start: Pose;
  end: Pose;
  bus: Keyframe[];
  pieces: [piece: number, keyframes: Keyframe[]][];
};
// A stretch down a straight where the bus is held still on screen while the
// page scrolls: its road, its top and bottom on the page, the scroll over
// which it's held, and where on screen (if not the plan's).
export type Hold = { from: number; to: number; top: number; bottom: number; start: number; end: number; x: number; screen?: number };
// A piece of trail: all or part of a leg, along a drive or a hold (or
// neither, following the scroll in mixed mode or glide mode).
export type Piece = { leg: Leg; drive?: number; hold?: number };
// Drive mode's plan (glide mode's has no drives, and the bus's place along
// the road to glide by). In mixed mode the road follows the scroll up to
// `scrolled.to`, until scroll `scrolled.end`.
export type Plan = {
  kind: "drive" | "glide";
  screen: number;
  view: number;
  drives: Drive[];
  holds: Hold[];
  pieces: Piece[];
  scrolled?: { to: number; end: number };
  poses?: { xs: number[]; ys: number[]; headings: number[] };
};

export type Route = {
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
  drive?: Plan; // in drive mode
};
