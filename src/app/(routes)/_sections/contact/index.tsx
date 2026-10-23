import { ContactForm } from "./elements/contact-form";
import { EMAIL, GITHUB_URL, LINKEDIN_URL } from "../../_constants";

const linkClass =
  "font-semibold text-peach underline decoration-peach/40 decoration-2 underline-offset-4 hover:text-amber hover:decoration-amber";

export default function ContactSection() {
  return (
    <section id="contact" className="bg-surface py-24 md:py-32">
      <div className="mx-auto grid max-w-6xl gap-12 pl-(--page-left) pr-(--page-right) lg:grid-cols-2 lg:gap-16">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight text-cream md:text-5xl">
            Contact
          </h2>
          <p className="mt-6 max-w-[44ch] text-lg leading-relaxed text-cream/90">
            I&apos;m available now for full-time software or backend engineer
            roles, remote or on-site, and I&apos;m open to relocating.
            Email is the quickest way to reach me, or use the form.
          </p>
          <a
            href={`mailto:${EMAIL}`}
            className="mt-8 inline-block break-all text-2xl font-bold text-amber underline decoration-amber/40 decoration-2 underline-offset-8 hover:decoration-amber md:text-3xl"
          >
            {EMAIL}
          </a>
          <p className="mt-8 flex gap-6">
            <a
              href={LINKEDIN_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
            >
              LinkedIn
            </a>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
            >
              GitHub
            </a>
          </p>
        </div>

        <div className="rounded-2xl border border-line bg-page p-6 md:p-8">
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
