import React from 'react';
import { Link } from 'react-router';
import { defaultLabels, IconCheck, IconClose, type MetaEntry } from '@pastel-studio/react';
import { componentPath, components } from '../components';
import type { ComponentDoc, ExportDoc } from '../components/types';
import { demoFor } from '../demos';
import { useDocsTheme } from '../theme';
import { findRole, findToken, sentence } from '../tokens';
import { Example } from './Example';
import { Callout, Code, Page, Section } from './Page';

/** Doc-comment text with its `inline code` shown as code. */
function inline(text: string): React.ReactNode {
  return text.split('`').map((part, i) => (i % 2 ? <Code key={i}>{part}</Code> : part));
}

/** "ButtonHTMLAttributes" → "<button>"; plain HTMLAttributes has no element of its own. */
function elementOf(htmlAttributes: string): string | undefined {
  const name = htmlAttributes.replace('HTMLAttributes', '').toLowerCase();
  return name ? `<${name === 'anchor' ? 'a' : name}>` : undefined;
}

/** A role whose value is a color can be shown as a swatch; a shadow cannot. */
const isColor = (value: string) => /^(#|rgb)/.test(value);

/** Live examples of a component's states or variants, each with its name and what it means. */
function Gallery({ entries, examples }: { entries: MetaEntry[]; examples?: Record<string, React.ReactNode> }) {
  return (
    <Example>
      <ul className="docs-gallery">
        {entries.map((entry) => (
          <li key={entry.name} className="docs-gallery-item">
            <div className="docs-gallery-stage">
              {examples?.[entry.name] ?? <span className="docs-gallery-missing">No example yet</span>}
            </div>
            <p className="docs-gallery-name">{entry.name}</p>
            <p className="docs-gallery-description">{inline(entry.description)}</p>
          </li>
        ))}
      </ul>
    </Example>
  );
}

/**
 * A `labels` prop is typed from the whole shared list, which TypeScript prints unreadably once the
 * list is long. Its words are listed under Words, so the table only points there.
 */
const isLabels = (name: string, words: string[]) => name === 'labels' && words.length > 0;

function PropsTable({ doc, words }: { doc: ExportDoc; words: string[] }) {
  const element = doc.htmlAttributes && elementOf(doc.htmlAttributes);
  return (
    <>
      {doc.props.length > 0 && (
        <div className="docs-table-wrap">
          <table className="docs-table docs-props">
            <caption className="docs-visually-hidden">Props of {doc.name}</caption>
            <thead>
              <tr><th scope="col">Prop</th><th scope="col">Type</th><th scope="col">Default</th><th scope="col">What it does</th></tr>
            </thead>
            <tbody>
              {doc.props.map((prop) => (
                <tr key={prop.name}>
                  <th scope="row">
                    <Code>{prop.name}</Code>
                    {prop.required && <span className="docs-required">Required</span>}
                  </th>
                  <td><Code>{isLabels(prop.name, words) ? '{ word?: string }' : prop.type}</Code></td>
                  <td>{prop.defaultValue !== undefined && <Code>{prop.defaultValue}</Code>}</td>
                  <td>{isLabels(prop.name, words) && !prop.description ? 'Its words for this one instance; the words are listed under Words.' : inline(prop.description)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {doc.htmlAttributes && (
        <p className="docs-note">
          {element ? <>Also accepts every <Code>{element}</Code> attribute.</> : 'Also accepts any HTML attribute.'}
        </p>
      )}
      {doc.props.length === 0 && !doc.htmlAttributes && <p className="docs-note">No props of its own.</p>}
    </>
  );
}

function TokensUsed({ component }: { component: ComponentDoc }) {
  const { theme } = useDocsTheme();
  return (
    <>
      <div className="docs-table-wrap">
        <table className="docs-table docs-tokens">
          <caption className="docs-visually-hidden">Tokens {component.name} uses</caption>
          <thead>
            <tr><th scope="col">Token</th><th scope="col">Value</th><th scope="col">Use</th></tr>
          </thead>
          <tbody>
            {component.tokens.map((name) => {
              const role = findRole(name);
              const token = findToken(name);
              return (
                <tr key={name}>
                  <th scope="row"><Code>{name}</Code></th>
                  <td>
                    {role && isColor(role[theme]) ? (
                      <span className="docs-token-color">
                        <span className="docs-swatch is-small" style={{ background: `var(${name})` }} />
                        {role[theme]}
                      </span>
                    ) : token && <Code>{role ? role[theme] : token.value}</Code>}
                  </td>
                  <td>{sentence(token?.comment)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {component.ownTokens.length > 0 && (
        <>
          <p className="docs-note">Its own tokens. Set one on the component itself, through a class of yours, to restyle it there.</p>
          <div className="docs-table-wrap">
            <table className="docs-table">
              <caption className="docs-visually-hidden">Tokens {component.name} defines</caption>
              <thead>
                <tr><th scope="col">Token</th><th scope="col">Default</th></tr>
              </thead>
              <tbody>
                {component.ownTokens.map((token) => (
                  <tr key={token.name}>
                    <th scope="row"><Code>{token.name}</Code></th>
                    <td><Code>{token.value}</Code></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
}

function Guidance({ dos, donts }: { dos: string[]; donts: string[] }) {
  return (
    <div className="docs-guidance">
      {dos.length > 0 && (
        <div className="docs-guidance-group is-do">
          <p className="docs-guidance-title"><IconCheck size={16} aria-hidden="true" />Do</p>
          <ul className="docs-list">{dos.map((text) => <li key={text}>{inline(text)}</li>)}</ul>
        </div>
      )}
      {donts.length > 0 && (
        <div className="docs-guidance-group is-dont">
          <p className="docs-guidance-title"><IconClose size={16} aria-hidden="true" />Don't</p>
          <ul className="docs-list">{donts.map((text) => <li key={text}>{inline(text)}</li>)}</ul>
        </div>
      )}
    </div>
  );
}

/**
 * A component's page. The same sections for every component, each built from data: the
 * component's types, stylesheet and meta.ts, plus its examples in src/demos. A section with
 * nothing to show is left out.
 */
export function ComponentPage({ component }: { component: ComponentDoc }) {
  const { meta, exports } = component;
  const demo = demoFor(component.name);
  const related = components.filter((c) => meta.related.includes(c.name));
  const names = exports.map((e) => e.name).join(', ');

  return (
    <Page overline={meta.group} title={component.name} lead={meta.summary}>
      <Section title="Overview">
        {exports[0]?.description && <p>{inline(exports[0].description)}</p>}
        <dl className="docs-facts">
          <div><dt>Status</dt><dd>{meta.status === 'stable' ? 'Stable' : 'Beta: its props may still change'}</dd></div>
          <div><dt>Import</dt><dd><Code>{`import { ${names} } from '@pastel-studio/react'`}</Code></dd></div>
        </dl>
        {!demo && (
          <Callout tone="warning" title="No examples yet">
            This component has no file in <Code>apps/docs/src/demos</Code>, so its demo, examples and guidance are missing.
          </Callout>
        )}
      </Section>

      {demo && (
        <Section title="Interactive demo" description="Try it: everything here is simulated in the browser.">
          <Example><demo.Demo /></Example>
        </Section>
      )}

      {meta.states.length > 0 && (
        <Section title="States" description="Every state, each reachable through props.">
          <Gallery entries={meta.states} examples={demo?.states} />
        </Section>
      )}

      {meta.variants.length > 0 && (
        <Section title="Variants and sizes">
          <Gallery entries={meta.variants} examples={demo?.variants} />
        </Section>
      )}

      <Section title="Props">
        {exports.map((doc) => (
          <React.Fragment key={doc.name}>
            {exports.length > 1 && <h3 className="docs-subtitle"><Code>{doc.name}</Code></h3>}
            {doc !== exports[0] && doc.description && <p>{inline(doc.description)}</p>}
            <PropsTable doc={doc} words={meta.labels} />
          </React.Fragment>
        ))}
      </Section>

      {meta.labels.length > 0 && (
        <Section title="Words" description={<>The words it shows or reads out, from the shared list. Translate or replace them with <Code>LabelsProvider</Code>, or with its <Code>labels</Code> prop for one instance.</>}>
          <div className="docs-table-wrap">
            <table className="docs-table">
              <caption className="docs-visually-hidden">Words {component.name} uses</caption>
              <thead>
                <tr><th scope="col">Word</th><th scope="col">Default</th></tr>
              </thead>
              <tbody>
                {meta.labels.map((word) => (
                  <tr key={word}>
                    <th scope="row"><Code>{word}</Code></th>
                    <td>{defaultLabels[word]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      )}

      {(component.tokens.length > 0 || component.ownTokens.length > 0) && (
        <Section title="Tokens used" description="Read from the component's stylesheet. Change a token in a theme and the component follows.">
          <TokensUsed component={component} />
        </Section>
      )}

      {(meta.keyboard.length > 0 || meta.aria.length > 0) && (
        <Section title="Keyboard and accessibility">
          {meta.keyboard.length > 0 && (
            <div className="docs-table-wrap">
              <table className="docs-table">
                <caption className="docs-visually-hidden">Keys {component.name} responds to</caption>
                <thead>
                  <tr><th scope="col">Key</th><th scope="col">What it does</th></tr>
                </thead>
                <tbody>
                  {meta.keyboard.map((entry) => (
                    <tr key={entry.keys}>
                      <th scope="row"><kbd className="docs-kbd">{entry.keys}</kbd></th>
                      <td>{inline(entry.action)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {meta.aria.length > 0 && <ul className="docs-list">{meta.aria.map((note) => <li key={note}>{inline(note)}</li>)}</ul>}
        </Section>
      )}

      {demo && (demo.dos.length > 0 || demo.donts.length > 0) && (
        <Section title="Do and don't">
          <Guidance dos={demo.dos} donts={demo.donts} />
        </Section>
      )}

      {related.length > 0 && (
        <Section title="Related">
          <ul className="docs-cards">
            {related.map((c) => (
              <li key={c.name}>
                <Link to={componentPath(c.slug)} className="docs-card">
                  <span className="docs-card-title">{c.name}</span>
                  <span className="docs-card-summary">{c.meta.summary}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      )}
    </Page>
  );
}
