import React, { useEffect } from 'react';

interface PageProps {
  /** Small label above the title, usually the section. */
  overline?: string;
  title: string;
  /** One or two sentences under the title. */
  lead?: React.ReactNode;
  children: React.ReactNode;
}

/** A documentation page: overline, title, lead, then its sections. */
export function Page({ overline, title, lead, children }: PageProps) {
  useEffect(() => {
    const site = 'Pastel Studio Design System';
    document.title = title === site ? site : `${title} · ${site}`;
  }, [title]);
  return (
    <article className="docs-page">
      <header className="docs-page-header">
        {overline && <p className="ps-overline">{overline}</p>}
        <h1 className="docs-page-title">{title}</h1>
        {lead && <p className="docs-lead">{lead}</p>}
      </header>
      {children}
    </article>
  );
}

interface SectionProps {
  title: string;
  /** Anchor id; defaults to the title in kebab case. */
  id?: string;
  description?: React.ReactNode;
  children?: React.ReactNode;
}

/** A titled part of a page, linkable by its id. */
export function Section({ title, id, description, children }: SectionProps) {
  const anchor = id ?? title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  return (
    <section className="docs-section" aria-labelledby={anchor}>
      <h2 id={anchor} className="docs-section-title">
        <a href={`#${anchor}`} className="docs-anchor">{title}</a>
      </h2>
      {description && <div className="docs-section-description">{description}</div>}
      {children}
    </section>
  );
}

/** Inline code: a token, a class, a prop. */
export function Code({ children }: { children: React.ReactNode }) {
  return <code className="docs-code">{children}</code>;
}

interface CalloutProps {
  tone?: 'info' | 'warning';
  title: string;
  children: React.ReactNode;
}

/** A short note set apart from the text. */
export function Callout({ tone = 'info', title, children }: CalloutProps) {
  return (
    <aside className={`docs-callout is-${tone}`}>
      <p className="docs-callout-title">{title}</p>
      <div className="docs-callout-body">{children}</div>
    </aside>
  );
}
