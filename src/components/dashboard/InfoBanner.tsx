import { Info } from 'lucide-react';

export function InfoBanner() {
  return (
    <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-4 flex items-center space-x-3 text-xs text-emerald-900 font-medium">
      <div className="h-8 w-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
        <Info className="h-4 w-4" />
      </div>
      <span>Keep your gym information updated to get more customers.</span>
    </div>
  );
}
