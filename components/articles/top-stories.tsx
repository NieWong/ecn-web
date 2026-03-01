'use client';

import { Post } from '@/lib/types';
import { ArticleCard } from './article-card';

interface TopStoriesProps {
  posts: Post[];
  title?: string;
}

export function TopStories({ posts, title = 'Top Stories' }: TopStoriesProps) {
  if (posts.length === 0) return null;

  return (
    <section className="premium-card p-6">
      <div className="section-header">
        <h2>{title}</h2>
      </div>
      <div className="space-y-0">
        {posts.slice(0, 5).map((post, index) => (
          <ArticleCard
            key={post.id}
            post={post}
            variant="numbered"
            number={index + 1}
          />
        ))}
      </div>
    </section>
  );
}
