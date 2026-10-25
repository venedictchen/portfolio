"use client";

import { useRef } from "react";
import { Bus } from "@/components";
import { PINNED, SLIDING, STICKY, TIMELINE } from "./constants";
import { Celebration } from "./elements/celebration";
import { TrailLeg } from "./elements/trail-leg";
import { useRoute, useRouteProgress } from "./hooks";
import type { Ride } from "./types";
import { animations } from "./utils/animations";

// Legs along steady straights ride with the sticky bus: pinned from the
// scroll handler, sliding with scroll timelines.
function rideFor(steady: boolean): Ride | undefined {
  if (!steady) return undefined;
  if (PINNED) return "pin";
  if (SLIDING) return "slide";
  return undefined;
}

export default function ScrollRoute() {
  const ref = useRef<HTMLDivElement>(null);
  const route = useRoute(ref);
  useRouteProgress(ref, route);

  return (
    <div ref={ref} className="scroll-route" style={{ height: route?.height }} aria-hidden="true">
      {route && (
        <>
          <svg width="100%" height={route.height}>
            <path className="scroll-road" d={route.road} />
            {[...route.jobs, ...route.stops].map((stop) => (
              <circle key={stop.at} className="scroll-stop" cx={stop.x} cy={stop.y} r={route.pin} />
            ))}
          </svg>
          {/* Over the stops, but it only reaches each as it lights up amber too. */}
          <div className="scroll-trail">
            {route.legs.map(
              (leg, i) =>
                leg.length > 0 && (
                  <TrailLeg
                    key={leg.s}
                    leg={leg}
                    index={i}
                    ride={rideFor(route.steady[i])}
                    stuck={route.stuck}
                  />
                )
            )}
          </div>
          <Celebration at={route.stops.at(-1)!} scale={route.party} />
          <div className="scroll-bus" data-frame="page">
            <div className="bus-face">
              <i className="bus-glow" />
              <Bus className="block w-full" />
            </div>
          </div>
          {STICKY && (
            <div className="bus-ride" style={{ height: route.stuck }}>
              <div className="bus-sticky">
                <div className="scroll-bus" data-frame="screen">
                  <div className="bus-face">
                    <i className="bus-glow" />
                    <Bus className="block w-full" />
                  </div>
                </div>
              </div>
            </div>
          )}
          {TIMELINE && <style>{animations(route)}</style>}
        </>
      )}
    </div>
  );
}
