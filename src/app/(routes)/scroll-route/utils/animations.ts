import { FADE, SLIDING, STICKY } from "../constants";
import type { Frame, Leg, Route } from "../types";
import { slides } from "./keyframes";

// How a leg shows u px of itself, as [property, value]: a straight's bar
// scales out along it, a corner's half-ring turns into its quarter. Both
// animate on the compositor, and rest square to the pixel grid.
export function reveal(leg: Leg, u: number) {
  // Keyframes round to hundredths, so within that of the end is the end.
  const f = u > leg.length - 0.01 ? 1 : Math.max(u / leg.length, 0);
  if (leg.r) return ["rotate", `${(f * 90 - 180).toFixed(2)}deg`];
  return ["scale", leg.dx ? `${f.toFixed(4)} 1` : `1 ${f.toFixed(4)}`];
}

// The bus and each leg of the trail on the page's scroll timeline. Every one
// spans the whole route, holding its first and last values out to the ends:
// Safari slips at the edges of an animation's range when scrolling back,
// leaving a leg drawn, or not, apart from the bus.
export function animations(route: Route) {
  const end = route.scroll.at(-1)!;
  const rule = (name: string, selector: string, steps: [number, string][]) => {
    const whole: [number, string][] = [
      ...(steps[0][0] > 0 ? [[0, steps[0][1]] as [number, string]] : []),
      ...steps,
      ...(steps.at(-1)![0] < end ? [[end, steps.at(-1)![1]] as [number, string]] : []),
    ];
    const to = whole.at(-1)![0];
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
    // The sticky bus, drawn over the page one, fades in over FADE px of scroll
    // where it takes over and out over FADE px before it hands back, with the
    // page bus showing under it meanwhile. In step the two sit exactly
    // together; where Safari draws them a little apart, it blends them
    // rather than jumping from one to the other.
    const page: [number, string][] = [[0, "opacity:1"]];
    const screen: [number, string][] = [[0, "opacity:0"]];
    const swaps = route.shown.slice(1);
    swaps.forEach(([at, sticky], i) => {
      const fade = Math.min(FADE, ((swaps[i + 1]?.[0] ?? Infinity) - at) / 3, (at - (swaps[i - 1]?.[0] ?? -Infinity)) / 3);
      if (sticky) {
        screen.push([at, "opacity:0"], [at + fade, "opacity:1"]);
        page.push([at + fade - 0.01, "opacity:1"], [at + fade, "opacity:0"]);
      } else {
        screen.push([at - fade, "opacity:1"], [at, "opacity:0"]);
        page.push([at - fade - 0.01, "opacity:0"], [at - fade, "opacity:1"]);
      }
    });
    css += rule("bus-face-page", '[data-frame="page"] > .bus-face', page);
    css += rule("bus-face-screen", '[data-frame="screen"] > .bus-face', screen);
  }
  const legs = route.legs.map((leg, i) => {
    if (leg.length <= 0) return "";
    const steps: [number, string][] =
      SLIDING && route.steady[i]
        ? slides(leg, route.trail[i], route.top, route.stuck).map(([at, y]) => [at, `translate:0 ${y}px`])
        : route.trail[i].map(([at, u]) => [at, reveal(leg, u).join(":")]);
    return rule(`trail-${i}`, `[data-leg="${i}"]`, steps);
  });
  return css + legs.join("");
}
