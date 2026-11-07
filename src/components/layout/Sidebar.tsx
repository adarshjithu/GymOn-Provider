import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Users,
  User,
  ShieldCheck,
  LogOut,
  Dumbbell,
} from 'lucide-react';
import type { TabType } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  activeTab?: string;
  isSidebarOpen: boolean;
  onSelectTab: (tab: TabType) => void;
  onClose?: () => void;
}

export function Sidebar({ activeTab, isSidebarOpen, onSelectTab, onClose }: SidebarProps) {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname;

  const isSubProvider = user?.role === 'sub_provider';

  const menuItems: { name: TabType; path: string; icon: React.ElementType }[] = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'My Gyms', path: '/gyms', icon: Building2 },
    { name: 'Customer Leads', path: '/leads', icon: Users },
    { name: 'Profile', path: '/profile', icon: User },
    ...(!isSubProvider
      ? [{ name: 'Users & Access' as TabType, path: '/users', icon: ShieldCheck }]
      : []),
    { name: 'Logout', path: '', icon: LogOut },
  ];

  const currentTab = (): string => {
    if (pathname === '/' || pathname === '/dashboard') return 'Dashboard';
    if (pathname.startsWith('/gyms')) return 'My Gyms';
    if (pathname.startsWith('/leads')) return 'Customer Leads';
    if (pathname.startsWith('/profile')) return 'Profile';
    if (pathname.startsWith('/users')) return 'Users & Access';
    return activeTab || 'Dashboard';
  };

  const handleTabClick = (item: { name: TabType; path: string }) => {
    if (onClose) onClose();
    if (item.name === 'Logout') {
      onSelectTab('Logout');
    } else {
      navigate(item.path);
      onSelectTab(item.name);
    }
  };

  const activeName = currentTab();

  return (
    <>
      {/* ============================================================== */}
      {/* MOBILE DRAWER BACKDROP OVERLAY (< lg)                          */}
      {/* ============================================================== */}
      {isSidebarOpen && (
        <div
          onClick={onClose}
          className="lg:hidden fixed inset-0 bg-slate-950/60 backdrop-blur-2xs z-40 transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      {/* ============================================================== */}
      {/* MOBILE SLIDE-OUT DRAWER (< lg)                                 */}
      {/* ============================================================== */}
      <aside
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-72 bg-[#060E1E] text-white flex flex-col justify-between transform transition-transform duration-300 ease-in-out border-r border-slate-800 shadow-2xl ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Mobile Drawer Header with Logo & Close Button */}
          <div className="px-5 py-5 flex items-center justify-between border-b border-slate-800/80">
            <div
              onClick={() => {
                if (onClose) onClose();
                navigate('/dashboard');
                onSelectTab('Dashboard');
              }}
              className="flex items-center space-x-3 select-none cursor-pointer"
            >
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-[#00A389] to-[#00C49F] flex items-center justify-center shadow-md shadow-[#00C49F]/20 shrink-0">
                <Dumbbell className="h-5 w-5 text-white stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center space-x-1">
                  <span className="text-xl font-black tracking-wide text-white">GYM</span>
                  <span className="text-xl font-black tracking-wide text-[#00C49F]">ON</span>
                </div>
                <p className="text-[9px] font-bold tracking-[0.2em] text-[#00C49F] uppercase -mt-1">
                  PROVIDER PORTAL
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
              aria-label="Close sidebar"
            >
              <LogOut className="h-5 w-5 rotate-180" />
            </button>
          </div>

          {/* Navigation Menu */}
          <nav className="px-3 py-4 space-y-1.5 overflow-y-auto max-h-[calc(100vh-140px)]">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeName === item.name;

              return (
                <button
                  key={item.name}
                  onClick={() => handleTabClick(item)}
                  className={`w-full flex items-center space-x-3.5 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-[#00A389] text-white font-semibold shadow-lg shadow-[#00A389]/20'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 shrink-0 ${
                      isActive ? 'text-white' : 'text-slate-400'
                    }`}
                  />
                  <span className="truncate">{item.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Mobile Drawer Bottom User Badge */}
        {user && (
          <div className="p-4 border-t border-slate-800/80 bg-slate-900/40">
            <div className="flex items-center space-x-3">
              <div className="h-9 w-9 rounded-full bg-[#00C49F] text-white font-bold text-xs flex items-center justify-center shrink-0">
                {user.name ? user.name[0]?.toUpperCase() : 'P'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate">{user.name}</p>
                <p className="text-[10px] text-slate-400 truncate">{user.gymName || 'GYMON Partner'}</p>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* ============================================================== */}
      {/* DESKTOP SIDEBAR (>= lg)                                        */}
      {/* ============================================================== */}
      <aside
        className={`hidden lg:flex bg-[#060E1E] text-white flex-col justify-between transition-all duration-300 z-30 ${
          isSidebarOpen ? 'w-64' : 'w-20'
        } shrink-0 border-r border-slate-800/60 shadow-xl`}
      >
        <div>
          {/* Brand Logo Section */}
          <div
            onClick={() => {
              navigate('/dashboard');
              onSelectTab('Dashboard');
            }}
            className="px-6 py-6 flex items-center space-x-3 select-none cursor-pointer"
          >
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-[#00A389] to-[#00C49F] flex items-center justify-center shadow-md shadow-[#00C49F]/20 shrink-0">
              <Dumbbell className="h-5 w-5 text-white stroke-[2.5]" />
            </div>
            {isSidebarOpen && (
              <div>
                <div className="flex items-center space-x-1">
                  <span className="text-xl font-black tracking-wide text-white">GYM</span>
                  <span className="text-xl font-black tracking-wide text-[#00C49F]">ON</span>
                </div>
                <p className="text-[9px] font-bold tracking-[0.2em] text-[#00C49F] uppercase -mt-1">
                  PROVIDER PORTAL
                </p>
              </div>
            )}
          </div>

          {/* Navigation Menu */}
          <nav className="px-3 py-2 space-y-1.5 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeName === item.name;

              return (
                <button
                  key={item.name}
                  onClick={() => handleTabClick(item)}
                  className={`w-full flex items-center space-x-3.5 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-[#00A389] text-white font-semibold shadow-lg shadow-[#00A389]/20'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`}
                  title={item.name}
                >
                  <Icon
                    className={`h-5 w-5 shrink-0 ${
                      isActive ? 'text-white' : 'text-slate-400'
                    }`}
                  />
                  {isSidebarOpen && (
                    <span className="truncate">{item.name}</span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
}
