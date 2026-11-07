export function GymDetailsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* 1. TOP NAVIGATION & HEADER ACTION BAR SKELETON */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Back button skeleton */}
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-lg bg-slate-200" />
          <div className="h-4 w-28 bg-slate-200 rounded-md" />
        </div>

        {/* Action buttons skeleton */}
        <div className="flex items-center space-x-3">
          <div className="h-9 w-36 bg-slate-200 rounded-xl" />
          <div className="h-9 w-24 bg-slate-200 rounded-xl" />
          <div className="h-9 w-32 bg-slate-200 rounded-xl" />
        </div>
      </div>

      {/* 2. GYM MAIN INFO HERO BANNER SKELETON */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="h-16 w-16 rounded-2xl bg-slate-200 shrink-0" />

          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <div className="h-7 w-56 bg-slate-200 rounded-md" />
              <div className="h-5 w-14 bg-slate-100 rounded-full" />
            </div>

            <div className="flex items-center space-x-3">
              <div className="h-4 w-32 bg-slate-100 rounded-md" />
              <div className="h-4 w-28 bg-slate-100 rounded-md" />
            </div>
          </div>
        </div>

        {/* Pricing Quick Display Skeleton */}
        <div className="flex items-center space-x-6 border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0 md:pl-6 w-full md:w-auto justify-between md:justify-end">
          <div className="space-y-1">
            <div className="h-3 w-16 bg-slate-100 rounded" />
            <div className="h-6 w-20 bg-slate-200 rounded" />
          </div>
          <div className="space-y-1">
            <div className="h-3 w-16 bg-slate-100 rounded" />
            <div className="h-6 w-20 bg-slate-200 rounded" />
          </div>
          <div className="space-y-1">
            <div className="h-3 w-16 bg-slate-100 rounded" />
            <div className="h-6 w-20 bg-slate-200 rounded" />
          </div>
        </div>
      </div>

      {/* 3. PHOTO GALLERY SKELETON */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
        {/* Main Photo Banner */}
        <div className="h-72 sm:h-96 w-full rounded-xl bg-slate-200 relative overflow-hidden">
          <div className="absolute bottom-4 left-4 h-7 w-28 bg-slate-300 rounded-lg" />
        </div>

        {/* Thumbnail row */}
        <div className="flex items-center space-x-3 overflow-x-auto pb-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 w-24 rounded-lg bg-slate-200 shrink-0" />
          ))}
        </div>
      </div>

      {/* 4. DETAILS GRID (ABOUT, FACILITIES, HOURS & LOCATION) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols wide) */}
        <div className="lg:col-span-2 space-y-6">
          {/* About Section */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-3">
            <div className="h-4 w-32 bg-slate-200 rounded-md" />
            <div className="space-y-2">
              <div className="h-3.5 w-full bg-slate-100 rounded" />
              <div className="h-3.5 w-5/6 bg-slate-100 rounded" />
              <div className="h-3.5 w-4/6 bg-slate-100 rounded" />
            </div>
          </div>

          {/* Facilities & Amenities */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="h-4 w-44 bg-slate-200 rounded-md" />
            <div className="flex flex-wrap gap-2.5">
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <div key={i} className="h-8 w-28 bg-slate-100 rounded-xl" />
              ))}
            </div>
          </div>

          {/* Operating Hours */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="h-4 w-36 bg-slate-200 rounded-md" />
            <div className="space-y-2.5">
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <div key={i} className="flex items-center justify-between py-1.5 border-b border-slate-50">
                  <div className="h-3.5 w-24 bg-slate-200 rounded" />
                  <div className="h-3.5 w-32 bg-slate-100 rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (1 Col wide) */}
        <div className="space-y-6">
          {/* Location & GPS */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="h-4 w-32 bg-slate-200 rounded-md" />
            <div className="space-y-3">
              <div className="h-3.5 w-full bg-slate-100 rounded" />
              <div className="h-3.5 w-3/4 bg-slate-100 rounded" />
              <div className="h-28 w-full bg-slate-100 rounded-xl" />
            </div>
          </div>

          {/* Metadata Card */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-3">
            <div className="h-4 w-28 bg-slate-200 rounded-md" />
            <div className="space-y-2">
              <div className="h-3.5 w-full bg-slate-100 rounded" />
              <div className="h-3.5 w-2/3 bg-slate-100 rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

