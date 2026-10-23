import Image from "next/image";
import { FEATURED, linkClass, PROJECTS } from "./constants";

export default function ProjectsSection() {
  return (
    <section id="projects" className="bg-surface py-24 md:py-32">
      <div className="mx-auto max-w-6xl pl-(--page-left) pr-(--page-right)">
        <h2 className="text-3xl font-semibold tracking-tight text-cream md:text-5xl">
          Projects
        </h2>

        <article className="mt-12 grid items-center gap-10 rounded-2xl bg-page p-6 md:grid-cols-2 md:p-10">
          <div>
            <h3 className="text-3xl font-bold tracking-tight text-amber md:text-4xl">
              {FEATURED.title}
            </h3>
            <p className="mt-4 max-w-[58ch] leading-relaxed text-cream/90">
              {FEATURED.description}
            </p>
            <dl className="mt-8 grid grid-cols-3 gap-4">
              {FEATURED.facts.map((fact) => (
                <div key={fact.label} className="border-t-2 border-amber pt-2">
                  <dt className="text-xl font-bold text-cream md:text-2xl">
                    {fact.value}
                  </dt>
                  <dd className="mt-1 text-sm text-cream-muted">{fact.label}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-8">
              <a
                href={FEATURED.url}
                target="_blank"
                rel="noopener noreferrer"
                className={linkClass}
              >
                Open Bikun Tracker
              </a>
            </p>
          </div>
          <Image
            src={FEATURED.imageUrl}
            alt="Bikun Tracker showing live bus positions on the Universitas Indonesia route map"
            width={715}
            height={914}
            sizes="(max-width: 768px) 80vw, 320px"
            className="mx-auto w-full max-w-xs rounded-2xl border border-line"
          />
        </article>

        <ul className="mt-8 grid gap-8 md:grid-cols-3">
          {PROJECTS.map((project) => (
            <li
              key={project.title}
              className="flex flex-col overflow-hidden rounded-xl border border-line bg-page"
            >
              <div className="relative aspect-[16/9]">
                <Image
                  src={project.imageUrl}
                  alt={`Screenshot of ${project.title}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <div className="flex flex-1 flex-col p-6">
                <h3 className="text-xl font-semibold text-cream">
                  {project.title}
                </h3>
                <p className="mt-3 leading-relaxed text-cream/90">
                  {project.description}
                </p>
                <p className="mt-3 text-sm text-cream-muted">
                  {project.technologies.join(", ")}
                </p>
                {(project.demoUrl || project.githubUrl) && (
                  <p className="mt-auto flex gap-5 pt-6">
                    {project.demoUrl && (
                      <a
                        href={project.demoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={linkClass}
                      >
                        Live site
                      </a>
                    )}
                    {project.githubUrl && (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={linkClass}
                      >
                        Code
                      </a>
                    )}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
