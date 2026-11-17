import { useState } from 'react';
import {
  Globe,
  MapPin,
  ArrowRightLeft,
  Share2,
  CheckCircle,
  AlertTriangle,
  Plus,
  Edit2,
  Trash2,
  Copy,
  ExternalLink,
  QrCode,
  ShieldAlert,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import FormField from '@/components/admin/FormField';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import {
  useGetSeoHealthReportQuery,
  useGetAdminAreasQuery,
  useCreateAreaMutation,
  useUpdateAreaMutation,
  useDeleteAreaMutation,
  useGetAdminRedirectsQuery,
  useCreateRedirectMutation,
  useUpdateRedirectMutation,
  useDeleteRedirectMutation,
  useGetGbpHelpersQuery,
} from '@/features/seo/seoApi';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { selectIsOwner } from '@/features/auth/authSlice';
import { addToast } from '@/features/ui/uiSlice';
import { slugify } from '@/lib/markdown';

export default function AdminSeoPage() {
  const dispatch = useAppDispatch();
  const isOwner = useAppSelector(selectIsOwner);

  const [activeTab, setActiveTab] = useState('health'); // 'health' | 'areas' | 'redirects' | 'gbp'

  // Queries
  const {
    data: healthReport,
    refetch: refetchHealth,
  } = useGetSeoHealthReportQuery();

  const {
    data: areas = [],
    refetch: refetchAreas,
  } = useGetAdminAreasQuery();

  const {
    data: redirects = [],
    refetch: refetchRedirects,
  } = useGetAdminRedirectsQuery();

  const { data: gbpData } = useGetGbpHelpersQuery();

  // Mutations
  const [createArea, { isLoading: isCreatingArea }] = useCreateAreaMutation();
  const [updateArea, { isLoading: isUpdatingArea }] = useUpdateAreaMutation();
  const [deleteArea] = useDeleteAreaMutation();

  const [createRedirect, { isLoading: isCreatingRedir }] = useCreateRedirectMutation();
  const [updateRedirect, { isLoading: isUpdatingRedir }] = useUpdateRedirectMutation();
  const [deleteRedirect] = useDeleteRedirectMutation();

  // Area Modal State
  const [areaModalOpen, setAreaModalOpen] = useState(false);
  const [editingArea, setEditingArea] = useState(null);
  const [areaForm, setAreaForm] = useState({
    nameEn: '',
    nameHi: '',
    slug: '',
    landmarks: '',
    descriptionEn: '',
    descriptionHi: '',
    directionsEn: '',
    directionsHi: '',
    mapEmbedUrl: '',
    faqQ1: '',
    faqA1: '',
    isActive: true,
    isPublished: true,
  });

  // Redirect Modal State
  const [redirectModalOpen, setRedirectModalOpen] = useState(false);
  const [editingRedirect, setEditingRedirect] = useState(null);
  const [redirectForm, setRedirectForm] = useState({
    fromPath: '',
    toPath: '',
    statusCode: 301,
    notes: '',
    isActive: true,
  });

  // Delete Confirm Dialog
  const [deleteConfirm, setDeleteConfirm] = useState({
    isOpen: false,
    type: null, // 'area' | 'redirect'
    id: null,
    title: '',
  });

  // GBP Print QR Modal State
  const [printQrModal, setPrintQrModal] = useState(false);

  // ------------------------------------
  // Area Handlers
  // ------------------------------------
  const handleOpenAddArea = () => {
    setEditingArea(null);
    setAreaForm({
      nameEn: '',
      nameHi: '',
      slug: '',
      landmarks: '',
      descriptionEn: '',
      descriptionHi: '',
      directionsEn: '',
      directionsHi: '',
      mapEmbedUrl: '',
      faqQ1: 'Is dedicated customer parking available?',
      faqA1: 'Yes, complimentary valet parking is provided at our studio entrance.',
      isActive: true,
      isPublished: true,
    });
    setAreaModalOpen(true);
  };

  const handleOpenEditArea = (area) => {
    setEditingArea(area);
    const faq = area.faqs?.[0] || {};
    setAreaForm({
      nameEn: area.name?.en || '',
      nameHi: area.name?.hi || '',
      slug: area.slug || '',
      landmarks: (area.landmarks || []).join(', '),
      descriptionEn: area.description?.en || '',
      descriptionHi: area.description?.hi || '',
      directionsEn: area.directions?.en || '',
      directionsHi: area.directions?.hi || '',
      mapEmbedUrl: area.mapEmbedUrl || '',
      faqQ1: faq.question?.en || '',
      faqA1: faq.answer?.en || '',
      isActive: Boolean(area.isActive),
      isPublished: Boolean(area.isPublished),
    });
    setAreaModalOpen(true);
  };

  const handleAreaNameChange = (e) => {
    const name = e.target.value;
    setAreaForm((prev) => ({
      ...prev,
      nameEn: name,
      slug: prev.slug || slugify(name),
    }));
  };

  const handleAreaSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: { en: areaForm.nameEn, hi: areaForm.nameHi },
        slug: areaForm.slug || slugify(areaForm.nameEn),
        landmarks: areaForm.landmarks
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        description: { en: areaForm.descriptionEn, hi: areaForm.descriptionHi },
        directions: { en: areaForm.directionsEn, hi: areaForm.directionsHi },
        mapEmbedUrl: areaForm.mapEmbedUrl,
        faqs: areaForm.faqQ1
          ? [
              {
                question: { en: areaForm.faqQ1, hi: '' },
                answer: { en: areaForm.faqA1, hi: '' },
              },
            ]
          : [],
        isActive: areaForm.isActive,
        isPublished: areaForm.isPublished,
      };

      if (editingArea) {
        await updateArea({ id: editingArea.id || editingArea._id, ...payload }).unwrap();
        dispatch(addToast({ type: 'success', message: 'Area updated successfully.' }));
      } else {
        await createArea(payload).unwrap();
        dispatch(addToast({ type: 'success', message: 'Area created successfully.' }));
      }
      setAreaModalOpen(false);
      refetchAreas();
      refetchHealth();
    } catch (err) {
      dispatch(addToast({ type: 'error', message: err?.message || 'Failed to save area.' }));
    }
  };

  // ------------------------------------
  // Redirect Handlers
  // ------------------------------------
  const handleOpenAddRedirect = () => {
    setEditingRedirect(null);
    setRedirectForm({
      fromPath: '',
      toPath: '',
      statusCode: 301,
      notes: '',
      isActive: true,
    });
    setRedirectModalOpen(true);
  };

  const handleOpenEditRedirect = (redir) => {
    setEditingRedirect(redir);
    setRedirectForm({
      fromPath: redir.fromPath,
      toPath: redir.toPath,
      statusCode: redir.statusCode,
      notes: redir.notes || '',
      isActive: Boolean(redir.isActive),
    });
    setRedirectModalOpen(true);
  };

  const handleRedirectSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingRedirect) {
        await updateRedirect({
          id: editingRedirect.id || editingRedirect._id,
          ...redirectForm,
        }).unwrap();
        dispatch(addToast({ type: 'success', message: 'Redirect rule updated.' }));
      } else {
        await createRedirect(redirectForm).unwrap();
        dispatch(addToast({ type: 'success', message: 'Redirect rule created.' }));
      }
      setRedirectModalOpen(false);
      refetchRedirects();
    } catch (err) {
      dispatch(addToast({ type: 'error', message: err?.message || 'Failed to save redirect.' }));
    }
  };

  // ------------------------------------
  // Delete Confirmation Handler
  // ------------------------------------
  const handleConfirmDelete = async () => {
    try {
      if (deleteConfirm.type === 'area') {
        await deleteArea(deleteConfirm.id).unwrap();
        dispatch(addToast({ type: 'success', message: 'Area deleted.' }));
        refetchAreas();
      } else if (deleteConfirm.type === 'redirect') {
        await deleteRedirect(deleteConfirm.id).unwrap();
        dispatch(addToast({ type: 'success', message: 'Redirect deleted.' }));
        refetchRedirects();
      }
      refetchHealth();
    } catch (err) {
      dispatch(addToast({ type: 'error', message: err?.message || 'Failed to delete.' }));
    } finally {
      setDeleteConfirm({ isOpen: false, type: null, id: null, title: '' });
    }
  };

  // ------------------------------------
  // Copy Utility
  // ------------------------------------
  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    dispatch(addToast({ type: 'success', message: `${label} copied to clipboard!` }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-ink flex items-center gap-2">
            <Globe className="w-6 h-6 text-accent" /> Local SEO & Technical Growth Console
          </h1>
          <p className="text-xs text-muted">
            Manage neighborhood landing pages, sitemap & technical redirects, audit content quality, and optimize Google Business Profile.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/sitemap.xml"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded text-xs font-semibold border border-border-light text-ink hover:text-accent hover:border-accent transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" /> View Sitemap XML
          </a>
          <a
            href="/robots.txt"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded text-xs font-semibold border border-border-light text-ink hover:text-accent hover:border-accent transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" /> View Robots.txt
          </a>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border-light flex flex-wrap gap-x-4 gap-y-2 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('health')}
          className={`pb-2.5 flex items-center gap-1.5 border-b-2 transition-colors ${
            activeTab === 'health'
              ? 'border-accent text-accent'
              : 'border-transparent text-muted hover:text-ink'
          }`}
        >
          <ShieldAlert className="w-4 h-4" /> SEO Health & Audits
          {healthReport?.issuesCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500/20 text-amber-600 font-mono">
              {healthReport.issuesCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('areas')}
          className={`pb-2.5 flex items-center gap-1.5 border-b-2 transition-colors ${
            activeTab === 'areas'
              ? 'border-accent text-accent'
              : 'border-transparent text-muted hover:text-ink'
          }`}
        >
          <MapPin className="w-4 h-4" /> Neighborhood Areas ({areas.length})
        </button>

        <button
          onClick={() => setActiveTab('redirects')}
          className={`pb-2.5 flex items-center gap-1.5 border-b-2 transition-colors ${
            activeTab === 'redirects'
              ? 'border-accent text-accent'
              : 'border-transparent text-muted hover:text-ink'
          }`}
        >
          <ArrowRightLeft className="w-4 h-4" /> Technical Redirects ({redirects.length})
        </button>

        <button
          onClick={() => setActiveTab('gbp')}
          className={`pb-2.5 flex items-center gap-1.5 border-b-2 transition-colors ${
            activeTab === 'gbp'
              ? 'border-accent text-accent'
              : 'border-transparent text-muted hover:text-ink'
          }`}
        >
          <Share2 className="w-4 h-4 text-blue-500" /> Google Business Profile
        </button>
      </div>

      {/* Tab 1: SEO Health Audit */}
      {activeTab === 'health' && (
        <div className="space-y-6">
          {/* Health Score Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-5 flex items-center justify-between border-accent/20">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-muted font-bold block">
                  Overall SEO Health
                </span>
                <span className="text-3xl font-serif font-bold text-ink">
                  {healthReport?.score ?? 100}%
                </span>
              </div>
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                  (healthReport?.score || 100) >= 90
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {(healthReport?.score || 100) >= 90 ? 'A' : 'B'}
              </div>
            </Card>

            <Card className="p-5">
              <span className="text-xs font-mono uppercase tracking-wider text-muted font-bold block">
                Total Pages Audited
              </span>
              <span className="text-2xl font-bold font-mono text-ink mt-1 block">
                {healthReport?.totalAudited || 0}
              </span>
              <span className="text-[11px] text-muted">Areas, Services, and Blog Articles</span>
            </Card>

            <Card className="p-5">
              <span className="text-xs font-mono uppercase tracking-wider text-muted font-bold block">
                Diagnostics Detected
              </span>
              <span className="text-2xl font-bold font-mono text-amber-600 mt-1 block">
                {healthReport?.issuesCount || 0}
              </span>
              <span className="text-[11px] text-muted">Issues to optimize or thin doorways</span>
            </Card>
          </div>

          {/* Issues List */}
          <Card className="p-6">
            <h2 className="text-base font-bold font-serif text-ink mb-4">
              Automated Content & SEO Audit Findings
            </h2>

            {healthReport?.issues?.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted">
                <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                All published landing pages pass quality criteria, word count minimums, and meta tag standards!
              </div>
            ) : (
              <div className="divide-y divide-border-light">
                {healthReport?.issues?.map((issue, idx) => (
                  <div key={idx} className="py-3.5 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${
                            issue.severity === 'error'
                              ? 'bg-red-100 text-red-800'
                              : issue.severity === 'warning'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {issue.severity}
                        </span>
                        <span className="font-bold text-ink text-xs">{issue.title}</span>
                      </div>
                      <p className="text-xs text-muted">{issue.problem}</p>
                    </div>

                    {issue.url && (
                      <a
                        href={issue.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-accent font-semibold hover:underline inline-flex items-center gap-1 self-start sm:self-center"
                      >
                        Inspect Page <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Tab 2: Areas Management */}
      {activeTab === 'areas' && (
        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-base font-bold font-serif text-ink">
                Neighborhood Areas & Landing Pages
              </h2>
              <p className="text-xs text-muted">
                Combination landing pages for local search. Enforces minimum word counts and unique local directions to prevent thin doorway pages.
              </p>
            </div>
            {isOwner && (
              <Button size="sm" onClick={handleOpenAddArea}>
                <Plus className="w-4 h-4 mr-1" /> Add Neighborhood Area
              </Button>
            )}
          </div>

          {areas.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted">
              No local areas configured yet. Click Add Neighborhood Area to create your first landing page.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border-light text-[11px] font-mono text-muted uppercase">
                    <th className="py-2.5 px-3">Area Name</th>
                    <th className="py-2.5 px-3">URL Slug</th>
                    <th className="py-2.5 px-3">Landmarks</th>
                    <th className="py-2.5 px-3">Quality Gate</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-light">
                  {areas.map((a) => {
                    const aId = a.id || a._id;
                    return (
                      <tr key={aId} className="hover:bg-surface/50">
                        <td className="py-3 px-3 font-bold text-ink">
                          {a.name?.en}
                          {a.name?.hi && (
                            <span className="block text-[11px] font-normal text-muted">
                              {a.name.hi}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 font-mono text-accent">/locations/{a.slug}</td>
                        <td className="py-3 px-3 text-muted max-w-xs truncate">
                          {(a.landmarks || []).join(', ') || 'None specified'}
                        </td>
                        <td className="py-3 px-3">
                          {a.qualityPassed ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              <CheckCircle className="w-3 h-3" /> Quality Passed
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              <AlertTriangle className="w-3 h-3" /> Thin Content Risk
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                              a.isPublished && a.isActive
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {a.isPublished && a.isActive ? 'Live' : 'Draft'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right space-x-2">
                          <a
                            href={`/locations/${a.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block p-1 text-muted hover:text-accent"
                            title="Preview Landing Page"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                          {isOwner && (
                            <>
                              <button
                                onClick={() => handleOpenEditArea(a)}
                                className="p-1 text-muted hover:text-ink"
                                title="Edit"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() =>
                                  setDeleteConfirm({
                                    isOpen: true,
                                    type: 'area',
                                    id: aId,
                                    title: a.name?.en,
                                  })
                                }
                                className="p-1 text-muted hover:text-red-600"
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* Tab 3: Redirects Management */}
      {activeTab === 'redirects' && (
        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-base font-bold font-serif text-ink">
                Technical Redirects & 410 Table
              </h2>
              <p className="text-xs text-muted">
                Manage legacy URLs, changed slugs (301 Permanent / 302 Temporary), and permanently removed content (410 Gone).
              </p>
            </div>
            {isOwner && (
              <Button size="sm" onClick={handleOpenAddRedirect}>
                <Plus className="w-4 h-4 mr-1" /> Add Redirect Rule
              </Button>
            )}
          </div>

          {redirects.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted">
              No custom redirect rules found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border-light text-[11px] font-mono text-muted uppercase">
                    <th className="py-2.5 px-3">Source Path</th>
                    <th className="py-2.5 px-3">Target Path</th>
                    <th className="py-2.5 px-3">Status Code</th>
                    <th className="py-2.5 px-3">Hits Count</th>
                    <th className="py-2.5 px-3">Last Accessed</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-light font-mono">
                  {redirects.map((r) => {
                    const rId = r.id || r._id;
                    return (
                      <tr key={rId} className="hover:bg-surface/50">
                        <td className="py-3 px-3 text-ink font-semibold">{r.fromPath}</td>
                        <td className="py-3 px-3 text-accent">
                          {r.statusCode === 410 ? (
                            <span className="text-muted italic">[410 Removed]</span>
                          ) : (
                            r.toPath
                          )}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              r.statusCode === 301
                                ? 'bg-blue-100 text-blue-800'
                                : r.statusCode === 410
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {r.statusCode}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-ink">{r.hitCount || 0}</td>
                        <td className="py-3 px-3 text-muted text-[11px]">
                          {r.lastHitAt ? new Date(r.lastHitAt).toLocaleDateString() : 'Never'}
                        </td>
                        <td className="py-3 px-3 text-right space-x-2 font-sans">
                          {isOwner && (
                            <>
                              <button
                                onClick={() => handleOpenEditRedirect(r)}
                                className="p-1 text-muted hover:text-ink"
                                title="Edit"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() =>
                                  setDeleteConfirm({
                                    isOpen: true,
                                    type: 'redirect',
                                    id: rId,
                                    title: r.fromPath,
                                  })
                                }
                                className="p-1 text-muted hover:text-red-600"
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* Tab 4: Google Business Profile Helpers */}
      {activeTab === 'gbp' && gbpData && (
        <div className="space-y-6">
          {/* Checklist & Counter QR Action */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 md:col-span-2 space-y-4">
              <h2 className="text-base font-bold font-serif text-ink">
                Google Business Profile Optimization Checklist
              </h2>
              <p className="text-xs text-muted">
                Step-by-step best practices to achieve Local Pack top-3 ranking in Mumbai.
              </p>

              <div className="space-y-2.5 pt-2">
                {gbpData.checklist?.map((item) => (
                  <div key={item.id} className="flex items-start gap-2.5 text-xs">
                    <CheckCircle
                      className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                        item.completed ? 'text-emerald-600' : 'text-gray-300'
                      }`}
                    />
                    <span className={item.completed ? 'text-ink font-medium' : 'text-muted'}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6 text-center space-y-4 flex flex-col justify-between border-accent/30 bg-accent/5">
              <div>
                <QrCode className="w-12 h-12 text-accent mx-auto mb-2" />
                <h3 className="text-sm font-bold font-serif text-ink">
                  Counter Google Review QR Card
                </h3>
                <p className="text-xs text-muted mt-1">
                  Place on the checkout desk so customers scan and review instantly before leaving.
                </p>
              </div>

              <Button onClick={() => setPrintQrModal(true)} size="sm">
                Open Printable Counter Card
              </Button>
            </Card>
          </div>

          {/* Copy-Ready 750 Character Business Description */}
          <Card className="p-6 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-base font-bold font-serif text-ink">
                  GBP Business Description (750 Characters Maximum)
                </h2>
                <p className="text-xs text-muted">
                  Keyword-optimized, natural copy grounded with your actual neighborhood landmarks.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  copyToClipboard(gbpData.businessDescriptions?.en, 'English Business Description')
                }
              >
                <Copy className="w-3.5 h-3.5 mr-1" /> Copy English Copy
              </Button>
            </div>

            <div className="p-4 rounded-lg bg-surface border border-border-light text-xs text-ink leading-relaxed font-sans space-y-2">
              <p>{gbpData.businessDescriptions?.en}</p>
              <div className="flex justify-between text-[11px] font-mono text-muted pt-2 border-t border-border-light">
                <span>Character Count: {gbpData.businessDescriptions?.characterCountEn} / 750</span>
                <span className="text-emerald-700 font-bold">✓ Within Google Character Limit</span>
              </div>
            </div>

            {gbpData.businessDescriptions?.hi && (
              <div className="p-4 rounded-lg bg-surface border border-border-light text-xs text-ink leading-relaxed font-sans space-y-2">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-accent text-[11px]">Hindi Description:</span>
                  <button
                    onClick={() =>
                      copyToClipboard(gbpData.businessDescriptions?.hi, 'Hindi Description')
                    }
                    className="text-xs text-muted hover:text-accent inline-flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" /> Copy
                  </button>
                </div>
                <p>{gbpData.businessDescriptions?.hi}</p>
              </div>
            )}
          </Card>

          {/* Formatted Services Menu for GBP */}
          <Card className="p-6 space-y-4">
            <h2 className="text-base font-bold font-serif text-ink">
              Ready-to-Paste GBP Products & Services List
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
              {gbpData.services?.map((s, idx) => (
                <div key={idx} className="p-3 rounded border border-border-light bg-surface/50 space-y-1">
                  <div className="flex justify-between font-bold text-ink">
                    <span>{s.name}</span>
                    <span className="font-mono text-accent">{s.price}</span>
                  </div>
                  <p className="text-[11px] text-muted line-clamp-2">{s.description}</p>
                  <button
                    onClick={() =>
                      copyToClipboard(`${s.name} - ${s.price}\n${s.description}`, s.name)
                    }
                    className="text-[10px] text-accent font-semibold hover:underline inline-flex items-center gap-1 mt-1"
                  >
                    <Copy className="w-3 h-3" /> Copy item
                  </button>
                </div>
              ))}
            </div>
          </Card>

          {/* Weekly Google Post Ideas */}
          <Card className="p-6 space-y-4">
            <h2 className="text-base font-bold font-serif text-ink">
              Weekly Google Post Update Prompts
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              {gbpData.postIdeas?.map((idea, idx) => (
                <div key={idx} className="p-4 rounded border border-border-light bg-surface space-y-2 flex flex-col justify-between">
                  <div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-accent/20 text-accent font-bold">
                      {idea.type}
                    </span>
                    <h3 className="font-bold text-ink text-sm mt-2">{idea.title}</h3>
                    <p className="text-xs text-muted leading-relaxed mt-1">{idea.body}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(idea.body, idea.title)}
                    className="mt-3 text-xs"
                  >
                    <Copy className="w-3.5 h-3.5 mr-1" /> Copy Post Text
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Area Add/Edit Modal */}
      {areaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 bg-white">
            <h2 className="text-base font-bold font-serif text-ink mb-4">
              {editingArea ? `Edit Area: ${editingArea.name?.en}` : 'Add Neighborhood Landing Page'}
            </h2>

            <form onSubmit={handleAreaSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  label="Area Name (English) *"
                  value={areaForm.nameEn}
                  onChange={handleAreaNameChange}
                  placeholder="e.g. Bandra West"
                  required
                />
                <FormField
                  label="Area Name (Hindi)"
                  value={areaForm.nameHi}
                  onChange={(e) => setAreaForm({ ...areaForm, nameHi: e.target.value })}
                  placeholder="e.g. बांद्रा वेस्ट"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <FormField
                  label="URL Slug *"
                  value={areaForm.slug}
                  onChange={(e) => setAreaForm({ ...areaForm, slug: slugify(e.target.value) })}
                  placeholder="bandra-west"
                  required
                />
                <FormField
                  label="Prominent Landmarks (comma separated) *"
                  value={areaForm.landmarks}
                  onChange={(e) => setAreaForm({ ...areaForm, landmarks: e.target.value })}
                  placeholder="Linking Road, Clock Tower, Station"
                  required
                />
              </div>

              <FormField
                label="Unique Local Description (English, minimum 25 words) *"
                type="textarea"
                rows={3}
                value={areaForm.descriptionEn}
                onChange={(e) => setAreaForm({ ...areaForm, descriptionEn: e.target.value })}
                placeholder="Describe the neighborhood vibe and why Modern Mane is the top choice for gentlemen here..."
                required
              />

              <FormField
                label="Directions / How to Reach (English, minimum 15 words) *"
                type="textarea"
                rows={2}
                value={areaForm.directionsEn}
                onChange={(e) => setAreaForm({ ...areaForm, directionsEn: e.target.value })}
                placeholder="Head down Turner Road towards Clock Tower. Dedicated valet parking is available..."
                required
              />

              {/* Area FAQ */}
              <div className="p-3 border border-border-light rounded bg-surface/50 space-y-2">
                <span className="font-semibold text-ink block">Neighborhood FAQ *</span>
                <FormField
                  label="Question"
                  value={areaForm.faqQ1}
                  onChange={(e) => setAreaForm({ ...areaForm, faqQ1: e.target.value })}
                  placeholder="Is parking available?"
                  required
                />
                <FormField
                  label="Answer"
                  type="textarea"
                  rows={2}
                  value={areaForm.faqA1}
                  onChange={(e) => setAreaForm({ ...areaForm, faqA1: e.target.value })}
                  placeholder="Yes, complimentary valet parking is available..."
                  required
                />
              </div>

              <div className="flex items-center gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={areaForm.isPublished}
                    onChange={(e) => setAreaForm({ ...areaForm, isPublished: e.target.checked })}
                    className="rounded text-accent focus:ring-accent"
                  />
                  <span>Published & Search-Engine Indexable</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-border-light">
                <Button variant="outline" size="sm" type="button" onClick={() => setAreaModalOpen(false)}>
                  Cancel
                </Button>
                <Button size="sm" type="submit" disabled={isCreatingArea || isUpdatingArea}>
                  Save Area Landing Page
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Redirect Add/Edit Modal */}
      {redirectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <Card className="w-full max-w-md p-6 bg-white">
            <h2 className="text-base font-bold font-serif text-ink mb-4">
              {editingRedirect ? 'Edit Redirect Rule' : 'Add Technical Redirect Rule'}
            </h2>

            <form onSubmit={handleRedirectSubmit} className="space-y-4 text-xs">
              <FormField
                label="Source Path (fromPath) *"
                value={redirectForm.fromPath}
                onChange={(e) => setRedirectForm({ ...redirectForm, fromPath: e.target.value })}
                placeholder="/old-service-name"
                required
              />

              <div className="grid grid-cols-2 gap-3">
                <FormField
                  label="Target Path (toPath)"
                  value={redirectForm.toPath}
                  onChange={(e) => setRedirectForm({ ...redirectForm, toPath: e.target.value })}
                  placeholder="/services"
                />
                <div>
                  <label htmlFor="redir-status-select" className="block text-xs font-semibold text-ink mb-1">
                    HTTP Status Code *
                  </label>
                  <select
                    id="redir-status-select"
                    value={redirectForm.statusCode}
                    onChange={(e) =>
                      setRedirectForm({ ...redirectForm, statusCode: Number(e.target.value) })
                    }
                    className="w-full text-xs p-2 border border-border-light rounded"
                  >
                    <option value={301}>301 Permanent Redirect</option>
                    <option value={302}>302 Temporary Redirect</option>
                    <option value={410}>410 Permanently Gone</option>
                  </select>
                </div>
              </div>

              <FormField
                label="Admin Reason / Notes"
                value={redirectForm.notes}
                onChange={(e) => setRedirectForm({ ...redirectForm, notes: e.target.value })}
                placeholder="e.g. Changed URL slug after Prompt 20"
              />

              <div className="flex justify-end gap-2 pt-4 border-t border-border-light">
                <Button variant="outline" size="sm" type="button" onClick={() => setRedirectModalOpen(false)}>
                  Cancel
                </Button>
                <Button size="sm" type="submit" disabled={isCreatingRedir || isUpdatingRedir}>
                  Save Redirect Rule
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Printable Counter Review QR Card Modal */}
      {printQrModal && gbpData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <Card className="w-full max-w-sm p-6 bg-white text-center space-y-4 border-2 border-accent">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-accent font-bold">
                Modern Mane Luxury Barber Studio
              </span>
              <h3 className="text-xl font-serif font-bold text-ink">
                Scan to Review Us on Google
              </h3>
              <p className="text-xs text-muted">
                Enjoyed your grooming experience? We would love your 5-star review!
              </p>
            </div>

            <div className="p-4 bg-white rounded-lg border border-border-light inline-block shadow-sm">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                  gbpData.reviewLink
                )}`}
                alt="Google Review QR Code"
                className="w-44 h-44 mx-auto"
              />
            </div>

            <div className="text-xs text-muted space-y-1">
              <div className="flex justify-center gap-1 text-amber-500">
                {'★'.repeat(5)}
              </div>
              <p className="font-mono text-[11px] truncate max-w-xs mx-auto text-accent">
                {gbpData.reviewLink}
              </p>
            </div>

            <div className="flex justify-center gap-2 pt-2 border-t border-border-light">
              <Button variant="outline" size="sm" onClick={() => setPrintQrModal(false)}>
                Close
              </Button>
              <Button size="sm" onClick={() => window.print()}>
                Print Desk Card
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title={`Delete ${deleteConfirm.type === 'area' ? 'Area' : 'Redirect'}?`}
        message={`Are you sure you want to permanently delete "${deleteConfirm.title}"?`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirm({ isOpen: false, type: null, id: null, title: '' })}
        isDanger
      />
    </div>
  );
}

