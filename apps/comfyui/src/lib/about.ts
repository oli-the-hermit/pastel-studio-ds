import { version } from '../../package.json';

const repo = 'https://github.com/oli-the-hermit/pastel-studio-ds';

export const links = {
  repo,
  docs: 'https://oli-the-hermit.github.io/pastel-studio-ds/',
  license: `${repo}/blob/main/LICENSE`,
};

/** A new GitHub issue, with the versions filled in so a report can be followed up. */
export function issueUrl(): string {
  const body = [
    '**What happened**',
    '',
    '',
    '**What you expected**',
    '',
    '',
    '---',
    `Pastel Studio for ComfyUI ${version}`,
    `Browser: ${navigator.userAgent}`,
  ].join('\n');
  const params = new URLSearchParams({ title: '[ComfyUI] ', labels: 'comfyui', body });
  return `${repo}/issues/new?${params.toString()}`;
}

/** Opens a page in the person's browser, never with access back to ComfyUI. */
export function openExternal(url: string): void {
  window.open(url, '_blank', 'noopener,noreferrer');
}

export { version };
