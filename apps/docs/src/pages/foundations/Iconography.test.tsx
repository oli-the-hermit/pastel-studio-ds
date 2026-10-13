import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import { DocsThemeProvider } from '../../theme';
import { Iconography } from './Iconography';

describe('Iconography', () => {
  it('lists the icons, not the components whose name starts with Icon', () => {
    render(<MemoryRouter><DocsThemeProvider><Iconography /></DocsThemeProvider></MemoryRouter>);
    const names = [...document.querySelectorAll('.docs-icon-name')].map((el) => el.textContent);
    expect(names).toContain('IconPlus');
    expect(names).not.toContain('IconButton');
    expect(screen.getByText(`${names.length} of ${names.length}`)).toBeTruthy();
  });
});
