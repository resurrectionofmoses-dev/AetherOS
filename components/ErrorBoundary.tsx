import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw, Home, Copy, Check, ShieldAlert } from 'lucide-react';
import { safeStorage } from '../services/safeStorage';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  contextName?: string;
  onReset?: () => void;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  copied: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    copied: false
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`[ErrorBoundary${this.props.contextName ? ` - ${this.props.contextName}` : ''}] Uncaught error:`, error, errorInfo);
    
    this.setState({ errorInfo });

    if (this.props.onError) {
      try {
        this.props.onError(error, errorInfo);
      } catch (cbErr) {
        console.error("[ErrorBoundary] Error during onError callback:", cbErr);
      }
    }

    // Persist to safeStorage audit log for forensic review
    try {
      const context = this.props.contextName || 'General Application';
      safeStorage.appendAuditLog(
        'SYSTEM_ALERT',
        `Component Fracture caught in [${context}]: ${error.message || 'Unknown Exception'}`,
        {
          component: context,
          stack: error.stack?.slice(0, 500),
          componentStack: errorInfo.componentStack?.slice(0, 500)
        }
      );
    } catch (e) {
      // Ignore audit log storage errors
    }
  }

  private handleSoftReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null, copied: false });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  private handleHardReload = () => {
    window.location.reload();
  };

  private handleCopyDiagnostic = () => {
    const errorDetails = [
      `--- AETHEROS COMPONENT FRACTURE LOG ---`,
      `Context: ${this.props.contextName || 'Global'}`,
      `Timestamp: ${new Date().toISOString()}`,
      `Error: ${this.state.error?.name || 'Error'}: ${this.state.error?.message || 'Unknown'}`,
      `Stack Trace:`,
      this.state.error?.stack || 'No stack trace available',
      `Component Stack:`,
      this.state.errorInfo?.componentStack || 'No component stack'
    ].join('\n');

    try {
      navigator.clipboard.writeText(errorDetails);
      this.setState({ copied: true });
      setTimeout(() => this.setState({ copied: false }), 2500);
    } catch (e) {
      console.warn("Failed to copy error details to clipboard", e);
    }
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isSubsystem = Boolean(this.props.contextName);

      return (
        <div className={`flex flex-col items-center justify-center p-6 font-mono text-zinc-300 ${
          isSubsystem 
            ? 'min-h-[380px] h-full w-full bg-zinc-950/90 rounded-2xl border-2 border-red-500/30 backdrop-blur-md'
            : 'min-h-screen bg-black border-2 border-red-900/40'
        }`}>
          <div className="relative mb-4">
            <div className="absolute -inset-1 rounded-full bg-red-600/20 blur-xl animate-pulse" />
            <div className="relative p-3 rounded-2xl bg-red-950/80 border border-red-500/50 text-red-400">
              <AlertTriangle size={isSubsystem ? 36 : 48} />
            </div>
          </div>

          <span className="text-[10px] font-black tracking-widest text-red-500 uppercase px-2.5 py-0.5 rounded bg-red-950/80 border border-red-500/30 mb-2">
            {this.props.contextName ? `FRACTURE IN ${this.props.contextName.toUpperCase()}` : 'SYSTEM FRACTURE DETECTED'}
          </span>

          <h2 className="text-xl font-bold tracking-tight text-white mb-2 text-center uppercase">
            {isSubsystem ? 'Subsystem Isolated For Protection' : 'Sovereign Bridge Interrupted'}
          </h2>

          <p className="text-xs text-zinc-400 max-w-lg text-center mb-5">
            {isSubsystem 
              ? 'An unexpected condition occurred within this isolated module. Core telemetry and neighboring services remain protected and operational.'
              : 'A critical runtime exception occurred. The sovereign safety interlock prevented cascade failure.'}
          </p>

          <div className="w-full max-w-xl bg-black/70 border border-red-500/20 rounded-xl p-3.5 mb-5 overflow-hidden">
            <div className="flex items-center justify-between text-[9px] uppercase tracking-wider text-red-400/80 pb-2 mb-2 border-b border-zinc-900">
              <span className="flex items-center gap-1.5 font-bold">
                <ShieldAlert size={12} className="text-red-500" />
                Diagnostic Exception Digest
              </span>
              <button
                onClick={this.handleCopyDiagnostic}
                className="hover:text-red-300 text-zinc-400 flex items-center gap-1 transition-colors cursor-pointer text-[9px]"
                title="Copy error report to clipboard"
              >
                {this.state.copied ? <Check size={11} className="text-green-400" /> : <Copy size={11} />}
                <span>{this.state.copied ? 'Copied' : 'Copy Log'}</span>
              </button>
            </div>
            <code className="text-[10px] text-red-300/90 font-mono break-all line-clamp-3 block selection:bg-red-950">
              {this.state.error?.message || "Non-descript runtime anomaly"}
            </code>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={this.handleSoftReset}
              className="flex items-center gap-2 px-4 py-2 bg-red-950 hover:bg-red-900/80 border border-red-500/50 text-red-200 hover:text-white rounded-xl uppercase text-[10px] font-black tracking-widest transition-all cursor-pointer shadow-lg active:scale-95"
            >
              <RefreshCcw size={13} className="text-red-400" />
              <span>{this.props.onReset ? 'Recover View' : 'Retry Subsystem'}</span>
            </button>

            {this.props.onReset && (
              <button
                onClick={this.handleSoftReset}
                className="flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-750 text-zinc-300 hover:text-white rounded-xl uppercase text-[10px] font-black tracking-widest transition-all cursor-pointer active:scale-95"
              >
                <Home size={13} className="text-zinc-400" />
                <span>Return to Dashboard</span>
              </button>
            )}

            <button
              onClick={this.handleHardReload}
              className="flex items-center gap-1.5 px-3 py-2 bg-transparent hover:bg-zinc-900 text-zinc-500 hover:text-zinc-300 rounded-xl uppercase text-[9px] font-mono tracking-wider transition-all cursor-pointer"
            >
              <span>Reload Workspace</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
