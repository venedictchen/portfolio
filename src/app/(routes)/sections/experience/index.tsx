
import { EXPERIENCES } from "./constants";
import { Logo } from "./elements/logo";

export default function ExperienceSection() {
  return (
    <section id="experience" className="py-24 md:py-32">
      <div className="mx-auto max-w-6xl pl-(--page-left) pr-(--page-right)">
        <h2 className="text-3xl font-semibold tracking-tight text-cream md:text-5xl">
          Experience
        </h2>

        <ol className="mt-12 border-t border-line">
          {EXPERIENCES.map((experience) => (
            <li
              key={experience.id}
              className="grid gap-3 border-b border-line py-8 md:grid-cols-[13rem_minmax(0,1fr)] md:gap-10 md:gap-x-16"
            >
              <p className="text-cream-muted md:pt-2.5">{experience.duration}</p>
              <div className="flex gap-4">
                <Logo experience={experience} />
                <div className="min-w-0">
                  <h3 className="text-xl font-semibold text-cream">
                    {experience.position}
                  </h3>
                  <p className="mt-0.5 text-peach">
                    {experience.company}
                    {experience.location && (
                      <span className="text-cream-muted">
                        , {experience.location}
                      </span>
                    )}
                  </p>
                  <ul className="mt-4 max-w-[68ch] list-disc space-y-2 pl-5 text-cream/90 marker:text-amber">
                    {experience.responsibilities.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
