import React from 'react';
import { useLabels, type LabelOverrides } from '../../labels';
import { Button } from '../Button';

type CrashWords = 'crashTitle' | 'crashBody' | 'crashReload' | 'crashCopyDetails' | 'crashCopied' | 'crashHint';

export interface CrashScreenProps {
  /** The app's mark, above the title. */
  mark?: React.ReactNode;
  onReload: () => void;
  onCopyDetails: () => void;
  /** The details were copied: the button says so. */
  copied?: boolean;
  labels?: LabelOverrides<CrashWords>;
}

/** The calm screen shown after a crash: what happened, that the data is safe, Reload, and the details for a report. */
export function CrashScreen({ mark, onReload, onCopyDetails, copied = false, labels: ownLabels }: CrashScreenProps) {
  const labels = useLabels(ownLabels);
  return (
    <div className="ps-crash-screen" role="alert">
      <div className="ps-crash-screen-card">
        {mark && <div className="ps-crash-screen-mark">{mark}</div>}
        <h1 className="ps-crash-screen-title">{labels.crashTitle}</h1>
        <p className="ps-crash-screen-body">{labels.crashBody}</p>
        <div className="ps-crash-screen-actions">
          <Button variant="primary" onClick={onReload}>{labels.crashReload}</Button>
          <Button onClick={onCopyDetails}>{copied ? labels.crashCopied : labels.crashCopyDetails}</Button>
        </div>
        <p className="ps-crash-screen-hint">{labels.crashHint}</p>
      </div>
    </div>
  );
}

export interface CrashBoundaryProps {
  children: React.ReactNode;
  mark?: React.ReactNode;
  /** The text a bug report needs: the app adds its version and platform; the error and stacks are passed in. */
  details?: (error: Error, componentStack: string | null) => string;
  /** Called with the error, e.g. to log it. */
  onError?: (error: Error, info: React.ErrorInfo) => void;
  labels?: LabelOverrides<CrashWords>;
}

interface CrashBoundaryState {
  error: Error | null;
  copied: boolean;
}

const plainDetails = (error: Error, componentStack: string | null) =>
  [`${error.name}: ${error.message}`, error.stack ?? '', componentStack ? `\nComponent stack:${componentStack}` : ''].join('\n');

/**
 * Catches a render crash anywhere below it and shows the CrashScreen instead of a blank window.
 * Reload starts the page again; Copy details puts a bug report on the clipboard.
 */
export class CrashBoundary extends React.Component<CrashBoundaryProps, CrashBoundaryState> {
  state: CrashBoundaryState = { error: null, copied: false };
  private componentStack: string | null = null;

  static getDerivedStateFromError(error: Error): Partial<CrashBoundaryState> {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    this.componentStack = info.componentStack ?? null;
    this.props.onError?.(error, info);
  }

  private copyDetails = () => {
    const { error } = this.state;
    if (!error) return;
    const text = (this.props.details ?? plainDetails)(error, this.componentStack);
    navigator.clipboard
      ?.writeText(text)
      .then(() => this.setState({ copied: true }))
      .catch(() => {
        // The clipboard can be blocked; the error still reached onError.
      });
  };

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <CrashScreen
        mark={this.props.mark}
        onReload={() => window.location.reload()}
        onCopyDetails={this.copyDetails}
        copied={this.state.copied}
        labels={this.props.labels}
      />
    );
  }
}
