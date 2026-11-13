import { LogOut, AlertTriangle, Loader2 } from 'lucide-react';

interface LogoutModalProps {
  isOpen: boolean;
  isLoading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function LogoutModal({ isOpen, isLoading, onConfirm, onCancel }: LogoutModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-[#0B1727] border border-slate-800 text-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-5 animate-scaleUp">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Sign Out</h3>
            <p className="text-xs text-slate-400">GymOn Provider Portal</p>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Are you sure you want to end your current session? You will need to enter your provider credentials to sign in again.
        </p>

        <div className="flex items-center space-x-3 pt-2">
          <button
            type="button"
            disabled={isLoading}
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700/80 text-xs font-semibold text-slate-300 transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-xs font-bold text-white transition-all shadow-lg shadow-rose-500/20 flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Signing out...</span>
              </>
            ) : (
              <>
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign Out</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
