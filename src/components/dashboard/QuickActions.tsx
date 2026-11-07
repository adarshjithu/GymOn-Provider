import { useNavigate } from 'react-router-dom';
import { Pencil, ImageIcon, ExternalLink } from 'lucide-react';
import type { TabType } from '../../types';

interface QuickActionsProps {
  onNavigate?: (tab: TabType) => void;
}

export function QuickActions({ onNavigate }: QuickActionsProps) {
  const navigate = useNavigate();

  const handleGoGyms = () => {
    navigate('/gyms');
    if (onNavigate) onNavigate('My Gyms');
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
      <h3 className="text-sm font-bold text-slate-900">Quick Actions</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          onClick={handleGoGyms}
          className="p-4 bg-sky-50/60 hover:bg-sky-100/60 border border-sky-100 rounded-xl flex flex-col items-center justify-center text-center transition-all group cursor-pointer"
        >
          <div className="p-2.5 bg-sky-100 text-sky-700 rounded-xl mb-2 group-hover:scale-110 transition-transform">
            <Pencil className="h-5 w-5" />
          </div>
          <span className="text-xs font-bold text-slate-800">Edit Gym</span>
        </button>

        <button
          onClick={handleGoGyms}
          className="p-4 bg-purple-50/60 hover:bg-purple-100/60 border border-purple-100 rounded-xl flex flex-col items-center justify-center text-center transition-all group cursor-pointer"
        >
          <div className="p-2.5 bg-purple-100 text-purple-700 rounded-xl mb-2 group-hover:scale-110 transition-transform">
            <ImageIcon className="h-5 w-5" />
          </div>
          <span className="text-xs font-bold text-slate-800">Upload Photos</span>
        </button>

        <button
          onClick={handleGoGyms}
          className="p-4 bg-amber-50/60 hover:bg-amber-100/60 border border-amber-100 rounded-xl flex flex-col items-center justify-center text-center transition-all group cursor-pointer"
        >
          <div className="p-2.5 bg-amber-100 text-amber-700 rounded-xl mb-2 group-hover:scale-110 transition-transform">
            <ExternalLink className="h-5 w-5" />
          </div>
          <span className="text-xs font-bold text-slate-800">View Public Listing</span>
        </button>
      </div>
    </div>
  );
}
