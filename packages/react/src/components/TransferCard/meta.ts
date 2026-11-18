import type { ComponentMeta } from '../../meta';

export const meta: ComponentMeta = {
  name: 'TransferCard',
  group: 'Feedback',
  summary: 'Copies, moves and uploads under way, in a card over the window\'s corner, each with its progress, what is left and a way to stop it; with TransferIndicator, the top bar\'s button that brings it back.',
  status: 'beta',
  states: [
    { name: 'Running', description: 'A bar, how much of how much, the percent, the time left and the speed, and the file being copied.' },
    { name: 'Waiting', description: 'In line behind another transfer, or still counting what it has to do: the bar sweeps.' },
    { name: 'Asking', description: 'A name is taken where it goes: Replace, Skip or Keep both, with "Do this for the rest".' },
    { name: 'Finished', description: 'How it went, with what went wrong listed on demand; a finished row can be taken away.' },
    { name: 'Failed, retryable', description: 'With `onRetry`, a row where something went wrong shows Retry and lists why at once: "clip.mp4 is open in another program".' },
    { name: 'Folded', description: 'Only its header, with the count of transfers still going.' },
  ],
  variants: [],
  keyboard: [
    { keys: 'Tab', action: 'Moves through Stop, the conflict\'s choices, Retry and the header\'s buttons.' },
  ],
  labels: [
    'transfers', 'transferStop', 'transferWaiting', 'transferCounting', 'transferBytesOf', 'transferTimeLeft', 'transferSpeed', 'transferExists',
    'transferIncoming', 'transferExisting', 'transferReplace', 'transferSkip', 'transferKeepBoth', 'transferForRest', 'transferErrors', 'transferRetry',
    'transferClearFinished', 'transferCollapse', 'transferExpand', 'transferHide', 'close',
  ],
  aria: [
    'The card is a `section` named "Transfers". Each row is `aria-busy` while it runs, and its bar is a `progressbar` named by the row\'s title.',
    'A conflict is a `group` named by the question, so its three buttons are read in that context.',
    'Hiding or folding the card never stops a transfer. TransferIndicator is an IconButton (its `label` is its name and tooltip) whose ring shows the overall progress; `attention` turns it to the warning color while a conflict waits.',
    'Announce when a transfer ends with a toast: the card may be hidden.',
  ],
  related: ['ProgressBar', 'Toast', 'IconButton'],
};
