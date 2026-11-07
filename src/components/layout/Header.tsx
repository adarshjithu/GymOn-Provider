import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, ChevronDown, LogOut, User } from "lucide-react";
import type { ProviderUser, TabType } from "../../types";

interface HeaderProps {
  activeTab: string;
  onToggleSidebar: () => void;
  user?: ProviderUser | null;
  onLogout?: () => void;
  onNavigate?: (tab: TabType) => void;
}

export function Header({ activeTab, onToggleSidebar, user, onLogout, onNavigate }: HeaderProps) {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Compute display name and initials
  const displayName = user?.name || "Provider";
  const displayGym = user?.gymName || "GYMON Partner";
  const initials = displayName
    .trim()
    .split(/\s+/)
    .map((part) => part[0] || "")
    .join("")
    .slice(0, 2)
    .toUpperCase() || "PR";

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-3.5 sm:px-6 lg:px-8 flex items-center justify-between shrink-0 shadow-xs z-20">
      {/* Left: Sidebar Toggle & Page Title */}
      <div className="flex items-center space-x-2.5 sm:space-x-4 min-w-0">
        <button
          onClick={onToggleSidebar}
          className="p-2 -ml-1 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer transition-colors shrink-0"
          title="Toggle Sidebar"
          aria-label="Toggle navigation"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="text-base sm:text-xl font-bold text-slate-900 tracking-tight truncate">
          {activeTab}
        </h1>
      </div>

      {/* Right: User Profile */}
      <div className="flex items-center space-x-2 sm:space-x-4 shrink-0">
        {/* User Profile Dropdown Container */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center space-x-2 sm:space-x-3 cursor-pointer select-none focus:outline-none p-1 sm:p-1.5 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <div className="h-9 w-9 rounded-full bg-[#00C49F] text-white font-bold text-xs flex items-center justify-center shadow-xs shrink-0">
              {initials}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-bold text-slate-900 leading-tight">
                {displayName}
              </span>
              <span className="text-[11px] text-slate-500 font-medium truncate max-w-[120px]">
                {displayGym}
              </span>
            </div>
            <ChevronDown
              className={`h-4 w-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                isDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 animate-fadeIn">
              <div className="px-4 py-2.5 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900">{displayName}</p>
                <p className="text-[11px] text-slate-500 truncate">{user?.email || "provider@gymon.com"}</p>
                <span className="inline-block mt-1.5 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                  Verified Provider
                </span>
              </div>

              <div className="py-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    navigate('/profile');
                    if (onNavigate) onNavigate('Profile');
                  }}
                  className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-teal-50 hover:text-[#00A389] flex items-center space-x-2 cursor-pointer transition-colors"
                >
                  <User className="h-4 w-4 text-slate-400" />
                  <span>My Profile</span>
                </button>
              </div>

              {onLogout && (
                <div className="pt-1 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setIsDropdownOpen(false);
                      onLogout();
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center space-x-2 cursor-pointer transition-colors"
                  >
                    <LogOut className="h-4 w-4 text-rose-500" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
