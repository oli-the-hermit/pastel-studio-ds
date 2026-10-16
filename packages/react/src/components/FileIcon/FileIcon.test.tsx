import React from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { FileIcon } from './FileIcon';

describe('FileIcon', () => {
  it('is decoration with its category, and shows the extension only at xl', () => {
    const { container, rerender } = render(<FileIcon entry={{ kind: 'file', name: 'Cover.psd' }} />);
    const icon = container.firstElementChild!;
    expect(icon.getAttribute('aria-hidden')).toBe('true');
    expect(icon.className).toBe('ps-file-icon ps-file-icon--md is-image');
    expect(icon.querySelector('.ps-file-icon-ext')).toBeNull();
    rerender(<FileIcon entry={{ kind: 'file', name: 'Cover.psd' }} size="xl" />);
    expect(container.querySelector('.ps-file-icon-ext')?.textContent).toBe('psd');
    rerender(<FileIcon entry={{ kind: 'folder', name: 'Albums' }} size="xl" />);
    expect(container.querySelector('.ps-file-icon-ext')).toBeNull();
    expect(container.firstElementChild!.classList.contains('is-folder')).toBe(true);
  });
});
