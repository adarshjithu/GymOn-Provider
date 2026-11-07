import { useNavigate } from 'react-router-dom';
import { Users, Pencil, Clock, Sparkles, User } from 'lucide-react';
import type { TabType } from '../../types';

interface StatCardsProps {
  oneEntryPrice: number;
  setOneEntryPrice: (price: number) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onNavigate?: (tab: TabType) => void;
}

export function StatCards({
  oneEntryPrice,
  setOneEntryPrice,
  isOpen,
  setIsOpen,
  onNavigate
}: StatCardsProps) {
  const navigate = useNavigate();

  const handleGoLeads = () => {
    navigate('/leads');
    if (onNavigate) onNavigate('Customer Leads');
  };

  const handleGoProfile = () => {
    navigate('/profile');
    if (onNavigate) onNavigate('Profile');
  };
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Card 1: New Requests Today */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500">New Requests Today</p>
            <h3 className="text-3xl font-black text-slate-900 mt-2">2</h3>
            <p className="text-[11px] text-slate-400 font-medium mt-1">Total this week: 5</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-teal-50 border border-teal-100 flex items-center justify-center text-[#00A389]">
            <Users className="h-5 w-5" />
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100">
          <button
            onClick={handleGoLeads}
            className="w-full py-2 bg-[#00A389] hover:bg-[#008f78] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center space-x-1.5 shadow-xs"
          >
            <Users className="h-3.5 w-3.5" />
            <span>View Leads</span>
          </button>
        </div>
      </div>

      {/* Card 2: One Entry Price */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500">One Entry Price</p>
            <h3 className="text-3xl font-black text-slate-900 mt-2">₹{oneEntryPrice}</h3>
            <p className="text-[11px] text-slate-400 font-medium mt-1">Per entry</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <Pencil className="h-4 w-4" />
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100">
          <button
            onClick={() => {
              const val = prompt('Enter new one-entry price (₹):', String(oneEntryPrice));
              if (val && !isNaN(Number(val))) setOneEntryPrice(Number(val));
            }}
            className="w-full py-2 bg-white border border-blue-200 hover:bg-blue-50 text-blue-600 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center space-x-1.5"
          >
            <Pencil className="h-3.5 w-3.5" />
            <span>Edit Price</span>
          </button>
        </div>
      </div>

      {/* Card 3: Today's Status */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500">Today's Status</p>
            <h3 className={`text-3xl font-black mt-2 ${isOpen ? 'text-emerald-600' : 'text-rose-600'}`}>
              {isOpen ? 'Open' : 'Closed'}
            </h3>
            <p className="text-[11px] text-slate-400 font-medium mt-1">
              {isOpen ? 'Open until 10:00 PM' : 'Closed for today'}
            </p>
          </div>
          <div className="h-10 w-10 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
            <Clock className="h-5 w-5" />
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full py-2 bg-white border border-amber-200 hover:bg-amber-50 text-amber-700 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center space-x-1.5"
          >
            <Clock className="h-3.5 w-3.5" />
            <span>Edit Hours</span>
          </button>
        </div>
      </div>

      {/* Card 4: Profile Completion */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <div className="w-full pr-2">
            <p className="text-xs font-bold text-slate-500">Profile Completion</p>
            <h3 className="text-3xl font-black text-slate-900 mt-2">80%</h3>
            
            <div className="w-full bg-slate-100 rounded-full h-2 mt-3 overflow-hidden">
              <div className="bg-indigo-600 h-2 rounded-full w-[80%]" />
            </div>
            <p className="text-[11px] text-slate-400 font-medium mt-2">
              Complete your profile to attract more customers.
            </p>
          </div>
          <div className="h-10 w-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
            <Sparkles className="h-5 w-5" />
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100">
          <button
            onClick={handleGoProfile}
            className="w-full py-2 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center space-x-1.5"
          >
            <User className="h-3.5 w-3.5" />
            <span>Complete Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
}
