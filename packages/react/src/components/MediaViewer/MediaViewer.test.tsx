import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { isBlockingOverlayOpen } from '../../lib/overlays';
import { MediaViewer, type MediaViewerProps } from './MediaViewer';

function setup(props: Partial<MediaViewerProps> = {}) {
  const handlers = { onClose: vi.fn(), onPrevious: vi.fn(), onNext: vi.fn(), onPanelOpenChange: vi.fn() };
  const utils = render(
    <MediaViewer open title="beach.png" position="3 of 12" zoomable naturalSize={{ width: 4000, height: 3000 }} panel={<p>Facts</p>} {...handlers} {...props}>
      <img src="beach.png" alt="" />
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

  it('leaves zoom out for anything that is not zoomable', () => {
    const { dialog, container } = setup({ zoomable: false });
    expect(screen.queryByRole('button', { name: 'Zoom in' })).toBeNull();
    fireEvent.keyDown(dialog, { key: '+' });
    expect(container.querySelector<HTMLElement>('.ps-media-viewer-canvas')!.style.transform).toBe('');
  });
});
