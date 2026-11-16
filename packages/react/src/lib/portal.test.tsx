import React, { useRef } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { createRoot } from 'react-dom/client';
import { describe, expect, it, vi } from 'vitest';
import { Modal } from '../components/Modal';
import { Popover } from '../components/Popover';
import { ToastRegion } from '../components/Toast';
import { PortalProvider } from './portal';
import { deepActiveElement, eventIsInside } from './shadowDom';

function AnchoredPopover({ onClose = () => {} }: { onClose?: () => void }) {
  const ref = useRef<HTMLButtonElement>(null);
  return (
    <>
      <button ref={ref}>Anchor</button>
      <Popover open anchorRef={ref} onClose={onClose}>
        <p>Panel</p>
      </Popover>
    </>
  );
}

describe('PortalProvider', () => {
  it('renders popovers, modals and toasts into its container', () => {
    const layer = document.createElement('div');
    document.body.append(layer);
    render(
      <PortalProvider container={layer}>
        <AnchoredPopover />
        <Modal isOpen title="Save prompt" onClose={() => {}}>Body</Modal>
        <ToastRegion toasts={[{ id: '1', message: 'Saved', tone: 'success' }]} />
      </PortalProvider>,
    );
    expect(layer.contains(screen.getByText('Panel'))).toBe(true);
    expect(layer.contains(screen.getByRole('dialog'))).toBe(true);
    expect(layer.contains(screen.getByText('Saved'))).toBe(true);
    layer.remove();
  });

  it('leaves modals and toasts in place without a provider', () => {
    const { container } = render(
      <>
        <Modal isOpen title="Save prompt" onClose={() => {}}>Body</Modal>
        <ToastRegion toasts={[{ id: '1', message: 'Saved', tone: 'success' }]} />
      </>,
    );
    expect(container.contains(screen.getByRole('dialog'))).toBe(true);
    expect(container.contains(screen.getByText('Saved'))).toBe(true);
  });
});

describe('inside a shadow root', () => {
  it('keeps a popover open when its own panel is pressed, and closes it from outside', () => {
    const host = document.createElement('div');
    document.body.append(host);
    const shadow = host.attachShadow({ mode: 'open' });
    const mount = document.createElement('div');
    const layer = document.createElement('div');
    shadow.append(mount, layer);
    const onClose = vi.fn();
    act(() => {
      createRoot(mount).render(
        <PortalProvider container={layer}>
          <AnchoredPopover onClose={onClose} />
        </PortalProvider>,
      );
    });

    const panel = layer.querySelector('.ps-popover p')!;
    fireEvent.mouseDown(panel, { composed: true });
    expect(onClose).not.toHaveBeenCalled();

    fireEvent.mouseDown(document.body);
    expect(onClose).toHaveBeenCalledTimes(1);
    host.remove();
  });

  it('finds the focused element and event targets past the shadow host', () => {
    const host = document.createElement('div');
    document.body.append(host);
    const shadow = host.attachShadow({ mode: 'open' });
    const input = document.createElement('input');
    shadow.append(input);
    input.focus();
    expect(document.activeElement).toBe(host);
    expect(deepActiveElement()).toBe(input);

    let inside = false;
    document.addEventListener('click', (e) => (inside = eventIsInside(e, input)), { once: true });
    input.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true }));
    expect(inside).toBe(true);
    host.remove();
  });
});
