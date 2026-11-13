export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Welcome Banner Skeleton */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="flex items-center space-x-4 min-w-0">
          <div className="h-16 w-16 rounded-full bg-slate-200 shrink-0" />
          <div className="space-y-2">
            <div className="h-6 w-48 bg-slate-200 rounded-md" />
            <div className="h-4 w-64 bg-slate-100 rounded-md" />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
          <div className="h-20 w-44 bg-slate-100 rounded-xl" />
          <div className="h-20 w-40 bg-slate-100 rounded-xl" />
          <div className="h-10 w-36 bg-slate-200 rounded-xl shrink-0" />
        </div>
      </div>

      {/* Main Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Gyms Grid (8 cols) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-6 w-32 bg-slate-200 rounded-md" />
            <div className="h-9 w-28 bg-slate-200 rounded-xl" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1.5 flex-1 pr-2">
                    <div className="h-5 w-3/4 bg-slate-200 rounded" />
                    <div className="h-3.5 w-1/2 bg-slate-100 rounded" />
                  </div>
                  <div className="h-5 w-16 bg-slate-200 rounded-full shrink-0" />
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <div className="h-14 bg-slate-50 border border-slate-100 rounded-xl" />
                  <div className="h-14 bg-slate-50 border border-slate-100 rounded-xl" />
                </div>

                <div className="h-10 bg-slate-50 border border-slate-100 rounded-xl" />
                <div className="h-10 bg-slate-200 rounded-xl" />
              </div>
            ))}
          </div>
        </div>

        {/* Right: Recent Leads Panel (4 cols) */}
        <div className="lg:col-span-5 xl:col-span-4 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="space-y-1">
              <div className="h-5 w-32 bg-slate-200 rounded" />
              <div className="h-3 w-44 bg-slate-100 rounded" />
            </div>
            <div className="h-4 w-20 bg-slate-200 rounded" />
          </div>

          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="p-3.5 bg-slate-50 rounded-xl space-y-2 border border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="h-4 w-28 bg-slate-200 rounded" />
                  <div className="h-5 w-16 bg-slate-200 rounded-md" />
                </div>
                <div className="h-3 w-36 bg-slate-100 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

