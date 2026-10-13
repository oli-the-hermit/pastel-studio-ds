import React, { useState } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { LabelsProvider } from '../../labels';
import { isBlockingOverlayOpen } from '../../lib/overlays';
import { Modal } from './Modal';

const noop = () => {};
const dialog = () => screen.queryByRole('dialog');

function Opener({ withField = true }: { withField?: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)}>Open</button>
      <Modal isOpen={open} title="Rename list" onClose={() => setOpen(false)}>
        {withField && <input aria-label="List name" />}
        <button onClick={() => setOpen(false)}>Save</button>
      </Modal>
    </>
  );
}

describe('Modal', () => {
  it('renders nothing while closed', () => {
    render(<Modal isOpen={false} title="Rename list" onClose={noop}>Body</Modal>);
    expect(dialog()).toBeNull();
  });

  it('is a modal dialog named by its title', () => {
    render(<Modal isOpen title="Rename list" onClose={noop}>Body</Modal>);
    expect(screen.getByRole('dialog', { name: 'Rename list' })).toBe(dialog());
    expect(dialog()?.getAttribute('aria-modal')).toBe('true');
    expect(dialog()?.className).toBe('ps-modal');
    expect(isBlockingOverlayOpen()).toBe(true);
  });

  it('has a close button, named from the shared words', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    const { rerender } = render(<Modal isOpen title="Rename list" onClose={onClose}>Body</Modal>);
    await user.click(screen.getByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenCalledTimes(1);
    rerender(<LabelsProvider labels={{ close: 'Cerrar' }}><Modal isOpen title="Rename list" onClose={onClose}>Body</Modal></LabelsProvider>);
    expect(screen.getByRole('button', { name: 'Cerrar' })).toBeTruthy();
    rerender(<Modal isOpen title="Rename list" onClose={onClose} labels={{ close: 'Dismiss' }}>Body</Modal>);
    expect(screen.getByRole('button', { name: 'Dismiss' })).toBeTruthy();
  });

  it('closes on Escape only when dismissible', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    const { rerender } = render(<Modal isOpen title="Rename list" onClose={onClose}>Body</Modal>);
    await user.keyboard('{Escape}');
    expect(onClose).not.toHaveBeenCalled();
    rerender(<Modal isOpen title="Rename list" onClose={onClose} dismissible>Body</Modal>);
    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('is wider when asked', () => {
    render(<Modal isOpen wide title="Rename list" onClose={noop}>Body</Modal>);
    expect(dialog()?.className).toBe('ps-modal ps-modal--wide');
  });

  it('moves focus to its first field when it opens', async () => {
    const user = userEvent.setup();
    render(<Opener />);
    await user.click(screen.getByText('Open'));
    await waitFor(() => expect(document.activeElement).toBe(screen.getByLabelText('List name')));
  });

  it('takes focus itself when it has no field', async () => {
    const user = userEvent.setup();
    render(<Opener withField={false} />);
    await user.click(screen.getByText('Open'));
    await waitFor(() => expect(document.activeElement).toBe(dialog()));
  });

  it('keeps Tab inside the dialog, both ways', async () => {
    const user = userEvent.setup();
    render(<Opener />);
    await user.click(screen.getByText('Open'));
    const close = screen.getByRole('button', { name: 'Close' });
    const save = screen.getByText('Save');
    save.focus();
    await user.tab();
    expect(document.activeElement).toBe(close);
    await user.tab({ shift: true });
    expect(document.activeElement).toBe(save);
  });

  it('gives focus back to what opened it, and leaves the page once its exit has played', async () => {
    const user = userEvent.setup();
    render(<Opener />);
    await user.click(screen.getByText('Open'));
    await user.click(screen.getByText('Save'));
    expect(document.activeElement).toBe(screen.getByText('Open'));
    await waitFor(() => expect(document.querySelector('.ps-modal')).toBeNull());
  });

  it('keeps its last content on screen while it leaves', () => {
    const { rerender } = render(<Modal isOpen title="Rename list" onClose={noop}>Body</Modal>);
    rerender(<Modal isOpen={false} title="" onClose={noop}>{null}</Modal>);
    expect(document.querySelector('.ps-modal-backdrop')?.classList.contains('is-closing')).toBe(true);
    expect(document.querySelector('.ps-modal-title')?.textContent).toBe('Rename list');
    expect(document.querySelector('.ps-modal-body')?.textContent).toBe('Body');
  });
});
