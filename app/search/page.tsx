'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { ArticleCard } from '@/components/articles/article-card';
import { postsAPI } from '@/lib/api';
import { Post, PostStatus, Visibility } from '@/lib/types';
import { Loader2, Search, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
    <div className="min-h-screen flex flex-col bg-[#fafafa]">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#e63946] mb-2">Хайлт</p>
            <h1 className="text-3xl font-bold text-gray-900">
              {query ? `"${query}" хайлтын үр дүн` : 'Нийтлэл хайх'}
            </h1>
            {query && posts.length > 0 && (
              <p className="mt-2 text-gray-600">{posts.length} нийтлэл олдлоо</p>
            )}
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <Loader2 className="h-10 w-10 animate-spin text-[#e63946] mx-auto" />
                <p className="mt-4 text-sm text-gray-500">Хайж байна...</p>
              </div>
            </div>
          ) : error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          ) : posts.length === 0 ? (
            <div className="premium-card p-12 text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-6">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {query ? 'Үр дүн олдсонгүй' : 'Хайлт эхлүүлэх'}
              </h3>
              <p className="text-gray-600 mb-6">
                {query ? `"${query}" нийтлэл олдсонгүй.` : 'Хайлтын үг оруулна уу.'}
              </p>
              <Link href="/">
                <Button variant="outline" className="rounded-xl">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Нүүр хуудас руу
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
