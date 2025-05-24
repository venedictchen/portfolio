"use client";

import { useEffect, useState } from "react";

type BreakpointSize = "sm" | "md" | "lg" | "xl" | "2xl";

const breakpointSizes: Record<BreakpointSize, number> = {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    "2xl": 1536,
};

export const useIsBreakpointOrLarger = (breakpoint: BreakpointSize) => {
    const [isBreakpointOrLarger, setIsBreakpointOrLarger] = useState(false);

    useEffect(() => {
        const minWidth = breakpointSizes[breakpoint];
        const mediaQuery = window.matchMedia(`(min-width: ${minWidth}px)`);
        setIsBreakpointOrLarger(mediaQuery.matches);

        const handler = (e: MediaQueryListEvent) =>
            setIsBreakpointOrLarger(e.matches);
        mediaQuery.addEventListener("change", handler);

        return () => mediaQuery.removeEventListener("change", handler);
    }, [breakpoint]);

    return isBreakpointOrLarger;
};
