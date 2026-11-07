interface MyGymsSkeletonProps {
  viewMode?: 'grid' | 'table';
}

export function MyGymsCardsSkeleton({ viewMode = 'grid' }: MyGymsSkeletonProps) {
  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
        {[1, 2, 3, 4, 5, 6].map((idx) => (
          <div
            key={idx}
            className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs flex flex-col justify-between"
          >
            {/* Photo Area */}
            <div className="relative h-48 bg-slate-200">
              <div className="absolute top-3 right-3 h-6 w-16 bg-slate-300 rounded-full" />
            </div>

            {/* Body */}
            <div className="p-5 space-y-4">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-slate-200 shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-4 w-36 bg-slate-200 rounded" />
                  <div className="h-3 w-24 bg-slate-100 rounded" />
                </div>
              </div>

              <div className="pt-2 flex items-baseline justify-between border-t border-slate-100">
                <div className="h-6 w-24 bg-slate-200 rounded" />
                <div className="h-4 w-16 bg-slate-100 rounded" />
              </div>
            </div>

            {/* Bottom Action Row */}
            <div className="px-5 py-3.5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between">
              <div className="h-4 w-12 bg-slate-200 rounded" />
              <div className="h-4 w-14 bg-slate-200 rounded" />
              <div className="h-4 w-14 bg-slate-200 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs animate-pulse">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <div className="h-4 w-32 bg-slate-200 rounded" />
        <div className="h-4 w-20 bg-slate-100 rounded" />
      </div>
      <div className="divide-y divide-slate-100">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-9 w-9 rounded-full bg-slate-200 shrink-0" />
              <div className="space-y-1.5">
                <div className="h-4 w-40 bg-slate-200 rounded" />
                <div className="h-3 w-28 bg-slate-100 rounded" />
              </div>
            </div>
            <div className="h-4 w-20 bg-slate-200 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function MyGymsSkeleton({ viewMode = 'grid' }: MyGymsSkeletonProps) {
  return (
    <div className="space-y-6 animate-pulse">
      {/* 1. TOP STATS & BANNER ROW SKELETON */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="h-14 w-14 rounded-2xl bg-slate-200 shrink-0" />
          <div className="space-y-2">
            <div className="h-5 w-52 bg-slate-200 rounded-md" />
            <div className="h-3.5 w-64 bg-slate-100 rounded-md" />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-3 min-w-[120px] flex items-center space-x-3"
            >
              <div className="h-9 w-9 rounded-lg bg-slate-200 shrink-0" />
              <div className="space-y-1.5 flex-1">
                <div className="h-4 w-8 bg-slate-200 rounded" />
                <div className="h-2.5 w-12 bg-slate-100 rounded" />
              </div>
            </div>
          ))}
          <div className="h-11 w-32 bg-slate-200 rounded-xl shrink-0" />
        </div>
      </div>

      {/* 2. SEARCH & FILTER CONTROLS SKELETON */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        <div className="h-10 w-full sm:w-80 bg-slate-100 rounded-xl" />
        <div className="flex items-center space-x-3">
          <div className="h-10 w-32 bg-slate-100 rounded-xl" />
          <div className="h-10 w-36 bg-slate-100 rounded-xl" />
          <div className="h-10 w-20 bg-slate-100 rounded-xl" />
        </div>
      </div>

      {/* 3. CONTENT SKELETON: GRID OR TABLE */}
      <MyGymsCardsSkeleton viewMode={viewMode} />
    </div>
  );
}
