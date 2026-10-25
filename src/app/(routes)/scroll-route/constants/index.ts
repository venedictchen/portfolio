export const DESKTOP = "(min-width: 85rem)";
export const TABLET = "(min-width: 48rem)";
export const TURN = 40;
export const FRAME = 16; // matches the photo's rounded-2xl
export const STEP = 4;
// ?route=js, css or drive picks one of the paths below anyway, to compare.
const PICK = typeof location === "undefined" ? null : new URLSearchParams(location.search).get("route");
// From the scroll handler, the bus shows a frame from a scroll position or
// two back; on iOS even scroll timelines are drawn a little apart from the
// scroll. On straights that run down the page the bus holds still on screen,
// so there a second bus rides a sticky frame that the browser keeps in step
// with the scroll, and a frame a little off barely moves it. Sticky needs
// the route's clip to be overflow: clip, not a scroll container.
export const STICKY = typeof CSS !== "undefined" && CSS.supports("overflow", "clip");
// On iPhone and iPad even that leaves the bus shaking wherever it moves on
// screen, so there it never follows the scroll by animation: it's held
// still on screen along the long straights, natively, and drives by itself
// (a timed animation) everywhere else. See useRouteDrive.
export const DRIVE =
  STICKY &&
  (PICK === "drive" ||
    (PICK === null &&
      typeof navigator !== "undefined" &&
      navigator.vendor === "Apple Computer, Inc." &&
      navigator.maxTouchPoints > 1));
// Scroll-driven CSS animations move the bus on the compositor, in step with
// the page; without them it follows from the scroll handler, a frame late.
export const TIMELINE =
  !DRIVE &&
  PICK !== "js" &&
  typeof CSS !== "undefined" &&
  CSS.supports("animation-timeline", "scroll()") &&
  CSS.supports("animation-range", "0px 1px");
// The trail's legs along those straights ride with it the same way, so
// their tips stay on it: from the scroll handler they're pinned (see pin),
// with scroll timelines they slide in a sticky frame like the bus's (see
// slides).
export const PINNED = !TIMELINE && !DRIVE && STICKY;
export const SLIDING = TIMELINE && STICKY;
// How far a sliding leg's bar runs past either end of the leg.
export const SLACK = 1000;
// px of scroll over which the sticky bus fades in or out over the page one.
export const FADE = 48;

// Bus position on screen, as fractions of the viewport height.
export const [TOP, AIM, BOTTOM] = [0.1, 0.6, 0.95];
// px of scroll either side over which the bus eases from one speed to the next.
export const EASE = 60;

export const RAYS = Array.from({ length: 12 }, (_, i) => i * 30);
// [angle in degrees, distance, delay in seconds]
export const TWINKLES = [
  [20, 58, 0.15], [75, 46, 0.35], [130, 62, 0.05], [185, 50, 0.4],
  [240, 60, 0.2], [300, 48, 0.3], [345, 66, 0.5], [105, 72, 0.6],
];
