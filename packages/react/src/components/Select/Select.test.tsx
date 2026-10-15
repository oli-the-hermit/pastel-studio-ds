import React, { useState } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { LabelsProvider } from '../../labels';
import { Select, type SelectOption, type SelectProps } from './Select';

const sounds: SelectOption[] = [
  { value: 'chime', label: 'Chime' },
  { value: 'bell', label: 'Bell', meta: 'Loud' },
  { value: 'none', label: 'No sound', disabled: true },
  { value: 'wood', label: 'Wood block' },
];
const many: SelectOption[] = ['Weekend errands', 'Reading', 'Garden', 'Work', 'Inbox', 'Groceries', 'Gifts', 'Travel', 'Health'].map((n) => ({ value: n, label: n }));

function Picker(props: Partial<SelectProps<string>> & { onPick?: (v: string) => void }) {
  const { onPick, ...rest } = props;
  const [value, setValue] = useState(props.value ?? '');
  return <Select ariaLabel="Sound" options={sounds} {...rest} value={value} onChange={(v) => { setValue(v); onPick?.(v); }} />;
}

const trigger = () => screen.getByRole('combobox', { name: 'Sound' });
const option = (name: string) => screen.getByRole('option', { name });

describe('Select', () => {
  it('shows the placeholder, then the chosen label, in a closed combobox', () => {
    const { rerender } = render(<Select ariaLabel="Sound" options={sounds} value="" onChange={() => {}} />);
    expect(trigger().getAttribute('aria-haspopup')).toBe('listbox');
    expect(trigger().getAttribute('aria-expanded')).toBe('false');
    expect(trigger().textContent).toBe('Select an option');
    expect(trigger().querySelector('.is-placeholder')).toBeTruthy();
    rerender(<Select ariaLabel="Sound" options={sounds} value="bell" onChange={() => {}} />);
    expect(trigger().textContent).toBe('Bell');
  });

  it('opens on a click, marks the chosen option, and picks another', async () => {
    const onPick = vi.fn();
    const user = userEvent.setup();
    render(<Picker value="bell" onPick={onPick} />);
    await user.click(trigger());
    expect(trigger().getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByRole('listbox').id).toBe(trigger().getAttribute('aria-controls'));
    expect(option('BellLoud').getAttribute('aria-selected')).toBe('true');
    await user.click(option('Wood block'));
    expect(onPick).toHaveBeenCalledWith('wood');
    expect(screen.queryByRole('listbox')).toBeNull();
    expect(document.activeElement).toBe(trigger());
  });

  it('moves with the arrows past disabled options, tells screen readers where it is, and picks with Enter', async () => {
    const onPick = vi.fn();
    const user = userEvent.setup();
    render(<Picker value="bell" onPick={onPick} />);
    trigger().focus();
    await user.keyboard('{ArrowDown}');
    expect(trigger().getAttribute('aria-activedescendant')).toBe(option('BellLoud').id);
    await user.keyboard('{ArrowDown}');
    expect(trigger().getAttribute('aria-activedescendant')).toBe(option('Wood block').id);
    expect(option('Wood block').className).toContain('is-highlighted');
    await user.keyboard('{Enter}');
    expect(onPick).toHaveBeenCalledWith('wood');
  });

  it('closes on Escape and gives focus back to the trigger', async () => {
    const user = userEvent.setup();
    render(<Picker value="bell" />);
    await user.click(trigger());
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('listbox')).toBeNull();
    expect(document.activeElement).toBe(trigger());
  });

  it('searches when there are more than 8 options, and says when nothing matches', async () => {
    const user = userEvent.setup();
    render(<Picker options={many} value="Reading" />);
    await user.click(trigger());
    const search = await screen.findByRole('combobox', { name: 'Search options' });
    await waitFor(() => expect(document.activeElement).toBe(search));
    await user.keyboard('gar');
    expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual(['Garden']);
    await user.keyboard('zzz');
    expect(screen.getByText('No matches')).toBeTruthy();
  });

  it('lists recent options first under their heading', async () => {
    const user = userEvent.setup();
    render(<Picker options={many.slice(0, 5)} value="Reading" recent={{ values: ['Garden', 'Missing'], label: 'Recent' }} />);
    await user.click(trigger());
    expect(screen.getByText('Recent')).toBeTruthy();
    expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual(['Garden', 'Weekend errands', 'Reading', 'Work', 'Inbox']);
    expect(screen.getAllByRole('separator')).toHaveLength(1);
  });

  it('creates a new option from a typed name and selects what onCreate returns', async () => {
    const onPick = vi.fn();
    const onCreate = vi.fn((name: string) => name.toLowerCase());
    const user = userEvent.setup();
    render(<Picker value="bell" onPick={onPick} createOption={{ label: 'New sound', onCreate }} />);
    await user.click(trigger());
    await user.click(screen.getByRole('button', { name: 'New sound' }));
    const name = await screen.findByRole('textbox', { name: 'New sound' });
    await waitFor(() => expect(document.activeElement).toBe(name));
    expect(screen.getByRole('button', { name: 'Create' })).toHaveProperty('disabled', true);
    await user.keyboard('Rain{Enter}');
    expect(onCreate).toHaveBeenCalledWith('Rain');
    expect(onPick).toHaveBeenCalledWith('rain');
  });

  it('does not open when disabled, takes words from the provider, and adds a hidden input for forms', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <LabelsProvider labels={{ selectPlaceholder: 'Elige' }}>
        <Select ariaLabel="Sound" options={sounds} value="" onChange={() => {}} disabled name="sound" />
      </LabelsProvider>
    );
    expect(trigger().textContent).toBe('Elige');
    await user.click(trigger());
    expect(screen.queryByRole('listbox')).toBeNull();
    expect(container.querySelector<HTMLInputElement>('input[type="hidden"]')?.name).toBe('sound');
  });

  it('turns variant into a class and shows an addon after the value', () => {
    const { container } = render(<Select ariaLabel="Sound" options={sounds} value="bell" onChange={() => {}} variant="header" valueAddon={<span>4 left</span>} className="mine" />);
    expect(container.firstElementChild?.className).toBe('ps-select ps-select--header mine');
    expect(trigger().querySelector('.ps-select-value-addon')?.textContent).toBe('4 left');
  });
});
