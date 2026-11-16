// Every word the Pastel Studio nodes show, in one place.

export const labels = {
  appName: 'Pastel Studio',
  edit: 'Edit',
  help: 'Help',
  about: 'About Pastel Studio',
  aboutBody: 'Nodes for ComfyUI built with the Pastel Studio design system.',

  editor: {
    area: 'Prompt',
    placeholder: 'Describe what you want to see. Use headings and lists to keep it organized.',
    words: (n: number) => (n === 1 ? '1 word' : `${n} words`),
  },

  clipboard: {
    cut: 'Cut',
    copy: 'Copy',
    paste: 'Paste',
    selectAll: 'Select all',
    copyPrompt: 'Copy prompt',
    copyPlain: 'Copy as plain text',
    copied: 'Prompt copied',
    copiedPlain: 'Prompt copied as plain text',
    noClipboard: 'The clipboard isn\'t available here. Use Ctrl+C and Ctrl+V instead.',
  },

  format: {
    toolbar: 'Formatting',
    more: 'More formatting',
    textStyle: 'Text style',
    lists: 'Lists',
    paragraph: 'Normal text',
    heading1: 'Heading 1',
    heading2: 'Heading 2',
    heading3: 'Heading 3',
    bold: 'Bold',
    italic: 'Italic',
    strike: 'Strikethrough',
    code: 'Code',
    link: 'Link',
    linkAddress: 'Link address',
    linkPlaceholder: 'https://',
    linkApply: 'Apply',
    linkRemove: 'Remove link',
    bulletList: 'Bulleted list',
    orderedList: 'Numbered list',
    checklist: 'Checklist',
    quote: 'Quote',
    codeBlock: 'Code block',
    undo: 'Undo',
    redo: 'Redo',
  },
} as const;
