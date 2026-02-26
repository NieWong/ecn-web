'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import DOMPurify from 'dompurify';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { postsAPI } from '@/lib/api';
import { Post } from '@/lib/types';
import { getImageUrl, formatDate, calculateReadTime } from '@/lib/helpers';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Lock, Loader2, ArrowLeft } from 'lucide-react';

export default function ArticlePage() {
  const params = useParams();
  const slug = params.slug as string;

  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      loadPost();
    }
  }, [slug]);

  const loadPost = async () => {
    try {
      setIsLoading(true);
      const data = await postsAPI.get(slug);
      setPost(data);
    } catch (err: any) {
      console.error('Failed to load post:', err);
      if (err.response?.status === 404) {
        setError('Article not found.');
      } else if (err.response?.status === 403) {
        setError('This article is private. Please sign in to read it.');
      } else {
        setError('Failed to load article. Please try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center py-12">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              {error || 'Article not found'}
            </h2>
            <Link href="/">
              <Button variant="outline" className="mt-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const readTime = post.contentHtml ? calculateReadTime(post.contentHtml) : 5;
  const sanitizedContent = post.contentHtml ? DOMPurify.sanitize(post.contentHtml) : '';

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-12">
          {post.coverFile && (
            <div className="relative aspect-[16/7] overflow-hidden rounded-3xl bg-gray-100">
              <img
                src={getImageUrl(post.coverFile)}
                alt={post.title}
                className="h-full w-full object-cover"
              />
            </div>
          )}
        </section>

        <article className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 pb-16 pt-12">
          {post.visibility === 'PRIVATE' && (
            <div className="mb-6 inline-flex items-center space-x-2 rounded-full border border-black/10 bg-white px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-600">
              <Lock className="h-3 w-3" />
              <span>Members only</span>
            </div>
          )}

          {post.categories && post.categories.length > 0 && (
            <div className="mb-6 flex flex-wrap gap-2">
              {post.categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/?category=${category.id}`}
                  className="rounded-full border border-black/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-600 hover:border-gray-900 hover:text-gray-900"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          )}

          <h1 className="fade-up font-serif text-4xl font-semibold text-gray-900 leading-tight md:text-5xl">
            {post.title}
          </h1>

          {post.summary && (
            <p className="mt-6 text-lg text-gray-600 font-serif italic leading-relaxed">
              {post.summary}
            </p>
          )}

          {post.author && (
            <div className="mt-10 flex items-center justify-between border-y border-black/5 py-6">
              <div className="flex items-center space-x-4">
                <Link href={`/profile/${post.author.id}`}>
                  {post.author.profilePicture ? (
                    <img
                      src={getImageUrl(post.author.profilePicture)}
                      alt={post.author.name || 'Author'}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-900 text-white text-base font-medium">
                      {post.author.name?.[0]?.toUpperCase() || post.author.email[0]?.toUpperCase()}
                    </div>
                  )}
                </Link>
                <div>
                  <Link
                    href={`/profile/${post.author.id}`}
                    className="text-sm font-semibold text-gray-900 hover:underline"
                  >
                    {post.author.name || 'Anonymous'}
                  </Link>
                  <div className="mt-2 flex items-center space-x-4 text-xs uppercase tracking-[0.2em] text-gray-500">
                    <span className="flex items-center space-x-1">
                      <Calendar className="h-3.5 w-3.5" />
                      <time>{formatDate(post.publishedAt || post.createdAt)}</time>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{readTime} min</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div
            className="prose max-w-none font-serif"
            dangerouslySetInnerHTML={{ __html: sanitizedContent }}
            style={{
              fontSize: '20px',
              lineHeight: '1.7',
            }}
          />

          <div className="mt-12 border-t border-black/5 pt-8">
            <Link href="/">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Articles
              </Button>
            </Link>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
