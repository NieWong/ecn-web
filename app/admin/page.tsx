'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { postsAPI, usersAPI, categoriesAPI, notificationsAPI } from '@/lib/api';
import {
  Post,
  PostStatus,
  Role,
  Visibility,
  Category,
} from '@/lib/types';
import { ContentType, ContentTypeLabels, inferContentTypeFromPost } from '@/lib/content-type';
import { useAuthStore } from '@/lib/store/auth-store';
import { formatDate, formatNumber, getPostUrl } from '@/lib/helpers';
import { CheckCircle, RefreshCw, ShieldAlert, Users, FileText, XCircle, Edit, FolderOpen, Trash2, Plus } from 'lucide-react';
import { useUserManagement } from '@/hooks/useUserManagement';
import { UsersTable } from '@/components/admin/UsersTable';
import { UserActionsQueue } from '@/components/admin/UserActionsQueue';

const MAX_METRICS_SAMPLE = 100;

export default function AdminDashboardPage() {
  const { user, isLoading: authLoading } = useAuthStore();

  // Post and content management state
  const [pendingPosts, setPendingPosts] = useState<Post[]>([]);
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    pendingUsers: 0,
    totalPosts: 0,
    publishedPosts: 0,
    pendingApprovalPosts: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionStates, setActionStates] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<'users' | 'articles' | 'approval' | 'categories'>('approval');

  // Category management states
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategorySlug, setNewCategorySlug] = useState('');
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editCategoryName, setEditCategoryName] = useState('');
  const [editCategorySlug, setEditCategorySlug] = useState('');
  const [articleTypeFilter, setArticleTypeFilter] = useState<'ALL' | ContentType>('ALL');

  // Post editing state
  const [rejectingPostId, setRejectingPostId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const isAdmin = user?.role === Role.ADMIN;

  const loadDashboard = useCallback(async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
      }
      setError(null);

      const [
        pending,
        users,
        activeUsers,
        postsAll,
        categoriesList,
        notifications,
      ] = await Promise.all([
        usersAPI.listPending(),
        usersAPI.listUsers(),
        usersAPI.listUsers({ isActive: true }),
        postsAPI.list({ take: MAX_METRICS_SAMPLE, sort: 'CREATED_AT_DESC' }),
        categoriesAPI.list(),
        notificationsAPI.list({ unreadOnly: true, take: 100 }),
      ]);

      const pendingApprovalList = postsAll.filter((post) => !post.isApproved);
      const publishedApprovedCount = postsAll.filter(
        (post) => post.status === PostStatus.PUBLISHED && post.isApproved
      ).length;

      userManagement.updateUsersData(pending, users, notifications);
      setPendingPosts(pendingApprovalList);
      setAllPosts(postsAll);
      setCategories(categoriesList);
      setStats({
        totalUsers: users.length,
        activeUsers: activeUsers.length,
        pendingUsers: pending.length,
        totalPosts: postsAll.length,
        publishedPosts: publishedApprovedCount,
        pendingApprovalPosts: pendingApprovalList.length,
      });
    } catch (err: unknown) {
      console.error('Failed to load admin dashboard:', err);
      setError('Failed to load admin data. Please try again.');
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, []);

  // Memoized callback for refreshing dashboard after user actions
  const handleDataRefresh = useCallback(() => {
    loadDashboard();
  }, [loadDashboard]);

  // User management state and actions (initialized after loadDashboard)
  const userManagement = useUserManagement(handleDataRefresh);

  useEffect(() => {
    if (isAdmin) {
      loadDashboard();
    }
  }, [isAdmin, loadDashboard]);

  useEffect(() => {
    if (!isAdmin) return;
    const interval = setInterval(() => {
      loadDashboard(true);
    }, 10000);
    return () => clearInterval(interval);
  }, [isAdmin, loadDashboard]);

  const setActionLoading = (id: string, isBusy: boolean) => {
    setActionStates((prev) => ({ ...prev, [id]: isBusy }));
  };

  const handlePublishPost = async (id: string) => {
    try {
      setActionLoading(id, true);
      await postsAPI.update(id, { status: PostStatus.PUBLISHED, visibility: Visibility.PUBLIC });
      await loadDashboard();
    } catch (err) {
      console.error('Publish post failed:', err);
    } finally {
      setActionLoading(id, false);
    }
  };

  // Approve article
  const handleApprovePost = async (id: string) => {
    try {
      setActionLoading(id, true);
      await postsAPI.approve(id);
      await loadDashboard();
    } catch (err) {
      console.error('Approve post failed:', err);
    } finally {
      setActionLoading(id, false);
    }
  };

  // Reject article with reason
  const handleRejectPost = async (id: string) => {
    if (!rejectReason.trim()) {
      alert('Татгалзах шалтгаан оруулна уу');
      return;
    }
    try {
      setActionLoading(id, true);
      await postsAPI.reject(id, rejectReason);
      setRejectingPostId(null);
      setRejectReason('');
      await loadDashboard();
    } catch (err) {
      console.error('Reject post failed:', err);
    } finally {
      setActionLoading(id, false);
    }
  };

  // Delete post
  const handleDeletePost = async (id: string) => {
    if (!confirm('Та энэ нийтлэлийг устгахдаа итгэлтэй байна уу?')) return;
    try {
      setActionLoading(id, true);
      await postsAPI.delete(id);
      await loadDashboard();
    } catch (err) {
      console.error('Delete post failed:', err);
    } finally {
      setActionLoading(id, false);
    }
  };

  // Category management functions
  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      alert('Ангиллын нэр оруулна уу');
      return;
    }
    const slug = newCategorySlug.trim() || newCategoryName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    try {
      setActionLoading('new-category', true);
      await categoriesAPI.create({ name: newCategoryName.trim(), slug });
      setNewCategoryName('');
      setNewCategorySlug('');
      await loadDashboard();
    } catch (err) {
      console.error('Create category failed:', err);
      alert('Ангилал үүсгэхэд алдаа гарлаа');
    } finally {
      setActionLoading('new-category', false);
    }
  };

  const handleUpdateCategory = async (id: string) => {
    if (!editCategoryName.trim()) {
      alert('Ангиллын нэр оруулна уу');
      return;
    }
    try {
      setActionLoading(id, true);
      await categoriesAPI.update(id, {
        name: editCategoryName.trim(),
        slug: editCategorySlug.trim() || undefined,
      });
      setEditingCategoryId(null);
      setEditCategoryName('');
      setEditCategorySlug('');
      await loadDashboard();
    } catch (err) {
      console.error('Update category failed:', err);
      alert('Ангилал засахад алдаа гарлаа');
    } finally {
      setActionLoading(id, false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Та энэ ангиллыг устгахдаа итгэлтэй байна уу?')) return;
    try {
      setActionLoading(id, true);
      await categoriesAPI.delete(id);
      await loadDashboard();
    } catch (err) {
      console.error('Delete category failed:', err);
      alert('Ангилал устгахад алдаа гарлаа');
    } finally {
      setActionLoading(id, false);
    }
  };

  const startEditCategory = (category: Category) => {
    setEditingCategoryId(category.id);
    setEditCategoryName(category.name);
    setEditCategorySlug(category.slug);
  };

  const metricsNote = useMemo(() => {
    if (stats.totalPosts >= MAX_METRICS_SAMPLE) {
      return `Counts based on the most recent ${MAX_METRICS_SAMPLE} posts.`;
    }
    return null;
  }, [stats.totalPosts]);

  const filteredPendingPosts = useMemo(() => {
    if (articleTypeFilter === 'ALL') return pendingPosts;
    return pendingPosts.filter((post) => inferContentTypeFromPost(post) === articleTypeFilter);
  }, [pendingPosts, articleTypeFilter]);

  const filteredAllPosts = useMemo(() => {
    if (articleTypeFilter === 'ALL') return allPosts;
    return allPosts.filter((post) => inferContentTypeFromPost(post) === articleTypeFilter);
  }, [allPosts, articleTypeFilter]);

  if (authLoading) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center text-gray-600">Ачаалж байна...</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="rounded-3xl border border-black/10 bg-white/90 p-8 text-center">
            <h1 className="text-2xl font-semibold text-gray-900">Админ медээлэл самбар</h1>
            <p className="mt-3 text-gray-600">Админ хэрэгсэл харахын тулд нэвтэрнэ үү.</p>
            <div className="mt-6">
              <Link href="/login">
                <Button>Нэвтрэх</Button>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="rounded-3xl border border-black/10 bg-white/90 p-8 text-center">
            <h1 className="text-2xl font-semibold text-gray-900">Хандах эрх үгүй</h1>
            <p className="mt-3 text-gray-600">Та энэ хуудсыг үзэх эрхгүй байна.</p>
            <div className="mt-6">
              <Link href="/">
                <Button variant="outline">Нүүр хуудас руу</Button>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />

      <main className="mx-auto max-w-384 px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Админ</p>
            <h1 className="mt-3 text-3xl font-semibold text-gray-900">Админ медээлэл самбар</h1>
            <p className="mt-2 text-gray-600">Хэрэглэгчдийг шалгах, контент зохицуулах, чухал хяналт хийх.</p>
          </div>
          <Button variant="outline" onClick={() => loadDashboard()} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Шинэчлэх
          </Button>
        </div>

        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <section className="mt-10">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-gray-500">
            <ShieldAlert className="h-4 w-4" />
            Сайтын тоо ширхэг
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
            <div className="rounded-2xl border border-black/10 bg-white/90 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Нийт хэрэглэгч</p>
              <p className="mt-2 text-2xl font-semibold text-gray-900">{formatNumber(stats.totalUsers)}</p>
            </div>
            <div className="rounded-2xl border border-black/10 bg-white/90 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Идэвхтэй хэрэглэгч</p>
              <p className="mt-2 text-2xl font-semibold text-gray-900">{formatNumber(stats.activeUsers)}</p>
            </div>
            <div className="rounded-2xl border border-black/10 bg-white/90 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Хүлээгдэж буй бүртгэл</p>
              <p className="mt-2 text-2xl font-semibold text-gray-900">{formatNumber(stats.pendingUsers)}</p>
            </div>
            <div className="rounded-2xl border border-black/10 bg-white/90 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Нийт нийтлэл</p>
              <p className="mt-2 text-2xl font-semibold text-gray-900">{formatNumber(stats.totalPosts)}</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <p className="text-sm text-gray-500">Нийтлэгдсэн</p>
              <p className="mt-2 text-2xl font-semibold text-gray-900">{formatNumber(stats.publishedPosts)}</p>
            </div>
            <div className="rounded-xl border border-orange-200 bg-orange-50 p-5">
              <p className="text-sm text-orange-600">Баталгаажуулах</p>
              <p className="mt-2 text-2xl font-semibold text-orange-900">{formatNumber(stats.pendingApprovalPosts)}</p>
            </div>
          </div>
          {metricsNote && (
            <p className="mt-3 text-xs text-gray-500">Тоо ширхэг нь хамгийн сүүлийн {MAX_METRICS_SAMPLE} нийтлэлд үндэслэн.</p>
          )}
        </section>

        {/* Tab Navigation */}
        <div className="mt-10 overflow-x-auto">
          <div className="flex min-w-max gap-2 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('approval')}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
              activeTab === 'approval'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Нийтлэл баталгаажуулах ({stats.pendingApprovalPosts})
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
              activeTab === 'users'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Хэрэглэгчид ({stats.totalUsers})
          </button>
          <button
            onClick={() => setActiveTab('articles')}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
              activeTab === 'articles'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Контент зохицуулалт
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
              activeTab === 'categories'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Ангилал ({categories.length})
          </button>
          </div>
        </div>

        {/* Article Approval Section */}
        {activeTab === 'approval' && (
          <section className="mt-6">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-orange-600">
              <CheckCircle className="h-4 w-4" />
              Нийтлэл баталгаажуулах
            </div>
            <p className="mt-1 text-sm text-gray-500">Хэрэглэгчид нийтлэл бичсэний дараа админ баталгаажуулах шаардлагатай.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button size="sm" variant={articleTypeFilter === 'ALL' ? 'default' : 'outline'} onClick={() => setArticleTypeFilter('ALL')}>
                Бүгд
              </Button>
              <Button size="sm" variant={articleTypeFilter === ContentType.CONTENT ? 'default' : 'outline'} onClick={() => setArticleTypeFilter(ContentType.CONTENT)}>
                {ContentTypeLabels[ContentType.CONTENT]}
              </Button>
              <Button size="sm" variant={articleTypeFilter === ContentType.NEWS ? 'default' : 'outline'} onClick={() => setArticleTypeFilter(ContentType.NEWS)}>
                {ContentTypeLabels[ContentType.NEWS]}
              </Button>
            </div>
            <div className="mt-4 rounded-xl border border-gray-200 bg-white">
              <div className="grid grid-cols-6 gap-4 border-b border-gray-200 px-6 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                <span>Нийтлэл</span>
                <span>Төрөл</span>
                <span>Зохиогч</span>
                <span>Огноо</span>
                <span>Төлөв</span>
                <span>Үйлдэл</span>
              </div>
              {loading ? (
                <div className="px-6 py-8 text-center text-sm text-gray-500">Ачаалж байна...</div>
              ) : filteredPendingPosts.length === 0 ? (
                <div className="px-6 py-8 text-center text-sm text-gray-500">Баталгаажуулах нийтлэл байхгүй байна.</div>
              ) : (
                filteredPendingPosts.map((post) => (
                  <div
                    key={post.id}
                    className="grid grid-cols-6 items-center gap-4 border-b border-gray-100 px-6 py-4 text-sm"
                  >
                    <div>
                      <Link href={getPostUrl(post)} className="font-medium text-gray-900 hover:text-blue-600">
                        {post.title}
                      </Link>
                      {post.adminComment && (
                        <p className="text-xs text-orange-600 mt-1">Сүүлийн сэтгэгдэл: {post.adminComment}</p>
                      )}
                    </div>
                    <span className="text-xs text-gray-700">{ContentTypeLabels[inferContentTypeFromPost(post)]}</span>
                    <p className="text-gray-700">{post.author?.name || 'Үл мэдэх зохиогч'}</p>
                    <p className="text-gray-600">{formatDate(post.createdAt)}</p>
                    <span className="inline-flex w-fit items-center rounded-full bg-orange-100 px-2 py-1 text-xs font-medium text-orange-600">
                      {post.isApproved ? 'Баталгаажсан' : 'Хүлээгдэж буй'}
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {rejectingPostId === post.id ? (
                        <div className="flex gap-2 items-center">
                          <input
                            type="text"
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="Татгалзах шалтгаан..."
                            className="border rounded px-2 py-1 text-sm w-40"
                          />
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRejectPost(post.id)}
                            disabled={actionStates[post.id]}
                          >
                            Илгээх
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setRejectingPostId(null);
                              setRejectReason('');
                            }}
                          >
                            Болих
                          </Button>
                        </div>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleApprovePost(post.id)}
                            disabled={actionStates[post.id]}
                          >
                            <CheckCircle className="h-4 w-4" />
                            Баталгаажуулах
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setRejectingPostId(post.id)}
                            disabled={actionStates[post.id]}
                          >
                            <XCircle className="h-4 w-4" />
                            Татгалзах
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        )}

        {/* Users Management Section */}
        {activeTab === 'users' && (
          <section className="mt-6 space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-blue-600">
                <Users className="h-4 w-4" />
                Хэрэглэгчийн удирдлага
              </div>
              <input
                type="text"
                placeholder="Нэр, имэйл, ID-р хайх..."
                value={userManagement.searchQuery}
                onChange={(e) => userManagement.setSearchQuery(e.target.value)}
                className="flex-1 max-w-xs px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <UserActionsQueue
              pendingUsers={userManagement.pendingUsers}
              passwordResetRequests={userManagement.passwordResetRequests}
              onApprovePending={userManagement.approveUser}
              onRejectPending={userManagement.rejectUser}
              onAllowPasswordReset={userManagement.allowPasswordReset}
              getActionState={userManagement.getActionState}
            />

            <div>
              <h4 className="mb-3 text-sm font-semibold text-gray-900">Бүх хэрэглэгчид</h4>
              <UsersTable
                users={userManagement.filteredAllUsers}
                loading={loading}
                currentUserId={user?.id}
                editingUserId={userManagement.editingUserId}
                onEditingUserChange={userManagement.setEditingUserId}
                onApprove={userManagement.approveUser}
                onReject={userManagement.rejectUser}
                onUpdateMembership={userManagement.updateMembership}
                onUpdateRole={userManagement.updateRole}
                onToggleAccountant={userManagement.toggleAccountant}
                onDelete={userManagement.deleteUser}
                getActionState={userManagement.getActionState}
              />
            </div>
          </section>
        )}

        {/* Content Moderation Section */}
        {activeTab === 'articles' && (
          <section className="mt-6">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-green-600">
              <FileText className="h-4 w-4" />
              Нийтлэл удирдлага
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button size="sm" variant={articleTypeFilter === 'ALL' ? 'default' : 'outline'} onClick={() => setArticleTypeFilter('ALL')}>
                Бүгд
              </Button>
              <Button size="sm" variant={articleTypeFilter === ContentType.CONTENT ? 'default' : 'outline'} onClick={() => setArticleTypeFilter(ContentType.CONTENT)}>
                {ContentTypeLabels[ContentType.CONTENT]}
              </Button>
              <Button size="sm" variant={articleTypeFilter === ContentType.NEWS ? 'default' : 'outline'} onClick={() => setArticleTypeFilter(ContentType.NEWS)}>
                {ContentTypeLabels[ContentType.NEWS]}
              </Button>
            </div>
            <div className="mt-4 rounded-xl border border-gray-200 bg-white overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Нийтлэл</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Төрөл</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Зохиогч</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Төлөв</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Баталгаажсан</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Огноо</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Үйлдэл</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-500">Ачаалж байна...</td>
                    </tr>
                  ) : filteredAllPosts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-500">Нийтлэл байхгүй байна.</td>
                    </tr>
                  ) : (
                    filteredAllPosts.map((post) => (
                      <tr key={post.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div>
                            <Link href={getPostUrl(post)} className="font-medium text-gray-900 hover:text-blue-600">
                              {post.title}
                            </Link>
                            <p className="text-xs text-gray-500">ID: {post.id.slice(0, 8)}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">{ContentTypeLabels[inferContentTypeFromPost(post)]}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{post.author?.name || 'Үл мэдэх'}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                            post.status === PostStatus.PUBLISHED ? 'bg-green-100 text-green-700' :
                            post.status === PostStatus.DRAFT ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {post.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                            post.isApproved ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                          }`}>
                            {post.isApproved ? 'Баталгаажсан' : 'Хүлээлтэй'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{formatDate(post.createdAt)}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2 flex-wrap">
                            <Button
                              size="sm"
                              onClick={() => handleApprovePost(post.id)}
                              disabled={actionStates[post.id] || post.isApproved}
                            >
                              {post.isApproved ? 'Баталгаажсан' : 'Баталгаажуулах'}
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handlePublishPost(post.id)}
                              disabled={actionStates[post.id] || post.status === PostStatus.PUBLISHED}
                            >
                              {post.status === PostStatus.PUBLISHED ? 'Нийтлэсэн' : 'Нийтлэх'}
                            </Button>
                            <Link href={`/write?edit=${post.id}`}>
                              <Button size="sm" variant="outline" disabled={actionStates[post.id]}>
                                <Edit className="h-3 w-3" />
                              </Button>
                            </Link>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeletePost(post.id)}
                              disabled={actionStates[post.id]}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-gray-500">
              Бүх нийтлэл ({allPosts.length}) болон тэдгээрийн төлөв эндээс харагдана. Засах, устгах үйлдэл хийх боломжтой.
            </p>
          </section>
        )}

        {/* Category Management Section */}
        {activeTab === 'categories' && (
          <section className="mt-6">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-purple-600">
              <FolderOpen className="h-4 w-4" />
              Ангилал удирдлага
            </div>

            {/* Create New Category */}
            <div className="mt-4 rounded-xl border border-gray-200 bg-white p-6">
              <h3 className="text-sm font-medium text-gray-900 mb-4">Шинэ ангилал үүсгэх</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ангиллын нэр (жишээ: Нийлэл, Судалгаа)"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <input
                  type="text"
                  placeholder="Slug (автоматаар үүсгэгдэнэ)"
                  value={newCategorySlug}
                  onChange={(e) => setNewCategorySlug(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <Button
                  onClick={handleCreateCategory}
                  disabled={actionStates['new-category']}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Үүсгэх
                </Button>
              </div>
            </div>

            {/* All Categories */}
            <div className="mt-6 rounded-xl border border-gray-200 bg-white overflow-hidden">
              <div className="grid grid-cols-4 gap-4 border-b border-gray-200 px-6 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                <span>Ангилал</span>
                <span>Slug</span>
                <span>Нийтлэл</span>
                <span>Үйлдэл</span>
              </div>
              {loading ? (
                <div className="px-6 py-8 text-center text-sm text-gray-500">Ачаалж байна...</div>
              ) : categories.length === 0 ? (
                <div className="px-6 py-8 text-center text-sm text-gray-500">Ангилал байхгүй байна.</div>
              ) : (
                categories.map((category) => (
                  <div key={category.id} className="grid grid-cols-4 items-center gap-4 border-b border-gray-100 px-6 py-4 text-sm hover:bg-gray-50">
                    {editingCategoryId === category.id ? (
                      <>
                        <input
                          type="text"
                          value={editCategoryName}
                          onChange={(e) => setEditCategoryName(e.target.value)}
                          className="border rounded px-2 py-1"
                        />
                        <input
                          type="text"
                          value={editCategorySlug}
                          onChange={(e) => setEditCategorySlug(e.target.value)}
                          className="border rounded px-2 py-1"
                        />
                        <span className="text-gray-500">-</span>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleUpdateCategory(category.id)}
                            disabled={actionStates[category.id]}
                          >
                            Хадгалах
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingCategoryId(null);
                              setEditCategoryName('');
                              setEditCategorySlug('');
                            }}
                          >
                            Болих
                          </Button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <p className="font-medium text-gray-900">{category.name}</p>
                          <p className="text-xs text-gray-500">ID: {category.id.slice(0, 8)}</p>
                        </div>
                        <code className="text-gray-600 bg-gray-100 px-2 py-1 rounded text-xs">{category.slug}</code>
                        <span className="text-gray-600">-</span>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => startEditCategory(category)}
                            disabled={actionStates[category.id]}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteCategory(category.id)}
                            disabled={actionStates[category.id]}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
