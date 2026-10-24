import Image from "next/image";
import { Bus, PlayOnView } from "@/components";
import { CV_URL, EMAIL } from "../../_constants";
import { SKILLS } from "./constants";

export default function AboutSection() {
  return (
    <section id="about" className="bg-surface py-24 md:py-32">
      <div className="mx-auto grid max-w-6xl gap-12 pl-(--page-left) pr-(--page-right) md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-16">
        <PlayOnView
          replayOnHover
          className="photo-lap relative mx-auto aspect-[4/5] w-[calc(100%-3.5rem)] max-w-sm md:mx-0 md:w-full"
        >
          <div className="absolute inset-0 overflow-hidden rounded-2xl">
            <Image
              src="/images/profile.webp"
              alt="Portrait of Venedict Chen"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 384px, 40vw"
            />
          </div>
          <svg className="photo-trail" aria-hidden="true">
            <rect width="100%" height="100%" rx="16" pathLength="100" />
          </svg>
          <div className="photo-bus">
            <Bus className="block w-full" />
          </div>
        </PlayOnView>

        <div>
          <h2 className="text-3xl font-semibold tracking-tight text-cream md:text-5xl">
            About
          </h2>
          <div className="mt-8 max-w-[62ch] space-y-5 text-lg leading-relaxed text-cream/90">
            <p>
              Venedict is a software engineer from Jakarta. He graduated in Computer
              Science from Universitas Indonesia in 2026, and for the past year
              Venedict have been a QA intern at Accenture, building tools that automate
              API testing and cut test data setup from 30 minutes to under 10
              seconds.
            </p>
            <p>
              Before that Venedict interned at OPPO Indonesia&apos;s factory, where he built
              a production line dashboard and a web-controlled warehouse locker
              system. At university he led RISTEK&apos;s web development team,
              coordinated 21 teaching assistants for Advanced Programming, and
              researched generating user interfaces from models.
            </p>
            <p>
              Venedict like work where the result is something people actually use,
              and I care as much about testing it as building it.
            </p>
          </div>

          <dl className="mt-10 grid gap-6 sm:grid-cols-3">
            {SKILLS.map((skill) => (
              <div key={skill.group} className="border-t border-line pt-3">
                <dt className="font-semibold text-cream">{skill.group}</dt>
                <dd className="mt-1 text-cream-muted">{skill.items}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-10 flex flex-wrap gap-3">
            <a
              href={CV_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center rounded-full bg-amber px-6 font-semibold text-page transition-colors hover:bg-peach"
            >
              View CV
            </a>
            <a
              href={`mailto:${EMAIL}`}
              className="inline-flex h-12 items-center rounded-full border border-cream/40 px-6 font-semibold text-cream transition-colors hover:border-amber hover:text-amber"
            >
              Email me
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
