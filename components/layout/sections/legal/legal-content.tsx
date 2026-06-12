import { Fragment } from "react";
import type { LegalPolicyContent, LegalRun } from "./legal-types";

function renderRun(run: LegalRun, key: number): React.ReactNode {
  if (typeof run === "string") return <Fragment key={key}>{run}</Fragment>;

  if ("b" in run) {
    return (
      <strong key={key} className="font-semibold text-text-primary">
        {run.b.map((r, i) => renderRun(r, i))}
      </strong>
    );
  }

  if ("i" in run) {
    return (
      <em key={key}>{run.i.map((r, i) => renderRun(r, i))}</em>
    );
  }

  // anchor
  const external = /^https?:\/\//.test(run.a.href);
  return (
    <a
      key={key}
      href={run.a.href}
      className="text-primary underline underline-offset-2 hover:text-primary/80"
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {run.c.map((r, i) => renderRun(r, i))}
    </a>
  );
}

function ClockIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M8.0026 14.6693C11.6845 14.6693 14.6693 11.6845 14.6693 8.0026C14.6693 4.32071 11.6845 1.33594 8.0026 1.33594C4.32071 1.33594 1.33594 4.32071 1.33594 8.0026C1.33594 11.6845 4.32071 14.6693 8.0026 14.6693Z"
        stroke="#6D727C"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 4V8L10.6667 9.33333"
        stroke="#6D727C"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function LegalContent({ content }: { content: LegalPolicyContent }) {
  return (
    <article className="min-w-0">
      <h1 className="heading-lg text-text-primary mb-3">{content.title}</h1>
      <p className="flex items-center gap-2 body-sm text-text-tertiary mb-8">
        <ClockIcon />
        {content.date}
      </p>

      <div className="flex flex-col gap-6 body-md text-text-secondary leading-relaxed">
        {content.blocks.map((block, bi) => (
          <section key={bi}>
            {block.heading && (
              <h2 className="body-lg-medium text-text-primary mb-2">
                {block.heading}
              </h2>
            )}
            {block.lines.map((line, li) => (
              <p key={li} className="whitespace-pre-wrap">
                {line.map((run, ri) => renderRun(run, ri))}
              </p>
            ))}
          </section>
        ))}
      </div>
    </article>
  );
}
