'use client';

import { Post, Category } from '@/lib/types';
import { ArticleCard } from './article-card';
import { TrendingUp, Hash, Users, Award } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { MemberInfoModal } from '@/components/common/member-info-modal';

interface TrendingSidebarProps {
  posts?: Post[];
  categories?: Category[];
}

export function TrendingSidebar({ posts = [], categories = [] }: TrendingSidebarProps) {
  const [showMemberInfoModal, setShowMemberInfoModal] = useState(false);

  return (
    <aside className="space-y-6">
      {categories.length > 0 && (
        <div className="premium-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Hash className="h-4 w-4 text-[#e63946]" />
            <h3 className="text-sm font-bold uppercase tracking-wide text-gray-900">
              Ангилал
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.slice(0, 8).map((category) => (
              <Link
                key={category.id}
                href={`/search?category=${category.id}`}
                className="category-pill"
              >
                {category.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Latest Posts */}
      {posts.length > 0 && (
        <div className="premium-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-4 w-4 text-[#e63946]" />
            <h3 className="text-sm font-bold uppercase tracking-wide text-gray-900">
              Шинэ нийтлэлүүд
            </h3>
          </div>
          <div className="space-y-4">
            {posts.slice(0, 4).map((post) => (
              <ArticleCard key={post.id} post={post} variant="compact" />
            ))}
          </div>
        </div>
      )}

      {/* Club CTA */}
      <div className="rounded-2xl border border-white/10 p-6 bg-gradient-to-br from-[#0a0a0a] to-[#1a1a1a] text-white shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Award className="h-5 w-5 text-[#e63946]" />
          <h3 className="text-sm font-bold uppercase tracking-wide">
            Гишүүн болох
          </h3>
        </div>
        <p className="text-sm text-white/70 mb-4">
          Эдийн засагчдын клубт нэгдэж, мэдлэгээ хуваалцаарай.
        </p>
        <button
          onClick={() => setShowMemberInfoModal(true)}
          className="btn-accent w-full text-center block"
        >
          Бүртгүүлэх
        </button>
        <Link
          href="/about"
          className="block mt-3 text-center text-sm text-white/60 hover:text-white transition-colors"
        >
          Дэлгэрэнгүй →
        </Link>
      </div>

      <MemberInfoModal open={showMemberInfoModal} onClose={() => setShowMemberInfoModal(false)} />
    </aside>
  );
}
