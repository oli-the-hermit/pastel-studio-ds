import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import { accentTokens } from '@pastel-studio/react';
import { DocsThemeProvider } from '../../theme';
import { Themes } from './Themes';

const renderPage = () => render(<MemoryRouter><DocsThemeProvider><Themes /></DocsThemeProvider></MemoryRouter>);

describe('Themes', () => {
  it('lists all 32 presets, each with eight role swatches in both themes', () => {
    renderPage();
    expect(document.querySelectorAll('.docs-accent-table tbody tr')).toHaveLength(32);
    expect(document.querySelector('.docs-accent-table tbody tr')!.querySelectorAll('.docs-accent-role')).toHaveLength(16);
  });

  it('shows the chosen accent\'s tokens on the sample, not on the page', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getAllByRole('button', { name: 'Moonlight blue' })[0]);
    const sample = document.querySelector<HTMLElement>('.docs-theme-sample')!;
    const theme = sample.closest('[data-theme]')!.getAttribute('data-theme') as 'dark' | 'light';
    expect(sample.style.getPropertyValue('--ps-accent').toUpperCase()).toBe(accentTokens('moonlight-blue', theme)['--ps-accent']);
    expect(document.documentElement.style.getPropertyValue('--ps-accent')).toBe('');
    expect(screen.getByRole('status').textContent).toBe('Moonlight blue');
  });
});
