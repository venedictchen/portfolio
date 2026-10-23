import Image from "next/image";
import { Bus, PlayOnView } from "@/components";
import { CV_URL } from "../../_constants";
import { CUTS, isLogo, LAND_AT, NOW, STOPS } from "./constants";

export default function HeroSection() {
  return (
    <section
      id="top"
      className="flex min-h-[100svh] flex-col justify-between overflow-hidden pt-24 pb-6 sm:pt-28"
    >
      {/* From tablets up the frame spans the five rows of column 1. */}
      <div className="mx-auto grid w-full max-w-6xl gap-x-8 px-5 md:grid-cols-[minmax(0,1fr)_auto] md:pl-(--page-left) md:pr-(--page-right) lg:gap-x-12">
        <p className="text-cream-muted">Software engineer in Jakarta</p>
        <h1 className="mt-4 text-[clamp(3.25rem,11vw,8.5rem)] font-bold leading-[0.92] tracking-[-0.04em] text-amber">
          Venedict
          <br />
          Chen
        </h1>
        <p className="mt-6 max-w-[34ch] sm:mt-8 text-xl leading-snug text-cream md:text-2xl">
Hi everyone! I&apos;m{" "} a Software Engineer passionate about building impactful applications, solving complex problems, and continuously exploring new technologies to create meaningful solutions.
        </p>

        <div className="mt-8 flex flex-wrap gap-3 sm:mt-10">
          <a
            href="#projects"
            className="inline-flex h-12 items-center rounded-full bg-amber px-6 font-semibold text-page transition-colors hover:bg-peach"
          >
            See my work
          </a>
          <a
            href={CV_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-12 items-center rounded-full border border-cream/40 px-6 font-semibold text-cream transition-colors hover:border-amber hover:text-amber"
          >
            View CV
          </a>
        </div>

        <PlayOnView
          replayOnView
          className="flip relative mt-8 aspect-[16/10] w-full overflow-hidden rounded-2xl bg-surface md:col-start-2 md:row-span-5 md:row-start-1 md:mt-10 md:aspect-[4/5] md:w-56 md:self-start lg:w-72 xl:w-80"
        >
          {CUTS.map((cut) => (
            <div
              key={cut.src}
              className="flip-cut"
              style={{ animationDelay: `${cut.at}s` }}
            >
              <Image
                src={cut.src}
                alt=""
                fill
                sizes="(max-width: 767px) 100vw, 320px"
                className={isLogo(cut.src) ? "object-contain p-8 lg:p-12" : "object-cover"}
              />
            </div>
          ))}
          <div
            className="flip-cut flex flex-col justify-between p-5 text-page md:p-6 lg:p-8"
            style={{ animationDelay: `${LAND_AT}s` }}
          >
            <p className="flex items-center gap-2 text-sm font-semibold lg:text-base">
              <span className="size-2 rounded-full bg-page lg:size-2.5" aria-hidden="true" />
              Available now
            </p>
            <div>
              <p className="text-xl font-bold leading-tight tracking-tight lg:text-2xl">
                Full-time software or backend engineer roles
              </p>
              <p className="mt-2 text-sm font-medium lg:mt-3 lg:text-base">
                Remote or on-site, open to relocating
              </p>
              <p className="mt-2 text-xs font-semibold lg:mt-3 lg:text-sm">
                Go · Spring Boot · TypeScript
              </p>
            </div>
            <a
              href="#contact"
              className="text-sm font-semibold underline decoration-page/40 decoration-2 underline-offset-4 hover:decoration-page lg:text-base"
            >
              Get in touch <span aria-hidden="true">→</span>
            </a>
          </div>
        </PlayOnView>

        <dl className="mt-10 grid max-w-3xl grid-cols-3 gap-4 text-sm sm:mt-14 sm:gap-6 sm:text-base">
          {NOW.map((item) => (
            <div key={item.term} className="border-t border-line pt-3">
              <dt className="text-cream-muted">{item.term}</dt>
              <dd className="mt-1 text-cream">
                {item.role}
                <span className="block text-cream-muted">{item.org}</span>
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="mx-auto mt-10 w-full max-w-6xl px-5 sm:mt-16 md:pl-(--page-left) md:pr-(--page-right)">
        <PlayOnView
          className="route"
          aria-label="Career route from 2022 to 2026"
        >
          <Bus className="route-bus" />
          <ol>
            {STOPS.map((stop, i) => (
              <li
                key={stop.label}
                className="route-stop"
                style={{ left: `${(i / (STOPS.length - 1)) * 100}%` }}
              >
                <a href="#experience">
                  <span
                    className="route-pin block"
                    style={{ animationDelay: `${stop.arrive}s` }}
                  />
                  <span className="route-year">{stop.year}</span>
                  <span className="route-label">{stop.label}</span>
                </a>
              </li>
            ))}
          </ol>
        </PlayOnView>
      </div>
    </section>
  );
}
