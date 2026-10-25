import { useEffect, useState, type RefObject } from "react";
import { DESKTOP, TABLET } from "../constants";
import type { Mode, Route } from "../types";
import { measure } from "../utils/measure";

// The route, measured from the page under the overlay, and again whenever
// the page resizes or switches between phone, tablet and desktop.
export function useRoute(ref: RefObject<HTMLElement | null>) {
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
  }, [ref]);

  return route;
}
