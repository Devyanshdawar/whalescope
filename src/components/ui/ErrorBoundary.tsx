/**
 * @fileoverview Global React Error Boundary.
 * Catches unhandled rendering errors and prevents application crashes.
 */

import React, { Component, type ErrorInfo, type ReactNode } from "react";
import { logger } from "../../utils/logger";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    logger.error("ErrorBoundary", "Unhandled UI rendering exception", {
      error,
      errorInfo,
    });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public override render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-screen items-center justify-center bg-[#0b0f19] p-6 text-slate-300">
          <div className="w-full max-w-md rounded-2xl border border-rose-500/20 bg-[#0e1422] p-8 text-center shadow-2xl">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h2 className="mt-4 text-lg font-bold text-white">Application Exception Caught</h2>
            <p className="mt-2 text-xs text-slate-400">
              The onchain data stream encountered an unexpected format. The fault-tolerance engine
              prevented a host crash.
            </p>
            <div className="mt-4 rounded-lg bg-black/40 p-3 text-left font-mono text-[10px] text-rose-300">
              {this.state.error?.message || "Unknown runtime exception"}
            </div>
            <button
              onClick={this.handleReset}
              className="mt-6 w-full rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-blue-500"
            >
              Reboot Engine
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

