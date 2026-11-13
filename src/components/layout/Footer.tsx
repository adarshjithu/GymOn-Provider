export function Footer() {
  return (
    <footer className="mt-8 pt-6 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 font-medium gap-2 select-none">
      <div>
        &copy; {new Date().getFullYear()} GymOn. All rights reserved.
      </div>
      <div className="flex items-center space-x-4">
        <a href="#privacy" className="hover:text-slate-800 transition-colors">
          Privacy Policy
        </a>
        <span>|</span>
        <a href="#terms" className="hover:text-slate-800 transition-colors">
          Terms &amp; Conditions
        </a>
      </div>
    </footer>
  );
}
