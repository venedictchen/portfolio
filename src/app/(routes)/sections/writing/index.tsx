import { ARTICLES } from "./constants";

export default function WritingSection() {
  return (
    <section id="writing" className="py-24 md:py-32">
      <div className="mx-auto max-w-6xl pl-(--page-left) pr-(--page-right)">
        <h2 className="text-3xl font-semibold tracking-tight text-cream md:text-5xl">
          Writing
        </h2>
        <p className="mt-4 max-w-[60ch] text-cream-muted">
          Articles I&apos;ve published on Medium about software engineering in
          practice.
        </p>

        <ul className="mt-12 border-t border-line">
          {ARTICLES.map((article) => (
            <li key={article.url} className="border-b border-line">
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block py-7"
              >
                <h3 className="text-xl font-semibold text-cream transition-colors group-hover:text-amber md:text-2xl">
                  {article.title}
                </h3>
                <p className="mt-2 max-w-[70ch] text-cream-muted">
                  {article.description}
                </p>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
