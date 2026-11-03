import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { componentsPlugin } from '../docs/components-plugin.ts';
import { tokensPlugin } from '../docs/tokens-plugin.ts';
import { fsPlugin } from './fs-plugin.ts';

// The canvas reads the components and tokens as data the same way the docs do, so its library and
// its prop panels can never drift from the code. In the browser, fs-plugin.ts stands in for the
// desktop app's file access.
export default defineConfig({
  plugins: [react(), tokensPlugin(), componentsPlugin(), fsPlugin()],
  server: { port: 5320, strictPort: true },
  clearScreen: false,
});
