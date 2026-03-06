import { File, Post } from './types';

/**
 * Generate URL-friendly slug from title
 */
export function generateSlug(title: string): string {
  const slug = title
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return slug || `post-${Date.now()}`;
}

/**
 * Calculate estimated read time for article content
 */
export function calculateReadTime(html: string): number {
  const wordsPerMinute = 200;
  const text = html.replace(/<[^>]*>/g, '');
  const wordCount = text.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

/**
 * Format date relative to now
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Get full URL for uploaded image (supports both API File objects and local paths)
 */
export function getImageUrl(file: File | null | undefined): string {
  if (!file) return '/placeholder-image.jpg';
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000/api';
  return `${API_BASE.replace('/api', '')}/uploads/${file.storageKey}`;
}

/**
 * Get image URL - supports local paths, File objects, or returns placeholder
 */
export function getProfileImageUrl(
  localPath: string | null | undefined,
  file: File | null | undefined
): string {
  // Prefer local path if available
  if (localPath) return localPath;
  // Fall back to File object
  if (file) return getImageUrl(file);
  // Return placeholder
  return '/placeholder-image.jpg';
}

/**
 * Get cover image URL for posts - supports local paths or File objects
 */
export function getCoverImageUrl(
  localPath: string | null | undefined,
  file: File | null | undefined
): string {
  // Prefer local path if available
  if (localPath) return localPath;
  // Fall back to File object
  if (file) return getImageUrl(file);
  // Return placeholder
  return '/placeholder-image.jpg';
}

/**
 * Get canonical article URL with fallback for legacy posts that may have empty slug
 */
export function getPostUrl(post: Pick<Post, 'id' | 'slug'>): string {
  const slug = post.slug?.trim();
  const identifier = slug || post.id;
  return `/article/${identifier}`;
}

/**
 * Truncate text to specified length
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length).trim() + '...';
}

/**
 * Format large numbers (1.2k, 1.2M, etc.)
 */
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toString();
}
