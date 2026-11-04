// @pastel-studio/catalog: the design system as data, for the browser side of a tool. The token and
// component data itself comes from the Vite plugins (./vite) as the virtual modules
// 'virtual:ps-tokens' and 'virtual:ps-components'; this entry holds their types and every
// component's meta.ts.
export * from './types';
export { metaByName } from './meta';
