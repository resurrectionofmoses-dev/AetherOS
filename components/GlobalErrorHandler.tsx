import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { 
  AlertCircle, AlertTriangle, Info, CheckCircle2, ShieldAlert, 
  Shield, ShieldCheck, Activity, Trash2, Zap
} from 'lucide-react';
import React from 'react';
import { safeStorage } from '../services/safeStorage';

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

  if (severity === ErrorSeverity.CRITICAL) {
    safeStorage.appendAuditLog('SYSTEM_ALERT', `Critical System Alert: [${title}] - ${finalMessage}`, { code });
  } else if (severity === ErrorSeverity.HIGH) {
    safeStorage.appendAuditLog('ALERT', `High Severity Alert: [${title}] - ${finalMessage}`, { code });
  }

  // Handle Safe Mode persistent error tracking
  if (severity === ErrorSeverity.CRITICAL || severity === ErrorSeverity.HIGH) {
    try {
      const currentCount = Number(localStorage.getItem('aetheros_error_count') || '0');
      const newCount = currentCount + 1;
      localStorage.setItem('aetheros_error_count', String(newCount));
      window.dispatchEvent(new CustomEvent('aetheros_error_registered', { detail: { count: newCount, report } }));
    } catch (e) {
      console.error("[GlobalErrorHandler] Error count update failed:", e);
    }
  }

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
  const [errorCount, setErrorCount] = useState<number>(() => {
    try {
      return Number(localStorage.getItem('aetheros_error_count') || '0');
    } catch {
      return 0;
    }
  });

  const [isSafeMode, setIsSafeMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('aetheros_safe_mode') === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const handleRegisterError = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && typeof customEvent.detail.count === 'number') {
        setErrorCount(customEvent.detail.count);
      }
    };

    const handleStorageChange = () => {
      try {
        setErrorCount(Number(localStorage.getItem('aetheros_error_count') || '0'));
        setIsSafeMode(localStorage.getItem('aetheros_safe_mode') === 'true');
      } catch (err) {
        console.error(err);
      }
    };

    window.addEventListener('aetheros_error_registered', handleRegisterError);
    window.addEventListener('storage', handleStorageChange);
    
    const handleSafeModeChange = () => {
      try {
        setIsSafeMode(localStorage.getItem('aetheros_safe_mode') === 'true');
      } catch (err) {
        console.error(err);
      }
    };
    window.addEventListener('aetheros_safe_mode_change', handleSafeModeChange);

    const handleGlobalError = (event: ErrorEvent) => {
      const msg = event.message || '';
      const errName = event.error?.name || '';
      const errMsg = event.error?.message || '';
      const fullText = `${msg} ${errName} ${errMsg}`.toLowerCase();
      
      // Filter out benign system, browser extension, sandbox, audio-decoding, or hot-reload scheduler warnings
      if (
        fullText.includes("performance") ||
        fullText.includes("measure") ||
        fullText.includes("datacloneerror") ||
        fullText.includes("should not already be working") ||
        fullText.includes("flushsync") ||
        fullText.includes("decode") ||
        fullText.includes("audio") ||
        fullText.includes("play()") ||
        fullText.includes("speech") ||
        fullText.includes("synthesis") ||
        fullText.includes("gesture") ||
        fullText.includes("metamask") ||
        fullText.includes("ethereum") ||
        fullText.includes("wallet") ||
        fullText.includes("provider") ||
        fullText.includes("web3") ||
        fullText.includes("ethers") ||
        fullText.includes("extension")
      ) {
        console.warn("[GlobalErrorHandler] Suppressed benign system, audio, or wallet error:", msg || errMsg || errName);
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
      const reason = event.reason || {};
      const reasonName = reason.name || '';
      const reasonMsg = reason.message || String(reason);
      const fullText = `${reasonName} ${reasonMsg}`.toLowerCase();

      const isBenignEvent = 
        reason instanceof Event || 
        (reason && typeof reason === 'object' && ('isTrusted' in reason || 'target' in reason));

      if (
        isBenignEvent ||
        fullText.includes("performance") ||
        fullText.includes("measure") ||
        fullText.includes("datacloneerror") ||
        fullText.includes("should not already be working") ||
        fullText.includes("flushsync") ||
        fullText.includes("decode") ||
        fullText.includes("audio") ||
        fullText.includes("play()") ||
        fullText.includes("speech") ||
        fullText.includes("synthesis") ||
        fullText.includes("gesture") ||
        fullText.includes("websocket") ||
        fullText.includes("socket") ||
        fullText.includes("hmr") ||
        fullText.includes("vite") ||
        fullText.includes("tonbridge") ||
        fullText.includes("binance") ||
        fullText.includes("event") ||
        fullText.includes("istrusted") ||
        fullText.includes("closed without opened") ||
        fullText.includes("metamask") ||
        fullText.includes("ethereum") ||
        fullText.includes("wallet") ||
        fullText.includes("provider") ||
        fullText.includes("web3") ||
        fullText.includes("ethers") ||
        fullText.includes("extension")
      ) {
        console.warn("[GlobalErrorHandler] Suppressed benign promise rejection:", reasonMsg);
        return;
      }

      console.error("[GlobalErrorHandler] UnhandledRejection:", event);
      reportError({
        title: 'ASYNC_COLLAPSE',
        message: reasonMsg,
        severity: ErrorSeverity.HIGH
      });
    };

    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('aetheros_error_registered', handleRegisterError);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('aetheros_safe_mode_change', handleSafeModeChange);
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  const toggleSafeMode = () => {
    const newMode = !isSafeMode;
    try {
      localStorage.setItem('aetheros_safe_mode', String(newMode));
      setIsSafeMode(newMode);
      window.dispatchEvent(new Event('aetheros_safe_mode_change'));
      
      toast(newMode ? 'SAFE MODE ENABLED' : 'SAFE MODE DISABLED', {
        description: newMode 
          ? 'Bypassing non-critical system modules to preserve performance.' 
          : 'Restored full operational system modules.',
        icon: newMode ? <ShieldCheck className="text-amber-500" size={20} /> : <Activity className="text-green-500" size={20} />,
        className: 'bg-zinc-950/95 border-2 border-amber-500/40 text-amber-200 font-mono text-xs uppercase tracking-tighter'
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleSimulateError = () => {
    reportError({
      title: 'MOCK_SYSTEM_FAILURE',
      message: 'Simulated high-gravity neural crash triggered for diagnostics.',
      severity: ErrorSeverity.HIGH,
      code: '0x3E2_MOCK_ERR'
    });
  };

  const handleResetLogs = () => {
    try {
      localStorage.setItem('aetheros_error_count', '0');
      setErrorCount(0);
      window.dispatchEvent(new CustomEvent('aetheros_error_registered', { detail: { count: 0 } }));
      toast('SYSTEM RESTORED', {
        description: 'Error logs cleared. Normal monitoring resumed.',
        icon: <CheckCircle2 className="text-green-500" size={20} />,
        className: 'bg-zinc-950 border-2 border-zinc-800 text-green-200 font-mono text-xs uppercase tracking-tighter'
      });
    } catch (err) {
      console.error(err);
    }
  };

  if (errorCount < 2) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-[9999] w-80 bg-zinc-950/95 border-2 border-red-500/40 p-4 rounded-xl shadow-2xl font-mono text-xs text-zinc-300 backdrop-blur-md animate-in slide-in-from-bottom duration-300">
      <div className="flex items-start justify-between gap-2 border-b border-zinc-800 pb-2 mb-3">
        <div className="flex items-center gap-1.5">
          <AlertTriangle className="text-red-500 animate-pulse shrink-0" size={16} />
          <div>
            <span className="text-red-500 font-black text-[10px] block uppercase tracking-widest leading-tight">
              PERSISTENT ERRORS DETECTED
            </span>
            <span className="text-[8px] text-zinc-500 uppercase">
              System Compromised ({errorCount} Critical Errors)
            </span>
          </div>
        </div>
        <button 
          onClick={handleResetLogs}
          className="p-1 rounded bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all cursor-pointer"
          title="Clear error logs and reset state"
        >
          <Trash2 size={12} />
        </button>
      </div>

      <p className="text-[9px] text-zinc-400 leading-relaxed uppercase mb-3.5">
        Repetitive high-severity execution failures detected. Safe Mode allows you to bypass non-critical system modules to stabilize core runtime.
      </p>

      {/* Safe Mode Status Panel & Switch */}
      <div className={`p-2.5 rounded-lg border-2 mb-3 transition-all duration-300 ${
        isSafeMode 
          ? 'bg-amber-950/20 border-amber-500/50 text-amber-200' 
          : 'bg-zinc-900/30 border-zinc-800 text-zinc-400'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className={`w-4 h-4 ${isSafeMode ? 'text-amber-500 animate-pulse' : 'text-zinc-650'}`} />
            <div>
              <span className="text-[9px] font-black uppercase tracking-wider block">
                {isSafeMode ? 'SAFE MODE ACTIVE' : 'SAFE MODE INACTIVE'}
              </span>
              <span className="text-[7px] block opacity-60">
                {isSafeMode ? 'NON-CRITICAL MODULES BYPASSED' : 'ALL MODULES ACTIVE (UNSTABLE)'}
              </span>
            </div>
          </div>
          
          {/* Custom Slide Toggle */}
          <button
            onClick={toggleSafeMode}
            className={`w-11 h-6 rounded-full p-1 transition-colors duration-300 shrink-0 cursor-pointer ${
              isSafeMode ? 'bg-amber-500' : 'bg-zinc-850'
            }`}
          >
            <div className={`w-4 h-4 rounded-full bg-black transition-transform duration-300 ${
              isSafeMode ? 'translate-x-5' : 'translate-x-0'
            }`} />
          </button>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleSimulateError}
          className="flex-1 h-7 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white font-black text-[8px] uppercase tracking-wider rounded transition-all flex items-center justify-center gap-1 cursor-pointer"
        >
          <Zap size={10} className="text-amber-500 animate-bounce" />
          Simulate Error
        </button>
        <button
          onClick={toggleSafeMode}
          className={`flex-1 h-7 border font-black text-[8.5px] uppercase tracking-wider rounded transition-all flex items-center justify-center gap-1 cursor-pointer text-black ${
            isSafeMode 
              ? 'bg-amber-500 hover:bg-amber-400 border-amber-400' 
              : 'bg-red-500 hover:bg-red-400 border-red-400 text-white'
          }`}
        >
          {isSafeMode ? 'Deactivate' : 'Activate Safe Mode'}
        </button>
      </div>
    </div>
  );
};
