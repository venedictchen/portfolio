"use client";
import { useState, useEffect } from "react";

// True once the page has scrolled a little, so the navbar can get a solid
// background. Checked at most once per frame with a passive listener, and
// only handed to React when it flips, so scrolling doesn't run React a frame
// at a time.
export const useNavbarStyles = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    let frame = 0;
    let scrolled: boolean | undefined;
    const update = () => {
      frame = 0;
      const next = window.scrollY > 24;
      if (next === scrolled) return;
      scrolled = next;
      setIsScrolled(next);
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
  }, []);

  return {
    isScrolled,
    barClass: isScrolled
      ? "bg-page/95 border-line"
      : "bg-transparent border-transparent",
  };
};
