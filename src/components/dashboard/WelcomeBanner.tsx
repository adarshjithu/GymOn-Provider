import { useNavigate } from 'react-router-dom';
import { Dumbbell, CheckCircle2, ExternalLink } from 'lucide-react';
import type { ProviderUser, TabType } from '../../types';

interface WelcomeBannerProps {
  user?: ProviderUser | null;
  onNavigate?: (tab: TabType) => void;
}

export function WelcomeBanner({ user, onNavigate }: WelcomeBannerProps) {
  const navigate = useNavigate();
  const gymName = user?.gymName || "Iron Fitness";
  const userName = user?.name ? user.name.split(" ")[0] : "Provider";

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6">
      <div className="flex items-center space-x-3.5 sm:space-x-4 min-w-0">
        {/* Gym Logo Circle */}
        <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-[#0A111F] border-2 border-slate-800 flex flex-col items-center justify-center text-white shrink-0 p-1.5 sm:p-2 text-center">
          <Dumbbell className="h-4 w-4 sm:h-5 sm:w-5 text-white mb-0.5" />
          <span className="text-[7px] font-black tracking-tighter uppercase leading-none truncate max-w-[45px] sm:max-w-[50px]">
            {gymName.split(" ")[0] || "GYM"}
          </span>
          <span className="text-[6px] text-slate-400 font-bold uppercase leading-none truncate max-w-[45px] sm:max-w-[50px]">
            {gymName.split(" ")[1] || "FITNESS"}
          </span>
        </div>

        <div className="min-w-0">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2 truncate">
            <span>Welcome back, {userName}!</span>
            <span className="shrink-0">👋</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5 sm:mt-1 truncate">
            Here's what's happening with your gym today.
          </p>
        </div>
      </div>

      {/* Gym Live Badge & Action */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-3 sm:pt-0 border-t md:border-t-0 md:border-l border-slate-200/80 md:pl-6 w-full md:w-auto">
        <div className="flex items-center space-x-3">
          <div className="h-9 w-9 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-emerald-700">
              {gymName} is LIVE
            </h4>
            <p className="text-[11px] text-slate-500 font-medium">
              Your gym is visible to customers.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            navigate('/gyms');
            if (onNavigate) onNavigate('My Gyms');
          }}
          className="w-full sm:w-auto px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-all shadow-xs flex items-center justify-center space-x-1.5 cursor-pointer shrink-0"
        >
          <span>View Public Listing</span>
          <ExternalLink className="h-3.5 w-3.5 text-slate-500" />
        </button>
      </div>
    </div>
  );
}
