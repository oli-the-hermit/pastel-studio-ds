import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { isBlockingOverlayOpen } from '../../lib/overlays';
import { useIdle } from '../../lib/useIdle';
import { MediaViewer, type MediaViewerProps } from './MediaViewer';

function setup(props: Partial<MediaViewerProps> = {}) {
  const handlers = { onClose: vi.fn(), onPrevious: vi.fn(), onNext: vi.fn(), onPanelOpenChange: vi.fn() };
  const utils = render(
    <MediaViewer open title="beach.png" position="3 of 12" zoomable naturalSize={{ width: 4000, height: 3000 }} panel={<p>Facts</p>} {...handlers} {...props}>
      {props.children ?? <img src="beach.png" alt="" />}
    </MediaViewer>
  );
  return { ...utils, ...handlers, dialog: screen.getByRole('dialog', { name: 'beach.png' }) };
}

describe('MediaViewer', () => {
  it('is a modal dialog named by the item, takes focus and pauses app shortcuts', () => {
    const { dialog, unmount } = setup();
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    expect(document.activeElement).toBe(dialog);
    expect(screen.getByText('3 of 12')).toBeTruthy();
    expect(isBlockingOverlayOpen()).toBe(true);
    unmount();
    expect(isBlockingOverlayOpen()).toBe(false);
  });

  it('renders nothing while closed', () => {
    render(<MediaViewer open={false} title="a.png" onClose={() => {}}><img src="a.png" alt="" /></MediaViewer>);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('goes to the previous and next item with the arrows and the buttons, leaving Shift + arrows alone', () => {
    const { dialog, onPrevious, onNext } = setup();
    fireEvent.keyDown(dialog, { key: 'ArrowLeft' });
    fireEvent.keyDown(dialog, { key: 'ArrowRight' });
    fireEvent.keyDown(dialog, { key: 'ArrowRight', shiftKey: true });
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(onPrevious).toHaveBeenCalledTimes(1);
    expect(onNext).toHaveBeenCalledTimes(2);
  });

  it('hides previous and next without their handlers', () => {
    setup({ onPrevious: undefined, onNext: undefined });
    expect(screen.queryByRole('button', { name: 'Previous' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Next' })).toBeNull();
  });

  it('closes on Escape and the close button, and ignores keys typed in the panel', () => {
    const { dialog, onClose, onNext } = setup({ panelOpen: true, panel: <input aria-label="Note" /> });
    fireEvent.keyDown(screen.getByRole('textbox', { name: 'Note' }), { key: 'ArrowRight' });
    expect(onNext).not.toHaveBeenCalled();
    fireEvent.keyDown(dialog, { key: 'Escape' });
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it('shows the panel when open and toggles it with its button and I', () => {
    const { dialog, onPanelOpenChange, rerender } = setup();
    expect(screen.queryByText('Facts')).toBeNull();
    fireEvent.keyDown(dialog, { key: 'i' });
    fireEvent.click(screen.getByRole('button', { name: 'Details pane' }));
    expect(onPanelOpenChange.mock.calls).toEqual([[true], [true]]);
    rerender(<MediaViewer open title="beach.png" panel={<p>Facts</p>} panelOpen onClose={() => {}}><img src="beach.png" alt="" /></MediaViewer>);
    expect(screen.getByText('Facts').closest('aside')?.getAttribute('aria-label')).toBe('Details pane');
    expect(screen.getByRole('dialog').classList.contains('is-panel-open')).toBe(true);
  });

  it('zooms images from the keyboard and the bar, and resets from the readout', () => {
    const { dialog, container } = setup();
    const canvas = container.querySelector<HTMLElement>('.ps-media-viewer-canvas')!;
    expect(screen.getByRole('button', { name: 'Zoom out' })).toHaveProperty('disabled', true);
    fireEvent.keyDown(dialog, { key: '+' });
    expect(canvas.style.transform).toContain('scale(1.25)');
    fireEvent.click(screen.getByRole('button', { name: 'Zoom in' }));
    expect(canvas.style.transform).toContain('scale(1.5625)');
    fireEvent.click(screen.getByRole('button', { name: /^Fit to window/ }));
    expect(canvas.style.transform).toContain('scale(1)');
  });

  it('puts the tools at the head of the open panel, and in the bar in groups while it is closed', () => {
    const tools = { actions: <button type="button">Favorite</button>, panelTools: <button type="button">Labels</button> };
    const { container, rerender } = setup(tools);
    const bar = container.querySelector('.ps-media-viewer-bar')!;
    expect(bar.querySelector('.ps-media-viewer-heading')?.textContent).toContain('3 of 12');
    const groups = Array.from(bar.querySelectorAll('.ps-media-viewer-group'), (g) => Array.from(g.querySelectorAll('button'), (b) => b.getAttribute('aria-label') ?? b.textContent));
    expect(groups).toEqual([['Details pane'], ['Labels'], ['Favorite'], ['Full screen', 'Close']]);

    rerender(
      <MediaViewer open title="beach.png" position="3 of 12" panel={<p>Facts</p>} panelOpen onPanelOpenChange={() => {}} onClose={() => {}} {...tools}>
        <img src="beach.png" alt="" />
      </MediaViewer>
    );
    expect(bar.querySelectorAll('button')).toHaveLength(0);
    const head = container.querySelector('.ps-media-viewer-panel-head')!;
    expect(Array.from(head.querySelectorAll('button'), (b) => b.getAttribute('aria-label') ?? b.textContent)).toEqual(['Details pane', 'Favorite', 'Full screen', 'Close']);
    expect(screen.queryByRole('button', { name: 'Labels' })).toBeNull();
  });

  it('lets the zoom box fade when the pointer and keys rest, and brings it back with either', () => {
    vi.useFakeTimers();
    try {
      const { dialog } = setup();
      expect(dialog.classList.contains('is-idle')).toBe(false);
      act(() => vi.advanceTimersByTime(2100));
      expect(dialog.classList.contains('is-idle')).toBe(true);
      fireEvent.pointerMove(dialog);
      expect(dialog.classList.contains('is-idle')).toBe(false);
      act(() => vi.advanceTimersByTime(2100));
      fireEvent.keyDown(dialog, { key: 'Shift' });
      expect(dialog.classList.contains('is-idle')).toBe(false);
    } finally {
      vi.useRealTimers();
    }
  });

  it('lets what it holds (a player hiding its controls) go idle inside it, but not under a menu', () => {
    function Player() {
      const [idle] = useIdle(true, 100);
      return <p>{idle ? 'idle' : 'awake'}</p>;
    }
    vi.useFakeTimers();
    try {
      setup({ zoomable: false, children: <Player /> });
      act(() => vi.advanceTimersByTime(150));
      expect(screen.getByText('idle')).toBeTruthy();
    } finally {
      vi.useRealTimers();
    }
  });

  it('leaves zoom out for anything that is not zoomable', () => {
    const { dialog, container } = setup({ zoomable: false });
    expect(screen.queryByRole('button', { name: 'Zoom in' })).toBeNull();
    fireEvent.keyDown(dialog, { key: '+' });
    expect(container.querySelector<HTMLElement>('.ps-media-viewer-canvas')!.style.transform).toBe('');
  });
});
