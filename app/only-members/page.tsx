'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { useAuthStore } from '@/lib/store/auth-store';
import { financeAPI, postsAPI, usersAPI } from '@/lib/api';
import {
  CreateFinanceEntryRequest,
  FinanceEntry,
  FinanceEntryType,
  FinanceStatus,
  FinanceSummary,
  MembershipLevel,
  Post,
  PostStatus,
  Role,
  User,
  Visibility,
} from '@/lib/types';
import { FileText, Wallet, Lock, Trash2 } from 'lucide-react';

const typeLabels: Record<FinanceEntryType, string> = {
  [FinanceEntryType.BUDGET]: 'Төсөв',
  [FinanceEntryType.INCOME]: 'Орлого',
  [FinanceEntryType.EXPENSE]: 'Зардал',
};

const statusLabels: Record<FinanceStatus, string> = {
  [FinanceStatus.PENDING]: 'Хүлээгдэж байна',
  [FinanceStatus.APPROVED]: 'Батлагдсан',
  [FinanceStatus.PAID]: 'Төлөгдсөн',
  [FinanceStatus.CANCELLED]: 'Цуцлагдсан',
};

const formatMNT = (value: number) => {
  return new Intl.NumberFormat('mn-MN', {
    style: 'currency',
    currency: 'MNT',
    maximumFractionDigits: 0,
  }).format(value);
};

const getApiErrorMessage = (error: unknown, fallback: string) => {
  const maybeError = error as { response?: { data?: { error?: string } } };
  return maybeError.response?.data?.error || fallback;
};

type FinanceFormState = Omit<CreateFinanceEntryRequest, 'amount'> & {
  amount: string;
};

export default function OnlyMembersPage() {
  const { isAuthenticated, isLoading: authLoading, user } = useAuthStore();
  const isAdmin = user?.role === Role.ADMIN;
  const isFinanceEditor = !!user && (isAdmin || user.isAccountant);
  const isMemberOnlyAreaAllowed =
    !!user && (isAdmin || user.isAccountant || user.membershipLevel !== MembershipLevel.REGULAR_USER);

  const [entries, setEntries] = useState<FinanceEntry[]>([]);
  const [summary, setSummary] = useState<FinanceSummary>({
    totalIncome: 0,
    totalExpense: 0,
    totalBudget: 0,
    balance: 0,
  });
  const [managers, setManagers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [memberPosts, setMemberPosts] = useState<Post[]>([]);
  const [postsError, setPostsError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FinanceFormState>({
    title: '',
    type: FinanceEntryType.BUDGET,
    amount: '',
    source: '',
    purpose: '',
    usedBy: '',
    status: FinanceStatus.PENDING,
    transactionDate: new Date().toISOString().slice(0, 10),
    managerId: null,
    notes: '',
  });

  const canManageEntry = useMemo(() => {
    return (entry: FinanceEntry) => {
      if (!user) return false;
      if (isFinanceEditor) return true;
      return entry.managerId === user.id;
    };
  }, [isFinanceEditor, user]);

  const loadFinance = async () => {
    try {
      setLoading(true);
      const [entryData, summaryData] = await Promise.all([
        financeAPI.list(),
        financeAPI.summary(),
      ]);
      setEntries(entryData);
      setSummary(summaryData);
    } catch (error: unknown) {
      setError(getApiErrorMessage(error, 'Санхүүгийн мэдээлэл татахад алдаа гарлаа.'));
    } finally {
      setLoading(false);
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

  const handleCreateEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);

      await financeAPI.create({
        ...form,
        amount: Number(form.amount.trim()),
        managerId: form.managerId || null,
        source: form.source || null,
        purpose: form.purpose || null,
        usedBy: form.usedBy || null,
        notes: form.notes || null,
      });

      setForm({
        title: '',
        type: FinanceEntryType.BUDGET,
        amount: '',
        source: '',
        purpose: '',
        usedBy: '',
        status: FinanceStatus.PENDING,
        transactionDate: new Date().toISOString().slice(0, 10),
        managerId: null,
        notes: '',
      });

      await loadFinance();
    } catch (error: unknown) {
      setError(getApiErrorMessage(error, 'Санхүүгийн мөр нэмэхэд алдаа гарлаа.'));
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (entryId: string, status: FinanceStatus) => {
    try {
      await financeAPI.update(entryId, { status });
      await loadFinance();
    } catch (error: unknown) {
      setError(getApiErrorMessage(error, 'Төлөв шинэчлэхэд алдаа гарлаа.'));
    }
  };

  const handleDelete = async (entryId: string) => {
    try {
      await financeAPI.remove(entryId);
      await loadFinance();
    } catch (error: unknown) {
      setError(getApiErrorMessage(error, 'Санхүүгийн мөр устгахад алдаа гарлаа.'));
    }
  };

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
            <h1 className="mt-2 text-3xl font-bold text-gray-900">Only Members</h1>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <section className="premium-card p-6">
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

            <section className="premium-card p-6">
              <div className="mb-4 flex items-center gap-2">
                <Wallet className="h-5 w-5 text-brand" />
                <h2 className="text-lg font-bold text-gray-900">Finance</h2>
              </div>
              {error && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                  <p className="text-xs text-gray-500">Төсөв</p>
                  <p className="mt-1 text-sm font-semibold text-gray-900">{formatMNT(summary.totalBudget)}</p>
                </div>
                <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2">
                  <p className="text-xs text-green-700">Орлого</p>
                  <p className="mt-1 text-sm font-semibold text-green-800">{formatMNT(summary.totalIncome)}</p>
                </div>
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
                  <p className="text-xs text-amber-700">Зардал</p>
                  <p className="mt-1 text-sm font-semibold text-amber-800">{formatMNT(summary.totalExpense)}</p>
                </div>
                <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2">
                  <p className="text-xs text-blue-700">Үлдэгдэл</p>
                  <p className="mt-1 text-sm font-semibold text-blue-800">{formatMNT(summary.balance)}</p>
                </div>
              </div>

              {isFinanceEditor && (
                <form onSubmit={handleCreateEntry} className="mb-5 grid gap-2 rounded-lg border border-gray-200 p-3">
                  <p className="text-sm font-semibold text-gray-900">Санхүүгийн мөр нэмэх</p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <input
                      value={form.title}
                      onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                      placeholder="Зүйл (жишээ: Хандив)"
                      className="rounded-md border border-gray-300 px-3 py-2 text-sm"
                      required
                    />
                    <input
                      type="text"
                      inputMode="numeric"
                      value={form.amount}
                      onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))}
                      placeholder="Дүн"
                      className="rounded-md border border-gray-300 px-3 py-2 text-sm"
                      required
                    />
                    <select
                      value={form.type}
                      onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value as FinanceEntryType }))}
                      className="rounded-md border border-gray-300 px-3 py-2 text-sm"
                    >
                      {Object.values(FinanceEntryType).map((value) => (
                        <option key={value} value={value}>{typeLabels[value]}</option>
                      ))}
                    </select>
                    <select
                      value={form.status}
                      onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value as FinanceStatus }))}
                      className="rounded-md border border-gray-300 px-3 py-2 text-sm"
                    >
                      {Object.values(FinanceStatus).map((value) => (
                        <option key={value} value={value}>{statusLabels[value]}</option>
                      ))}
                    </select>
                    <input
                      type="date"
                      value={form.transactionDate}
                      onChange={(e) => setForm((prev) => ({ ...prev, transactionDate: e.target.value }))}
                      className="rounded-md border border-gray-300 px-3 py-2 text-sm"
                      required
                    />
                    {isAdmin && (
                      <select
                        value={form.managerId || ''}
                        onChange={(e) => setForm((prev) => ({ ...prev, managerId: e.target.value || null }))}
                        className="rounded-md border border-gray-300 px-3 py-2 text-sm"
                      >
                        <option value="">Менежер сонгоогүй</option>
                        {managers.map((manager) => (
                          <option key={manager.id} value={manager.id}>
                            {manager.name || manager.email}
                          </option>
                        ))}
                      </select>
                    )}
                    <input
                      value={form.source || ''}
                      onChange={(e) => setForm((prev) => ({ ...prev, source: e.target.value }))}
                      placeholder="Орлого хаанаас"
                      className="rounded-md border border-gray-300 px-3 py-2 text-sm"
                    />
                    <input
                      value={form.purpose || ''}
                      onChange={(e) => setForm((prev) => ({ ...prev, purpose: e.target.value }))}
                      placeholder="Юунд зарцуулах"
                      className="rounded-md border border-gray-300 px-3 py-2 text-sm"
                    />
                    <input
                      value={form.usedBy || ''}
                      onChange={(e) => setForm((prev) => ({ ...prev, usedBy: e.target.value }))}
                      placeholder="Хэн ашигласан"
                      className="rounded-md border border-gray-300 px-3 py-2 text-sm"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-fit rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-50"
                  >
                    {saving ? 'Хадгалж байна...' : 'Нэмэх'}
                  </button>
                </form>
              )}

              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="border-b border-gray-200 px-3 py-2 text-left">Зүйл</th>
                      <th className="border-b border-gray-200 px-3 py-2 text-left">Төрөл</th>
                      <th className="border-b border-gray-200 px-3 py-2 text-left">Дүн</th>
                      <th className="border-b border-gray-200 px-3 py-2 text-left">Эх үүсвэр / зориулалт</th>
                      <th className="border-b border-gray-200 px-3 py-2 text-left">Хариуцагч</th>
                      <th className="border-b border-gray-200 px-3 py-2 text-left">Төлөв</th>
                      <th className="border-b border-gray-200 px-3 py-2 text-left">Үйлдэл</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={7} className="px-3 py-4 text-center text-gray-500">Уншиж байна...</td>
                      </tr>
                    ) : entries.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-3 py-4 text-center text-gray-500">Одоогоор санхүүгийн мэдээлэл алга.</td>
                      </tr>
                    ) : (
                      entries.map((entry) => (
                        <tr key={entry.id}>
                          <td className="border-b border-gray-100 px-3 py-2">
                            <div className="font-medium text-gray-900">{entry.title}</div>
                            <div className="text-xs text-gray-500">
                              {new Date(entry.transactionDate).toLocaleDateString('mn-MN')}
                            </div>
                          </td>
                          <td className="border-b border-gray-100 px-3 py-2">{typeLabels[entry.type]}</td>
                          <td className="border-b border-gray-100 px-3 py-2">{formatMNT(Number(entry.amount))}</td>
                          <td className="border-b border-gray-100 px-3 py-2">
                            <div>{entry.source || '-'}</div>
                            <div className="text-xs text-gray-500">{entry.purpose || '-'}</div>
                            <div className="text-xs text-gray-500">Ашигласан: {entry.usedBy || '-'}</div>
                          </td>
                          <td className="border-b border-gray-100 px-3 py-2">{entry.manager?.name || entry.manager?.email || '-'}</td>
                          <td className="border-b border-gray-100 px-3 py-2">
                            {canManageEntry(entry) ? (
                              <select
                                value={entry.status}
                                onChange={(e) => handleStatusChange(entry.id, e.target.value as FinanceStatus)}
                                className="rounded-md border border-gray-300 px-2 py-1 text-xs"
                              >
                                {Object.values(FinanceStatus).map((value) => (
                                  <option key={value} value={value}>{statusLabels[value]}</option>
                                ))}
                              </select>
                            ) : (
                              <span>{statusLabels[entry.status]}</span>
                            )}
                          </td>
                          <td className="border-b border-gray-100 px-3 py-2">
                            {canManageEntry(entry) ? (
                              <button
                                onClick={() => handleDelete(entry.id)}
                                className="rounded-md p-1 text-gray-500 hover:bg-red-50 hover:text-red-600"
                                title="Устгах"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            ) : (
                              <span className="text-xs text-gray-400">-</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
