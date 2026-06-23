
import { useEffect } from 'react';
import { toast } from 'sonner';
import { AlertCircle, AlertTriangle, Info, CheckCircle2, ShieldAlert } from 'lucide-react';
import React from 'react';

export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface ErrorReport {
  title: string;
  message: string;
  severity?: ErrorSeverity;
  code?: string;
  error?: any;
}

export const reportError = (report: ErrorReport) => {
  const { title, message, severity = ErrorSeverity.MEDIUM, code, error } = report;
  
  const icon = severity === ErrorSeverity.CRITICAL ? <ShieldAlert className="text-red-600" size={20} /> :
               severity === ErrorSeverity.HIGH ? <AlertTriangle className="text-red-500" size={20} /> :
               severity === ErrorSeverity.MEDIUM ? <AlertCircle className="text-amber-500" size={20} /> :
               <Info className="text-blue-500" size={20} />;

  const finalMessage = error ? `${message} (${error.message || String(error)})` : message;

  toast(title, {
    description: finalMessage,
    icon,
    duration: severity === ErrorSeverity.CRITICAL ? 10000 : 5000,
    className: `
      ${severity === 'CRITICAL' ? 'bg-red-950/90 border-red-900/50 text-red-100' : 
        severity === 'HIGH' ? 'bg-red-900/20 border-red-900/40 text-red-200' :
        severity === 'MEDIUM' ? 'bg-amber-900/20 border-amber-900/40 text-amber-200' :
        'bg-blue-900/20 border-blue-900/40 text-blue-200'}
      font-mono border-2 backdrop-blur-md rounded-none uppercase tracking-tighter
    `,
    action: code ? {
      label: 'COPY_CODE',
      onClick: () => navigator.clipboard.writeText(code)
    } : undefined
  });
};

export const reportSuccess = (title: string, message: string) => {
  toast(title, {
    description: message,
    icon: <CheckCircle2 className="text-green-500" size={20} />,
    className: 'bg-green-900/20 border-green-900/40 text-green-200 font-mono border-2 backdrop-blur-md rounded-none uppercase tracking-tighter'
  });
};

export const GlobalErrorHandler: React.FC = () => {
  useEffect(() => {
    const handleGlobalError = (event: ErrorEvent) => {
      const msg = event.message || '';
      // Filter out benign system, browser extension, sandbox or hot-reload scheduler warnings
      if (
        msg.includes("Performance") ||
        msg.includes("measure") ||
        msg.includes("DataCloneError") ||
        msg.includes("Should not already be working") ||
        msg.includes("flushSync")
      ) {
        console.warn("[GlobalErrorHandler] Suppressed benign system/scheduler error:", msg);
        return;
      }

      console.error("[GlobalErrorHandler] ErrorEvent:", event);
      reportError({
        title: 'UNHANDLED_EXCEPTION',
        message: event.message || 'A neural fracture has occurred in the main thread.',
        severity: ErrorSeverity.HIGH
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const message = event.reason?.message || event.reason || 'A promise chain has collapsed without a catch block.';
      const msgStr = String(message);

      if (
        msgStr.includes("Performance") ||
        msgStr.includes("measure") ||
        msgStr.includes("DataCloneError") ||
        msgStr.includes("Should not already be working") ||
        msgStr.includes("flushSync")
      ) {
        console.warn("[GlobalErrorHandler] Suppressed benign promise rejection:", msgStr);
        return;
      }

      console.error("[GlobalErrorHandler] UnhandledRejection:", event);
      reportError({
        title: 'ASYNC_COLLAPSE',
        message: msgStr,
        severity: ErrorSeverity.HIGH
      });
    };

    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return null;
};
