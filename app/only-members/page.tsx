'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { FinanceViewer } from '@/components/finance/FinanceViewer';
import { FinanceEditor } from '@/components/finance/FinanceEditor';
import { useAuthStore } from '@/lib/store/auth-store';
import { financeAPI, postsAPI, usersAPI } from '@/lib/api';
import {
  CreateFinanceEntryRequest,
  FinanceEntry,
  FinanceEntryType,
  FinanceStatus,
  MembershipLevel,
  Post,
  PostStatus,
  Role,
  User,
  Visibility,
} from '@/lib/types';
import { FileText, Lock } from 'lucide-react';


type MembersTab = 'posts' | 'finance';

const getApiErrorMessage = (error: unknown, fallback: string) => {
  const maybeError = error as { response?: { data?: { error?: string } } };
  return maybeError.response?.data?.error || fallback;
};

export default function OnlyMembersPage() {
  const { isAuthenticated, isLoading: authLoading, user } = useAuthStore();
  const isAdmin = user?.role === Role.ADMIN;
  const isFinanceEditor = !!user && (isAdmin || user.isAccountant);
  const isMemberOnlyAreaAllowed =
    !!user && (isAdmin || user.isAccountant || user.membershipLevel !== MembershipLevel.REGULAR_USER);

  const [entries, setEntries] = useState<FinanceEntry[]>([]);
  const [managers, setManagers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [memberPosts, setMemberPosts] = useState<Post[]>([]);
  const [postsError, setPostsError] = useState<string | null>(null);
  const [financeError, setFinanceError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<MembersTab>('posts');

  const canManageEntry = (entry: FinanceEntry) => {
    if (!user) return false;
    if (isFinanceEditor) return true;
    return entry.managerId === user.id;
  };

  const activeFinanceEntries = useMemo(
    () => entries.filter((entry) => entry.status !== FinanceStatus.CANCELLED),
    [entries]
  );

  const dynamicSummary = useMemo(() => {
    const totalBudget = activeFinanceEntries
      .filter((entry) => entry.type === FinanceEntryType.BUDGET)
      .reduce((sum, entry) => sum + Number(entry.amount), 0);

    const totalIncome = activeFinanceEntries
      .filter((entry) => entry.type === FinanceEntryType.INCOME)
      .reduce((sum, entry) => sum + Number(entry.amount), 0);

    const totalExpense = activeFinanceEntries
      .filter((entry) => entry.type === FinanceEntryType.EXPENSE)
      .reduce((sum, entry) => sum + Number(entry.amount), 0);

    return {
      totalBudget,
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
    };
  }, [activeFinanceEntries]);

  const contributionRows = useMemo(() => {
    const grouped = new Map<string, number>();

    activeFinanceEntries
      .filter((entry) => entry.type === FinanceEntryType.INCOME)
      .forEach((entry) => {
        const contributor =
          entry.source?.trim() ||
          entry.createdBy?.name ||
          entry.createdBy?.email ||
          'Тодорхойгүй';

        grouped.set(contributor, (grouped.get(contributor) || 0) + Number(entry.amount));
      });

    return Array.from(grouped.entries())
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [activeFinanceEntries]);

  const loadFinance = async () => {
    try {
      setLoading(true);
      setFinanceError(null);
      const entryData = await financeAPI.list();
      setEntries(entryData);
    } catch (error: unknown) {
      setFinanceError(getApiErrorMessage(error, 'Санхүүгийн мэдээлэл татахад алдаа гарлаа.'));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFinanceEntry = async (entry: CreateFinanceEntryRequest) => {
    try {
      setFinanceError(null);
      await financeAPI.create(entry);
      await loadFinance();
    } catch (error: unknown) {
      setFinanceError(getApiErrorMessage(error, 'Санхүүгийн мөр нэмэхэд алдаа гарлаа.'));
      throw error; // Let the editor component handle UI
    }
  };

  const handleStatusChange = async (entryId: string, status: FinanceStatus) => {
    try {
      await financeAPI.update(entryId, { status });
      await loadFinance();
    } catch (error: unknown) {
      setFinanceError(getApiErrorMessage(error, 'Төлөв шинэчлэхэд алдаа гарлаа.'));
    }
  };

  const loadMemberPosts = async () => {
    try {
      setLoadingPosts(true);
      setPostsError(null);
      const posts = await postsAPI.list({
        visibility: Visibility.PRIVATE,
        status: PostStatus.PUBLISHED,
        sort: 'CREATED_AT_DESC',
        take: 8,
      });
      setMemberPosts(posts);
    } catch (error: unknown) {
      setPostsError(getApiErrorMessage(error, 'Only Members нийтлэл татахад алдаа гарлаа.'));
    } finally {
      setLoadingPosts(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    loadFinance();
    loadMemberPosts();
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) return;
    usersAPI
      .listUsers({ isActive: true })
      .then((allUsers) => {
        const eligibleManagers = allUsers.filter(
          (candidate) => candidate.membershipLevel !== MembershipLevel.REGULAR_USER
        );
        setManagers(eligibleManagers);
      })
      .catch(() => setManagers([]));
  }, [isAuthenticated, isAdmin]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#fafafa]">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="premium-card max-w-md p-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
              <Lock className="h-7 w-7 text-brand animate-pulse" />
            </div>
            <h1 className="mt-4 text-2xl font-bold text-gray-900">Only Members</h1>
            <p className="mt-3 text-gray-600">Нэвтрэлтийг шалгаж байна...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated || !isMemberOnlyAreaAllowed) {
    return (
      <div className="min-h-screen flex flex-col bg-[#fafafa]">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="premium-card max-w-md p-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
              <Lock className="h-7 w-7 text-brand" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Only Members</h1>
            <p className="mt-3 text-gray-600">
              {!isAuthenticated
                ? 'Энэ хэсгийг үзэхийн тулд нэвтрэх шаардлагатай.'
                : `Таны бүртгэл одоогоор “${user?.membershipLevel || 'UNKNOWN'}” түвшинд байна. Энэ хэсэг зөвхөн баталгаажсан гишүүдэд нээлттэй.`}
            </p>
            <Link href="/login" className="btn-primary mt-6 inline-flex">Нэвтрэх</Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#fafafa]">
      <Header />
      <main className="flex-1 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand">Private Area</p>
            <h1 className="mt-2 text-3xl font-bold text-gray-900">Дотоод булан</h1>
          </div>

          <div className="mb-8 flex justify-center">
            <div className="inline-flex rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
              <button
                type="button"
                onClick={() => setActiveTab('posts')}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                  activeTab === 'posts'
                    ? 'bg-brand text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Only Members Posts
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('finance')}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                  activeTab === 'finance'
                    ? 'bg-brand text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Finance
              </button>
            </div>
          </div>

          {activeTab === 'posts' && (
            <section className="mx-auto max-w-4xl premium-card p-6">
              <div className="mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-brand" />
                <h2 className="text-lg font-bold text-gray-900">Only Members Posts</h2>
              </div>
              {postsError && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {postsError}
                </div>
              )}
              <div className="space-y-3">
                {loadingPosts ? (
                  <p className="text-sm text-gray-500">Нийтлэлүүдийг уншиж байна...</p>
                ) : memberPosts.length === 0 ? (
                  <p className="text-sm text-gray-500">Одоогоор only members нийтлэл алга.</p>
                ) : (
                  memberPosts.map((post) => (
                    <Link
                      key={post.id}
                      href={`/article/${post.slug || post.id}`}
                      className="block rounded-lg border border-gray-200 bg-white px-3 py-3 transition-colors hover:border-brand/40 hover:bg-red-50/30"
                    >
                      <p className="text-sm font-semibold text-gray-900">{post.title}</p>
                      <p className="mt-1 text-xs text-gray-500">
                        {new Date(post.publishedAt || post.createdAt).toLocaleDateString('mn-MN')}
                      </p>
                      {post.summary && (
                        <p className="mt-2 line-clamp-2 text-sm text-gray-600">{post.summary}</p>
                      )}
                    </Link>
                  ))
                )}
              </div>
            </section>
          )}

          {activeTab === 'finance' && (
            <div className="mx-auto max-w-6xl">
              <FinanceViewer
                summary={dynamicSummary}
                entries={entries}
                contributionRows={contributionRows}
                loading={loading}
                isFinanceEditor={isFinanceEditor}
                onStatusChange={handleStatusChange}
                canManageEntry={canManageEntry}
                error={financeError}
                editor={
                  isFinanceEditor ? (
                    <FinanceEditor
                      onSubmit={handleCreateFinanceEntry}
                      managers={managers}
                      isAdmin={isAdmin}
                      error={financeError}
                    />
                  ) : undefined
                }
              />
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
