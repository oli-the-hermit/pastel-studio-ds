/// <reference types="vite/client" />

// Built by the docs' tokens-plugin.ts and components-plugin.ts (see vite.config.ts). Typed where
// they're imported: an ambient module can't import the types files by a relative path.
declare module 'virtual:ps-tokens' {
  export const tokens: unknown;
}

declare module 'virtual:ps-components' {
  export const components: unknown;
}
