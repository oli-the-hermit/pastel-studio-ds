import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { defaultLabels, LabelsProvider } from '../../labels';
import { ACCENT_PRESETS, accentWord } from '../../theme/presets';
import { accentTokens } from '../../theme/theme';
import { AppearancePanel } from './AppearancePanel';

const base = { theme: 'dark' as const, onThemeChange: () => {}, accent: 'solar-lime' as const, onAccentChange: () => {} };

describe('AppearancePanel', () => {
  it('names every preset with a shared word', () => {
    for (const { id } of ACCENT_PRESETS) expect(defaultLabels[accentWord(id)]).toBeTruthy();
    expect(accentWord('moss-grey')).toBe('colorMossGrey');
  });

  it('offers the three themes and the 32 presets in three named groups, with the current ones selected', () => {
    render(<AppearancePanel {...base} theme="system" accent="sage" />);
    expect(screen.getByRole('radio', { name: 'System' }).getAttribute('aria-checked')).toBe('true');
    for (const group of ['Vibrant', 'Calm', 'Muted']) expect(screen.getByRole('radiogroup', { name: group })).toBeTruthy();
    expect(screen.getAllByRole('radio')).toHaveLength(3 + 32);
    expect(screen.getByRole('radio', { name: 'Sage' }).getAttribute('aria-checked')).toBe('true');
  });

  it('reports a theme and an accent, and changes nothing by itself', async () => {
    const user = userEvent.setup();
    const onThemeChange = vi.fn(), onAccentChange = vi.fn();
    render(<AppearancePanel {...base} onThemeChange={onThemeChange} onAccentChange={onAccentChange} />);
    await user.click(screen.getByRole('radio', { name: 'Light' }));
    await user.click(screen.getByRole('radio', { name: 'Moonlight blue' }));
    expect(onThemeChange).toHaveBeenCalledWith('light');
    expect(onAccentChange).toHaveBeenCalledWith('moonlight-blue');
    expect(screen.getByRole('radio', { name: 'Solar lime' }).getAttribute('aria-checked')).toBe('true');
  });

  it('shows recent colors only when there are some, and keeps them as they were when it opened', () => {
    const { rerender } = render(<AppearancePanel {...base} />);
    expect(screen.queryByRole('radiogroup', { name: 'Recent colors' })).toBeNull();
    rerender(<AppearancePanel {...base} recent={['sky']} key="again" />);
    const recent = screen.getByRole('radiogroup', { name: 'Recent colors' });
    expect(recent.querySelectorAll('[role="radio"]')).toHaveLength(1);
    rerender(<AppearancePanel {...base} recent={['sky', 'mint']} key="again" />);
    expect(screen.getByRole('radiogroup', { name: 'Recent colors' }).querySelectorAll('[role="radio"]')).toHaveLength(1);
  });

  it('asks to remember the accent it opened with and the last one, only if it changed', () => {
    const onRemember = vi.fn();
    const { rerender, unmount } = render(<AppearancePanel {...base} onRemember={onRemember} />);
    rerender(<AppearancePanel {...base} accent="peach" onRemember={onRemember} />);
    unmount();
    expect(onRemember).toHaveBeenCalledWith(['solar-lime', 'peach']);
    const untouched = vi.fn();
    render(<AppearancePanel {...base} onRemember={untouched} />).unmount();
    expect(untouched).not.toHaveBeenCalled();
  });

  it('draws the swatches in the theme asked for', () => {
    render(<AppearancePanel {...base} theme="dark" resolvedTheme="light" />);
    const sky = screen.getByRole('radio', { name: 'Sky' });
    expect(sky.style.getPropertyValue('--ps-color-swatch-fill').toUpperCase()).toBe(accentTokens('sky', 'light')['--ps-accent']);
  });

  it('takes its words from the shared list or its own labels', () => {
    render(
      <LabelsProvider labels={{ theme: 'Tema', colorSky: 'Cielo' }}>
        <AppearancePanel {...base} labels={{ accentColor: 'Color de acento' }} />
      </LabelsProvider>
    );
    expect(screen.getByRole('heading', { name: 'Tema' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Color de acento' })).toBeTruthy();
    expect(screen.getByRole('radio', { name: 'Cielo' })).toBeTruthy();
  });
});
