import type { ComponentMeta } from '@pastel-studio/react';

// Each component's meta.ts, as an ordinary module: editing one updates whatever shows it in place.
const metas = import.meta.glob<{ meta: ComponentMeta }>('../../react/src/components/*/meta.ts', { eager: true });

/** Every component's meta.ts, by component name. */
export const metaByName: ReadonlyMap<string, ComponentMeta> = new Map(Object.values(metas).map(({ meta }) => [meta.name, meta]));
