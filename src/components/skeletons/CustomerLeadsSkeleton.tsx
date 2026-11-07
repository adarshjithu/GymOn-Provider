export function CustomerLeadsTableSkeleton() {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs animate-pulse">
      {/* Table Header */}
      <div className="bg-[#F8FAFC] border-b border-slate-200/80 px-6 py-4 flex items-center justify-between">
        <div className="h-3.5 w-24 bg-slate-200 rounded" />
        <div className="h-3.5 w-28 bg-slate-200 rounded" />
        <div className="h-3.5 w-36 bg-slate-200 rounded hidden md:block" />
        <div className="h-3.5 w-24 bg-slate-200 rounded" />
        <div className="h-3.5 w-16 bg-slate-200 rounded" />
      </div>

      {/* Table Rows */}
      <div className="divide-y divide-slate-100">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="px-6 py-4 flex items-center justify-between">
            {/* Customer */}
            <div className="flex items-center space-x-3 w-56">
              <div className="h-10 w-10 rounded-full bg-slate-200 shrink-0" />
              <div className="space-y-1.5 flex-1">
                <div className="h-4 w-28 bg-slate-200 rounded" />
                <div className="h-3 w-20 bg-slate-100 rounded" />
              </div>
            </div>

            {/* Gym Badge */}
            <div className="hidden sm:block w-40">
              <div className="h-6 w-32 bg-slate-100 rounded-lg" />
            </div>

            {/* Message */}
            <div className="hidden md:block flex-1 max-w-sm px-4 space-y-1">
              <div className="h-3 w-full bg-slate-100 rounded" />
              <div className="h-3 w-3/4 bg-slate-100 rounded" />
            </div>

            {/* Date */}
            <div className="w-28 space-y-1">
              <div className="h-3.5 w-20 bg-slate-200 rounded" />
              <div className="h-2.5 w-14 bg-slate-100 rounded" />
            </div>

            {/* Status */}
            <div className="w-24">
              <div className="h-6 w-20 bg-slate-100 rounded-full" />
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2">
              <div className="h-7 w-7 bg-slate-100 rounded-lg" />
              <div className="h-7 w-7 bg-slate-100 rounded-lg" />
            </div>
          </div>
        ))}
      </div>

      {/* Table Footer */}
      <div className="px-6 py-3.5 bg-[#F8FAFC] border-t border-slate-200/80 flex items-center justify-between">
        <div className="h-4 w-36 bg-slate-200 rounded" />
        <div className="flex items-center space-x-2">
          <div className="h-7 w-16 bg-slate-200 rounded-lg" />
          <div className="h-7 w-16 bg-slate-200 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function CustomerLeadsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* 1. TOP BANNER SKELETON */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="h-14 w-14 rounded-2xl bg-slate-200 shrink-0" />
          <div className="space-y-2">
            <div className="h-5 w-48 bg-slate-200 rounded-md" />
            <div className="h-3.5 w-60 bg-slate-100 rounded-md" />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-3 min-w-[110px] space-y-1.5"
            >
              <div className="h-5 w-10 bg-slate-200 rounded" />
              <div className="h-2.5 w-14 bg-slate-100 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* 2. FILTER & SEARCH CONTROLS SKELETON */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="h-10 bg-slate-100 rounded-xl" />
          <div className="h-10 bg-slate-100 rounded-xl" />
          <div className="h-10 bg-slate-100 rounded-xl" />
        </div>
      </div>

      {/* 3. LEADS TABLE SKELETON */}
      <CustomerLeadsTableSkeleton />
    </div>
  );
}
