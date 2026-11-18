import React, { useState } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Combobox, type ComboboxOption, type ComboboxProps } from './Combobox';

const folders: ComboboxOption[] = [
  { id: 'p', label: 'Photos', detail: 'D:\\Photos', value: 'D:\\Photos', group: 'Folders' },
  { id: 'pr', label: 'Projects', detail: 'D:\\Projects', value: 'D:\\Projects', group: 'Folders' },
  { id: 'm', label: 'Music', detail: 'E:\\Music', value: 'E:\\Music', group: 'Pinned' },
];
const recent = { label: 'Recent', items: [{ id: 'r1', label: 'D:\\Art', value: 'D:\\Art' }] };

function Harness(props: Partial<ComboboxProps> & { initial?: string }) {
  const { initial = '', ...rest } = props;
  const [value, setValue] = useState(initial);
  const suggestions = value ? folders.filter((f) => f.label.toLowerCase().startsWith(value.toLowerCase().replace(/^d:\\?/, ''))) : [];
  return <Combobox value={value} onChange={setValue} suggestions={suggestions} recent={recent} placeholder="e.g. D:\Photos\2026" {...rest} />;
}

const input = () => screen.getByRole('combobox') as HTMLInputElement;
const options = () => screen.queryAllByRole('option').map((o) => o.textContent);

describe('Combobox', () => {
  it('shows its example as a placeholder, gone while there is text and back when it is empty', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    expect(input().placeholder).toBe('e.g. D:\\Photos\\2026');
    expect(input().getAttribute('aria-label')).toBe('e.g. D:\\Photos\\2026');
    await user.type(input(), 'P');
    expect(input().value).toBe('P');
    await user.clear(input());
    expect(input().value).toBe('');
  });

  it('offers recent items while empty, and suggestions in groups as you type', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(input());
    expect(options()).toEqual(['D:\\Art']);
    expect(screen.getByRole('group', { name: 'Recent' })).toBeTruthy();
    await user.type(input(), 'p');
    expect(options()).toEqual(['PhotosD:\\Photos', 'ProjectsD:\\Projects']);
    expect(screen.getByRole('group', { name: 'Folders' })).toBeTruthy();
    expect(input().getAttribute('aria-expanded')).toBe('true');
  });

  it('moves with the arrows, then Enter picks the highlighted suggestion', async () => {
    const user = userEvent.setup();
    const onPick = vi.fn();
    render(<Harness onPick={onPick} />);
    await user.type(input(), 'p');
    await user.keyboard('{ArrowDown}{ArrowDown}');
    const active = screen.getAllByRole('option')[1];
    expect(input().getAttribute('aria-activedescendant')).toBe(active.id);
    expect(active.getAttribute('aria-selected')).toBe('true');
    await user.keyboard('{Enter}');
    expect(onPick).toHaveBeenCalledWith(folders[1]);
    expect(input().getAttribute('aria-expanded')).toBe('false');
  });

  it('without onPick, picking fills the field with the suggestion', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.type(input(), 'ph');
    await user.click(screen.getByRole('option'));
    expect(input().value).toBe('D:\\Photos');
  });

  it('Tab completes the field and stays in it', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.type(input(), 'pr');
    await user.keyboard('{ArrowDown}{Tab}');
    expect(input().value).toBe('D:\\Projects');
    expect(document.activeElement).toBe(input());
  });

  it('Enter with nothing highlighted submits the text as typed', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<Harness onSubmit={onSubmit} />);
    await user.type(input(), 'Z:\\Nowhere{Enter}');
    expect(onSubmit).toHaveBeenCalledWith('Z:\\Nowhere');
  });

  it('Escape closes the list first, then clears, and never reaches what is around it', async () => {
    const user = userEvent.setup();
    const behind = vi.fn();
    window.addEventListener('keydown', behind);
    render(<Harness />);
    await user.type(input(), 'p');
    await user.keyboard('{Escape}');
    expect(input().getAttribute('aria-expanded')).toBe('false');
    expect(input().value).toBe('p');
    await user.keyboard('{Escape}');
    expect(input().value).toBe('');
    window.removeEventListener('keydown', behind);
    expect(behind.mock.calls.filter(([e]) => (e as KeyboardEvent).key === 'Escape')).toHaveLength(0);
  });

  it('fetches suggestions after the typing pauses, and drops a stale answer', async () => {
    vi.useFakeTimers();
    const answers: Record<string, (o: ComboboxOption[]) => void> = {};
    const load = vi.fn((text: string) => new Promise<ComboboxOption[]>((resolve) => (answers[text] = resolve)));
    const { rerender } = render(<Combobox value="" onChange={() => {}} loadSuggestions={load} placeholder="Search folders" variant="search" />);
    act(() => input().focus());
    rerender(<Combobox value="ph" onChange={() => {}} loadSuggestions={load} placeholder="Search folders" variant="search" />);
    act(() => void vi.advanceTimersByTime(150));
    rerender(<Combobox value="pho" onChange={() => {}} loadSuggestions={load} placeholder="Search folders" variant="search" />);
    act(() => void vi.advanceTimersByTime(150));
    expect(load.mock.calls.map(([t]) => t)).toEqual(['ph', 'pho']);
    await act(async () => answers.ph([{ id: 'old', label: 'Old answer' }]));
    expect(options()).toEqual([]);
    await act(async () => answers.pho([{ id: 'p', label: 'Photos' }]));
    expect(options()).toEqual(['Photos']);
    vi.useRealTimers();
  });

  it('holds a button at its end, and the search pill clears', async () => {
    const user = userEvent.setup();
    const onBrowse = vi.fn();
    render(
      <Harness
        variant="search"
        initial="photos"
        endAdornment={<button type="button" onClick={onBrowse}>Browse</button>}
      />
    );
    await user.click(screen.getByRole('button', { name: 'Browse' }));
    expect(onBrowse).toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Clear search' }));
    expect(input().value).toBe('');
  });
});
