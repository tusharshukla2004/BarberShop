import { useState } from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  Bell,
  Scissors,
  Users,
  Image,
  Star,
  Settings,
  LogOut,
  Menu,
  X,
  ExternalLink,
} from 'lucide-react';
import { useAppSelector } from '@/app/hooks';
import { selectCurrentUser, selectIsOwner } from '@/features/auth/authSlice';
import { useLogoutMutation } from '@/features/auth/authApi';
import Seo from '@/components/common/Seo';

export default function AdminLayout() {
  const navigate = useNavigate();
  const currentUser = useAppSelector(selectCurrentUser);
  const isOwner = useAppSelector(selectIsOwner);
  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const navItems = [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/admin/bookings', label: 'Bookings', icon: Calendar },
    { to: '/admin/reminders', label: 'Reminders', icon: Bell },
    ...(isOwner
      ? [
          { to: '/admin/services', label: 'Services', icon: Scissors },
          { to: '/admin/barbers', label: 'Barbers', icon: Users },
          { to: '/admin/gallery', label: 'Gallery', icon: Image },
          { to: '/admin/reviews', label: 'Reviews', icon: Star },
          { to: '/admin/settings', label: 'Settings', icon: Settings },
        ]
      : []),
  ];

  return (
    <div className="min-h-screen bg-card/40 flex flex-col md:flex-row text-ink">
      <Seo title="Admin Console | Sovereign Barbershop" noindex={true} />
      {/* Mobile Top Bar */}
      <div className="md:hidden bg-ink text-white px-4 py-3 flex items-center justify-between border-b border-border-dark sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <Scissors className="w-5 h-5 text-accent" />
          <span className="font-display text-lg tracking-wider">SOVEREIGN ADMIN</span>
        </div>

        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? 'Close sidebar menu' : 'Open sidebar menu'}
          className="p-1.5 rounded text-white hover:bg-white/10"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar (Desktop + Mobile Drawer) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-ink text-white flex flex-col justify-between transition-transform duration-300 md:static md:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Brand header */}
          <div className="p-6 border-b border-border-dark flex items-center justify-between">
            <Link to="/admin" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent">
                <Scissors className="w-4 h-4" />
              </div>
              <div>
                <span className="font-display text-xl tracking-wider block leading-none">
                  SOVEREIGN
                </span>
                <span className="text-[10px] text-on-dark-muted uppercase tracking-widest">
                  Management Desk
                </span>
              </div>
            </Link>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden p-1 text-on-dark-muted hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-md text-xs uppercase tracking-wider font-semibold transition-colors ${
                      isActive
                        ? 'bg-accent text-white shadow-sm'
                        : 'text-on-dark-muted hover:bg-white/10 hover:text-white'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* User profile & footer */}
        <div className="p-4 border-t border-border-dark space-y-3">
          <div className="flex items-center justify-between text-xs px-2">
            <div>
              <p className="font-semibold text-white truncate max-w-[140px]">
                {currentUser?.name || 'Admin User'}
              </p>
              <span className="inline-block text-[10px] font-bold uppercase tracking-widest text-accent">
                {currentUser?.role || 'Staff'}
              </span>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              title="Sign Out"
              className="p-1.5 rounded text-on-dark-muted hover:text-white hover:bg-white/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          <Link
            to="/"
            target="_blank"
            className="flex items-center justify-center gap-1.5 w-full py-2 rounded bg-white/5 hover:bg-white/10 text-on-dark-muted hover:text-white text-[11px] font-medium transition-colors"
          >
            <span>View Public Store</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </aside>

      {/* Main Panel Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
