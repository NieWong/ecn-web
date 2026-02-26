'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { ArticleCard } from '@/components/articles/article-card';
import { postsAPI } from '@/lib/api';
import { Post, PostStatus, Visibility } from '@/lib/types';
import { Loader2 } from 'lucide-react';

export default function SearchPage() {
  const params = useSearchParams();
  const query = params.get('q') || '';
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (query) {
      loadResults();
    } else {
      setPosts([]);
      setIsLoading(false);
    }
  }, [query]);

  const loadResults = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await postsAPI.list({
        search: query,
        status: PostStatus.PUBLISHED,
        visibility: Visibility.PUBLIC,
        sort: 'PUBLISHED_AT_DESC',
        take: 20,
      });
      setPosts(data);
    } catch (err) {
      console.error('Search failed:', err);
      setError('Failed to fetch search results.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col gap-2">
            <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Search</p>
            <h1 className="font-serif text-3xl font-semibold text-gray-900">
              {query ? `Results for "${query}"` : 'Search'}
            </h1>
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
              <p className="text-gray-600">No results found.</p>
              <Link href="/" className="mt-4 inline-block text-sm font-semibold text-gray-900">
                Back to home
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
