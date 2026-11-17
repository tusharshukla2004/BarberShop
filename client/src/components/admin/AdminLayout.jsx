import { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate, Link } from 'react-router-dom';
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
  Clock,
  BarChart3,
  Tag,
  HelpCircle,
  CreditCard,
  Package as PackageIcon,
  Globe,
  BookOpen,
  UserCheck,
  ShieldCheck,
  KeyRound,
  ChevronRight,
} from 'lucide-react';
import { useAppSelector } from '@/app/hooks';
import { selectCurrentUser, selectIsOwner } from '@/features/auth/authSlice';
import { useLogoutMutation } from '@/features/auth/authApi';
import Seo from '@/components/common/Seo';

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = useAppSelector(selectCurrentUser);
  const isOwner = useAppSelector(selectIsOwner);
  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const navGroups = [
    {
      label: 'Workspace',
      items: [{ to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true }],
    },
    {
      label: 'Operations',
      items: [
        { to: '/admin/queue', label: 'Walk-in Queue', icon: Clock },
        { to: '/admin/bookings', label: 'Bookings', icon: Calendar },
        { to: '/admin/reminders', label: 'Reminders', icon: Bell },
        { to: '/admin/customers', label: 'Customers', icon: Users },
      ],
    },
    ...(isOwner
      ? [
          {
            label: 'Business',
            items: [
              { to: '/admin/reports', label: 'Reports', icon: BarChart3 },
              { to: '/admin/payments', label: 'Payments', icon: CreditCard },
              { to: '/admin/packages-plans', label: 'Packages & Plans', icon: PackageIcon },
              { to: '/admin/staff', label: 'Staff Accounts', icon: UserCheck },
              { to: '/admin/audit-logs', label: 'Audit Logs', icon: ShieldCheck },
            ],
          },
          {
            label: 'Studio & Website',
            items: [
              { to: '/admin/services', label: 'Services', icon: Scissors },
              { to: '/admin/barbers', label: 'Barbers', icon: Users },
              { to: '/admin/offers', label: 'Offers', icon: Tag },
              { to: '/admin/faqs', label: 'FAQs', icon: HelpCircle },
              { to: '/admin/blog', label: 'Blog Journal', icon: BookOpen },
              { to: '/admin/seo', label: 'SEO & Local', icon: Globe },
              { to: '/admin/gallery', label: 'Gallery', icon: Image },
              { to: '/admin/reviews', label: 'Reviews', icon: Star },
              { to: '/admin/settings', label: 'Settings', icon: Settings },
            ],
          },
        ]
      : []),
  ];

  const activeItem = navGroups
    .flatMap((group) => group.items)
    .find(
      (item) =>
        location.pathname === item.to ||
        (item.to !== '/admin' && location.pathname.startsWith(`${item.to}/`))
    );
  const pageLabel =
    location.pathname.startsWith('/admin/customers/') && location.pathname !== '/admin/customers'
      ? 'Customer profile'
      : activeItem?.label || 'Account security';
  const initials = (currentUser?.name || 'Admin User')
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="admin-shell min-h-screen lg:h-screen lg:overflow-hidden flex flex-col lg:flex-row text-ink">
      <Seo title="Admin Console | Sovereign Barbershop" noindex={true} />
      {/* Mobile Top Bar */}
      <div className="admin-mobile-bar lg:hidden px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <Scissors className="w-5 h-5 text-accent" />
          <span className="font-semibold text-sm tracking-wide">SOVEREIGN <span className="font-normal text-on-dark-muted">ADMIN</span></span>
        </div>

        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-expanded={mobileMenuOpen}
          aria-label={mobileMenuOpen ? 'Close sidebar menu' : 'Open sidebar menu'}
          className="p-2 rounded-md text-white hover:bg-white/10 transition-colors"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar (Desktop + Mobile Drawer) */}
      {mobileMenuOpen && (
        <button
          type="button"
          onClick={() => setMobileMenuOpen(false)}
          aria-label="Close admin navigation"
          className="fixed inset-0 z-40 bg-ink/50 backdrop-blur-[2px] lg:hidden"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-ink text-white flex flex-col transition-transform duration-300 lg:sticky lg:top-0 lg:translate-x-0 lg:h-screen overscroll-contain shrink-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex min-h-0 flex-1 flex-col">
          {/* Brand header */}
          <div className="p-5 border-b border-border-dark flex items-center justify-between shrink-0">
            <Link to="/admin" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-accent/15 border border-accent/20 flex items-center justify-center text-accent">
                <Scissors className="w-4 h-4" />
              </div>
              <div>
                <span className="font-semibold text-sm tracking-[0.12em] block leading-none">
                  SOVEREIGN
                </span>
                <span className="text-[10px] text-on-dark-muted tracking-wide mt-1 block">
                  Management console
                </span>
              </div>
            </Link>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden p-1 text-on-dark-muted hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav aria-label="Admin navigation" className="flex-1 min-h-0 overflow-y-auto p-3">
            {navGroups.map((group) => (
              <div key={group.label} className="mb-5 last:mb-0">
                <p className="px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">
                  {group.label}
                </p>
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.end}
                        onClick={() => setMobileMenuOpen(false)}
                        className={({ isActive }) =>
                          `group flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors ${
                            isActive
                              ? 'bg-white/10 text-white shadow-sm ring-1 ring-inset ring-white/10'
                              : 'text-on-dark-muted hover:bg-white/[0.06] hover:text-white'
                          }`
                        }
                      >
                        <Icon className="w-[17px] h-[17px] shrink-0 text-white/55 transition-colors group-hover:text-accent" />
                        <span className="truncate">{item.label}</span>
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Sidebar footer */}
        <div className="p-3 border-t border-border-dark shrink-0">
          <Link
            to="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between gap-2 w-full px-3 py-2.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-on-dark-muted hover:text-white text-xs font-medium transition-colors"
          >
            <span>View public store</span>
            <ExternalLink className="w-3.5 h-3.5 text-accent" />
          </Link>
        </div>

      </aside>

      {/* Main Panel Content */}
      <div className="flex-1 flex flex-col min-w-0 lg:h-screen lg:overflow-y-auto overscroll-contain">
        <header className="admin-topbar sticky top-0 z-30 flex min-h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-2 text-sm">
            <Link to="/admin" className="shrink-0 text-muted hover:text-ink transition-colors">
              Workspace
            </Link>
            <ChevronRight className="h-4 w-4 shrink-0 text-muted/50" aria-hidden="true" />
            <span className="truncate font-semibold text-ink" aria-current="page">{pageLabel}</span>
          </nav>
          <div className="flex shrink-0 items-center gap-2.5">
            <div className="hidden text-right sm:block">
              <p className="max-w-40 truncate text-xs font-semibold text-ink">
                {currentUser?.name || 'Admin User'}
              </p>
              <p className="mt-0.5 text-[10px] font-medium capitalize text-muted">
                {currentUser?.role || 'Staff'}
              </p>
            </div>
            <div
              aria-hidden="true"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-ink text-xs font-semibold text-white ring-2 ring-white"
            >
              {initials}
            </div>
            <Link
              to="/admin/change-password"
              title="Change Staff Password"
              aria-label="Change Staff Password"
              className="rounded-lg p-2 text-muted hover:bg-card hover:text-ink transition-colors"
            >
              <KeyRound className="h-4 w-4" />
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              title="Sign Out"
              aria-label="Sign Out"
              className="rounded-lg p-2 text-muted hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50 transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </header>

        <main className="admin-content flex-1 w-full max-w-[96rem] px-4 py-6 sm:px-6 lg:px-8 lg:py-8 mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
