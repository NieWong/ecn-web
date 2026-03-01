'use client';

import Link from 'next/link';
import { Post } from '@/lib/types';
import { getImageUrl, getCoverImageUrl, getProfileImageUrl, formatDate, calculateReadTime, truncate } from '@/lib/helpers';
import { Clock, Lock, MessageCircle, ArrowUpRight } from 'lucide-react';

interface ArticleCardProps {
  post: Post;
  variant?: 'default' | 'compact' | 'featured' | 'numbered';
  number?: number;
}

export function ArticleCard({ post, variant = 'default', number }: ArticleCardProps) {
  const readTime = post.contentHtml ? calculateReadTime(post.contentHtml) : 5;
  const isPrivate = post.visibility === 'PRIVATE';

  // Numbered variant (like "Top Stories" list)
  if (variant === 'numbered' && number) {
    return (
      <article className="group">
        <Link href={`/article/${post.slug}`} className="block">
          <div className="flex gap-4 py-4 border-b border-gray-100 hover:bg-gray-50/50 transition-colors -mx-4 px-4">
            <div className="number-badge flex-shrink-0">
              {number}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-[15px] text-gray-900 leading-snug group-hover:text-[#e63946] transition-colors line-clamp-2">
                {post.title}
              </h3>
              <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
                <span className="font-medium uppercase tracking-wide">
                  {post.author?.name || 'Anonymous'}
                </span>
                <span>{formatDate(post.publishedAt || post.createdAt)}</span>
              </div>
            </div>
            {(post.coverImagePath || post.coverFile) && (
              <div className="relative w-24 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={getCoverImageUrl(post.coverImagePath, post.coverFile)}
                  alt={post.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            )}
          </div>
        </Link>
      </article>
    );
  }

  // Compact variant for sidebar/lists
  if (variant === 'compact') {
    return (
      <article className="group">
        <Link href={`/article/${post.slug}`} className="block">
          <div className="flex gap-4 py-3">
            {(post.coverImagePath || post.coverFile) && (
              <div className="relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100">
                <img
                  src={getCoverImageUrl(post.coverImagePath, post.coverFile)}
                  alt={post.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm text-gray-900 leading-snug group-hover:text-[#e63946] transition-colors line-clamp-2">
                {post.title}
              </h3>
              <p className="mt-1.5 text-xs text-gray-500">
                {formatDate(post.publishedAt || post.createdAt)}
              </p>
            </div>
          </div>
        </Link>
      </article>
    );
  }

  // Featured variant (hero-style)
  if (variant === 'featured') {
    return (
      <article className="group relative h-full">
        <Link href={`/article/${post.slug}`} className="block h-full">
          <div className="relative h-full min-h-[400px] rounded-2xl overflow-hidden bg-gray-900">
            {(post.coverImagePath || post.coverFile) && (
              <img
                src={getCoverImageUrl(post.coverImagePath, post.coverFile)}
                alt={post.title}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            )}
            <div className="hero-overlay absolute inset-0" />
            
            <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8">
              {isPrivate && (
                <div className="mb-4 inline-flex self-start items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-800">
                  <Lock className="h-3 w-3" />
                  <span>Members Only</span>
                </div>
              )}
              
              {post.categories && post.categories[0] && (
                <span className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#e63946]">
                  {post.categories[0].name}
                </span>
              )}
              
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight">
                {post.title}
              </h2>
              
              {post.summary && (
                <p className="mt-3 text-sm sm:text-base text-white/80 line-clamp-2 max-w-2xl">
                  {post.summary}
                </p>
              )}
              
              <div className="mt-4 flex items-center gap-4 text-xs text-white/60">
                <span className="font-semibold uppercase tracking-wide text-white/80">
                  {post.author?.name || 'Anonymous'}
                </span>
                <span>{formatDate(post.publishedAt || post.createdAt)}</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {readTime} min
                </span>
              </div>
            </div>
          </div>
        </Link>
      </article>
    );
  }

  // Default variant (stream item)
  return (
    <article className="group fade-up">
      <Link href={`/article/${post.slug}`} className="block">
        <div className="stream-item flex flex-col gap-4 md:flex-row md:items-start">
          {/* Content */}
          <div className="flex-1 order-2 md:order-1">
            {/* Author & Category */}
            <div className="flex items-center gap-3 mb-3">
              {(post.author?.profilePicturePath || post.author?.profilePicture) ? (
                <img
                  src={getProfileImageUrl(post.author.profilePicturePath, post.author.profilePicture)}
                  alt={post.author.name || 'Author'}
                  className="h-7 w-7 rounded-full object-cover ring-2 ring-white"
                />
              ) : (
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#e63946] to-[#f472b6] text-white text-xs font-semibold">
                  {post.author?.name?.[0]?.toUpperCase() || 'A'}
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-900">
                  {post.author?.name || 'Anonymous'}
                </span>
                {post.categories && post.categories[0] && (
                  <>
                    <span className="text-gray-300">·</span>
                    <span className="text-xs font-medium text-[#e63946] uppercase tracking-wide">
                      {post.categories[0].name}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Title */}
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 leading-snug group-hover:text-[#e63946] transition-colors">
              {post.title}
            </h2>

            {/* Summary */}
            {post.summary && (
              <p className="mt-2 text-[15px] text-gray-600 line-clamp-2">
                {truncate(post.summary, 160)}
              </p>
            )}

            {/* Meta */}
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-500">
              <time className="font-medium">
                {formatDate(post.publishedAt || post.createdAt)}
              </time>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {readTime} min read
              </span>
              <span className="comments-count flex items-center gap-1 cursor-pointer">
                <MessageCircle className="h-3.5 w-3.5" />
                <span>Comments</span>
              </span>
              {isPrivate && (
                <span className="flex items-center gap-1 text-amber-600">
                  <Lock className="h-3.5 w-3.5" />
                  <span>Members</span>
                </span>
              )}
            </div>
          </div>

          {/* Image */}
          {(post.coverImagePath || post.coverFile) && (
            <div className="relative aspect-[16/10] w-full md:w-64 lg:w-72 flex-shrink-0 order-1 md:order-2 image-zoom rounded-xl overflow-hidden bg-gray-100">
              <img
                src={getCoverImageUrl(post.coverImagePath, post.coverFile)}
                alt={post.title}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          )}
        </div>
      </Link>
    </article>
  );
}
