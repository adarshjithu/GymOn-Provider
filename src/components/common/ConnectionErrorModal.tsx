import { useState, useEffect } from 'react';
import { WifiOff, ServerCrash, RefreshCw, Loader2, ShieldAlert } from 'lucide-react';
import { connectionManager, type ConnectionState } from '../../services/connectionManager';

export function ConnectionErrorModal() {
  const [connectionState, setConnectionState] = useState<ConnectionState>(() =>
    connectionManager.getState()
  );
  const [isRetrying, setIsRetrying] = useState<boolean>(() =>
    connectionManager.getIsRetrying()
  );
  const [countdown, setCountdown] = useState<number>(15);

  useEffect(() => {
    // Initialize connection manager
    connectionManager.init();

    // Subscribe to state updates
    const unsubscribe = connectionManager.subscribe((state, retrying) => {
      setConnectionState(state);
      setIsRetrying(retrying);
      if (state === 'OK') {
        setCountdown(15);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // 15-second countdown ticker for visual auto-retry feedback
  useEffect(() => {
    if (connectionState === 'OK') {
      setCountdown(15);
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => (prev <= 1 ? 15 : prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [connectionState]);

  // Trap keyboard and prevent Escape key dismissal
  useEffect(() => {
    if (connectionState === 'OK') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [connectionState]);

  // If connected, render nothing (no modal, zero obstruction)
  if (connectionState === 'OK') {
    return null;
  }

  const isNoInternet = connectionState === 'NO_INTERNET';

  const modalConfig = isNoInternet
    ? {
        title: 'No Internet Connection',
        message: 'Please check your internet connection and try again.',
        buttonText: 'Retry Connection',
        icon: WifiOff,
        accentColor: 'from-amber-500 to-rose-500',
        badgeBg: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
      }
    : {
        title: 'Server Connection Lost',
        message: 'Unable to connect to the server. Please try again shortly.',
        buttonText: 'Retry Server',
        icon: ServerCrash,
        accentColor: 'from-[#00A389] to-[#00C49F]',
        badgeBg: 'bg-[#00A389]/10 border-[#00A389]/20 text-[#00C49F]',
      };

  const IconComponent = modalConfig.icon;

  const handleManualRetry = async () => {
    setCountdown(15);
    await connectionManager.manualRetry();
  };

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="connection-modal-title"
      aria-describedby="connection-modal-desc"
      className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md select-none animate-in fade-in duration-200"
      onClick={(e) => e.stopPropagation()}
    >
      <div
        className="w-full max-w-md bg-[#0B1528] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6 sm:p-8 text-center relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle decorative glow */}
        <div
          className={`absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none bg-gradient-to-r ${modalConfig.accentColor}`}
        />

        {/* Status Icon */}
        <div className="relative mx-auto mb-5">
          <div
            className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center border shadow-lg ${modalConfig.badgeBg}`}
          >
            <IconComponent className="w-8 h-8 stroke-[2.2]" />
          </div>
          <div className="absolute -bottom-1 right-1/2 translate-x-7 bg-slate-900 border border-slate-700 rounded-full p-1 text-slate-400">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
          </div>
        </div>

        {/* Modal Title (Exact match to specification) */}
        <h2
          id="connection-modal-title"
          className="text-lg sm:text-xl font-bold text-white tracking-tight"
        >
          {modalConfig.title}
        </h2>

        {/* Modal Message (Exact match to specification) */}
        <p
          id="connection-modal-desc"
          className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xs mx-auto"
        >
          {modalConfig.message}
        </p>

        {/* Auto-retry 15-second status indicator */}
        <div className="mt-5 inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400 font-medium">
          <span className="relative flex h-2 w-2">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isNoInternet ? 'bg-rose-400' : 'bg-[#00C49F]'
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                isNoInternet ? 'bg-rose-500' : 'bg-[#00A389]'
              }`}
            />
          </span>
          <span>Auto-retrying in {countdown}s</span>
        </div>

        {/* Action Button */}
        <div className="mt-6">
          <button
            type="button"
            onClick={handleManualRetry}
            disabled={isRetrying}
            className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-[#00A389] to-[#00C49F] hover:opacity-95 active:scale-[0.99] transition-all shadow-lg shadow-[#00A389]/25 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRetrying ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Checking Connection...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 text-white" />
                <span>{modalConfig.buttonText}</span>
              </>
            )}
          </button>
        </div>

        {/* Safety Note */}
        <p className="mt-4 text-[10px] text-slate-500">
          Your active session, inputs, and page state will be restored automatically upon reconnection.
        </p>
      </div>
    </div>
  );
}

