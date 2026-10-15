import React, { createRef, useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Slider, type SliderProps } from './Slider';

const thumb = () => screen.getByRole('slider');

function Volume(props: Partial<SliderProps>) {
  const [value, setValue] = useState(props.value ?? 50);
  return <Slider label="Volume" {...props} value={value} onChange={(v) => { setValue(v); props.onChange?.(v); }} />;
}

/** jsdom has no layout: give the track a box 200px wide starting at x = 100. */
const placeTrack = (el: Element) => {
  el.getBoundingClientRect = () => ({ left: 100, width: 200, top: 0, height: 20, right: 300, bottom: 20, x: 100, y: 0, toJSON: () => ({}) });
};

describe('Slider', () => {
  it('is a named slider with its range, value and spoken value', () => {
    render(<Slider label="Seek" value={64} max={200} valueText={(v) => `${v} seconds`} />);
    expect(screen.getByRole('slider', { name: 'Seek' })).toBe(thumb());
    expect(thumb().getAttribute('aria-valuemin')).toBe('0');
    expect(thumb().getAttribute('aria-valuemax')).toBe('200');
    expect(thumb().getAttribute('aria-valuenow')).toBe('64');
    expect(thumb().getAttribute('aria-valuetext')).toBe('64 seconds');
    expect(thumb().style.left).toBe('32%');
  });

  it('steps with the arrows, pages by a tenth, and jumps to the ends', async () => {
    const onChange = vi.fn();
    const onChangeEnd = vi.fn();
    const user = userEvent.setup();
    render(<Volume onChange={onChange} onChangeEnd={onChangeEnd} />);
    thumb().focus();
    await user.keyboard('{ArrowRight}');
    expect(thumb().getAttribute('aria-valuenow')).toBe('51');
    await user.keyboard('{ArrowDown}{ArrowDown}');
    expect(thumb().getAttribute('aria-valuenow')).toBe('49');
    await user.keyboard('{PageUp}');
    expect(thumb().getAttribute('aria-valuenow')).toBe('59');
    await user.keyboard('{End}');
    expect(thumb().getAttribute('aria-valuenow')).toBe('100');
    await user.keyboard('{ArrowRight}');
    expect(thumb().getAttribute('aria-valuenow')).toBe('100');
    await user.keyboard('{Home}');
    expect(thumb().getAttribute('aria-valuenow')).toBe('0');
    expect(onChangeEnd).toHaveBeenLastCalledWith(0);
  });

  it('follows a drag, snapping to the step, and commits once on release', () => {
    const onChange = vi.fn();
    const onChangeEnd = vi.fn();
    const { container } = render(<Volume step={10} onChange={onChange} onChangeEnd={onChangeEnd} />);
    const root = container.firstElementChild!;
    placeTrack(root);
    fireEvent.pointerDown(root, { button: 0, clientX: 150, pointerId: 1 });
    expect(onChange).toHaveBeenLastCalledWith(30);
    expect(root.className).toContain('is-dragging');
    fireEvent.pointerMove(root, { clientX: 262, pointerId: 1 });
    expect(onChange).toHaveBeenLastCalledWith(80);
    expect(onChangeEnd).not.toHaveBeenCalled();
    fireEvent.pointerUp(root, { clientX: 262, pointerId: 1 });
    expect(onChangeEnd).toHaveBeenCalledWith(80);
    expect(root.className).not.toContain('is-dragging');
  });

  it('shows a preview bubble while hovering', () => {
    const { container } = render(<Slider label="Seek" value={0} max={200} preview={(v) => `at ${v}`} onChange={() => {}} />);
    const root = container.firstElementChild!;
    placeTrack(root);
    fireEvent.pointerMove(root, { clientX: 200 });
    expect(container.querySelector('.ps-slider-preview')?.textContent).toBe('at 100');
    fireEvent.pointerLeave(root);
    expect(container.querySelector('.ps-slider-preview')).toBeNull();
  });

  it('splits the track into chapters and draws the buffered range', () => {
    const { container } = render(<Slider label="Seek" value={30} buffered={60} marks={[{ value: 50 }]} />);
    const segments = container.querySelectorAll('.ps-slider-segment');
    expect(segments).toHaveLength(2);
    expect(Array.from(segments).map((s) => (s.querySelector('.ps-slider-fill') as HTMLElement).style.width)).toEqual(['60%', '0%']);
    expect(Array.from(segments).map((s) => (s.querySelector('.ps-slider-buffer') as HTMLElement).style.width)).toEqual(['100%', '20%']);
  });

  it('read only, is a progressbar that ignores pointer and keys', () => {
    const onChange = vi.fn();
    const { container } = render(<Slider label="Session progress" value={40} readOnly onChange={onChange} />);
    const root = container.firstElementChild!;
    expect(screen.queryByRole('slider')).toBeNull();
    expect(screen.getByRole('progressbar', { name: 'Session progress' })).toBe(root);
    expect(root.getAttribute('aria-valuenow')).toBe('40');
    expect(root.className).toBe('ps-slider is-read-only');
    placeTrack(root);
    fireEvent.pointerDown(root, { button: 0, clientX: 250 });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('when disabled, cannot be focused, dragged or stepped', () => {
    const onChange = vi.fn();
    const { container } = render(<Slider label="Volume" value={40} disabled onChange={onChange} />);
    const root = container.firstElementChild!;
    expect(thumb().tabIndex).toBe(-1);
    expect(thumb().getAttribute('aria-disabled')).toBe('true');
    placeTrack(root);
    fireEvent.pointerDown(root, { button: 0, clientX: 250 });
    fireEvent.keyDown(thumb(), { key: 'ArrowRight' });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('turns size and knob into classes and forwards its ref and attributes', () => {
    const ref = createRef<HTMLDivElement>();
    render(<Slider ref={ref} label="Volume" value={40} size="sm" knob="hover" className="mine" data-id="3" />);
    expect(ref.current?.className).toBe('ps-slider ps-slider--sm ps-slider--knob-hover mine');
    expect(ref.current?.dataset.id).toBe('3');
  });
});
