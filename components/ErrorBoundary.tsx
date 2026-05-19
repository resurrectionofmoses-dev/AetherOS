
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[ErrorBoundary] Uncaught error:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-black text-red-500 p-8 font-mono border-2 border-red-900/40">
          <AlertTriangle size={64} className="mb-6 animate-pulse" />
          <h1 className="text-2xl font-bold mb-4 tracking-tighter uppercase">System Fracture Detected</h1>
          <div className="bg-red-950/20 border border-red-900/40 p-4 mb-6 max-w-2xl w-full overflow-auto">
            <p className="text-sm text-red-400 mb-2">CRITICAL_EXCEPTION_LOG:</p>
            <code className="text-xs break-all">{this.state.error?.message || "Unknown neural collapse"}</code>
          </div>
          <button
            onClick={this.handleReset}
            className="flex items-center gap-2 px-6 py-3 bg-red-900/20 border border-red-900/40 hover:bg-red-900/40 transition-colors uppercase text-sm tracking-widest"
          >
            <RefreshCcw size={16} />
            Re-Initialize Sovereign Bridge
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
