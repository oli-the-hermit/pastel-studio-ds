import { defineConfig, type Plugin as VitePlugin } from 'vite';
import react from '@vitejs/plugin-react';
import type { PluginCreator } from 'postcss';

// ComfyUI serves pack/web at /extensions/<pack folder>/ and imports every *.js file in it as an
// extension. The entry is the only .js file; chunks are .mjs so they load only when imported.
// ComfyUI's own modules are read from window.comfyAPI (src/comfy.ts), so nothing is external.

/**
 * The node UI renders inside a shadow root, so the design system's page-level selectors must
 * target the host instead. @font-face does nothing inside a shadow root; fonts are registered
 * on the page separately (see src/mount/styles.ts).
 */
const shadowScope: PluginCreator<void> = () => ({
  postcssPlugin: 'pastel-shadow-scope',
  Once(root, { result }) {
    // The font files themselves are registered on the page, untouched.
    if (result.opts.from?.includes('@fontsource')) return;
    root.walkAtRules('font-face', (rule) => {
      rule.remove();
    });
    root.walkRules((rule) => {
      rule.selectors = rule.selectors.map((s) => s.replace(/^(?::root|html|body)(?=$|[\s,.:[>+~])/, ':host'));
    });
  },
});
shadowScope.postcss = true;

/** Builds pack/web from src/: one ES module entry, React and the design system bundled in. */
export default defineConfig(({ mode }) => ({
  plugins: [react() as VitePlugin[]],
  css: { postcss: { plugins: [shadowScope()] } },
  define: { 'process.env.NODE_ENV': JSON.stringify(mode === 'development' ? 'development' : 'production') },
  build: {
    outDir: 'pack/web',
    emptyOutDir: true,
    sourcemap: mode === 'development',
    minify: mode !== 'development',
    lib: { entry: 'src/extension.ts', formats: ['es'], fileName: () => 'pastel_studio.js' },
    rollupOptions: {
      output: { chunkFileNames: 'chunks/[name]-[hash].mjs', assetFileNames: 'assets/[name]-[hash][extname]' },
    },
  },
}));
