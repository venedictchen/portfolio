"use client";

import { useRef } from "react";
import { Bus } from "@/components";
import { PINNED, SLIDING, STICKY, TIMELINE } from "./constants";
import { Celebration } from "./elements/celebration";
import { TrailLeg } from "./elements/trail-leg";
import { useRoute, useRouteDrive, useRouteProgress } from "./hooks";
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

const face = (
  <div className="bus-face">
    <i className="bus-glow" />
    <Bus className="block w-full" />
  </div>
);

export default function ScrollRoute() {
  const ref = useRef<HTMLDivElement>(null);
  const route = useRoute(ref);
  useRouteProgress(ref, route);
  useRouteDrive(ref, route);
  const plan = route?.drive;

  return (
    <div ref={ref} className="scroll-route" style={{ height: route?.height }} data-drive={plan ? "" : undefined} aria-hidden="true">
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
            {plan
              ? plan.pieces.flatMap((piece, i) =>
                  piece.hold === undefined
                    ? [<TrailLeg key={piece.leg.s} leg={piece.leg} index={i} stuck={route.stuck} />]
                    : // Along a hold: the trail sliding with the held bus, and a
                      // plain copy drawn once the bus has gone past it.
                      [
                        <TrailLeg key={piece.leg.s} leg={piece.leg} index={i} ride="slide" stuck={route.stuck} rest={plan.screen} />,
                        <TrailLeg key={`${piece.leg.s}-past`} leg={piece.leg} index={`past-${piece.hold}`} stuck={route.stuck} />,
                      ]
                )
              : route.legs.map(
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
          {plan ? (
            <>
              <div className="scroll-bus" data-frame="drive">
                {face}
              </div>
              {/* A bus per hold, sticky at the hold's place on screen within it. */}
              {plan.holds.map((hold, k) => (
                <div key={hold.from} className="bus-ride" style={{ top: hold.top, height: hold.bottom - hold.top }}>
                  <div className="bus-sticky" style={{ top: plan.screen }}>
                    <div className="scroll-bus" data-frame="hold" data-hold={k} style={{ translate: `${hold.x}px 0px`, rotate: "90deg" }}>
                      {face}
                    </div>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <>
              <div className="scroll-bus" data-frame="page">
                {face}
              </div>
              {STICKY && (
                <div className="bus-ride" style={{ height: route.stuck }}>
                  <div className="bus-sticky">
                    <div className="scroll-bus" data-frame="screen">
                      {face}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
          {TIMELINE && <style>{animations(route)}</style>}
        </>
      )}
    </div>
  );
}
