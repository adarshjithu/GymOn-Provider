import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { WelcomeBanner } from './components/dashboard/WelcomeBanner';
import { StatCards } from './components/dashboard/StatCards';
import { QuickActions } from './components/dashboard/QuickActions';
import { RecentRequests } from './components/dashboard/RecentRequests';
import { InfoBanner } from './components/dashboard/InfoBanner';
import { LoginPage } from './components/auth/LoginPage';
import { LogoutModal } from './components/auth/LogoutModal';
import { MyGymsPage } from './components/gyms/MyGymsPage';
import { CreateGymPage } from './components/gyms/CreateGymPage';
import { GymDetailsPage } from './components/gyms/GymDetailsPage';
import { EditGymPage } from './components/gyms/EditGymPage';
import { CustomerLeadsPage } from './components/leads/CustomerLeadsPage';
import { LeadDetailsPage } from './components/leads/LeadDetailsPage';
import { ProfilePage } from './components/profile/ProfilePage';
import { UsersAccessPage } from './components/users/UsersAccessPage';
import { leadService } from './api/leadService';
import { useAuth } from './context/AuthContext';
import type { TabType, RequestLead } from './types';
import { Dumbbell, Loader2 } from 'lucide-react';

export default function App() {
  const { user, isAuthenticated, isLoading: isAuthLoading, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024;
    }
    return true;
  });
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Auto-close mobile drawer on route navigation
  useEffect(() => {
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  }, [location.pathname]);

  // Sync sidebar state on window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Dashboard state
  const [oneEntryPrice, setOneEntryPrice] = useState(150);
  const [isOpen, setIsOpen] = useState(true);
  const [requests, setRequests] = useState<RequestLead[]>([]);
  const [isRequestsLoading, setIsRequestsLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      setIsRequestsLoading(true);
      leadService
        .getLeads({ limit: 3 })
        .then((res) => {
          const list = res.leads || [];
          const formatted: RequestLead[] = list.slice(0, 3).map((lead) => ({
            id: lead.id || lead._id || '',
            name: lead.customerName,
            date: lead.preferredDate || lead.updatedAt || 'Recent',
            requestedTime: lead.preferredTime || '06:00 PM',
          }));
          setRequests(formatted);
        })
        .catch(() => {
          setRequests([]);
        })
        .finally(() => {
          setIsRequestsLoading(false);
        });
    }
  }, [isAuthenticated]);

  const handleSelectTab = (tab: TabType) => {
    if (tab === 'Logout') {
      setShowLogoutModal(true);
      return;
    }
    const routesMap: Record<string, string> = {
      'Dashboard': '/dashboard',
      'My Gyms': '/gyms',
      'My Gym': '/gyms',
      'Customer Leads': '/leads',
      'Profile': '/profile',
      'Users & Access': '/users',
    };
    if (routesMap[tab]) {
      navigate(routesMap[tab]);
    }
  };

  const handleConfirmLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      setShowLogoutModal(false);
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  // If loading authentication state from storage
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#060E1E] flex flex-col items-center justify-center space-y-4">
        <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-[#00A389] to-[#00C49F] flex items-center justify-center shadow-lg shadow-[#00C49F]/20 animate-pulse">
          <Dumbbell className="h-6 w-6 text-white stroke-[2.5]" />
        </div>
        <div className="flex items-center space-x-2 text-slate-400 text-xs font-medium">
          <Loader2 className="h-4 w-4 animate-spin text-[#00C49F]" />
          <span>Loading GYMON Portal...</span>
        </div>
      </div>
    );
  }

  // If unauthenticated, redirect to login
  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage onSuccess={() => navigate('/dashboard')} />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // If authenticated and visiting /login, redirect to /dashboard
  if (location.pathname === '/login') {
    return <Navigate to="/dashboard" replace />;
  }

  // Derive dynamic header title from URL pathname
  const getHeaderTitle = (pathname: string): string => {
    if (pathname === '/' || pathname === '/dashboard') return 'Dashboard';
    if (pathname === '/gyms') return 'My Gyms';
    if (pathname === '/gyms/new') return 'Create New Gym';
    if (pathname.includes('/gyms/') && pathname.endsWith('/edit')) return 'Edit Gym Details';
    if (pathname.startsWith('/gyms/')) return 'Gym Details';
    if (pathname === '/leads') return 'Customer Leads';
    if (pathname.startsWith('/leads/')) return 'Lead Details';
    if (pathname.startsWith('/profile')) return 'Profile';
    if (pathname.startsWith('/users')) return 'Users & Access';
    return 'Dashboard';
  };

  const headerTitle = getHeaderTitle(location.pathname);

  return (
    <div className="flex h-screen bg-[#F4F7FA] font-sans antialiased overflow-hidden text-slate-800">
      {/* SIDEBAR */}
      <Sidebar
        activeTab={headerTitle}
        isSidebarOpen={isSidebarOpen}
        onSelectTab={handleSelectTab}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* HEADER */}
        <Header
          activeTab={headerTitle}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          user={user}
          onLogout={() => setShowLogoutModal(true)}
          onNavigate={handleSelectTab}
        />

        {/* WORKSPACE */}
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 bg-[#F4F7FA] overflow-y-auto flex flex-col justify-between">
          <div className="max-w-7xl w-full mx-auto space-y-6">
            <Routes>
              {/* Redirect root to dashboard */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />

              {/* 1. Dashboard */}
              <Route
                path="/dashboard"
                element={
                  <>
                    <WelcomeBanner user={user} onNavigate={handleSelectTab} />

                    <StatCards
                      oneEntryPrice={oneEntryPrice}
                      setOneEntryPrice={setOneEntryPrice}
                      isOpen={isOpen}
                      setIsOpen={setIsOpen}
                      onNavigate={handleSelectTab}
                    />

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <QuickActions onNavigate={handleSelectTab} />
                      <RecentRequests requests={requests} isLoading={isRequestsLoading} onNavigate={handleSelectTab} />
                    </div>

                    <InfoBanner />
                  </>
                }
              />

              {/* 2. My Gyms */}
              <Route path="/gyms" element={<MyGymsPage />} />
              <Route path="/gyms/new" element={<CreateGymPage />} />
              <Route path="/gyms/:slug/edit" element={<EditGymPage />} />
              <Route path="/gyms/:slug" element={<GymDetailsPage />} />

              {/* 3. Customer Leads */}
              <Route path="/leads" element={<CustomerLeadsPage />} />
              <Route path="/leads/:leadId" element={<LeadDetailsPage />} />

              {/* 4. Profile */}
              <Route
                path="/profile"
                element={<ProfilePage onLogout={() => setShowLogoutModal(true)} />}
              />

              {/* 5. Users & Access */}
              <Route
                path="/users"
                element={
                  user?.role === 'sub_provider' ? (
                    <Navigate to="/dashboard" replace />
                  ) : (
                    <UsersAccessPage />
                  )
                }
              />

              {/* Fallback to dashboard */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>

          {/* FOOTER */}
          <Footer />
        </main>
      </div>

      {/* LOGOUT CONFIRMATION MODAL */}
      <LogoutModal
        isOpen={showLogoutModal}
        isLoading={isLoggingOut}
        onConfirm={handleConfirmLogout}
        onCancel={() => setShowLogoutModal(false)}
      />
    </div>
  );
}
