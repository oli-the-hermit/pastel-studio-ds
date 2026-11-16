/**
 * Plain text written into Markdown with as few escapes as it takes to read back the same.
 * TipTap's serializer escapes every `\ ` * _ [ ] ~` and every `& < >`, so "R&D", "snake_case",
 * "2 * 3" or "C:\Users" come out as "R&amp;D", "snake\_case", "2 \* 3", "C:\\Users". Here a
 * character is escaped only where Markdown (CommonMark + GFM, as marked reads it) could take
 * it for syntax.
 */

const isSpace = (c: string | undefined) => c !== undefined && /\s/.test(c);
const isWordChar = (c: string | undefined) => c !== undefined && /[\p{L}\p{N}]/u.test(c);
const ASCII_PUNCTUATION = /[!-/:-@[-`{-~]/;

/**
 * At the start of the text, characters that would turn the line into a block: a heading
 * ("# "), a list ("- ", "+ ", "1. ", "2) ") or a rule ("---"). Escaping them where the text
 * only follows a mark is harmless: it reads back the same.
 */
function escapeLineStart(text: string): { head: string; rest: string } {
  const heading = /^#{1,6}(?=\s|$)/.exec(text);
  if (heading) return { head: `\\${heading[0]}`, rest: text.slice(heading[0].length) };
  if (/^[-+](?=\s|$)/.test(text) || /^-{3,}\s*$/.test(text)) return { head: `\\${text[0]}`, rest: text.slice(1) };
  const ordered = /^(\d{1,9})([.)])(?=\s|$)/.exec(text);
  if (ordered) return { head: `${ordered[1]}\\${ordered[2]}`, rest: text.slice(ordered[0].length) };
  return { head: '', rest: text };
}

/** Escapes plain text (no code, no entities yet) for a Markdown inline context. */
export function escapeMarkdownText(raw: string): string {
  const { head, rest: text } = escapeLineStart(raw);
  let out = head;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    const prev = text[i - 1];
    const next = text[i + 1];
    switch (c) {
      case '\\':
        // A backslash only escapes punctuation; at the end it could join the next character, or break the line.
        out += next === undefined || ASCII_PUNCTUATION.test(next) ? '\\\\' : c;
        break;
      case '*':
        // With space on both sides a star can neither open nor close emphasis.
        out += isSpace(prev) && isSpace(next) ? c : '\\*';
        break;
      case '_':
        // Inside a word (snake_case) an underscore is never emphasis.
        out += isWordChar(prev) && isWordChar(next) ? c : '\\_';
        break;
      case '`':
      case '~':
      case '[':
        out += `\\${c}`;
        break;
      case '&':
        // Only where it would start an entity: "&amp;", "&#38;".
        out += /^&(?:[a-zA-Z][a-zA-Z0-9]*|#[0-9]+|#[xX][0-9a-fA-F]+);/.test(text.slice(i)) ? '&amp;' : c;
        break;
      case '<':
        // Only where it could open a tag, a comment or an autolink.
        out += next !== undefined && /[a-zA-Z/!?]/.test(next) ? '&lt;' : c;
        break;
      case '>':
        // At the start of the text it could open a quote.
        out += i === 0 ? '&gt;' : c;
        break;
      default:
        out += c;
    }
  }
  return out;
}

/** Undoes TipTap's `encodeHtmlEntities`, which runs before its escaping step. */
export const decodeBasicEntities = (text: string) => text.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
