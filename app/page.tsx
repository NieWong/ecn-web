'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { ArticleCard } from '@/components/articles/article-card';
import { postsAPI, categoriesAPI } from '@/lib/api';
import { Post, Category, PostStatus, Visibility } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ArrowRight, TrendingUp, Loader2 } from 'lucide-react';
import { calculateReadTime, formatDate } from '@/lib/helpers';

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCategories();
    loadPosts();
  }, [selectedCategory]);

  const loadCategories = async () => {
    try {
      const data = await categoriesAPI.list();
      setCategories(data);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const loadPosts = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await postsAPI.list({
        status: PostStatus.PUBLISHED,
        visibility: Visibility.PUBLIC,
        categoryId: selectedCategory || undefined,
        sort: 'PUBLISHED_AT_DESC',
        take: 20,
      });

      setPosts(data);
    } catch (err: any) {
      console.error('Failed to load posts:', err);

      if (err.response?.status === 500) {
        setError('Server error. Please check if the backend API is running properly.');
      } else if (err.code === 'ERR_NETWORK' || err.message.includes('Network Error')) {
        setError('Cannot connect to the API. Make sure the backend is running on http://localhost:4000');
      } else {
        setError('Failed to load articles. Please try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const featuredPost = posts[0];
  const secondaryPosts = posts.slice(1);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <section className="border-b border-black/5 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="fade-up text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-gray-500">ECN Journal</p>
            <h1 className="mt-6 font-serif text-5xl font-semibold tracking-tight text-gray-900 sm:text-6xl">
              A calmer way to read the world.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
              Modern reporting, thoughtful essays, and clear thinking from writers you can trust.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link href="/register">
                <Button size="lg" className="rounded-full bg-gray-900 px-8 text-white hover:bg-gray-800">
                  Start Reading
                </Button>
              </Link>
              <Link href="/write" className="text-sm font-semibold text-gray-700 hover:text-gray-900">
                Start Writing
              </Link>
            </div>
          </div>
        </div>
      </section>

      {categories.length > 0 && (
        <section className="border-b border-black/5 py-6">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-2 mb-4 text-xs uppercase tracking-[0.3em] text-gray-500">
              <TrendingUp className="h-4 w-4" />
              <h2>Trending topics</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition-colors ${
                  selectedCategory === null
                    ? 'border-gray-900 bg-gray-900 text-white'
                    : 'border-black/10 bg-white text-gray-600 hover:border-gray-900 hover:text-gray-900'
                }`}
              >
                All
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition-colors ${
                    selectedCategory === category.id
                      ? 'border-gray-900 bg-gray-900 text-white'
                      : 'border-black/10 bg-white text-gray-600 hover:border-gray-900 hover:text-gray-900'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      <main className="flex-1 py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-gray-600">{error}</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No articles found.</p>
              <Link href="/write" className="mt-4 inline-block text-gray-900 hover:underline">
                Be the first to write
              </Link>
            </div>
          ) : (
            <>
              {featuredPost && (
                <div className="mb-12">
                  <Link href={`/article/${featuredPost.slug}`}>
                    <div className="group relative overflow-hidden rounded-3xl border border-black/10 bg-white">
                      <div className="grid gap-8 p-8 md:grid-cols-[1.2fr_1fr]">
                        <div className="space-y-4">
                          <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Featured</p>
                          <h2 className="font-serif text-3xl font-semibold text-gray-900 md:text-4xl">
                            {featuredPost.title}
                          </h2>
                          {featuredPost.summary && (
                            <p className="text-sm text-gray-600">
                              {featuredPost.summary}
                            </p>
                          )}
                          <div className="flex items-center space-x-4 text-xs uppercase tracking-[0.2em] text-gray-500">
                            <span>{formatDate(featuredPost.publishedAt || featuredPost.createdAt)}</span>
                            <span>{calculateReadTime(featuredPost.contentHtml || '')} min</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                            Read story <ArrowRight className="h-4 w-4" />
                          </div>
                        </div>
                        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-gray-100">
                          {featuredPost.coverFile && (
                            <img
                              src={featuredPost.coverFile.storageKey
                                ? `${process.env.NEXT_PUBLIC_API_BASE?.replace('/api', '') || 'http://localhost:4000'}/uploads/${featuredPost.coverFile.storageKey}`
                                : '/placeholder-image.jpg'
                              }
                              alt={featuredPost.title}
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              )}

              <div className="space-y-2">
                {secondaryPosts.map((post) => (
                  <ArticleCard key={post.id} post={post} />
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
