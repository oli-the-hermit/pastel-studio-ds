"""Markdown to plain prompt text, without dependencies.

The editor saves Markdown. Text encoders should see the words, not the decorations, so the
node strips headings, emphasis, list and quote markers, links and code marks, and keeps the
line breaks. It runs on the server, so prompts queued through the API get the same result.
Prompt syntax that isn't Markdown, such as (word:1.2), {a|b} and \\( \\), is left alone.
"""

from __future__ import annotations

import re

# Characters a backslash can escape in Markdown (ASCII punctuation).
_ESCAPABLE = r"!\"#$%&'()*+,\-./:;<=>?@\[\\\]^_`{|}~"
_ESCAPE = re.compile(rf"\\([{_ESCAPABLE}])")
_CODE_SPAN = re.compile(r"(`+)(.+?)\1", re.DOTALL)
_HTML_COMMENT = re.compile(r"<!--.*?-->", re.DOTALL)

_FENCE = re.compile(r"^\s{0,3}(`{3,}|~{3,})")
_RULE = re.compile(r"^\s{0,3}([-*_=])(\s*\1){2,}\s*$")
_HEADING = re.compile(r"^\s{0,3}#{1,6}(\s+|$)")
_HEADING_CLOSE = re.compile(r"\s+#+\s*$")
_QUOTE = re.compile(r"^\s{0,3}>\s?")
_TASK = re.compile(r"^\s*(?:[-*+]|\d+[.)])\s+\[[ xX]\]\s+")
_LIST = re.compile(r"^\s*(?:[-*+]|\d+[.)])\s+")
# At least one column break, so a lone "---" stays a rule (handled above).
_TABLE_SEPARATOR = re.compile(r"^\s*\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)+\|?\s*$")
_HARD_BREAK = re.compile(r"(\\| {2,})$")

_IMAGE = re.compile(r"!\[([^\]]*)\]\([^)]*\)")
_LINK = re.compile(r"\[([^\]]+)\]\([^)]*\)")
_AUTOLINK = re.compile(r"<((?:https?|ftp|mailto):[^>\s]+)>")
_STRONG = re.compile(r"(\*\*|__)(?=\S)(.+?)(?<=\S)\1")
_EM_STAR = re.compile(r"\*(?=\S)(.+?)(?<=\S)\*")
_EM_UNDERSCORE = re.compile(r"(?<![\w])_(?=\S)(.+?)(?<=\S)_(?![\w])")
_STRIKE = re.compile(r"~~(?=\S)(.+?)(?<=\S)~~")

# Private-use characters hold escaped text and code spans while the marks are stripped.
_HOLD = ""


def _inline(text: str) -> str:
    held: list[str] = []

    def hold(value: str) -> str:
        held.append(value)
        return f"{_HOLD}{len(held) - 1}{_HOLD}"

    text = _CODE_SPAN.sub(lambda m: hold(m.group(2).strip()), text)
    # A backslash before punctuation keeps the punctuation; ComfyUI's own \( \) escapes are
    # saved by the editor as \\( and come back out as \(.
    text = _ESCAPE.sub(lambda m: hold(m.group(1)), text)
    text = _IMAGE.sub(r"\1", text)
    text = _LINK.sub(r"\1", text)
    text = _AUTOLINK.sub(r"\1", text)
    for pattern in (_STRONG, _EM_STAR, _EM_UNDERSCORE, _STRIKE):
        previous = None
        while previous != text:
            previous = text
            text = pattern.sub(lambda m: m.group(m.lastindex), text)
    return re.sub(rf"{_HOLD}(\d+){_HOLD}", lambda m: held[int(m.group(1))], text)


def _table_row(line: str) -> str:
    cells = [c.strip() for c in line.strip().strip("|").split("|")]
    return ", ".join(c for c in cells if c)


def markdown_to_plain(markdown: str) -> str:
    """The prompt as plain text: the same words and line breaks, without Markdown marks."""
    lines: list[str] = []
    in_fence = False
    for raw in _HTML_COMMENT.sub("", markdown or "").splitlines():
        if _FENCE.match(raw):
            in_fence = not in_fence
            continue
        if in_fence:
            lines.append(raw.rstrip())
            continue
        line = raw
        while _QUOTE.match(line):
            line = _QUOTE.sub("", line, count=1)
        if _RULE.match(line) or _TABLE_SEPARATOR.match(line):
            continue
        if _HEADING.match(line):
            line = _HEADING_CLOSE.sub("", _HEADING.sub("", line))
        line = _TASK.sub("", line)
        line = _LIST.sub("", line)
        if line.strip().startswith("|") and line.strip().endswith("|"):
            line = _table_row(line)
        line = _HARD_BREAK.sub("", line.rstrip("\n"))
        lines.append(_inline(line).strip())

    text = "\n".join(lines)
    # Markdown separates paragraphs with a blank line; keep one, never more.
    return re.sub(r"\n{3,}", "\n\n", text).strip()
