'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { ArticleCard } from '@/components/articles/article-card';
import { postsAPI } from '@/lib/api';
import { Post } from '@/lib/types';
import { useAuthStore } from '@/lib/store/auth-store';
import { Button } from '@/components/ui/button';
import { Loader2, PenSquare, Plus, FileText } from 'lucide-react';

export default function MyArticlesPage() {
  const { user, isAuthenticated } = useAuthStore();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadPosts();
    }
  }, [user]);

  const loadPosts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await postsAPI.list({ authorId: user?.id, sort: 'CREATED_AT_DESC' });
      setPosts(data);
    } catch (err) {
      console.error('Failed to load articles:', err);
      setError('Failed to load your articles.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex flex-col bg-[#fafafa]">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="premium-card max-w-md p-8 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-6">
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Миний нийтлэлүүд</h1>
            <p className="mt-3 text-gray-600">Нэвтрэж ноорог ба нийтлэлүүдээ засах.</p>
            <div className="mt-6">
              <Link href="/login">
                <Button className="btn-primary">Нэвтрэх</Button>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#fafafa]">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#e63946] mb-2">Миний</p>
              <h1 className="text-3xl font-bold text-gray-900">Миний нийтлэлүүд</h1>
            </div>
            <Link href="/write">
              <Button className="btn-primary">
                <Plus className="h-4 w-4 mr-2" />
                Шинэ бичих
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <Loader2 className="h-10 w-10 animate-spin text-[#e63946] mx-auto" />
                <p className="mt-4 text-sm text-gray-500">Ачаалж байна...</p>
              </div>
            </div>
          ) : error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          ) : posts.length === 0 ? (
            <div className="premium-card p-12 text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-6">
                <PenSquare className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Нийтлэл байхгүй байна</h3>
              <p className="text-gray-600 mb-6">Анхны нийтлэлээ бичиж эхлээрэй.</p>
              <Link href="/write">
                <Button className="btn-primary">
                  <Plus className="h-4 w-4 mr-2" />
                  Анхны нийтлэл бичих
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <ArticleCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
