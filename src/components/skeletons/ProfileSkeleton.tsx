export function ProfileSkeleton() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 font-sans animate-pulse">
      {/* 1. TOP HERO BANNER SKELETON */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center space-x-5">
            <div className="h-20 w-20 rounded-full bg-slate-200 shrink-0" />

            <div className="space-y-2.5">
              <div className="flex items-center space-x-3">
                <div className="h-7 w-48 bg-slate-200 rounded-md" />
                <div className="h-5 w-24 bg-slate-100 rounded-full" />
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <div className="h-4 w-36 bg-slate-100 rounded" />
                <div className="h-4 w-28 bg-slate-100 rounded" />
                <div className="h-4 w-32 bg-slate-100 rounded" />
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3 self-start md:self-auto shrink-0">
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-3 min-w-[110px] space-y-1">
              <div className="h-6 w-10 bg-slate-200 rounded mx-auto" />
              <div className="h-3 w-16 bg-slate-100 rounded mx-auto" />
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-3 min-w-[110px] space-y-1">
              <div className="h-6 w-10 bg-slate-200 rounded mx-auto" />
              <div className="h-3 w-16 bg-slate-100 rounded mx-auto" />
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN GRID: PROFILE FORM & PASSWORD FORM SKELETON */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* PERSONAL DETAILS CARD */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-5">
          <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
            <div className="h-10 w-10 rounded-xl bg-slate-200 shrink-0" />
            <div className="space-y-1.5">
              <div className="h-4 w-36 bg-slate-200 rounded-md" />
              <div className="h-3 w-48 bg-slate-100 rounded" />
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="h-3.5 w-20 bg-slate-200 rounded" />
              <div className="h-10 bg-slate-100 rounded-xl" />
            </div>

            <div className="space-y-2">
              <div className="h-3.5 w-24 bg-slate-200 rounded" />
              <div className="h-10 bg-slate-100 rounded-xl" />
            </div>

            <div className="space-y-2">
              <div className="h-3.5 w-24 bg-slate-200 rounded" />
              <div className="h-10 bg-slate-100 rounded-xl" />
            </div>

            <div className="pt-2">
              <div className="h-10 w-32 bg-slate-200 rounded-xl" />
            </div>
          </div>
        </div>

        {/* SECURITY & PASSWORD CARD */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-5">
          <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
            <div className="h-10 w-10 rounded-xl bg-slate-200 shrink-0" />
            <div className="space-y-1.5">
              <div className="h-4 w-40 bg-slate-200 rounded-md" />
              <div className="h-3 w-52 bg-slate-100 rounded" />
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="h-3.5 w-28 bg-slate-200 rounded" />
              <div className="h-10 bg-slate-100 rounded-xl" />
            </div>

            <div className="space-y-2">
              <div className="h-3.5 w-24 bg-slate-200 rounded" />
              <div className="h-10 bg-slate-100 rounded-xl" />
            </div>

            <div className="space-y-2">
              <div className="h-3.5 w-36 bg-slate-200 rounded" />
              <div className="h-10 bg-slate-100 rounded-xl" />
            </div>

            <div className="pt-2">
              <div className="h-10 w-36 bg-slate-200 rounded-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* 3. REGISTERED GYMS LIST SKELETON */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="h-4 w-40 bg-slate-200 rounded-md" />
          <div className="h-3.5 w-20 bg-slate-100 rounded" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 rounded-xl border border-slate-100 bg-slate-50/70 space-y-2">
              <div className="h-4 w-32 bg-slate-200 rounded" />
              <div className="h-3 w-24 bg-slate-100 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

