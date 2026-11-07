export function UsersAccessTableSkeleton() {
  return (
    <div className="divide-y divide-slate-100 animate-pulse">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="px-6 py-4 flex items-center justify-between">
          {/* User & Contact */}
          <div className="flex items-center space-x-3 w-56">
            <div className="h-10 w-10 rounded-full bg-slate-200 shrink-0" />
            <div className="space-y-1.5 flex-1">
              <div className="h-4 w-28 bg-slate-200 rounded" />
              <div className="h-3 w-36 bg-slate-100 rounded" />
            </div>
          </div>

          {/* Role */}
          <div className="hidden sm:block w-28">
            <div className="h-6 w-20 bg-slate-100 rounded-lg" />
          </div>

          {/* Permissions Tags */}
          <div className="hidden md:flex items-center gap-1.5 flex-1 px-4">
            <div className="h-5 w-20 bg-slate-100 rounded" />
            <div className="h-5 w-18 bg-slate-100 rounded" />
            <div className="h-5 w-24 bg-slate-100 rounded" />
          </div>

          {/* Status Switch */}
          <div className="w-20">
            <div className="h-6 w-12 bg-slate-200 rounded-full" />
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-slate-100 rounded-lg" />
            <div className="h-8 w-8 bg-slate-100 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function UsersAccessSkeleton() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 font-sans animate-pulse">
      {/* 1. TOP HEADER & SUMMARY BANNER SKELETON */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="h-16 w-16 rounded-2xl bg-slate-200 shrink-0" />
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <div className="h-6 w-60 bg-slate-200 rounded-md" />
              <div className="h-5 w-28 bg-slate-100 rounded-full" />
            </div>
            <div className="h-3.5 w-80 sm:w-96 bg-slate-100 rounded" />
          </div>
        </div>

        <div className="h-10 w-40 bg-slate-200 rounded-xl shrink-0" />
      </div>

      {/* 2. ROLES OVERVIEW CARDS SKELETON */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-3 w-24 bg-slate-200 rounded" />
              <div className="h-4 w-14 bg-slate-100 rounded-full" />
            </div>
            <div className="h-7 w-20 bg-slate-200 rounded-md" />
            <div className="h-3 w-40 bg-slate-100 rounded" />
          </div>
        ))}
      </div>

      {/* 3. SUB-PROVIDERS TABLE CARD SKELETON */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
        {/* Search header bar */}
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="h-5 w-44 bg-slate-200 rounded-md" />
            <div className="h-3.5 w-56 bg-slate-100 rounded" />
          </div>
          <div className="h-10 w-full sm:w-64 bg-slate-100 rounded-xl" />
        </div>

        {/* Table Column Headers */}
        <div className="bg-[#F8FAFC] border-b border-slate-200/80 px-6 py-3.5 flex items-center justify-between">
          <div className="h-3 w-28 bg-slate-200 rounded" />
          <div className="h-3 w-20 bg-slate-200 rounded hidden sm:block" />
          <div className="h-3 w-36 bg-slate-200 rounded hidden md:block" />
          <div className="h-3 w-16 bg-slate-200 rounded" />
          <div className="h-3 w-16 bg-slate-200 rounded" />
        </div>

        {/* Table Rows */}
        <UsersAccessTableSkeleton />
      </div>
    </div>
  );
}
