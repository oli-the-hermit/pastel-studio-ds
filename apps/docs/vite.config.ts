import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { componentsPlugin } from './components-plugin.ts';
import { tokensPlugin } from './tokens-plugin.ts';

// DOCS_BASE sets the public path for hosting under a sub-path, e.g. /pastel-studio-ds/ on GitHub Pages.
export default defineConfig({
  base: process.env.DOCS_BASE ?? '/',
  plugins: [react(), tokensPlugin(), componentsPlugin()],
  server: { port: 5310, strictPort: true },
});
