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
};
