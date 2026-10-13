import { createElement } from 'react';
import type React from 'react';
import { ComponentPage } from './blocks/ComponentPage';
import { componentPath, components } from './components';
import { Home } from './pages/Home';
import { GettingStarted } from './pages/GettingStarted';
import { Principles } from './pages/foundations/Principles';
import { Color } from './pages/foundations/Color';
import { Typography } from './pages/foundations/Typography';
import { Spacing } from './pages/foundations/Spacing';
import { Shape } from './pages/foundations/Shape';
import { Elevation } from './pages/foundations/Elevation';
import { Motion } from './pages/foundations/Motion';
import { Iconography } from './pages/foundations/Iconography';

// The one list of documentation pages: the navigation, the routes, the previous/next links
// and the overview cards all come from here. A new page is one entry; a component's page
// comes from its folder in packages/react/src/components, with no entry to write.

export interface DocPage {
  path: string;
  title: string;
  section: 'Start' | 'Foundations' | 'Components';
  /** One sentence, shown on overview cards. */
  summary: string;
  component: React.ComponentType;
}

const COMPONENT_PAGES = components.map((component): DocPage => ({
  path: componentPath(component.slug),
  title: component.name,
  section: 'Components',
  summary: component.meta.summary,
  component: () => createElement(ComponentPage, { component }),
}));

export const PAGES: DocPage[] = [
  { path: '/', title: 'Overview', section: 'Start', component: Home,
    summary: 'What Pastel Studio is, what it holds and where to start.' },
  { path: '/getting-started', title: 'Getting started', section: 'Start', component: GettingStarted,
    summary: 'Add Pastel Studio to an app, pick a theme and keep your own styles on top.' },
  { path: '/foundations/principles', title: 'Principles', section: 'Foundations', component: Principles,
    summary: 'The few rules every screen in the family follows.' },
  { path: '/foundations/color', title: 'Color', section: 'Foundations', component: Color,
    summary: 'The palette, the roles each theme assigns, and how well they contrast.' },
  { path: '/foundations/typography', title: 'Typography', section: 'Foundations', component: Typography,
    summary: 'Geist Variable, eight sizes, and the weights, line heights and tracking around them.' },
  { path: '/foundations/spacing', title: 'Spacing and sizing', section: 'Foundations', component: Spacing,
    summary: 'A 2px spacing grid and the fixed heights of controls.' },
  { path: '/foundations/shape', title: 'Shape', section: 'Foundations', component: Shape,
    summary: 'Corner radii, hairlines and rings.' },
  { path: '/foundations/elevation', title: 'Elevation and layers', section: 'Foundations', component: Elevation,
    summary: 'Tonal surfaces instead of shadows, and the stacking order of floating layers.' },
  { path: '/foundations/motion', title: 'Motion', section: 'Foundations', component: Motion,
    summary: 'Six durations and two curves: standard and emphasized.' },
  { path: '/foundations/iconography', title: 'Iconography', section: 'Foundations', component: Iconography,
    summary: 'The icon set: one grid, one stroke, drawn in the current text color.' },
  ...COMPONENT_PAGES,
];

export const SECTIONS = [...new Set(PAGES.map((p) => p.section))];
