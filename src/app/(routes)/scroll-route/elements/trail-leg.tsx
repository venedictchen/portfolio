 import { SLACK } from "../constants";
import type { Leg, Ride } from "../types";

type LegProps = Readonly<{ leg: Leg; index: number | string }>;

// A leg down the page, sliding: a bar SLACK longer than the leg each way
// slides in a sticky frame like the sticky bus's, clipped to the leg, so
// its leading end (see slides) rides on that bus.
// In drive mode a sliding leg doesn't slide: its leading end rests at `rest`
// px down the screen, where the bus is held, and the clip does the rest.
function SlidingLeg({ leg, index, stuck, rest }: LegProps & Readonly<{ stuck: number; rest?: number }>) {
  const { x, y, length } = leg;
  const long = length + 1;
  return (
    <div className="trail-clip" style={{ left: x - 2, top: y, width: 4, height: long }}>
      <div className="trail-ride" style={{ top: -y, height: stuck }}>
        <div className="trail-frame">
          <div
            className="trail-slide"
            data-leg={index}
            style={{ top: -(long + 2 * SLACK), height: long + 2 * SLACK, translate: rest === undefined ? undefined : `0 ${rest}px` }}
          />
        </div>
      </div>
    </div>
  );
}

// A leg up or down the page, pinned: a bar as long as the leg slides in
// a sticky track twice as long, clipped to the leg, so the sticky offset
// (see pin) puts its leading end on the bus.
function PinnedLeg({ leg, index }: LegProps) {
  const { x, y, dy, length } = leg;
  const long = length + 1;
  return (
    <div className="trail-clip" style={{ left: x - 2, top: dy > 0 ? y : y - long, width: 4, height: long }}>
      <div className="trail-track" style={{ top: dy > 0 ? -long : 0, height: 2 * long }}>
        <div className="trail-pin" data-leg={index} style={{ height: long, top: dy > 0 ? -1e5 : 1e5 }} />
      </div>
    </div>
  );
}

function BarLeg({ leg, index }: LegProps) {
  const { x, y, dx, dy, length } = leg;
  const long = length + 1;
  const style = dx
    ? { left: dx > 0 ? x : x - long, top: y - 2, width: long, height: 4, transformOrigin: dx > 0 ? "left" : "right" }
    : { left: x - 2, top: dy > 0 ? y : y - long, width: 4, height: long, transformOrigin: dy > 0 ? "top" : "bottom" };
  return <div className="trail-bar" data-leg={index} style={style} />;
}

function CornerLeg({ leg, index }: LegProps) {
  const { x, y, dx, dy, r, nx, ny } = leg;
  const outer = r + 2;
  const start = (Math.atan2(-ny, -nx) * 180) / Math.PI;
  return (
    <div className="trail-corner" style={{ left: x + nx * r, top: y + ny * r, rotate: `${start}deg`, scale: `1 ${Math.sign(ny * dx - nx * dy)}` }}>
      <div className="trail-quadrant" style={{ width: outer, height: outer }}>
        <div className="trail-rotor" data-leg={index}>
          <svg className="trail-half" aria-hidden="true" style={{ left: -outer }} width={2 * outer} height={outer} viewBox={`${-outer} 0 ${2 * outer} ${outer}`}>
            <path d={`M ${r} 0 A ${r} ${r} 0 0 1 ${-r} 0`} />
          </svg>
        </div>
      </div>
    </div>
  );
}

// A leg of the trail: for a straight, a bar 1px longer so it overlaps the
// corner after; for a corner, a half-ring (stroked like the road, so they
// line up) turning about the corner's centre inside its quarter, in a frame
// turned (and mirrored) so the corner runs clockwise from 0°.
export function TrailLeg({ leg, index, ride, stuck, rest }: LegProps & Readonly<{ ride?: Ride; stuck: number; rest?: number }>) {
  if (ride === "slide") return <SlidingLeg leg={leg} index={index} stuck={stuck} rest={rest} />;
  if (ride === "pin") return <PinnedLeg leg={leg} index={index} />;
  if (!leg.r) return <BarLeg leg={leg} index={index} />;
  return <CornerLeg leg={leg} index={index} />;
}
