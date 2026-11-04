import { COMPONENT_GROUPS } from '@pastel-studio/react';
import { metaByName } from '@pastel-studio/catalog';
import { components as data } from 'virtual:ps-components';
import type { ComponentData, ComponentDoc } from './types';

/** A component's address in the docs. */
export const componentPath = (slug: string) => `/components/${slug}`;

/** Every component, read from packages/react/src/components at build time, in docs order: by group, then by name. */
export const components: ComponentDoc[] = (data as ComponentData[])
  .map((component) => {
    const meta = metaByName.get(component.name);
    if (!meta) throw new Error(`No meta.ts for ${component.name} in packages/react/src/components/${component.name}`);
    return { ...component, meta };
  })
  .sort((a, b) => COMPONENT_GROUPS.indexOf(a.meta.group) - COMPONENT_GROUPS.indexOf(b.meta.group) || a.name.localeCompare(b.name));
