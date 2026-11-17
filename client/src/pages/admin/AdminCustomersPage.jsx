import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Search,
  Plus,
  Filter,
  AlertTriangle,
  Phone,
  Mail,
  Calendar,
  Eye,
  CheckCircle2,
  X,
  Clock,
  Cake,
  MessageSquare,
  Send,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import QueryState from '@/components/common/QueryState';
import {
  useGetCustomersQuery,
  useCreateCustomerMutation,
} from '@/features/customers/customersApi';
import { useGetBarbersQuery } from '@/features/barbers/barbersApi';
import { useGetSettingsQuery } from '@/features/settings/settingsApi';
import {
  useGetDueForVisitCustomersQuery,
  useGetUpcomingBirthdaysQuery,
} from '@/features/wallet/walletApi';
import { buildWhatsAppLink, renderTemplate } from '@/lib/whatsapp';
import { useAppDispatch } from '@/app/hooks';
import { addToast } from '@/features/ui/uiSlice';

export default function AdminCustomersPage() {
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'due' | 'birthdays'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFlagFilter, setSelectedFlagFilter] = useState('all');
  const [selectedTag, setSelectedTag] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // New customer form state
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    phone: '',
    email: '',
    birthday: '',
    notes: '',
    tags: '',
    preferredBarberId: '',
    whatsappConsent: true,
  });

  const queryParams = useMemo(() => {
    const params = { limit: 100 };
    if (searchTerm.trim()) params.search = searchTerm.trim();
    if (selectedFlagFilter === 'flagged') params.isFlagged = true;
    if (selectedFlagFilter === 'clean') params.isFlagged = false;
    if (selectedTag) params.tag = selectedTag;
    return params;
  }, [searchTerm, selectedFlagFilter, selectedTag]);

  const {
    data: customersData,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetCustomersQuery(queryParams);

  const { data: barbers = [] } = useGetBarbersQuery();
  const { data: settings = {} } = useGetSettingsQuery();
  const { data: dueData = { customers: [], total: 0 } } =
    useGetDueForVisitCustomersQuery(28);
  const { data: bdayData = { upcomingBirthdays: [], total: 0 } } =
    useGetUpcomingBirthdaysQuery(7);

  const [createCustomer, { isLoading: isCreating }] = useCreateCustomerMutation();

  const handleSendRebookingNudge = (cust) => {
    const template =
      settings?.messageTemplates?.rebooking_nudge ||
      'Hello {name}! Gentle reminder from {shopName} that your last haircut was about {lastVisitAgo}. Ready for a fresh haircut and styling? Book your slot today: {bookingLink}';
    const message = renderTemplate(template, {
      name: cust.name,
      shopName: 'Modern Mane Luxury Barber Studio',
      lastVisitAgo: cust.lastVisitAgo || 'a few weeks ago',
      bookingLink: `${window.location.origin}/book`,
    });
    const link = buildWhatsAppLink(cust.phone, message);
    if (link) window.open(link, '_blank', 'noopener,noreferrer');
  };

  const handleSendBirthdayGreeting = (cust) => {
    const template =
      settings?.messageTemplates?.birthday_greeting ||
      'Janamdin Mubarak {name}! 🎂 {shopName} ki taraf se aapko hardik shubhkaamnayein. Apne birthday par aaiye aur ek premium grooming session enjoy karein: {bookingLink}';
    const message = renderTemplate(template, {
      name: cust.name,
      shopName: 'Modern Mane Luxury Barber Studio',
      bookingLink: `${window.location.origin}/book`,
    });
    const link = buildWhatsAppLink(cust.phone, message);
    if (link) window.open(link, '_blank', 'noopener,noreferrer');
  };

  const customers = useMemo(() => customersData?.customers || [], [customersData]);
  const pagination = customersData?.pagination || { total: customers.length };

  // All unique tags across loaded customers
  const allTags = useMemo(() => {
    const tagsSet = new Set();
    customers.forEach((c) => {
      if (Array.isArray(c.tags)) {
        c.tags.forEach((t) => tagsSet.add(t));
      }
    });
    return Array.from(tagsSet);
  }, [customers]);

  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    if (!newCustomer.name.trim() || !newCustomer.phone.trim()) {
      dispatch(
        addToast({
          type: 'error',
          message: 'Customer name and phone number are required.',
        })
      );
      return;
    }

    try {
      const tagList = newCustomer.tags
        ? newCustomer.tags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean)
        : [];

      await createCustomer({
        name: newCustomer.name.trim(),
        phone: newCustomer.phone.trim(),
        email: newCustomer.email.trim() || undefined,
        notes: newCustomer.notes.trim() || undefined,
        tags: tagList,
        preferredBarberId: newCustomer.preferredBarberId || null,
        whatsappConsent: Boolean(newCustomer.whatsappConsent),
      }).unwrap();

      dispatch(
        addToast({
          type: 'success',
          message: `Customer ${newCustomer.name} created successfully!`,
        })
      );

      setShowAddModal(false);
      setNewCustomer({
        name: '',
        phone: '',
        email: '',
        notes: '',
        tags: '',
        preferredBarberId: '',
        whatsappConsent: true,
      });
      refetch();
    } catch (err) {
      dispatch(
        addToast({
          type: 'error',
          message: err?.data?.message || err?.message || 'Failed to create customer.',
        })
      );
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return 'Never';
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return 'Never';
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-accent/15 text-accent border border-accent/30">
              <Users className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-medium font-heading text-ink/85 tracking-tight">
              Customer Directory
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted mt-1">
            Client profiles, visit frequency, barbershop notes, and repeat history.
          </p>
        </div>

        <Button
          type="button"
          variant="accent"
          size="sm"
          onClick={() => setShowAddModal(true)}
          className="text-xs h-9 px-4 uppercase tracking-wider font-semibold self-start sm:self-auto shadow-sm"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Add Customer
        </Button>
      </div>

      {/* Directory Tabs */}
      <div className="flex border-b border-border-light gap-6 text-sm font-medium">
        <button
          onClick={() => setActiveTab('all')}
          className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'all'
              ? 'border-accent text-accent font-semibold'
              : 'border-transparent text-muted hover:text-ink'
          }`}
        >
          <Users className="w-4 h-4" /> All Clients ({pagination.total})
        </button>
        <button
          onClick={() => setActiveTab('due')}
          className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'due'
              ? 'border-accent text-accent font-semibold'
              : 'border-transparent text-muted hover:text-ink'
          }`}
        >
          <Clock className="w-4 h-4 text-amber-500" /> Due for Visit Nudges ({dueData.total || 0})
        </button>
        <button
          onClick={() => setActiveTab('birthdays')}
          className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'birthdays'
              ? 'border-accent text-accent font-semibold'
              : 'border-transparent text-muted hover:text-ink'
          }`}
        >
          <Cake className="w-4 h-4 text-pink-500" /> Upcoming Birthdays ({bdayData.total || 0})
        </button>
      </div>

      {/* Tab 2: Due for Visit (Rebooking Nudges) */}
      {activeTab === 'due' && (
        <div className="space-y-4">
          <Card className="p-5">
            <div className="mb-4">
              <h2 className="text-base font-medium text-ink/85">Due for Visit (Over 4 Weeks Since Last Appointment)</h2>
              <p className="text-xs text-muted">
                One-tap WhatsApp button pre-fills a friendly Hinglish rebooking reminder with customer name and booking link.
              </p>
            </div>

            {dueData.customers?.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted">
                No clients are currently overdue for a visit.
              </div>
            ) : (
              <div className="divide-y divide-border-light">
                {dueData.customers?.map((cust) => (
                  <div key={cust.id} className="py-3.5 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-ink/85 text-sm">{cust.name}</span>
                        <span className="text-xs text-muted font-mono">{cust.phone}</span>
                      </div>
                      <div className="text-xs text-muted mt-0.5">
                        Last visit: <strong className="text-amber-700 font-medium">{cust.lastVisitAgo}</strong> ({cust.daysSinceVisit} days ago) · {cust.stats?.completedVisits || 0} lifetime visits
                      </div>
                    </div>

                    <Button
                      size="sm"
                      onClick={() => handleSendRebookingNudge(cust)}
                      className="text-xs bg-[#25D366] hover:bg-[#1EBE5D] text-white self-start sm:self-center"
                    >
                      <MessageSquare className="w-3.5 h-3.5 mr-1.5" /> Send Rebooking Nudge
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Tab 3: Upcoming Birthdays */}
      {activeTab === 'birthdays' && (
        <div className="space-y-4">
          <Card className="p-5">
            <div className="mb-4">
              <h2 className="text-base font-medium text-ink/85">Upcoming Birthdays (Next 7 Days)</h2>
              <p className="text-xs text-muted">
                Congratulate your clients on their birthday with a one-tap WhatsApp greeting (consent verified).
              </p>
            </div>

            {bdayData.upcomingBirthdays?.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted">
                No client birthdays registered in the next 7 days with WhatsApp consent.
              </div>
            ) : (
              <div className="divide-y divide-border-light">
                {bdayData.upcomingBirthdays?.map((cust) => (
                  <div key={cust.id} className="py-3.5 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-ink/85 text-sm flex items-center gap-1.5">
                          <Cake className="w-4 h-4 text-pink-500" />
                          {cust.name}
                        </span>
                        <span className="text-xs text-muted font-mono">{cust.phone}</span>
                      </div>
                      <div className="text-xs text-muted mt-0.5">
                        Birthday: <strong className="text-pink-600 font-medium">{cust.birthdayFormatted}</strong> ({cust.daysUntilBirthday === 0 ? 'Today! 🎉' : `in ${cust.daysUntilBirthday} days`})
                      </div>
                    </div>

                    <Button
                      size="sm"
                      onClick={() => handleSendBirthdayGreeting(cust)}
                      className="text-xs bg-[#25D366] hover:bg-[#1EBE5D] text-white self-start sm:self-center"
                    >
                      <Send className="w-3.5 h-3.5 mr-1.5" /> Send Birthday Wish
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Tab 1: All Clients */}
      {activeTab === 'all' && (
        <>
          {/* Search & Filters */}
      <Card className="p-4 sm:p-5">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Search Bar */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-ink/40 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, phone, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-surface border border-border-light text-xs sm:text-sm text-ink placeholder:text-ink/40 focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          {/* Flag Filter */}
          <div className="md:col-span-4 flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-ink/50 shrink-0" />
            <select
              value={selectedFlagFilter}
              onChange={(e) => setSelectedFlagFilter(e.target.value)}
              className="w-full px-2.5 py-2 rounded-lg bg-surface border border-border-light text-xs font-medium text-ink focus:outline-none focus:ring-1 focus:ring-accent"
            >
              <option value="all">All Clients ({pagination.total})</option>
              <option value="flagged">Flagged & Repeat No-Shows Only</option>
              <option value="clean">Good Standing (No Flags)</option>
            </select>
          </div>

          {/* Tag Filter */}
          <div className="md:col-span-3">
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="w-full px-2.5 py-2 rounded-lg bg-surface border border-border-light text-xs font-medium text-ink focus:outline-none focus:ring-1 focus:ring-accent"
            >
              <option value="">All Tags</option>
              {allTags.map((tag) => (
                <option key={tag} value={tag}>
                  Tag: #{tag}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Customers List */}
      <QueryState isLoading={isLoading} isError={isError} error={error}>
        {customers.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-accent/10 text-accent mx-auto flex items-center justify-center mb-3">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-base font-medium text-ink/80">No customers found</h3>
            <p className="text-xs text-muted mt-1 max-w-sm mx-auto">
              {searchTerm || selectedFlagFilter !== 'all' || selectedTag
                ? 'Try adjusting your filters or search terms.'
                : 'Customer profiles will automatically be generated here as appointments are booked.'}
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {/* Desktop Table Header */}
            <div className="hidden lg:grid grid-cols-12 gap-4 px-4 py-2 text-[11px] font-medium text-muted uppercase tracking-wider">
              <div className="col-span-4">Client & Contact</div>
              <div className="col-span-2 text-center">Visits (Done/Total)</div>
              <div className="col-span-2">Last Visit</div>
              <div className="col-span-2">No-Shows / Flags</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>

            {customers.map((c) => {
              const custId = c.id || c._id;
              const stats = c.stats || {};
              const noShowCount = stats.noShowCount || 0;
              const isHighNoShow = noShowCount >= 2;

              return (
                <div
                  key={custId}
                  className={`p-4 sm:p-5 rounded-xl border transition-all duration-200 ${
                    c.isFlagged || isHighNoShow
                      ? 'bg-amber-500/5 border-amber-500/30'
                      : 'bg-white border-border-light/90 hover:border-accent/40 shadow-2xs hover:shadow-sm'
                  }`}
                >
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-4 items-center">
                    {/* Name & Contact */}
                    <div className="lg:col-span-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                          to={`/admin/customers/${custId}`}
                          className="font-semibold text-sm text-ink hover:text-accent transition-colors"
                        >
                          {c.name}
                        </Link>
                        {c.whatsappConsent ? (
                          <span
                            className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 font-bold uppercase tracking-wider"
                            title="WhatsApp Updates Opted-in"
                          >
                            WA Opt-in
                          </span>
                        ) : null}
                      </div>

                      <div className="flex items-center gap-3 text-xs text-muted mt-1.5">
                        <span className="flex items-center gap-1 font-mono">
                          <Phone className="w-3.5 h-3.5 text-accent" />
                          {c.phone}
                        </span>
                        {c.email ? (
                          <span className="flex items-center gap-1 truncate max-w-[150px]">
                            <Mail className="w-3.5 h-3.5 text-muted" />
                            {c.email}
                          </span>
                        ) : null}
                      </div>

                      {/* Tags */}
                      {Array.isArray(c.tags) && c.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {c.tags.map((tag) => (
                            <span
                              key={tag}
                              className="text-[10px] px-2 py-0.5 rounded-full bg-sand/40 border border-border-light text-muted font-medium"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Visits */}
                    <div className="lg:col-span-2 text-left lg:text-center">
                      <span className="inline-block px-2.5 py-1 rounded-md bg-card/70 border border-border-light text-xs font-mono font-bold text-ink">
                        {stats.completedVisits || 0} / {stats.totalVisits || 0}
                      </span>
                      <div className="text-[11px] text-muted font-medium mt-1">
                        Spent: <span className="font-semibold text-ink">₹{stats.totalSpent || 0}</span>
                      </div>
                    </div>

                    {/* Last Visit */}
                    <div className="lg:col-span-2 text-xs text-muted">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-accent" />
                        <span className="font-medium text-ink/80">{formatDate(stats.lastVisitAt)}</span>
                      </div>
                    </div>

                    {/* No-Shows / Flags */}
                    <div className="lg:col-span-2 space-y-1">
                      {c.isFlagged ? (
                        <span
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200"
                          title={c.flagReason || 'Flagged for staff attention'}
                        >
                          <AlertTriangle className="w-3 h-3 shrink-0" />
                          {c.flagReason || 'Flagged'}
                        </span>
                      ) : isHighNoShow ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200">
                          <Clock className="w-3 h-3" />
                          {noShowCount} No-Shows
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" /> Good Standing
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="lg:col-span-2 flex items-center justify-end gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-border-light">
                      <Link to={`/admin/customers/${custId}`}>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="text-xs h-8 px-3 rounded-lg text-ink hover:text-accent font-semibold uppercase tracking-wider"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" />
                          Profile
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </QueryState>
        </>
      )}

      {/* Add Customer Modal */}
      {showAddModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        >
          <div className="bg-card rounded-xl shadow-2xl max-w-md w-full p-6 text-left border border-border-light animate-in fade-in zoom-in-95 duration-100">
            <div className="flex items-center justify-between pb-3 border-b border-border-light mb-4">
              <h3 className="font-bold text-base text-ink flex items-center gap-2">
                <Users className="w-4 h-4 text-accent" />
                Add New Customer
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-md text-ink/50 hover:text-ink hover:bg-surface"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="space-y-4">
              <div>
                <label
                  htmlFor="new-cust-name"
                  className="block text-xs font-semibold uppercase tracking-wider text-ink/70 mb-1"
                >
                  Full Name *
                </label>
                <input
                  id="new-cust-name"
                  type="text"
                  required
                  placeholder="e.g. Aakash Verma"
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                  className="w-full px-3 py-2 rounded bg-surface border border-border-light text-xs sm:text-sm text-ink focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>

              <div>
                <label
                  htmlFor="new-cust-phone"
                  className="block text-xs font-semibold uppercase tracking-wider text-ink/70 mb-1"
                >
                  Phone (Indian Mobile) *
                </label>
                <input
                  id="new-cust-phone"
                  type="text"
                  required
                  placeholder="9876543210 or +91 98765 43210"
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded bg-surface border border-border-light text-xs sm:text-sm text-ink focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>

              <div>
                <label
                  htmlFor="new-cust-email"
                  className="block text-xs font-semibold uppercase tracking-wider text-ink/70 mb-1"
                >
                  Email (Optional)
                </label>
                <input
                  id="new-cust-email"
                  type="email"
                  placeholder="customer@domain.com"
                  value={newCustomer.email}
                  onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                  className="w-full px-3 py-2 rounded bg-surface border border-border-light text-xs sm:text-sm text-ink focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>

              <div>
                <label
                  htmlFor="new-cust-bday"
                  className="block text-xs font-semibold uppercase tracking-wider text-ink/70 mb-1"
                >
                  Date of Birth (Optional - For Birthday Greetings)
                </label>
                <input
                  id="new-cust-bday"
                  type="date"
                  value={newCustomer.birthday}
                  onChange={(e) => setNewCustomer({ ...newCustomer, birthday: e.target.value })}
                  className="w-full px-3 py-2 rounded bg-surface border border-border-light text-xs sm:text-sm text-ink focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>

              <div>
                <label
                  htmlFor="new-cust-tags"
                  className="block text-xs font-semibold uppercase tracking-wider text-ink/70 mb-1"
                >
                  Tags (Comma separated)
                </label>
                <input
                  id="new-cust-tags"
                  type="text"
                  placeholder="VIP, Fade, Beard"
                  value={newCustomer.tags}
                  onChange={(e) => setNewCustomer({ ...newCustomer, tags: e.target.value })}
                  className="w-full px-3 py-2 rounded bg-surface border border-border-light text-xs sm:text-sm text-ink focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>

              <div>
                <label
                  htmlFor="new-cust-barber"
                  className="block text-xs font-semibold uppercase tracking-wider text-ink/70 mb-1"
                >
                  Preferred Barber
                </label>
                <select
                  id="new-cust-barber"
                  value={newCustomer.preferredBarberId}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, preferredBarberId: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded bg-surface border border-border-light text-xs sm:text-sm text-ink focus:outline-none focus:ring-1 focus:ring-accent"
                >
                  <option value="">No preference</option>
                  {barbers.map((b) => (
                    <option key={b._id || b.id} value={b._id || b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="new-cust-notes"
                  className="block text-xs font-semibold uppercase tracking-wider text-ink/70 mb-1"
                >
                  Barber Notes & Style Preferences
                </label>
                <textarea
                  id="new-cust-notes"
                  rows={2}
                  placeholder="e.g. Skin fade with textured crop on top..."
                  value={newCustomer.notes}
                  onChange={(e) => setNewCustomer({ ...newCustomer, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded bg-surface border border-border-light text-xs sm:text-sm text-ink focus:outline-none focus:ring-1 focus:ring-accent resize-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="wa-consent-new"
                  checked={newCustomer.whatsappConsent}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, whatsappConsent: e.target.checked })
                  }
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="wa-consent-new" className="text-xs text-ink/80 select-none">
                  Customer opted-in for WhatsApp booking updates
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border-light">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="accent"
                  size="sm"
                  disabled={isCreating}
                  className="font-semibold"
                >
                  {isCreating ? 'Saving...' : 'Create Profile'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
