import { useNavigate } from 'react-router-dom';
import { Users } from 'lucide-react';
import type { RequestLead, TabType } from '../../types';
import { RecentRequestsSkeleton } from '../skeletons';

interface RecentRequestsProps {
  requests: RequestLead[];
  isLoading?: boolean;
  onNavigate?: (tab: TabType) => void;
}

export function RecentRequests({ requests, isLoading, onNavigate }: RecentRequestsProps) {
  const navigate = useNavigate();

  const handleGoLeads = (id?: string) => {
    if (id) {
      navigate(`/leads/${id}`);
    } else {
      navigate('/leads');
    }
    if (onNavigate) onNavigate('Customer Leads');
  };

  if (isLoading) {
    return <RecentRequestsSkeleton />;
  }

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-6 shadow-xs flex flex-col justify-between space-y-4">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-900">Recent Requests</h3>
          <button
            onClick={() => handleGoLeads()}
            className="text-xs font-bold text-[#00A389] hover:underline cursor-pointer flex items-center space-x-1"
          >
            <span>View All Leads</span>
            <span>&rarr;</span>
          </button>
        </div>

        <div className="space-y-2.5">
          {requests.length > 0 ? (
            requests.map((req) => (
              <div
                key={req.id}
                className="flex items-center justify-between p-3 sm:p-3.5 bg-slate-50 border border-slate-100 rounded-xl hover:bg-slate-100/60 transition-colors gap-2"
              >
                <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0">
                  <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm flex items-center justify-center shrink-0">
                    {req.name ? req.name[0]?.toUpperCase() : 'U'}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 truncate">{req.name}</h4>
                    <p className="text-[11px] text-slate-500 truncate">{req.date}</p>
                    <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 truncate">
                      Requested: {req.requestedTime}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
                  <span className="px-2 sm:px-3 py-1 bg-blue-50 text-blue-600 rounded-md text-[11px] sm:text-xs font-bold border border-blue-100">
                    {req.requestedTime}
                  </span>
                  <button
                    onClick={() => handleGoLeads(req.id)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
                  >
                    <span className="sr-only">View</span>
                    &rarr;
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-slate-400 text-xs">
              <Users className="h-8 w-8 mx-auto mb-2 opacity-40" />
              <p>No recent lead requests found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
