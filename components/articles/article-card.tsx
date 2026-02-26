'use client';

import Link from 'next/link';
import { Post } from '@/lib/types';
import { getImageUrl, formatDate, calculateReadTime, truncate } from '@/lib/helpers';
import { Clock, Lock } from 'lucide-react';

interface ArticleCardProps {
  post: Post;
}

export function ArticleCard({ post }: ArticleCardProps) {
  const readTime = post.contentHtml ? calculateReadTime(post.contentHtml) : 5;
  const isPrivate = post.visibility === 'PRIVATE';

  return (
    <article className="group fade-up">
      <Link href={`/article/${post.slug}`} className="block">
        <div className="flex flex-col gap-4 border-b border-black/5 pb-8 pt-6 md:flex-row md:items-start">
          {post.coverFile && (
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-gray-100 md:w-56">
              <img
                src={getImageUrl(post.coverFile)}
                alt={post.title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {isPrivate && (
                <div className="absolute left-3 top-3 inline-flex items-center space-x-2 rounded-full bg-white/90 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-gray-800">
                  <Lock className="h-3 w-3" />
                  <span>Members</span>
                </div>
              )}
            </div>
          )}

          <div className="flex-1">
            <div className="mb-3 flex items-center space-x-3">
              {post.author?.profilePicture ? (
                <img
                  src={getImageUrl(post.author.profilePicture)}
                  alt={post.author.name || 'Author'}
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-900 text-white text-xs font-medium">
                  {post.author?.name?.[0]?.toUpperCase() || post.author?.email[0]?.toUpperCase() || 'A'}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
                  {post.author?.name || 'Anonymous'}
                </p>
              </div>
            </div>

            <h2 className="mb-3 font-serif text-2xl font-semibold text-gray-900 leading-snug group-hover:text-gray-700">
              {post.title}
            </h2>

            {post.summary && (
              <p className="mb-4 text-sm text-gray-600 line-clamp-2">
                {truncate(post.summary, 180)}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs uppercase tracking-[0.2em] text-gray-500">
              <time>{formatDate(post.publishedAt || post.createdAt)}</time>
              <span className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>{readTime} min</span>
              </span>
              {post.categories && post.categories.length > 0 && (
                <span className="rounded-full border border-black/10 px-3 py-1">
                  {post.categories[0].name}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}
