import { RAYS, TWINKLES } from "../constants";
import type { Stop } from "../types";

// HTML, not SVG, and animating only transform and opacity,
// so it runs on the compositor instead of repainting every frame.
export function Celebration({ at, scale }: Readonly<{ at: Stop; scale: number }>) {
  return (
    <div className="scroll-party" style={{ left: at.x, top: at.y, scale }}>
      <i className="party-ring" />
      <i className="party-ring" style={{ animationDelay: "1s" }} />
      {RAYS.map((angle) => (
        <i key={angle} className="party-ray" style={{ rotate: `${angle}deg` }} />
      ))}
      {TWINKLES.map(([angle, distance, delay]) => (
        <i
          key={angle}
          className="party-twinkle"
          style={{
            translate: `${Math.cos((angle * Math.PI) / 180) * distance}px ${Math.sin((angle * Math.PI) / 180) * distance}px`,
            animationDelay: `${delay}s`,
          }}
        />
      ))}
    </div>
  );
}
