'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { postsAPI, usersAPI } from '@/lib/api';
import { Post, PostStatus, Role, User, Visibility } from '@/lib/types';
import { useAuthStore } from '@/lib/store/auth-store';
import { formatDate, formatNumber } from '@/lib/helpers';
import { CheckCircle, RefreshCw, ShieldAlert, Users, FileText, EyeOff } from 'lucide-react';

const MAX_MODERATION_LIST = 50;
const MAX_METRICS_SAMPLE = 100;

export default function AdminDashboardPage() {
  const { user, isLoading: authLoading } = useAuthStore();
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [moderationPosts, setModerationPosts] = useState<Post[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    pendingUsers: 0,
    totalPosts: 0,
    publishedPosts: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionStates, setActionStates] = useState<Record<string, boolean>>({});

  const isAdmin = user?.role === Role.ADMIN;

  useEffect(() => {
    if (isAdmin) {
      loadDashboard();
    }
  }, [isAdmin]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        pending,
        allUsers,
        activeUsers,
        postsAll,
        postsPublished,
        postsDraft,
        postsArchived,
        postsPrivate,
      ] = await Promise.all([
        usersAPI.listPending(),
        usersAPI.listUsers(),
        usersAPI.listUsers({ isActive: true }),
        postsAPI.list({ take: MAX_METRICS_SAMPLE, sort: 'CREATED_AT_DESC' }),
        postsAPI.list({ status: PostStatus.PUBLISHED, take: MAX_METRICS_SAMPLE, sort: 'CREATED_AT_DESC' }),
        postsAPI.list({ status: PostStatus.DRAFT, take: MAX_MODERATION_LIST, sort: 'CREATED_AT_DESC' }),
        postsAPI.list({ status: PostStatus.ARCHIVED, take: MAX_MODERATION_LIST, sort: 'CREATED_AT_DESC' }),
        postsAPI.list({ visibility: Visibility.PRIVATE, take: MAX_MODERATION_LIST, sort: 'CREATED_AT_DESC' }),
      ]);

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
      setModerationPosts(moderationList);
      setStats({
        totalUsers: allUsers.length,
        activeUsers: activeUsers.length,
        pendingUsers: pending.length,
        totalPosts: postsAll.length,
        publishedPosts: postsPublished.length,
      });
    } catch (err: any) {
      console.error('Failed to load admin dashboard:', err);
      setError('Failed to load admin data. Please try again.');
    } finally {
      setLoading(false);
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
          <div className="text-center text-gray-600">Loading dashboard...</div>
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
            <h1 className="text-2xl font-semibold text-gray-900">Admin Dashboard</h1>
            <p className="mt-3 text-gray-600">Please log in to access admin tools.</p>
            <div className="mt-6">
              <Link href="/login">
                <Button>Go to Login</Button>
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
            <h1 className="text-2xl font-semibold text-gray-900">Access denied</h1>
            <p className="mt-3 text-gray-600">You do not have permission to view this page.</p>
            <div className="mt-6">
              <Link href="/">
                <Button variant="outline">Back to Home</Button>
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
            <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Admin</p>
            <h1 className="mt-3 text-3xl font-semibold text-gray-900">Admin Dashboard</h1>
            <p className="mt-2 text-gray-600">Review users, moderate content, and monitor key signals.</p>
          </div>
          <Button variant="outline" onClick={loadDashboard} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
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
            Site Metrics
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div className="rounded-2xl border border-black/10 bg-white/90 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Total users</p>
              <p className="mt-2 text-2xl font-semibold text-gray-900">{formatNumber(stats.totalUsers)}</p>
            </div>
            <div className="rounded-2xl border border-black/10 bg-white/90 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Active users</p>
              <p className="mt-2 text-2xl font-semibold text-gray-900">{formatNumber(stats.activeUsers)}</p>
            </div>
            <div className="rounded-2xl border border-black/10 bg-white/90 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Pending approvals</p>
              <p className="mt-2 text-2xl font-semibold text-gray-900">{formatNumber(stats.pendingUsers)}</p>
            </div>
            <div className="rounded-2xl border border-black/10 bg-white/90 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Total posts</p>
              <p className="mt-2 text-2xl font-semibold text-gray-900">{formatNumber(stats.totalPosts)}</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <p className="text-sm text-gray-500">Published posts</p>
              <p className="mt-2 text-2xl font-semibold text-gray-900">{formatNumber(stats.publishedPosts)}</p>
            </div>
          </div>
          {metricsNote && (
            <p className="mt-3 text-xs text-gray-500">{metricsNote}</p>
          )}
        </section>

        <section className="mt-12">
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
            <Users className="h-4 w-4" />
            User Approvals
          </div>
          <div className="mt-4 rounded-xl border border-gray-200 bg-white">
            <div className="grid grid-cols-4 gap-4 border-b border-gray-200 px-6 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
              <span>User</span>
              <span>Email</span>
              <span>Requested</span>
              <span>Actions</span>
            </div>
            {loading ? (
              <div className="px-6 py-8 text-center text-sm text-gray-500">Loading pending users...</div>
            ) : pendingUsers.length === 0 ? (
              <div className="px-6 py-8 text-center text-sm text-gray-500">No pending approvals.</div>
            ) : (
              pendingUsers.map((pending) => (
                <div
                  key={pending.id}
                  className="grid grid-cols-4 items-center gap-4 border-b border-gray-100 px-6 py-4 text-sm"
                >
                  <div>
                    <p className="font-medium text-gray-900">{pending.name || 'Unnamed user'}</p>
                    <p className="text-xs text-gray-500">ID {pending.id.slice(0, 8)}</p>
                  </div>
                  <p className="text-gray-700">{pending.email}</p>
                  <p className="text-gray-600">{formatDate(pending.createdAt)}</p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleApproveUser(pending.id)}
                      disabled={actionStates[pending.id]}
                    >
                      <CheckCircle className="h-4 w-4" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRejectUser(pending.id)}
                      disabled={actionStates[pending.id]}
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="mt-12">
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
            <FileText className="h-4 w-4" />
            Content Moderation
          </div>
          <div className="mt-4 rounded-xl border border-gray-200 bg-white">
            <div className="grid grid-cols-5 gap-4 border-b border-gray-200 px-6 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
              <span>Post</span>
              <span>Author</span>
              <span>Status</span>
              <span>Visibility</span>
              <span>Actions</span>
            </div>
            {loading ? (
              <div className="px-6 py-8 text-center text-sm text-gray-500">Loading moderation queue...</div>
            ) : moderationPosts.length === 0 ? (
              <div className="px-6 py-8 text-center text-sm text-gray-500">No posts require review.</div>
            ) : (
              moderationPosts.map((post) => (
                <div
                  key={post.id}
                  className="grid grid-cols-5 items-center gap-4 border-b border-gray-100 px-6 py-4 text-sm"
                >
                  <div>
                    <p className="font-medium text-gray-900">{post.title}</p>
                    <p className="text-xs text-gray-500">Updated {formatDate(post.updatedAt)}</p>
                  </div>
                  <p className="text-gray-700">{post.author?.name || 'Unknown author'}</p>
                  <span className="inline-flex w-fit items-center rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                    {post.status}
                  </span>
                  <span className="inline-flex w-fit items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                    {post.visibility === Visibility.PRIVATE && <EyeOff className="h-3 w-3" />}
                    {post.visibility}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      onClick={() => handlePublishPost(post.id)}
                      disabled={actionStates[post.id]}
                    >
                      Publish
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUnpublishPost(post.id)}
                      disabled={actionStates[post.id]}
                    >
                      Unpublish
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleArchivePost(post.id)}
                      disabled={actionStates[post.id]}
                    >
                      Archive
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
          <p className="mt-3 text-xs text-gray-500">
            Moderation queue shows drafts, archived posts, and private posts (up to {MAX_MODERATION_LIST}).
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
}
