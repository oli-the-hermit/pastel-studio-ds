import type { ComponentMeta } from '../../meta';

export const meta: ComponentMeta = {
  name: 'CrashScreen',
  group: 'Feedback',
  summary: 'The calm screen after a crash, and CrashBoundary, which shows it when anything below it fails to draw.',
  status: 'beta',
  states: [
    { name: 'Crashed', description: 'What happened, that the saved data is safe, Reload and Copy details, and a hint about reporting it.' },
    { name: 'Details copied', description: 'After Copy details the button says the details were copied.' },
  ],
  variants: [],
  keyboard: [
    { keys: 'Tab', action: 'Moves between Reload and Copy details.' },
  ],
  labels: ['crashTitle', 'crashBody', 'crashReload', 'crashCopyDetails', 'crashCopied', 'crashHint'],
  aria: [
    'The screen is an `alert`, so a screen reader announces it as it appears.',
    'Wrap the app (or each window) in a CrashBoundary; pass `details` to add the version and platform to the report and `onError` to log the error.',
  ],
  related: ['Button'],
};
