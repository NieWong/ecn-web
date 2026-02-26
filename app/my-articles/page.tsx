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
import { Loader2 } from 'lucide-react';

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
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="max-w-md rounded-3xl border border-black/10 bg-white/90 p-8 text-center">
            <h1 className="font-serif text-2xl font-semibold text-gray-900">My articles</h1>
            <p className="mt-3 text-sm text-gray-600">Sign in to manage your drafts and published stories.</p>
            <div className="mt-6">
              <Link href="/login">
                <Button className="rounded-full bg-gray-900 text-white hover:bg-gray-800">Sign In</Button>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col gap-2">
            <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Library</p>
            <h1 className="font-serif text-3xl font-semibold text-gray-900">My articles</h1>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : error ? (
            <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          ) : posts.length === 0 ? (
            <div className="mt-8 rounded-3xl border border-black/10 bg-white/90 p-8 text-center">
              <p className="text-gray-600">No articles yet.</p>
              <Link href="/write" className="mt-4 inline-block text-sm font-semibold text-gray-900">
                Start your first story
              </Link>
            </div>
          ) : (
            <div className="mt-6 space-y-2">
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
