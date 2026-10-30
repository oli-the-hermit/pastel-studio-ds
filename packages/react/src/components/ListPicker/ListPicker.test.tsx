import React, { useRef } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ListPicker, type ListPickerProps, type ListPickerState } from './ListPicker';

const options = [
  { value: 'beach', label: 'Beach', meta: 12 },
  { value: 'family', label: 'Family', meta: 40 },
  { value: 'work', label: 'Work', meta: 3 },
];
const states: Record<string, ListPickerState> = { beach: true, family: 'mixed', work: false };

function Harness(props: Partial<ListPickerProps>) {
  const anchor = useRef<HTMLButtonElement>(null);
  return (
    <>
      <button ref={anchor} type="button">Tags</button>
      <ListPicker open anchorRef={anchor} onClose={() => {}} label="Tags" options={options} stateOf={(v) => states[v]} onChange={() => {}} {...props} />
    </>
  );
}

describe('ListPicker', () => {
  it('lists the options as check boxes with their states, mixed included', () => {
    render(<Harness />);
    expect(screen.getByRole('group', { name: 'Tags' })).toBeTruthy();
    expect((screen.getByRole('checkbox', { name: /Beach/ }) as HTMLInputElement).checked).toBe(true);
    expect((screen.getByRole('checkbox', { name: /Family/ }) as HTMLInputElement).indeterminate).toBe(true);
    expect((screen.getByRole('checkbox', { name: /Work/ }) as HTMLInputElement).checked).toBe(false);
  });

  it('reports a change, and checking a mixed option checks it for all', () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    fireEvent.click(screen.getByRole('checkbox', { name: /Beach/ }));
    fireEvent.click(screen.getByRole('checkbox', { name: /Family/ }));
    fireEvent.click(screen.getByRole('checkbox', { name: /Work/ }));
    expect(onChange.mock.calls).toEqual([['beach', false], ['family', true], ['work', true]]);
  });

  it('puts recent picks first under their heading', () => {
    render(<Harness recent={['work']} />);
    const labels = screen.getAllByRole('checkbox').map((c) => c.closest('label')?.textContent);
    expect(labels[0]).toContain('Work');
    expect(screen.getByText('Recent')).toBeTruthy();
    expect(screen.getByText('All')).toBeTruthy();
  });

  it('filters as you type and offers to create a new name', () => {
    const onCreate = vi.fn();
    render(<Harness onCreate={onCreate} />);
    const search = screen.getByRole('searchbox', { name: 'Tags' });
    fireEvent.change(search, { target: { value: 'fam' } });
    expect(screen.getAllByRole('checkbox')).toHaveLength(1);
    fireEvent.change(search, { target: { value: 'Holidays' } });
    expect(screen.queryAllByRole('checkbox')).toHaveLength(0);
    fireEvent.click(screen.getByRole('button', { name: 'Create "Holidays"' }));
    expect(onCreate).toHaveBeenCalledWith('Holidays');
  });

  it('creates with Enter, toggles the only match with Enter, and says when nothing matches', () => {
    const onCreate = vi.fn();
    const onChange = vi.fn();
    const { rerender } = render(<Harness onCreate={onCreate} onChange={onChange} />);
    const search = screen.getByRole('searchbox', { name: 'Tags' });
    fireEvent.change(search, { target: { value: 'Trips' } });
    fireEvent.keyDown(search, { key: 'Enter' });
    expect(onCreate).toHaveBeenCalledWith('Trips');
    fireEvent.change(search, { target: { value: 'wor' } });
    fireEvent.keyDown(search, { key: 'Enter' });
    expect(onChange).toHaveBeenCalledWith('work', true);
    rerender(<Harness onChange={onChange} />);
    fireEvent.change(screen.getByRole('searchbox', { name: 'Tags' }), { target: { value: 'zzz' } });
    expect(screen.getByText('No matches')).toBeTruthy();
  });

  it('does not offer to create a name that exists', () => {
    render(<Harness onCreate={() => {}} />);
    fireEvent.change(screen.getByRole('searchbox', { name: 'Tags' }), { target: { value: 'beach' } });
    expect(screen.queryByRole('button', { name: /Create/ })).toBeNull();
  });
});
