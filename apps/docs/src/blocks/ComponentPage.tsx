import React from 'react';
import type { ComponentDoc } from '../components/types';
import { Page } from './Page';

/** A component's page, built from its data: its group, its name and what it's for. */
export function ComponentPage({ component }: { component: ComponentDoc }) {
  return <Page overline={component.meta.group} title={component.name} lead={component.meta.summary} />;
}
