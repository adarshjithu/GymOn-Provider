export function LeadDetailsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* 1. TOP NAVIGATION & BACK BUTTON SKELETON */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-lg bg-slate-200" />
          <div className="h-4 w-36 bg-slate-200 rounded-md" />
        </div>

        <div className="flex items-center space-x-2.5">
          <div className="h-9 w-32 bg-slate-200 rounded-xl" />
          <div className="h-9 w-28 bg-slate-200 rounded-xl" />
        </div>
      </div>

      {/* 2. CUSTOMER LEAD HEADER BANNER SKELETON */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="h-16 w-16 rounded-2xl bg-slate-200 shrink-0" />

          <div className="space-y-2">
            <div className="h-7 w-48 bg-slate-200 rounded-md" />
            <div className="flex items-center space-x-3">
              <div className="h-4 w-32 bg-slate-100 rounded-md" />
              <div className="h-4 w-28 bg-slate-100 rounded-md" />
            </div>
          </div>
        </div>

        {/* Status Control Switcher Skeleton */}
        <div className="border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0 md:pl-6 w-full md:w-auto space-y-2">
          <div className="h-3 w-20 bg-slate-200 rounded" />
          <div className="flex items-center space-x-1.5 p-1 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="h-7 w-16 bg-slate-200 rounded-lg" />
            <div className="h-7 w-20 bg-slate-100 rounded-lg" />
            <div className="h-7 w-16 bg-slate-100 rounded-lg" />
          </div>
        </div>
      </div>

      {/* 3. DETAILS GRID SKELETON */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Message, Inquiry Details, Notes */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Message Card */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-3">
            <div className="h-4 w-44 bg-slate-200 rounded-md" />
            <div className="h-20 bg-slate-50 rounded-xl p-4 space-y-2">
              <div className="h-3.5 w-full bg-slate-100 rounded" />
              <div className="h-3.5 w-3/4 bg-slate-100 rounded" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-1">
                  <div className="h-3 w-20 bg-slate-100 rounded" />
                  <div className="h-4 w-24 bg-slate-200 rounded" />
                </div>
              ))}
            </div>
          </div>

          {/* Follow-up Notes & Activity */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="h-4 w-52 bg-slate-200 rounded-md" />
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
              <div className="flex items-center justify-between">
                <div className="h-3 w-20 bg-slate-200 rounded" />
                <div className="h-3 w-16 bg-slate-100 rounded" />
              </div>
              <div className="h-3.5 w-5/6 bg-slate-100 rounded" />
            </div>
          </div>
        </div>

        {/* Right 1 Col: Contact Info & Associated Gym */}
        <div className="space-y-6">
          {/* Contact Card */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="h-4 w-32 bg-slate-200 rounded-md" />
            <div className="space-y-3">
              <div className="space-y-1">
                <div className="h-3 w-20 bg-slate-100 rounded" />
                <div className="h-4 w-32 bg-slate-200 rounded" />
              </div>
              <div className="pt-2 border-t border-slate-100 space-y-1">
                <div className="h-3 w-20 bg-slate-100 rounded" />
                <div className="h-4 w-40 bg-slate-200 rounded" />
              </div>
            </div>
          </div>

          {/* Associated Gym Card */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="h-4 w-36 bg-slate-200 rounded-md" />
            <div className="space-y-2">
              <div className="h-4 w-44 bg-slate-200 rounded" />
              <div className="h-3 w-32 bg-slate-100 rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

