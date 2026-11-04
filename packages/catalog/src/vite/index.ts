// The Vite plugins that serve the design system as data. Add them to a tool's vite.config.ts, then
// import { tokens } from 'virtual:ps-tokens' and { components } from 'virtual:ps-components'.
export { componentsPlugin, wordsType } from './components-plugin.ts';
export { tokensPlugin } from './tokens-plugin.ts';
