'use client';

import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { useEffect, useState } from 'react';
import { postsAPI, categoriesAPI } from '@/lib/api';
import { Post, PostStatus, Visibility } from '@/lib/types';
import { getNewsCategory } from '@/lib/content-type';
import { ArticleCard } from '@/components/articles/article-card';

export default function NewsPage() {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    const loadNews = async () => {
      try {
        const categories = await categoriesAPI.list();
        const newsCategory = getNewsCategory(categories);

        if (!newsCategory) {
          setPosts([]);
          return;
        }

        const data = await postsAPI.list({
          status: PostStatus.PUBLISHED,
          visibility: Visibility.PUBLIC,
          categoryId: newsCategory.id,
          sort: 'PUBLISHED_AT_DESC',
          take: 30,
        });

        setPosts(data);
      } catch (err) {
        console.error('Failed to load news:', err);
      }
    };

    loadNews();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#fafafa]">
      <Header />
      <main className="flex-1 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Мэдээ, мэдээлэл</h1>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <div key={post.id} className="premium-card p-4">
                <ArticleCard post={post} variant="compact" />
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
