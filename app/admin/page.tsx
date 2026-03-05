'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { postsAPI, usersAPI, categoriesAPI } from '@/lib/api';
import { Post, PostStatus, Role, User, Visibility, MembershipLevel, MembershipLevelLabels, Category } from '@/lib/types';
import { useAuthStore } from '@/lib/store/auth-store';
import { formatDate, formatNumber } from '@/lib/helpers';
import { CheckCircle, RefreshCw, ShieldAlert, Users, FileText, EyeOff, XCircle, Edit, Award, FolderOpen, Trash2, Plus } from 'lucide-react';

const MAX_MODERATION_LIST = 50;
const MAX_METRICS_SAMPLE = 100;

export default function AdminDashboardPage() {
  const { user, isLoading: authLoading } = useAuthStore();
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [pendingPosts, setPendingPosts] = useState<Post[]>([]);
  const [moderationPosts, setModerationPosts] = useState<Post[]>([]);
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
  const [rejectingPostId, setRejectingPostId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'articles' | 'approval' | 'categories'>('overview');
  
  // Category management states
  const [categories, setCategories] = useState<Category[]>([]);
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategorySlug, setNewCategorySlug] = useState('');
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editCategoryName, setEditCategoryName] = useState('');
  const [editCategorySlug, setEditCategorySlug] = useState('');

  const isAdmin = user?.role === Role.ADMIN;

  useEffect(() => {
    if (isAdmin) {
      loadDashboard();
    }
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin) return;
    const interval = setInterval(() => {
      loadDashboard(true);
    }, 10000);
    return () => clearInterval(interval);
  }, [isAdmin]);

  const loadDashboard = async (silent = false) => {
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
        postsDraft,
        postsArchived,
        postsPrivate,
        categoriesList,
      ] = await Promise.all([
        usersAPI.listPending(),
        usersAPI.listUsers(),
        usersAPI.listUsers({ isActive: true }),
        postsAPI.list({ take: MAX_METRICS_SAMPLE, sort: 'CREATED_AT_DESC' }),
        postsAPI.list({ status: PostStatus.DRAFT, take: MAX_MODERATION_LIST, sort: 'CREATED_AT_DESC' }),
        postsAPI.list({ status: PostStatus.ARCHIVED, take: MAX_MODERATION_LIST, sort: 'CREATED_AT_DESC' }),
        postsAPI.list({ visibility: Visibility.PRIVATE, take: MAX_MODERATION_LIST, sort: 'CREATED_AT_DESC' }),
        categoriesAPI.list(),
      ]);

      const pendingApprovalList = postsAll.filter((post) => !post.isApproved);
      const publishedApprovedCount = postsAll.filter(
        (post) => post.status === PostStatus.PUBLISHED && post.isApproved
      ).length;

      const moderationMap = new Map<string, Post>();
      [...postsDraft, ...postsArchived, ...postsPrivate].forEach((post) => {
        moderationMap.set(post.id, post);
      });

      const moderationList = Array.from(moderationMap.values()).sort((a, b) => {
        const aTime = new Date(a.updatedAt).getTime();
        const bTime = new Date(b.updatedAt).getTime();
        return bTime - aTime;
      });

      setPendingUsers(pending);
      setAllUsers(users);
      setPendingPosts(pendingApprovalList);
      setModerationPosts(moderationList);
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
    } catch (err: any) {
      console.error('Failed to load admin dashboard:', err);
      setError('Failed to load admin data. Please try again.');
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  const setActionLoading = (id: string, isBusy: boolean) => {
    setActionStates((prev) => ({ ...prev, [id]: isBusy }));
  };

  const handleApproveUser = async (id: string) => {
    try {
      setActionLoading(id, true);
      await usersAPI.approve(id);
      await loadDashboard();
    } catch (err) {
      console.error('Approve user failed:', err);
    } finally {
      setActionLoading(id, false);
    }
  };

  const handleRejectUser = async (id: string) => {
    try {
      setActionLoading(id, true);
      await usersAPI.deactivate(id);
      await loadDashboard();
    } catch (err) {
      console.error('Deactivate user failed:', err);
    } finally {
      setActionLoading(id, false);
    }
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

  const handleUnpublishPost = async (id: string) => {
    try {
      setActionLoading(id, true);
      await postsAPI.update(id, { status: PostStatus.DRAFT, visibility: Visibility.PRIVATE });
      await loadDashboard();
    } catch (err) {
      console.error('Unpublish post failed:', err);
    } finally {
      setActionLoading(id, false);
    }
  };

  const handleArchivePost = async (id: string) => {
    try {
      setActionLoading(id, true);
      await postsAPI.update(id, { status: PostStatus.ARCHIVED });
      await loadDashboard();
    } catch (err) {
      console.error('Archive post failed:', err);
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

  // Update user membership level
  const handleUpdateMembership = async (userId: string, level: MembershipLevel) => {
    try {
      setActionLoading(userId, true);
      await usersAPI.updateMembershipLevel(userId, level);
      setEditingUserId(null);
      await loadDashboard();
    } catch (err) {
      console.error('Update membership failed:', err);
    } finally {
      setActionLoading(userId, false);
    }
  };

  // Update user role
  const handleUpdateRole = async (userId: string, role: Role) => {
    try {
      setActionLoading(userId, true);
      await usersAPI.updateRole(userId, role);
      await loadDashboard();
    } catch (err) {
      console.error('Update role failed:', err);
    } finally {
      setActionLoading(userId, false);
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

      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
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
        <div className="mt-10 flex gap-2 border-b border-gray-200">
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

        {/* Article Approval Section */}
        {activeTab === 'approval' && (
          <section className="mt-6">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-orange-600">
              <CheckCircle className="h-4 w-4" />
              Нийтлэл баталгаажуулах
            </div>
            <p className="mt-1 text-sm text-gray-500">Хэрэглэгчид нийтлэл бичсэний дараа админ баталгаажуулах шаардлагатай.</p>
            <div className="mt-4 rounded-xl border border-gray-200 bg-white">
              <div className="grid grid-cols-5 gap-4 border-b border-gray-200 px-6 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                <span>Нийтлэл</span>
                <span>Зохиогч</span>
                <span>Огноо</span>
                <span>Төлөв</span>
                <span>Үйлдэл</span>
              </div>
              {loading ? (
                <div className="px-6 py-8 text-center text-sm text-gray-500">Ачаалж байна...</div>
              ) : pendingPosts.length === 0 ? (
                <div className="px-6 py-8 text-center text-sm text-gray-500">Баталгаажуулах нийтлэл байхгүй байна.</div>
              ) : (
                pendingPosts.map((post) => (
                  <div
                    key={post.id}
                    className="grid grid-cols-5 items-center gap-4 border-b border-gray-100 px-6 py-4 text-sm"
                  >
                    <div>
                      <Link href={`/article/${post.slug}`} className="font-medium text-gray-900 hover:text-blue-600">
                        {post.title}
                      </Link>
                      {post.adminComment && (
                        <p className="text-xs text-orange-600 mt-1">Сүүлийн сэтгэгдэл: {post.adminComment}</p>
                      )}
                    </div>
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
          <section className="mt-6">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-blue-600">
              <Users className="h-4 w-4" />
              Хэрэглэгчийн удирдлага
            </div>

            {/* Pending Users */}
            {pendingUsers.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Хүлээгдэж буй бүртгэл ({pendingUsers.length})</h3>
                <div className="rounded-xl border border-orange-200 bg-orange-50">
                  {pendingUsers.map((pending) => (
                    <div
                      key={pending.id}
                      className="flex items-center justify-between border-b border-orange-100 px-6 py-4 text-sm last:border-0"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{pending.name || 'Нэргүй хэрэглэгч'}</p>
                        <p className="text-gray-600">{pending.email}</p>
                        <p className="text-xs text-gray-500">{formatDate(pending.createdAt)}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleApproveUser(pending.id)}
                          disabled={actionStates[pending.id]}
                        >
                          <CheckCircle className="h-4 w-4" />
                          Зөвшөөрөх
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRejectUser(pending.id)}
                          disabled={actionStates[pending.id]}
                        >
                          Татгалзах
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* All Users */}
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Бүх хэрэглэгчид</h3>
              <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Хэрэглэгч</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Имэйл</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Гишүүнчлэл</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Роль</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Төлөв</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Үйлдэл</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {loading ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">Ачаалж байна...</td>
                      </tr>
                    ) : allUsers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">Хэрэглэгч байхгүй.</td>
                      </tr>
                    ) : (
                      allUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <p className="font-medium text-gray-900">{u.name || 'Нэргүй'}</p>
                            <p className="text-xs text-gray-500">ID: {u.id.slice(0, 8)}</p>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">{u.email}</td>
                          <td className="px-4 py-3">
                            {editingUserId === u.id ? (
                              <select
                                value={u.membershipLevel}
                                onChange={(e) => handleUpdateMembership(u.id, e.target.value as MembershipLevel)}
                                className="border rounded px-2 py-1 text-sm"
                                disabled={actionStates[u.id]}
                              >
                                {Object.entries(MembershipLevelLabels).map(([value, label]) => (
                                  <option key={value} value={value}>{label}</option>
                                ))}
                              </select>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
                                <Award className="h-3 w-3" />
                                {MembershipLevelLabels[u.membershipLevel] || u.membershipLevel}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                              u.role === Role.ADMIN ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
                            }`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                              u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {u.isActive ? 'Идэвхтэй' : 'Идэвхгүй'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              {editingUserId === u.id ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setEditingUserId(null)}
                                >
                                  Болих
                                </Button>
                              ) : (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setEditingUserId(u.id)}
                                    disabled={actionStates[u.id]}
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                  {u.role !== Role.ADMIN && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleUpdateRole(u.id, Role.ADMIN)}
                                      disabled={actionStates[u.id]}
                                    >
                                      Админ болгох
                                    </Button>
                                  )}
                                  {u.role === Role.ADMIN && u.id !== user?.id && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleUpdateRole(u.id, Role.USER)}
                                      disabled={actionStates[u.id]}
                                    >
                                      Админ болиулах
                                    </Button>
                                  )}
                                  {u.isActive ? (
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={() => handleRejectUser(u.id)}
                                      disabled={actionStates[u.id] || u.id === user?.id}
                                    >
                                      Идэвхгүй
                                    </Button>
                                  ) : (
                                    <Button
                                      size="sm"
                                      onClick={() => handleApproveUser(u.id)}
                                      disabled={actionStates[u.id]}
                                    >
                                      Идэвхжүүлэх
                                    </Button>
                                  )}
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
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
            <div className="mt-4 rounded-xl border border-gray-200 bg-white overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Нийтлэл</th>
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
                      <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">Ачаалж байна...</td>
                    </tr>
                  ) : allPosts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">Нийтлэл байхгүй байна.</td>
                    </tr>
                  ) : (
                    allPosts.map((post) => (
                      <tr key={post.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div>
                            <Link href={`/article/${post.slug}`} className="font-medium text-gray-900 hover:text-blue-600">
                              {post.title}
                            </Link>
                            <p className="text-xs text-gray-500">ID: {post.id.slice(0, 8)}</p>
                          </div>
                        </td>
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
