"use client";

import { useEffect, useRef, useState, type ComponentProps } from "react";
import { cn } from "@/lib/utils";

const settled = (img: HTMLImageElement) =>
  img.complete
    ? Promise.resolve()
    : new Promise((done) => {
        img.addEventListener("load", done, { once: true });
        img.addEventListener("error", done, { once: true });
      });

// Adds .is-playing once half of it is on screen and its images have loaded
// (the CSS keeps its animations paused until then), and .is-done when they
// have all finished. With replayOnView, leaving the screen completely
// rewinds them and coming back plays them again.
export function PlayOnView({
  className,
  replayOnHover,
  replayOnView,
  ...props
}: ComponentProps<"div"> & { replayOnHover?: boolean; replayOnView?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState<"waiting" | "playing" | "done">("waiting");

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    let active = true;
    let played = false;
    let rewound = false;
    const images = Promise.all(
      Array.from(node.querySelectorAll("img"), settled)
    );
    const animations = () => node.getAnimations({ subtree: true });
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.intersectionRatio >= 0.5 && !played) {
          played = true;
          if (!replayOnView) observer.disconnect();
          images.then(() => active && setStage("playing"));
        } else if (entry.intersectionRatio >= 0.5 && rewound) {
          rewound = false;
          animations().forEach((animation) => animation.play());
        } else if (played && !entry.isIntersecting) {
          rewound = true;
          animations().forEach((animation) => {
            animation.pause();
            animation.currentTime = 0;
          });
        }
      },
      { threshold: [0, 0.5] }
    );
    observer.observe(node);
    return () => {
      active = false;
      observer.disconnect();
    };
  }, [replayOnView]);

  useEffect(() => {
    if (stage !== "playing" || !ref.current) return;
    let active = true;
    const running = ref.current.getAnimations({ subtree: true });
    Promise.allSettled(running.map((animation) => animation.finished)).then(
      () => active && setStage("done")
    );
    return () => {
      active = false;
    };
  }, [stage]);

  // play() on a finished animation rewinds it to the start.
  const replay = () => {
    const animations = ref.current?.getAnimations({ subtree: true }) ?? [];
    if (stage !== "done" || animations.some((a) => a.playState !== "finished"))
      return;
    animations.forEach((animation) => animation.play());
  };

  return (
    <div
      ref={ref}
      onMouseEnter={replayOnHover ? replay : undefined}
      className={cn(
        className,
        stage !== "waiting" && "is-playing",
        stage === "done" && "is-done"
      )}
      {...props}
    />
  );
}
