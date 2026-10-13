import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import type { ComponentDoc } from '../components/types';
import { DocsThemeProvider } from '../theme';
import { ComponentPage } from './ComponentPage';

// A component that exists only here: it has no demo file, so the page shows its gaps.
const sample: ComponentDoc = {
  name: 'Sample',
  slug: 'sample',
  exports: [
    {
      name: 'Sample',
      description: 'Does one thing. Defaults to `type="button"`.',
      htmlAttributes: 'ButtonHTMLAttributes',
      props: [
        { name: 'variant', type: '"secondary" | "primary"', required: false, defaultValue: 'secondary', description: '`secondary` is the neutral look.' },
        { name: 'label', type: 'string', required: true, description: 'Accessible name.' },
      ],
    },
    { name: 'SamplePart', description: 'A part of it.', props: [] },
  ],
  tokens: ['--ps-accent', '--ps-space-20'],
  ownTokens: [{ name: '--ps-sample-fill', value: 'var(--ps-surface-2)' }],
  meta: {
    name: 'Sample',
    group: 'Actions',
    summary: 'A sample for the page template.',
    status: 'beta',
    states: [{ name: 'Disabled', description: 'Set `disabled`.' }],
    variants: [],
    keyboard: [{ keys: 'Enter', action: 'Presses it.' }],
    aria: ['A native `<button>`.'],
    related: [],
  },
};

function renderPage(component: ComponentDoc) {
  render(<MemoryRouter><DocsThemeProvider><ComponentPage component={component} /></DocsThemeProvider></MemoryRouter>);
}

const sections = () => screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent);
const table = (name: string) => screen.getByRole('table', { name });
const rowsOf = (name: string) => within(table(name)).getAllByRole('row').slice(1).map((row) => row.textContent);

describe('ComponentPage', () => {
  it("opens with the component's group, name and summary", () => {
    renderPage(sample);
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Sample');
    expect(screen.getByText('Actions')).toBeTruthy();
    expect(screen.getByText('A sample for the page template.')).toBeTruthy();
  });

  it('shows the sections it has data for, in the template order, and leaves out the rest', () => {
    renderPage(sample);
    expect(sections()).toEqual(['Overview', 'States', 'Props', 'Tokens used', 'Keyboard and accessibility']);
  });

  it('lists each exported component in the import line and gives each its own props', () => {
    renderPage(sample);
    expect(screen.getByText("import { Sample, SamplePart } from '@pastel-studio/react'")).toBeTruthy();
    expect(rowsOf('Props of Sample')).toEqual([
      'variant"secondary" | "primary"secondarysecondary is the neutral look.',
      'labelRequiredstringAccessible name.',
    ]);
    expect(screen.getByText('<button>', { selector: '.docs-note code' })).toBeTruthy();
    expect(screen.getByText('No props of its own.')).toBeTruthy();
  });

  it('shows inline code from doc comments as code', () => {
    renderPage(sample);
    expect(screen.getByText('type="button"').tagName).toBe('CODE');
  });

  it('shows the tokens used with their values, and the tokens the component defines', () => {
    renderPage(sample);
    const [accent, space] = within(table('Tokens Sample uses')).getAllByRole('row').slice(1);
    expect(accent.textContent).toMatch(/^--ps-accent#[0-9A-F]{6}/);
    expect(space.textContent).toMatch(/^--ps-space-2020px/);
    expect(rowsOf('Tokens Sample defines')).toEqual(['--ps-sample-fillvar(--ps-surface-2)']);
  });

  it('says what is missing when a component has no examples yet', () => {
    renderPage(sample);
    expect(screen.getByText('No examples yet')).toBeTruthy();
    expect(screen.getByText('No example yet')).toBeTruthy();
  });

  it('lists the keys and the accessibility notes', () => {
    renderPage(sample);
    expect(rowsOf('Keys Sample responds to')).toEqual(['EnterPresses it.']);
    expect(screen.getByText('<button>', { selector: 'li code' })).toBeTruthy();
  });
});
