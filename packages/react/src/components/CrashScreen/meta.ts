import type { ComponentMeta } from '../../meta';

export const meta: ComponentMeta = {
  name: 'CrashScreen',
  group: 'Feedback',
  summary: 'The calm screen after a crash, and CrashBoundary, which shows it when anything below it fails to draw.',
  status: 'beta',
  states: [
    { name: 'Crashed', description: 'What happened, that the saved data is safe, what failed and when with the reference it was logged under, the technical details folded, Reload and Copy details, and a hint about reporting it.' },
    { name: 'Details copied', description: 'After Copy details the button says the details were copied.' },
  ],
  variants: [],
  keyboard: [
    { keys: 'Tab', action: 'Moves between Technical details, Reload and Copy details.' },
    { keys: 'Enter / Space', action: 'On Technical details, unfolds the stack and the component stack.' },
  ],
  labels: ['crashTitle', 'crashBody', 'crashReload', 'crashCopyDetails', 'crashCopied', 'crashHint', 'crashProblem', 'crashTechnical', 'crashReference', 'crashLogged'],
  aria: [
    'The screen is an `alert`, so a screen reader announces it as it appears.',
    'Wrap the app (or each window) in a CrashBoundary; pass `details` to add the version and platform to the report, and `onError` to log the error and return the reference it was filed under.',
    'The technical details are a native `details` element: its summary is a button a screen reader announces as collapsed or expanded.',
  ],
  related: ['Button'],
};
