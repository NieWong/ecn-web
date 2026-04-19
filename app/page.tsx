'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { ArticleCard } from '@/components/articles/article-card';
import { TopStories } from '@/components/articles/top-stories';
import { TrendingSidebar } from '@/components/articles/trending-sidebar';
import { postsAPI, categoriesAPI } from '@/lib/api';
import { Post, Category, PostStatus } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ArrowRight, Loader2, Sparkles, Clock, Zap } from 'lucide-react';
import { calculateReadTime, formatDate, getCoverImageUrl, getProfileImageUrl, getPostUrl } from '@/lib/helpers';
import { useAuthStore } from '@/lib/store/auth-store';

export default function Home() {
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (authLoading) return;
    loadPosts();
  }, [selectedCategory, isAuthenticated, authLoading]);

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
  const secondaryFeatured = posts.slice(1, 3);
  const topStories = posts.slice(0, 5);
  const streamPosts = posts.length > 3 ? posts.slice(3) : posts;
  const sidebarLatestPosts = posts.length > 5 ? posts.slice(5, 9) : posts.slice(0, 4);

  return (
    <div className="min-h-screen flex flex-col bg-[#fafafa]">
      <Header />

      {categories.length > 0 && (
        <section className="border-b border-gray-100 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-3 overflow-x-auto pb-1">
              <button
                type="button"
                onClick={() => setSelectedCategory(null)}
                className={`category-pill whitespace-nowrap ${selectedCategory === null ? 'active' : ''}`}
              >
                Бүгд
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setSelectedCategory(category.id)}
                  className={`category-pill whitespace-nowrap ${selectedCategory === category.id ? 'active' : ''}`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {!isLoading && !error && posts.length > 0 && (
        <section className="border-b border-gray-100">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid gap-4 lg:grid-cols-3 lg:grid-rows-2">
              {featuredPost && (
                <div className="lg:col-span-2 lg:row-span-2">
                  <Link href={getPostUrl(featuredPost)} className="group block h-full">
                    <article className="relative h-full min-h-[300px] lg:min-h-[500px] rounded-2xl overflow-hidden bg-gray-900">
                      {(featuredPost.coverImagePath || featuredPost.coverFile) && (
                        <img
                          src={getCoverImageUrl(featuredPost.coverImagePath, featuredPost.coverFile)}
                          alt={featuredPost.title}
                          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      )}
                      <div className="hero-overlay absolute inset-0" />
                      
                      <div className="absolute inset-0 flex flex-col justify-end p-6 lg:p-10">
                        <div className="mb-4 flex items-center gap-3">
                          <span className="category-pill active">
                            {featuredPost.categories?.[0]?.name || 'Featured'}
                          </span>
                        </div>
                        
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight max-w-2xl">
                          {featuredPost.title}
                        </h2>
                        
                        {featuredPost.summary && (
                          <p className="mt-4 text-base text-white/80 line-clamp-2 max-w-xl">
                            {featuredPost.summary}
                          </p>
                        )}
                        
                        <div className="mt-5 flex items-center gap-4">
                          <div className="flex items-center gap-3">
                            {(featuredPost.author?.profilePicturePath || featuredPost.author?.profilePicture) ? (
                              <img
                                src={getProfileImageUrl(featuredPost.author.profilePicturePath, featuredPost.author.profilePicture)}
                                alt={featuredPost.author.name || 'Зохиогч'}
                                className="h-9 w-9 rounded-full object-cover ring-2 ring-white/30"
                              />
                            ) : (
                              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#e63946] to-[#f472b6] text-white text-sm font-semibold ring-2 ring-white/30">
                                {featuredPost.author?.name?.[0]?.toUpperCase() || 'A'}
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-semibold text-white">
                                {featuredPost.author?.name || 'Нэргүй'}
                              </p>
                              <p className="text-xs text-white/60">
                                {formatDate(featuredPost.publishedAt || featuredPost.createdAt)}
                                {' · '}
                                {calculateReadTime(featuredPost.contentHtml || '')} мин унших
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </article>
                  </Link>
                </div>
              )}
              
              {secondaryFeatured.map((post) => (
                <div key={post.id} className="lg:col-span-1">
                  <Link href={getPostUrl(post)} className="group block h-full">
                    <article className="relative h-full min-h-[200px] lg:min-h-0 rounded-2xl overflow-hidden bg-gray-900">
                      {(post.coverImagePath || post.coverFile) && (
                        <img
                          src={getCoverImageUrl(post.coverImagePath, post.coverFile)}
                          alt={post.title}
                          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      )}
                      <div className="hero-overlay absolute inset-0" />
                      
                      <div className="absolute inset-0 flex flex-col justify-end p-5">
                        {post.categories?.[0] && (
                          <span className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#e63946]">
                            {post.categories[0].name}
                          </span>
                        )}
                        <h3 className="text-lg font-bold text-white leading-snug line-clamp-2">
                          {post.title}
                        </h3>
                        <div className="mt-2 flex items-center gap-2 text-xs text-white/60">
                          <span className="font-medium">{post.author?.name || 'Нэргүй'}</span>
                          <span>·</span>
                          <span>{formatDate(post.publishedAt || post.createdAt)}</span>
                        </div>
                      </div>
                    </article>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <main className="flex-1 py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {isLoading ? (  
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-[#e63946]" />
            </div>
          ) : error ? (
            <div className="text-center py-20 max-w-md mx-auto">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-50 flex items-center justify-center">
                <Zap className="h-8 w-8 text-red-500" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Холболтын алдаа</h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <Button onClick={loadPosts} className="btn-primary">
                Дахин оролдох
              </Button>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20 max-w-md mx-auto">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
                <Sparkles className="h-8 w-8 text-gray-400" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Нийтлэл байхгүй байна</h2>
              <p className="text-gray-600 mb-6">Өөрийн нийтлэлээ бичиж эхлээрэй.</p>
              <Link href="/write" className="btn-accent inline-flex items-center gap-2">
                Бичиж эхлэх
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <div className="grid gap-10 lg:grid-cols-3">
              {/* Main Stream */}
              <div className="lg:col-span-2">
                <div className="section-header">
                  <Clock className="h-4 w-4" />
                  <h2>Шинэ нийтлэлүүд</h2>
                </div>
                <div className="space-y-6">
                  {streamPosts.map((post) => (
                    <ArticleCard key={post.id} post={post} />
                  ))}
                </div>
                
                {/* Load More */}
                {posts.length >= 20 && (
                  <div className="mt-8 text-center">
                    <Button variant="outline" className="rounded-full px-8">
                      Цааш үзэх
                    </Button>
                  </div>
                )}
              </div>

              <div className="lg:col-span-1">
                <div className="sticky top-[180px] space-y-6">
                  <TopStories posts={topStories} />
                  <TrendingSidebar posts={sidebarLatestPosts} categories={categories} />
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
