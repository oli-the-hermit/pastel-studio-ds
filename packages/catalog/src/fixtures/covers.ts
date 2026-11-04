// Generated album art for the demos: flat geometric covers (no files, no network).
// Raw colors are fine here: they're content, like a photo would be.

const svg = (body: string, bg: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect width="200" height="200" fill="${bg}"/>${body}</svg>`)}`;

export const covers = {
  midnight: svg('<circle cx="132" cy="70" r="38" fill="#D1DD23"/><rect x="0" y="128" width="200" height="72" fill="#1E2024"/><rect x="0" y="148" width="200" height="6" fill="#5EC8B8"/><rect x="0" y="166" width="200" height="3" fill="#5EC8B8"/>', '#3A3F0A'),
  orchard: svg('<circle cx="70" cy="110" r="52" fill="#F2B654"/><circle cx="130" cy="90" r="52" fill="#FF8A7A"/><circle cx="100" cy="140" r="18" fill="#1A1C17"/>', '#F3F4EE'),
  tidal: svg('<path d="M0 120 Q50 90 100 120 T200 120 V200 H0Z" fill="#5EC8B8"/><path d="M0 150 Q50 120 100 150 T200 150 V200 H0Z" fill="#103B36"/><circle cx="150" cy="56" r="20" fill="#F1F2EC"/>', '#0E4F46'),
  paper: svg('<rect x="40" y="40" width="120" height="120" rx="60" fill="none" stroke="#1A1C17" stroke-width="10"/><rect x="88" y="20" width="24" height="160" fill="#D1DD23"/>', '#EDEEE8'),
  neon: svg('<polygon points="100,30 170,160 30,160" fill="none" stroke="#D1DD23" stroke-width="12"/><circle cx="100" cy="118" r="16" fill="#FF6B5B"/>', '#272A2F'),
  dune: svg('<rect y="0" width="200" height="110" fill="#F2B654"/><path d="M0 110 C60 80 120 140 200 100 V200 H0Z" fill="#8A5A00"/><circle cx="60" cy="56" r="22" fill="#FBEBCB"/>', '#46330C')
};
