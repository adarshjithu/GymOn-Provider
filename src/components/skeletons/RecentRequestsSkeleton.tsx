export function RecentRequestsSkeleton() {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-4 animate-pulse">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="h-4 w-32 bg-slate-200 rounded-md" />
          <div className="h-3.5 w-24 bg-slate-100 rounded" />
        </div>

        <div className="space-y-2.5">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-100 rounded-xl"
            >
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-slate-200 shrink-0" />
                <div className="space-y-1.5">
                  <div className="h-3.5 w-28 bg-slate-200 rounded" />
                  <div className="h-3 w-20 bg-slate-100 rounded" />
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="h-6 w-20 bg-slate-200 rounded-md" />
                <div className="h-4 w-4 bg-slate-200 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

