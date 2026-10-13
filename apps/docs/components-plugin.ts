// Serves the components to the docs as data: import { components } from 'virtual:ps-components'.
// Props come from each component's TypeScript types and "tokens used" from its stylesheet, so
// a component page can never drift from the code. (Each meta.ts joins in src/components/index.ts,
// as an ordinary module.) Editing a component reloads the docs.
import fs from 'node:fs';
import path from 'node:path';
import { withCustomConfig, type PropItem } from 'react-docgen-typescript';
import type { Plugin } from 'vite';
import { componentNames, COMPONENTS_DIR, kebab, REACT_SRC, stylesheetTokens } from '../../scripts/components/parse.ts';
import type { ComponentData, ExportDoc, PropDoc } from './src/components/types.ts';

const ID = 'virtual:ps-components';
const RESOLVED = `\0${ID}`;

const fromDom = (prop: PropItem) => prop.parent?.fileName.includes('node_modules') ?? false;

function propDoc(prop: PropItem): PropDoc {
  const values: { value: string }[] | undefined = prop.type.name === 'enum' ? prop.type.value : undefined;
  return {
    name: prop.name,
    type: values ? values.map((v) => v.value).join(' | ') : prop.type.name,
    required: prop.required,
    defaultValue: prop.defaultValue?.value ?? undefined,
    description: prop.description,
  };
}

function build(): ComponentData[] {
  const names = componentNames();
  if (!names.length) return [];
  const parser = withCustomConfig(path.join(REACT_SRC, '..', 'tsconfig.json'), {
    savePropValueAsString: true,
    shouldExtractLiteralValuesFromEnum: true,
    shouldRemoveUndefinedFromOptional: true,
  });
  return names.map((name) => {
    // Components are PascalCase; a helper a file also exports (iconButtonClass) is not one.
    const docs = parser.parse(path.join(COMPONENTS_DIR, name, `${name}.tsx`)).filter((doc) => /^[A-Z]/.test(doc.displayName));
    const exports = docs.map((doc): ExportDoc => {
      const props = Object.values(doc.props);
      // The most specific DOM interface among the inherited attributes: ButtonHTMLAttributes
      // rather than the HTMLAttributes and AriaAttributes it extends.
      const dom = props.filter(fromDom).map((p) => p.parent!.name).filter((n) => n.endsWith('HTMLAttributes'));
      return {
        name: doc.displayName,
        description: doc.description,
        props: props.filter((p) => !fromDom(p)).map(propDoc),
        htmlAttributes: dom.find((n) => n !== 'HTMLAttributes') ?? dom[0],
      };
    });
    const sheet = path.join(COMPONENTS_DIR, name, `${kebab(name)}.css`);
    const { used, own } = stylesheetTokens(fs.existsSync(sheet) ? fs.readFileSync(sheet, 'utf8') : '');
    // The folder's own component first, then its parts.
    exports.sort((a, b) => Number(b.name === name) - Number(a.name === name));
    return { name, slug: kebab(name), exports, tokens: used, ownTokens: own };
  });
}

export function componentsPlugin(): Plugin {
  return {
    name: 'pastel-studio-components',
    resolveId: (id) => (id === ID ? RESOLVED : undefined),
    load(id) {
      if (id !== RESOLVED) return;
      if (fs.existsSync(COMPONENTS_DIR)) {
        for (const entry of fs.readdirSync(COMPONENTS_DIR, { recursive: true }) as string[]) {
          const file = path.join(COMPONENTS_DIR, entry);
          if (fs.statSync(file).isFile()) this.addWatchFile(file);
        }
      }
      return `export const components = ${JSON.stringify(build())};`;
    },
    configureServer(server) {
      // The folder may not exist until the first component is promoted, so watch its parent.
      server.watcher.add(REACT_SRC);
      const reload = (file: string) => {
        if (!path.resolve(file).startsWith(COMPONENTS_DIR)) return;
        const mod = server.moduleGraph.getModuleById(RESOLVED);
        if (mod) server.moduleGraph.invalidateModule(mod);
        server.ws.send({ type: 'full-reload' });
      };
      server.watcher.on('change', reload);
      server.watcher.on('add', reload);
      server.watcher.on('unlink', reload);
    },
  };
}
