import designSystemCss from '@pastel-studio/react/styles.css?inline';
import fontCss from '@fontsource-variable/geist/index.css?inline';
import nodeCss from '../node.css?inline';

let sheet: CSSStyleSheet | null = null;
let fontsAdded = false;

/** One stylesheet shared by every shadow root, so each node doesn't parse the CSS again. */
export function designSystemSheet(): CSSStyleSheet {
  if (!sheet) {
    sheet = new CSSStyleSheet();
    sheet.replaceSync(`${designSystemCss}\n${nodeCss}`);
  }
  return sheet;
}

/** @font-face only works at page level; registering Geist there doesn't restyle ComfyUI. */
export function registerFonts(): void {
  if (fontsAdded) return;
  fontsAdded = true;
  const style = document.createElement('style');
  style.dataset.pastelStudio = 'fonts';
  style.textContent = fontCss;
  document.head.append(style);
}
