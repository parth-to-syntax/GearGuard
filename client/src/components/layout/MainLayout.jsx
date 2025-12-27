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
    <div className="min-h-screen bg-[var(--surface-ground)] bg-industrial-grid">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[var(--border-subtle)]">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 bg-gradient-to-br from-[#ff6b35] to-[#e85a2a] rounded-xl flex items-center justify-center shadow-lg" style={{ boxShadow: '0 4px 14px rgba(255, 107, 53, 0.35)' }}>
                <Wrench className="w-5 h-5 text-white" strokeWidth={2.5} />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-black/10 to-white/20" />
              </div>
              <span className="font-['Sora'] font-bold text-xl tracking-tight text-[var(--steel-900)]">
                GearGuard
              </span>
            </div>

            {/* Navigation Tabs - Desktop */}
            <nav className="hidden lg:flex items-center gap-1">
              {navigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    `group flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-[var(--brand-accent-muted)] text-[var(--brand-accent)]'
                        : 'text-[var(--steel-600)] hover:text-[var(--steel-900)] hover:bg-[var(--steel-100)]'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <item.icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? 'text-[var(--brand-accent)]' : ''}`} />
                      <span className="font-['DM_Sans']">{item.name}</span>
                    </>
                  )}
                </NavLink>
              ))}
            </nav>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-[var(--steel-600)] hover:text-[var(--steel-900)] hover:bg-[var(--steel-100)] rounded-lg transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Right Section */}
            <div className="hidden lg:flex items-center gap-2">
              {/* Global Search */}
              <GlobalSearch />

              {/* Notifications */}
              <button className="relative p-2.5 text-[var(--steel-500)] hover:text-[var(--steel-700)] hover:bg-[var(--steel-100)] rounded-xl transition-all duration-200 group">
                <Bell className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-[var(--brand-accent)] rounded-full ring-2 ring-white" />
              </button>

              {/* Theme Toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-2.5 text-[var(--steel-500)] hover:text-[var(--steel-700)] hover:bg-[var(--steel-100)] rounded-xl transition-all duration-200 group"
              >
                {isDarkMode ? (
                  <Sun className="w-5 h-5 group-hover:scale-110 group-hover:rotate-45 transition-transform" />
                ) : (
                  <Moon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                )}
              </button>

              {/* Divider */}
              <div className="w-px h-8 bg-[var(--border-default)] mx-2" />

              {/* User Menu */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[var(--steel-700)] to-[var(--steel-800)] rounded-xl flex items-center justify-center shadow-lg overflow-hidden">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-white text-sm font-semibold font-['Sora']">
                      {user?.name?.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="hidden xl:block">
                  <p className="text-sm font-semibold text-[var(--steel-900)] leading-tight font-['DM_Sans']">
                    {user?.name}
                  </p>
                  <p className="text-xs text-[var(--steel-500)] capitalize font-['DM_Sans']">{user?.role?.toLowerCase()}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2.5 text-[var(--steel-400)] hover:text-[var(--status-danger)] hover:bg-[var(--status-danger-bg)] rounded-xl transition-all duration-200 group"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-[var(--border-subtle)] bg-white animate-slide-down">
            <nav className="px-4 py-3 space-y-1">
              {navigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all ${
                      isActive
                        ? 'bg-[var(--brand-accent-muted)] text-[var(--brand-accent)]'
                        : 'text-[var(--steel-600)] hover:bg-[var(--steel-100)]'
                    }`
                  }
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </NavLink>
              ))}
            </nav>
            <div className="px-4 py-3 border-t border-[var(--border-subtle)]">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[var(--steel-700)] to-[var(--steel-800)] rounded-xl flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--steel-900)]">{user?.name}</p>
                  <p className="text-xs text-[var(--steel-500)] capitalize">{user?.role?.toLowerCase()}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-[var(--status-danger)] bg-[var(--status-danger-bg)] rounded-lg hover:bg-red-100 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-[1600px]">
        <div className="animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
