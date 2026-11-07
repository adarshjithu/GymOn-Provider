export function EditGymSkeleton() {
  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16 font-sans animate-pulse">
      {/* 1. TOP BREADCRUMB & HEADER SKELETON */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-slate-200" />
          <div className="space-y-1.5">
            <div className="h-3 w-40 bg-slate-100 rounded" />
            <div className="h-6 w-52 bg-slate-200 rounded-md" />
          </div>
        </div>

        <div className="h-9 w-32 bg-slate-200 rounded-xl" />
      </div>

      {/* ============================================================== */}
      {/* SECTION 1: GYM DETAILS SKELETON                                */}
      {/* ============================================================== */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
        {/* Card Header Bar */}
        <div className="px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-slate-200 shrink-0" />
            <div className="space-y-1.5">
              <div className="h-4 w-48 bg-slate-200 rounded-md" />
              <div className="h-3 w-64 bg-slate-100 rounded" />
            </div>
          </div>
          <div className="h-10 w-36 bg-slate-200 rounded-xl shrink-0" />
        </div>

        {/* Form Body Inputs */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Gym Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <div className="h-3.5 w-24 bg-slate-200 rounded" />
              <div className="h-10 bg-slate-100 rounded-xl" />
            </div>
            <div className="space-y-2">
              <div className="h-3.5 w-28 bg-slate-200 rounded" />
              <div className="h-10 bg-slate-100 rounded-xl" />
            </div>
          </div>

          {/* City & Address */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <div className="h-3.5 w-16 bg-slate-200 rounded" />
              <div className="h-10 bg-slate-100 rounded-xl" />
            </div>
            <div className="space-y-2">
              <div className="h-3.5 w-32 bg-slate-200 rounded" />
              <div className="h-10 bg-slate-100 rounded-xl" />
            </div>
          </div>

          {/* Pricing Tiers (3 Cards) */}
          <div className="space-y-2">
            <div className="h-3.5 w-40 bg-slate-200 rounded" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                  <div className="h-3 w-20 bg-slate-200 rounded" />
                  <div className="h-9 bg-slate-200 rounded-lg" />
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <div className="h-3.5 w-28 bg-slate-200 rounded" />
            <div className="h-24 bg-slate-100 rounded-xl" />
          </div>

          {/* Facilities Grid */}
          <div className="space-y-2">
            <div className="h-3.5 w-36 bg-slate-200 rounded" />
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="h-8 w-24 bg-slate-100 rounded-xl" />
              ))}
            </div>
          </div>

          {/* Operating Hours (7 Days) */}
          <div className="space-y-3 pt-2">
            <div className="h-3.5 w-44 bg-slate-200 rounded" />
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/70 border border-slate-100">
                  <div className="h-4 w-24 bg-slate-200 rounded" />
                  <div className="flex items-center space-x-2">
                    <div className="h-8 w-24 bg-slate-100 rounded-lg" />
                    <div className="h-8 w-24 bg-slate-100 rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Save Bar */}
        <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex justify-end">
          <div className="h-10 w-36 bg-slate-200 rounded-xl" />
        </div>
      </div>

      {/* ============================================================== */}
      {/* SECTION 2: PHOTOS SHOWCASE SKELETON                            */}
      {/* ============================================================== */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
        {/* Photos Header Bar */}
        <div className="px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-slate-200 shrink-0" />
            <div className="space-y-1.5">
              <div className="h-4 w-44 bg-slate-200 rounded-md" />
              <div className="h-3 w-56 bg-slate-100 rounded" />
            </div>
          </div>
          <div className="h-10 w-36 bg-slate-200 rounded-xl shrink-0" />
        </div>

        {/* Dropzone & Preview Cards */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Dropzone skeleton */}
          <div className="h-36 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/60 flex flex-col items-center justify-center space-y-2">
            <div className="h-8 w-8 rounded-full bg-slate-200" />
            <div className="h-3.5 w-48 bg-slate-200 rounded" />
            <div className="h-2.5 w-32 bg-slate-100 rounded" />
          </div>

          {/* Photo Gallery Grid skeleton */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-36 rounded-xl bg-slate-200 relative overflow-hidden">
                <div className="absolute top-2 right-2 h-6 w-6 rounded-lg bg-slate-300" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

