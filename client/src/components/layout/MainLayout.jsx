import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Wrench, 
  LayoutDashboard, 
  Calendar, 
  Settings2, 
  BarChart3, 
  Users, 
  LogOut, 
  User, 
  Search, 
  Moon, 
  Sun,
  Bell,
  Plus,
  Building2,
  Kanban,
  FolderTree,
  ChevronDown,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';
import GlobalSearch from '../ui/GlobalSearch';

const navigation = [
  { name: 'Maintenance', href: '/maintenance', icon: Wrench },
  { name: 'Board', href: '/maintenance/board', icon: Kanban },
  { name: 'Calendar', href: '/maintenance/calendar', icon: Calendar },
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Work Centers', href: '/work-centers', icon: Building2 },
  { name: 'Equipment', href: '/equipment', icon: Settings2 },
  { name: 'Categories', href: '/categories', icon: FolderTree },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
  { name: 'Teams', href: '/teams', icon: Users },
];

const MainLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className="h-screen flex flex-col bg-transparent overflow-hidden">
      {/* Top Navigation Bar */}
      <header className="nav-dark shrink-0 border-b border-[var(--border-subtle)] z-50">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="gg-logo-mark relative w-9 h-9 bg-gradient-to-br from-[var(--brand-accent)] to-[var(--brand-accent-hover)] rounded-xl flex items-center justify-center shadow-lg" style={{ boxShadow: '0 4px 14px rgba(59, 130, 246, 0.25)' }}>
                <Wrench className="w-5 h-5 text-white" strokeWidth={2.5} />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-black/10 to-white/20" />
              </div>
              <span className="font-['Inter'] font-light text-lg tracking-tight text-white">
                GearGuard
              </span>
            </div>

            {/* Navigation Tabs - Desktop */}
            <nav className="hidden lg:flex items-center gap-2">
              {navigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    `group flex items-center gap-2 px-3.5 py-2 text-sm font-light rounded-md transition-all whitespace-nowrap ${
                      isActive
                        ? 'text-primary font-medium'
                        : 'text-secondary hover:text-primary'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <item.icon className="gg-nav-icon w-4 h-4" />
                      <span>{item.name}</span>
                    </>
                  )}
                </NavLink>
              ))}
            </nav>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-secondary hover:text-primary hover:bg-[rgba(255,255,255,0.05)] rounded-lg transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Right Section */}
            <div className="hidden lg:flex items-center gap-3">
              {/* Global Search */}
              <GlobalSearch />

              {/* Notifications */}
              <button className="relative p-1.5 text-secondary hover:text-primary rounded-lg transition-all">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[var(--brand-accent)] rounded-full ring-2 ring-[var(--bg-dark-1)]" />
              </button>

              {/* Theme Toggle - Hidden since we're in dark mode */}
              {false && (
                <button
                  onClick={toggleDarkMode}
                  className="p-2 text-secondary hover:text-primary rounded-lg transition-all"
                >
                  {isDarkMode ? (
                    <Sun className="w-5 h-5" />
                  ) : (
                    <Moon className="w-5 h-5" />
                  )}
                </button>
              )}

              {/* User Menu */}
              <div className="gg-user-menu flex items-center gap-3">
                <div className="w-9 h-9 bg-gradient-to-br from-[var(--brand-accent)] to-[var(--brand-accent-hover)] rounded-xl flex items-center justify-center shadow-lg overflow-hidden">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-white text-sm font-semibold">
                      {user?.name?.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="hidden xl:block">
                  <p className="text-sm font-medium text-primary leading-tight">
                    {user?.name}
                  </p>
                  <p className="text-xs text-secondary capitalize">{user?.role?.toLowerCase()}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="gg-logout-btn lux-btn-primary flex items-center gap-2 px-3 py-1.5 text-sm"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden md:inline">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden backdrop-blur-md nav-dark animate-slide-down">
            <nav className="px-4 py-3 space-y-1">
              {navigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 text-sm font-light rounded-lg transition-all ${
                      isActive
                        ? 'bg-[var(--brand-accent-muted)] text-[var(--brand-accent)]'
                        : 'text-secondary hover:text-primary hover:bg-[rgba(255,255,255,0.05)]'
                    }`
                  }
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </NavLink>
              ))}
            </nav>
            <div className="px-4 py-3 border-t border-[var(--card-border)]">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[var(--brand-accent)] to-[var(--brand-accent-hover)] rounded-xl flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-primary">{user?.name}</p>
                  <p className="text-xs text-secondary capitalize">{user?.role?.toLowerCase()}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="lux-btn-primary w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="animate-fade-in flex-1 flex flex-col">
          {children}
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
