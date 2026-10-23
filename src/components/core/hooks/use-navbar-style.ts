"use client";
import { useState, useEffect } from "react";

// True once the page has scrolled a little, so the navbar can get a solid
// background. Checked at most once per frame with a passive listener.
export const useNavbarStyles = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      setIsScrolled(window.scrollY > 24);
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
