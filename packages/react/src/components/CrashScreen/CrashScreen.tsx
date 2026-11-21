import React from 'react';
import { useLabels, type LabelOverrides } from '../../labels';
import { Button } from '../Button';

type CrashWords =
  | 'crashTitle' | 'crashBody' | 'crashReload' | 'crashCopyDetails' | 'crashCopied' | 'crashHint'
  | 'crashProblem' | 'crashTechnical' | 'crashReference' | 'crashLogged';

export interface CrashScreenProps {
  /** The app's mark, above the title. */
  mark?: React.ReactNode;
  onReload: () => void;
  onCopyDetails: () => void;
  /** The details were copied: the button says so. */
  copied?: boolean;
  /** What failed, in one line: "TypeError: Cannot read properties of undefined (reading 'key')". */
  problem?: string;
  /** When it happened, as the reader reads times: "21 Nov 2026, 14:18:25". */
  when?: string;
  /** The code the app filed the error under in its log, for a report to point at the right entry. */
  reference?: string;
  /** The error was written to the app's log. */
  logged?: boolean;
  /** Everything a developer needs: the stack, the component stack, the version. Shown folded. */
  details?: string;
  labels?: LabelOverrides<CrashWords>;
}

/**
 * The calm screen shown after a crash: what happened, that the data is safe, what failed and when
 * (with the full details folded below), Reload, and the details for a report.
 */
export function CrashScreen({
  mark, onReload, onCopyDetails, copied = false, problem, when, reference, logged = false, details, labels: ownLabels,
}: CrashScreenProps) {
  const labels = useLabels(ownLabels);
  // Each fact stays whole on its line: a reference broken at its hyphens is hard to read out
  const facts = [when, reference && labels.crashReference.replace('{reference}', reference)].filter((f): f is string => Boolean(f));
  return (
    <div className="ps-crash-screen" role="alert">
      <div className="ps-crash-screen-card">
        {mark && <div className="ps-crash-screen-mark">{mark}</div>}
        <h1 className="ps-crash-screen-title">{labels.crashTitle}</h1>
        <p className="ps-crash-screen-body">{labels.crashBody}</p>
        {(problem || facts.length > 0) && (
          <div className="ps-crash-screen-problem">
            <p className="ps-crash-screen-problem-label">{labels.crashProblem}</p>
            {problem && <p className="ps-crash-screen-problem-text">{problem}</p>}
            {facts.length > 0 && (
              <p className="ps-crash-screen-facts">
                {facts.map((fact, i) => (
                  <React.Fragment key={fact}>
                    {i > 0 && ' · '}
                    <span className="ps-crash-screen-fact">{fact}</span>
                  </React.Fragment>
                ))}
              </p>
            )}
          </div>
        )}
        {details && (
          <details className="ps-crash-screen-details">
            <summary>{labels.crashTechnical}</summary>
            <pre tabIndex={0}>{details}</pre>
          </details>
        )}
        <div className="ps-crash-screen-actions">
          <Button variant="primary" onClick={onReload}>{labels.crashReload}</Button>
          <Button onClick={onCopyDetails}>{copied ? labels.crashCopied : labels.crashCopyDetails}</Button>
        </div>
        <p className="ps-crash-screen-hint">{logged ? `${labels.crashLogged} ${labels.crashHint}` : labels.crashHint}</p>
      </div>
    </div>
  );
}

/** What the app did with a crash: the code it filed it under, and whether it reached the log. */
export interface CrashReport {
  reference?: string;
  logged?: boolean;
}

export interface CrashBoundaryProps {
  children: React.ReactNode;
  mark?: React.ReactNode;
  /** The text a bug report needs: the app adds its version and platform; the error and stacks are passed in. */
  details?: (error: Error, componentStack: string | null, report: CrashReport, at: Date) => string;
  /**
   * Called with the error, e.g. to log it. Return the reference it was filed under (and whether it
   * was logged) for the screen to show it.
   */
  onError?: (error: Error, info: React.ErrorInfo) => CrashReport | void;
  labels?: LabelOverrides<CrashWords>;
}

interface CrashBoundaryState {
  error: Error | null;
  copied: boolean;
  at: Date | null;
  componentStack: string | null;
  report: CrashReport;
}

/** "TypeError: Cannot read properties of undefined (reading 'key')"; an error without a message says its kind. */
export const crashProblem = (error: Error) => (error.message ? `${error.name || 'Error'}: ${error.message}` : error.name || String(error));

/** The error's stack, after its one-line problem unless the stack already starts with it (as browsers' do). */
export const crashStack = (error: Error) => {
  const problem = crashProblem(error);
  const stack = error.stack ?? '';
  return stack.startsWith(problem) ? stack : [problem, stack].filter(Boolean).join('\n');
};

const plainDetails = (error: Error, componentStack: string | null, report: CrashReport, at: Date) =>
  [
    `When: ${at.toISOString()}`,
    report.reference ? `Reference: ${report.reference}` : '',
    crashStack(error),
    componentStack ? `\nComponent stack:${componentStack}` : '',
  ].filter(Boolean).join('\n');

const timeOf = (at: Date) =>
  at.toLocaleString(undefined, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' });

/**
 * Catches a render crash anywhere below it and shows the CrashScreen instead of a blank window:
 * what failed and when, the reference the app logged it under, and the full details folded.
 * Reload starts the page again; Copy details puts a bug report on the clipboard.
 */
export class CrashBoundary extends React.Component<CrashBoundaryProps, CrashBoundaryState> {
  state: CrashBoundaryState = { error: null, copied: false, at: null, componentStack: null, report: {} };

  static getDerivedStateFromError(error: Error): Partial<CrashBoundaryState> {
    return { error, at: new Date() };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    let report: CrashReport = {};
    try {
      report = this.props.onError?.(error, info) ?? {};
    } catch {
      // Reporting must never stop the screen from showing.
    }
    this.setState({ componentStack: info.componentStack ?? null, report });
  }

  private detailsText(): string {
    const { error, componentStack, report, at } = this.state;
    if (!error) return '';
    return (this.props.details ?? plainDetails)(error, componentStack, report, at ?? new Date());
  }

  private copyDetails = () => {
    if (!this.state.error) return;
    navigator.clipboard
      ?.writeText(this.detailsText())
      .then(() => this.setState({ copied: true }))
      .catch(() => {
        // The clipboard can be blocked; the details are still on screen.
      });
  };

  render() {
    const { error, at, report, copied } = this.state;
    if (!error) return this.props.children;
    return (
      <CrashScreen
        mark={this.props.mark}
        onReload={() => window.location.reload()}
        onCopyDetails={this.copyDetails}
        copied={copied}
        problem={crashProblem(error)}
        when={at ? timeOf(at) : undefined}
        reference={report.reference}
        logged={report.logged}
        details={this.detailsText()}
        labels={this.props.labels}
      />
    );
  }
}
