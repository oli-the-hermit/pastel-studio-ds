# Pastel Studio for ComfyUI

Nodes for ComfyUI built with the [Pastel Studio design system](https://oli-the-hermit.github.io/pastel-studio-ds/).

## Pastel Prompt

A prompt box you can organize: headings, lists, bold and quotes show formatted while you write.

- **prompt**: the text without Markdown marks, for CLIP Text Encode or any text input. Weights like
  `(word:1.2)` stay as typed.
- **markdown**: the prompt as written, for Save Text or notes.
- **conditioning**: the prompt encoded, when a CLIP is connected to the `clip` input.

The Pastel Studio menu saves and loads prompts (`.md` files in your ComfyUI user folder, next to your
workflows) and exports them all as one `.zip`. The profile badge opens Profile, Appearance and Settings.

## Privacy

Prompts, settings and your profile stay in your ComfyUI user folder. The only internet request is the
update check (once a day, to GitHub), which you can turn off in Settings.

## License

MIT. Made by San Milano.
