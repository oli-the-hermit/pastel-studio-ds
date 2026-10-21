import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CrashBoundary, CrashScreen } from './CrashScreen';

function Broken(): React.ReactElement {
  throw new Error('Boom');
}

afterEach(() => vi.restoreAllMocks());

describe('CrashScreen', () => {
  it('says what happened, offers Reload and Copy details, and says when the details were copied', async () => {
    const user = userEvent.setup();
    const onReload = vi.fn(), onCopyDetails = vi.fn();
    const { rerender } = render(<CrashScreen onReload={onReload} onCopyDetails={onCopyDetails} />);
    expect(screen.getByRole('alert')).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Something unexpected happened' })).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Reload' }));
    await user.click(screen.getByRole('button', { name: 'Copy details' }));
    expect(onReload).toHaveBeenCalled();
    expect(onCopyDetails).toHaveBeenCalled();
    rerender(<CrashScreen onReload={onReload} onCopyDetails={onCopyDetails} copied labels={{ crashCopied: 'Copiado' }} />);
    expect(screen.getByRole('button', { name: 'Copiado' })).toBeTruthy();
  });
});

describe('CrashBoundary', () => {
  it('shows its children until one fails to draw, then the crash screen, and reports the error', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const onError = vi.fn();
    const { rerender } = render(<CrashBoundary onError={onError}><p>Fine</p></CrashBoundary>);
    expect(screen.getByText('Fine')).toBeTruthy();
    rerender(<CrashBoundary onError={onError}><Broken /></CrashBoundary>);
    expect(screen.getByRole('heading', { name: 'Something unexpected happened' })).toBeTruthy();
    expect(onError.mock.calls[0][0].message).toBe('Boom');
  });

  it('copies the app\'s details for a bug report', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    // user-event puts its own clipboard on the page; watch that one.
    const user = userEvent.setup();
    const writeText = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue();
    render(<CrashBoundary details={(e) => `v1.4.0 · ${e.message}`}><Broken /></CrashBoundary>);
    await user.click(screen.getByRole('button', { name: 'Copy details' }));
    expect(writeText).toHaveBeenCalledWith('v1.4.0 · Boom');
    await waitFor(() => expect(screen.getByRole('button', { name: 'Details copied' })).toBeTruthy());
  });
});
