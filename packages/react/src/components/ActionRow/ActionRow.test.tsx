import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ActionRow } from './ActionRow';

describe('ActionRow', () => {
  it('holds the buttons in the order given and forwards the ref and attributes', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<ActionRow ref={ref} className="mine"><button>Cancel</button><button>Save</button></ActionRow>);
    expect(screen.getAllByRole('button').map((b) => b.textContent)).toEqual(['Cancel', 'Save']);
    expect(ref.current?.className).toBe('ps-action-row mine');
  });
});
