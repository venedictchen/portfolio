import { useEffect, type RefObject } from "react";
import { FOLLOW } from "../constants";
import type { Route } from "../types";

// ms over which the bus makes up any distance it's behind the scroll by.
const CATCH_UP = 80;

// Follow mode (?route=follow): the bus and trail run the scroll timeline's
// keyframes as timed animations, 1ms for each px of scroll, all at one time.
// The scroll never sets where they are: each frame only their speed is set,
// to the scroll's own plus a little more to make up what they're behind, and
// the browser moves them smoothly in between. So they follow the scroll a
// frame or two behind without being drawn a little apart from it frame to
// frame, which is what WebKit does to scroll-driven animations.
export function useRouteFollow(ref: RefObject<HTMLElement | null>, route: Route | null) {
  useEffect(() => {
    const overlay = ref.current;
    if (!FOLLOW || !route || !overlay) return;
    const animations = overlay
      .getAnimations({ subtree: true })
      .filter((animation) => /^(bus|trail)-/.test((animation as CSSAnimation).animationName ?? ""));
    if (!animations.length) return;

    let frame = 0;
    let rate = 0;
    let [lastY, lastT] = [window.scrollY, performance.now()];
    let speed = 0; // the scroll's, in px per ms
    const time = () => Number(animations[0].currentTime ?? 0);
    const hold = (y: number) => {
      for (const animation of animations) {
        animation.pause();
        animation.currentTime = y;
      }
      rate = 0;
    };

    const tick = (now: number) => {
      frame = 0;
      const y = window.scrollY;
      const dt = now - lastT;
      // As it is now, not averaged, so it stops when the scroll does.
      if (dt > 0) speed = (y - lastY) / dt;
      [lastY, lastT] = [y, now];
      const behind = y - time();
      // Caught up and still: rest exactly where the scroll is.
      if (Math.abs(behind) < 0.5 && Math.abs(speed) < 0.005) {
        if (rate !== 0) hold(y);
        return;
      }
      const next = Math.min(Math.max(speed + behind / CATCH_UP, -20), 20);
      if (rate === 0 || Math.abs(next - rate) > 0.02 * Math.max(Math.abs(rate), 0.05)) {
        for (const animation of animations) {
          animation.updatePlaybackRate(next);
          if (animation.playState !== "running") animation.play();
        }
        rate = next;
      }
      frame = requestAnimationFrame(tick);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };

    hold(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, [ref, route]);
}
