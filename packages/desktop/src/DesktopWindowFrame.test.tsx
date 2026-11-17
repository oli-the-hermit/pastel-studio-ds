import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DesktopWindowFrame } from './DesktopWindowFrame';

// A stand-in for the Tauri window, so the frame can be tried outside the desktop app.
const win = vi.hoisted(() => ({
  minimize: vi.fn(async () => {}),
  toggleMaximize: vi.fn(async () => {}),
  close: vi.fn(async () => {}),
  isMaximized: vi.fn(async () => false),
  onResized: vi.fn(async () => () => {}),
}));
vi.mock('@tauri-apps/api/window', () => ({ getCurrentWindow: () => win }));

const inTauri = () => Object.assign(window, { __TAURI_INTERNALS__: {} });

afterEach(() => {
  delete (window as { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__;
  vi.clearAllMocks();
});

describe('DesktopWindowFrame', () => {
  it('renders the screen alone in a browser', () => {
    const { container } = render(<DesktopWindowFrame><main>Sign in</main></DesktopWindowFrame>);
    expect(container.querySelector('.ps-window-frame')).toBeNull();
    expect(screen.getByRole('main').textContent).toBe('Sign in');
  });

  it('in the desktop app, puts a bar that moves the window above the screen, with its buttons wired', async () => {
    inTauri();
    const user = userEvent.setup();
    const { container } = render(<DesktopWindowFrame labels={{ close: 'Cerrar' }}><main>Sign in</main></DesktopWindowFrame>);
    await act(async () => {});
    expect(container.querySelector('.ps-window-frame-bar')?.hasAttribute('data-tauri-drag-region')).toBe(true);
    expect(screen.getByRole('main').textContent).toBe('Sign in');
    await user.click(screen.getByRole('button', { name: 'Minimize' }));
    await user.click(screen.getByRole('button', { name: 'Maximize' }));
    await user.click(screen.getByRole('button', { name: 'Cerrar' }));
    expect(win.minimize).toHaveBeenCalled();
    expect(win.toggleMaximize).toHaveBeenCalled();
    expect(win.close).toHaveBeenCalled();
  });
});
