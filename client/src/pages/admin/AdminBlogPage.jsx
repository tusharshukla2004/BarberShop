import { useState } from 'react';
import {
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  Eye,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import FormField from '@/components/admin/FormField';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import {
  useGetAdminPostsQuery,
  useCreatePostMutation,
  useUpdatePostMutation,
  useDeletePostMutation,
} from '@/features/seo/seoApi';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { selectIsOwner } from '@/features/auth/authSlice';
import { addToast } from '@/features/ui/uiSlice';
import { slugify, renderMarkdown } from '@/lib/markdown';

export default function AdminBlogPage() {
  const dispatch = useAppDispatch();
  const isOwner = useAppSelector(selectIsOwner);

  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'published' | 'scheduled' | 'draft'

  const { data: posts = [], refetch } = useGetAdminPostsQuery();

  const [createPost, { isLoading: isCreating }] = useCreatePostMutation();
  const [updatePost, { isLoading: isUpdating }] = useUpdatePostMutation();
  const [deletePost] = useDeletePostMutation();

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [editorMode, setEditorMode] = useState('write'); // 'write' | 'preview'

  const [formState, setFormState] = useState({
    titleEn: '',
    titleHi: '',
    slug: '',
    excerptEn: '',
    excerptHi: '',
    contentEn: '',
    contentHi: '',
    coverImage: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1200&q=80',
    tags: 'haircut, fade, grooming',
    category: 'haircut',
    status: 'draft',
    publishedAt: new Date().toISOString().slice(0, 16),
    seoTitle: '',
    seoDescription: '',
  });

  const [deleteConfirm, setDeleteConfirm] = useState({
    isOpen: false,
    id: null,
    title: '',
  });

  const handleOpenAdd = () => {
    setEditingPost(null);
    setFormState({
      titleEn: '',
      titleHi: '',
      slug: '',
      excerptEn: '',
      excerptHi: '',
      contentEn: '## Introduction\n\nWrite your master grooming article here in Markdown...',
      contentHi: '',
      coverImage: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1200&q=80',
      tags: 'haircut, fade, styling',
      category: 'haircut',
      status: 'draft',
      publishedAt: new Date().toISOString().slice(0, 16),
      seoTitle: '',
      seoDescription: '',
    });
    setEditorMode('write');
    setModalOpen(true);
  };

  const handleOpenEdit = (post) => {
    setEditingPost(post);
    setFormState({
      titleEn: post.title?.en || '',
      titleHi: post.title?.hi || '',
      slug: post.slug || '',
      excerptEn: post.excerpt?.en || '',
      excerptHi: post.excerpt?.hi || '',
      contentEn: post.content?.en || '',
      contentHi: post.content?.hi || '',
      coverImage: post.coverImage || '',
      tags: (post.tags || []).join(', '),
      category: post.category || 'haircut',
      status: post.status || 'draft',
      publishedAt: post.publishedAt
        ? new Date(post.publishedAt).toISOString().slice(0, 16)
        : new Date().toISOString().slice(0, 16),
      seoTitle: post.seoTitle || '',
      seoDescription: post.seoDescription || '',
    });
    setEditorMode('write');
    setModalOpen(true);
  };

  const handleTitleChange = (e) => {
    const title = e.target.value;
    setFormState((prev) => ({
      ...prev,
      titleEn: title,
      slug: prev.slug || slugify(title),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: { en: formState.titleEn, hi: formState.titleHi },
        slug: formState.slug || slugify(formState.titleEn),
        excerpt: { en: formState.excerptEn, hi: formState.excerptHi },
        content: { en: formState.contentEn, hi: formState.contentHi },
        coverImage: formState.coverImage,
        tags: formState.tags
          .split(',')
          .map((s) => s.trim().toLowerCase())
          .filter(Boolean),
        category: formState.category,
        status: formState.status,
        publishedAt: new Date(formState.publishedAt).toISOString(),
        seoTitle: formState.seoTitle,
        seoDescription: formState.seoDescription,
      };

      if (editingPost) {
        await updatePost({ id: editingPost.id || editingPost._id, ...payload }).unwrap();
        dispatch(addToast({ type: 'success', message: 'Blog post updated.' }));
      } else {
        await createPost(payload).unwrap();
        dispatch(addToast({ type: 'success', message: 'Blog post created.' }));
      }
      setModalOpen(false);
      refetch();
    } catch (err) {
      dispatch(addToast({ type: 'error', message: err?.message || 'Failed to save blog post.' }));
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await deletePost(deleteConfirm.id).unwrap();
      dispatch(addToast({ type: 'success', message: 'Blog post deleted.' }));
      refetch();
    } catch (err) {
      dispatch(addToast({ type: 'error', message: err?.message || 'Failed to delete.' }));
    } finally {
      setDeleteConfirm({ isOpen: false, id: null, title: '' });
    }
  };

  const postsList = Array.isArray(posts) ? posts : (posts?.posts || []);
  const filteredPosts = postsList.filter((p) => {
    if (activeTab === 'all') return true;
    return p.status === activeTab;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-ink flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-accent" /> Editorial Journal & Blog Management
          </h1>
          <p className="text-xs text-muted">
            Publish expert master barber advice, haircut trend forecasts, and grooming tips with live Markdown preview and scheduling.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/blog"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded text-xs font-semibold border border-border-light text-ink hover:text-accent hover:border-accent transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Visit Public Journal
          </a>
          <Button size="sm" onClick={handleOpenAdd}>
            <Plus className="w-4 h-4 mr-1" /> New Article
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border-light flex gap-4 text-xs font-semibold">
        {['all', 'published', 'scheduled', 'draft'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2.5 capitalize border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-accent text-accent'
                : 'border-transparent text-muted hover:text-ink'
            }`}
          >
            {tab} Articles ({posts.filter((p) => (tab === 'all' ? true : p.status === tab)).length})
          </button>
        ))}
      </div>

      {/* Table */}
      <Card className="p-6">
        {filteredPosts.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted">
            No articles found in this tab. Click New Article to create one.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border-light text-[11px] font-mono text-muted uppercase">
                  <th className="py-2.5 px-3">Title & Summary</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Read Time</th>
                  <th className="py-2.5 px-3">Views</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {filteredPosts.map((post) => {
                  const pId = post.id || post._id;
                  return (
                    <tr key={pId} className="hover:bg-surface/50">
                      <td className="py-3 px-3 max-w-sm">
                        <span className="font-bold text-ink block truncate">{post.title?.en}</span>
                        <span className="text-[11px] font-mono text-accent">/blog/{post.slug}</span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-accent/20 text-accent font-bold">
                          {post.category}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold capitalize ${
                            post.status === 'published'
                              ? 'bg-emerald-100 text-emerald-800'
                              : post.status === 'scheduled'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {post.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-muted font-mono">{post.readingTimeMinutes || 3} min</td>
                      <td className="py-3 px-3 text-ink font-mono font-bold">{post.viewsCount || 0}</td>
                      <td className="py-3 px-3 text-muted text-[11px] font-mono">
                        {new Date(post.publishedAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-3 text-right space-x-2">
                        <a
                          href={`/blog/${post.slug}${post.status !== 'published' ? '?preview=true' : ''}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block p-1 text-muted hover:text-accent"
                          title="Preview Article"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                        <button
                          onClick={() => handleOpenEdit(post)}
                          className="p-1 text-muted hover:text-ink"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {isOwner && (
                          <button
                            onClick={() =>
                              setDeleteConfirm({
                                isOpen: true,
                                id: pId,
                                title: post.title?.en,
                              })
                            }
                            className="p-1 text-muted hover:text-red-600"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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

      {/* Editor Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 bg-white">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base font-bold font-serif text-ink">
                {editingPost ? `Edit Article: ${editingPost.title?.en}` : 'Compose New Journal Article'}
              </h2>
              {editingPost && (
                <a
                  href={`/blog/${formState.slug}?preview=true`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-accent font-semibold inline-flex items-center gap-1 hover:underline"
                >
                  <Eye className="w-3.5 h-3.5" /> Open Draft Preview Link
                </a>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  label="Article Title (English) *"
                  value={formState.titleEn}
                  onChange={handleTitleChange}
                  placeholder="e.g. How to Choose the Perfect Fade Haircut"
                  required
                />
                <FormField
                  label="Article Title (Hindi)"
                  value={formState.titleHi}
                  onChange={(e) => setFormState({ ...formState, titleHi: e.target.value })}
                  placeholder="e.g. सही फेड हेयरकट कैसे चुनें"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <FormField
                  label="URL Slug *"
                  value={formState.slug}
                  onChange={(e) => setFormState({ ...formState, slug: slugify(e.target.value) })}
                  placeholder="fade-haircut-guide"
                  required
                />
                <div>
                  <label htmlFor="blog-category-select" className="block text-xs font-semibold text-ink mb-1">
                    Category *
                  </label>
                  <select
                    id="blog-category-select"
                    value={formState.category}
                    onChange={(e) => setFormState({ ...formState, category: e.target.value })}
                    className="w-full text-xs p-2 border border-border-light rounded"
                  >
                    <option value="haircut">Haircut</option>
                    <option value="beard">Beard Care</option>
                    <option value="styling">Styling</option>
                    <option value="grooming">Grooming</option>
                    <option value="trends">Trends</option>
                    <option value="news">Studio News</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="blog-status-select" className="block text-xs font-semibold text-ink mb-1">
                    Publishing Status *
                  </label>
                  <select
                    id="blog-status-select"
                    value={formState.status}
                    onChange={(e) => setFormState({ ...formState, status: e.target.value })}
                    className="w-full text-xs p-2 border border-border-light rounded"
                  >
                    <option value="draft">Draft (Private)</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="published">Published (Live)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <FormField
                  label="Cover Image URL"
                  value={formState.coverImage}
                  onChange={(e) => setFormState({ ...formState, coverImage: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                />
                <FormField
                  label="Publish Date / Schedule Time *"
                  type="datetime-local"
                  value={formState.publishedAt}
                  onChange={(e) => setFormState({ ...formState, publishedAt: e.target.value })}
                  required
                />
              </div>

              <FormField
                label="Excerpt Summary (English) *"
                type="textarea"
                rows={2}
                value={formState.excerptEn}
                onChange={(e) => setFormState({ ...formState, excerptEn: e.target.value })}
                placeholder="Brief 1-2 sentence preview for search engine snippets and cards..."
                required
              />

              {/* Markdown Content Editor with Live Preview */}
              <div className="space-y-2">
                <div className="flex justify-between items-center border-b border-border-light pb-1">
                  <label htmlFor="blog-content-editor" className="font-semibold text-ink">
                    Article Content (Markdown format) *
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setEditorMode('write')}
                      className={`px-2.5 py-0.5 rounded text-xs font-semibold ${
                        editorMode === 'write' ? 'bg-accent text-primary' : 'text-muted hover:text-ink'
                      }`}
                    >
                      Write
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditorMode('preview')}
                      className={`px-2.5 py-0.5 rounded text-xs font-semibold ${
                        editorMode === 'preview' ? 'bg-accent text-primary' : 'text-muted hover:text-ink'
                      }`}
                    >
                      Live Preview
                    </button>
                  </div>
                </div>

                {editorMode === 'write' ? (
                  <textarea
                    id="blog-content-editor"
                    rows={10}
                    required
                    value={formState.contentEn}
                    onChange={(e) => setFormState({ ...formState, contentEn: e.target.value })}
                    className="w-full font-mono text-xs p-3 border border-border-light rounded bg-surface/30 focus:outline-none focus:border-accent leading-relaxed"
                    placeholder="## Heading 2&#10;&#10;Write content in Markdown..."
                  />
                ) : (
                  <div
                    className="min-h-[200px] max-h-[300px] overflow-y-auto p-4 border border-border-light rounded bg-white text-xs space-y-3 prose prose-sm"
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(formState.contentEn) }}
                  />
                )}
              </div>

              <FormField
                label="Tags (comma-separated)"
                value={formState.tags}
                onChange={(e) => setFormState({ ...formState, tags: e.target.value })}
                placeholder="haircut, fade, styling, beard"
              />

              <div className="flex justify-end gap-2 pt-4 border-t border-border-light">
                <Button variant="outline" size="sm" type="button" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
                <Button size="sm" type="submit" disabled={isCreating || isUpdating}>
                  Save Article
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="Delete Article?"
        message={`Are you sure you want to permanently delete "${deleteConfirm.title}"?`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirm({ isOpen: false, id: null, title: '' })}
        isDanger
      />
    </div>
  );
}
