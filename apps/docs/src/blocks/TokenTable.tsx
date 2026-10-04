import React from 'react';
import type { Token } from '../tokens/types';
import { Code } from './Page';
import { sentence } from '../tokens';

export interface TokenColumn<T extends Token> {
  header: string;
  render: (token: T) => React.ReactNode;
  /** Narrow, right-aligned numbers. */
  numeric?: boolean;
}

interface TokenTableProps<T extends Token> {
  tokens: T[];
  /** Columns after the token name. Defaults to Value and Use. */
  columns?: TokenColumn<T>[];
  caption?: string;
}

const DEFAULT_COLUMNS: TokenColumn<Token>[] = [
  { header: 'Value', render: (t) => <Code>{t.value}</Code> },
  { header: 'Use', render: (t) => sentence(t.comment) },
];

/** Tokens as a table: the name first, then whatever the page needs to show. */
export function TokenTable<T extends Token>({ tokens, columns, caption }: TokenTableProps<T>) {
  const cols = (columns ?? DEFAULT_COLUMNS) as TokenColumn<T>[];
  return (
    <div className="docs-table-wrap">
      <table className="docs-table">
        {caption && <caption className="docs-visually-hidden">{caption}</caption>}
        <thead>
          <tr>
            <th scope="col">Token</th>
            {cols.map((c) => <th key={c.header} scope="col" className={c.numeric ? 'is-numeric' : undefined}>{c.header}</th>)}
          </tr>
        </thead>
        <tbody>
          {tokens.map((t) => (
            <tr key={t.name}>
              <th scope="row"><Code>{t.name}</Code></th>
              {cols.map((c) => <td key={c.header} className={c.numeric ? 'is-numeric' : undefined}>{c.render(t)}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
