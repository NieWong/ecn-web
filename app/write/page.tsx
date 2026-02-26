'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/lib/store/auth-store';
import { filesAPI, postsAPI } from '@/lib/api';
import { generateSlug } from '@/lib/helpers';
import { PostStatus, Visibility } from '@/lib/types';
import { ImagePlus, Loader2 } from 'lucide-react';

export default function WritePage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState<Visibility>(Visibility.PUBLIC);
  const [coverFileId, setCoverFileId] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [slugLocked, setSlugLocked] = useState(false);

  useEffect(() => {
    if (!slugLocked) {
      setSlug(generateSlug(title));
    }
  }, [title, slugLocked]);

  const handleCoverUpload = async (file: File) => {
    try {
      setError(null);
      const uploaded = await filesAPI.upload(file, Visibility.PUBLIC);
      setCoverFileId(uploaded.id);
      setCoverPreview(URL.createObjectURL(file));
    } catch (err) {
      console.error('Cover upload failed:', err);
      setError('Failed to upload cover image. Please try again.');
    }
  };

  const handleSave = async (status: PostStatus) => {
    if (!title.trim()) {
      setError('Title is required.');
      return;
    }

    if (!content.trim()) {
      setError('Content is required.');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      setSuccess(null);

      await postsAPI.create({
        title: title.trim(),
        slug: slug.trim() || generateSlug(title),
        summary: summary.trim() || undefined,
        contentHtml: content,
        contentJson: {},
        status,
        visibility,
        coverFileId: coverFileId || undefined,
        categoryIds: [],
      });

      setSuccess(status === PostStatus.PUBLISHED ? 'Article published.' : 'Draft saved.');
      setTimeout(() => router.push('/'), 1200);
    } catch (err) {
      console.error('Save article failed:', err);
      setError('Failed to save article. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="max-w-md rounded-3xl border border-black/10 bg-white/90 p-8 text-center">
            <h1 className="font-serif text-2xl font-semibold text-gray-900">Write an article</h1>
            <p className="mt-3 text-sm text-gray-600">Sign in to start writing and publishing.</p>
            <div className="mt-6">
              <Link href="/login">
                <Button className="rounded-full bg-gray-900 text-white hover:bg-gray-800">Sign In</Button>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
            <div className="flex-1 space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  className="rounded-full bg-gray-900 text-white hover:bg-gray-800"
                  disabled={isSaving}
                  onClick={() => handleSave(PostStatus.DRAFT)}
                >
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save draft'}
                </Button>
                <Button
                  variant="outline"
                  className="rounded-full"
                  disabled={isSaving}
                  onClick={() => handleSave(PostStatus.PUBLISHED)}
                >
                  Publish
                </Button>
                <p className="text-xs uppercase tracking-[0.2em] text-gray-500">{visibility}</p>
              </div>

              {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {error}
                </div>
              )}

              {success && (
                <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
                  {success}
                </div>
              )}

              <div className="rounded-3xl border border-black/10 bg-white/90 p-6">
                <label className="text-xs uppercase tracking-[0.2em] text-gray-500">Title</label>
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Write a clean, direct headline"
                  className="mt-3 w-full border-b border-black/10 bg-transparent pb-3 text-3xl font-serif text-gray-900 outline-none"
                />
              </div>

              <div className="rounded-3xl border border-black/10 bg-white/90 p-6">
                <label className="text-xs uppercase tracking-[0.2em] text-gray-500">Summary</label>
                <textarea
                  value={summary}
                  onChange={(event) => setSummary(event.target.value)}
                  rows={3}
                  placeholder="Give readers a one-paragraph overview."
                  className="mt-3 w-full resize-none rounded-2xl border border-black/10 bg-white p-4 text-sm text-gray-900 outline-none focus:border-black/40 focus:ring-2 focus:ring-black/10"
                />
              </div>

              <div className="rounded-3xl border border-black/10 bg-white/90 p-6">
                <label className="text-xs uppercase tracking-[0.2em] text-gray-500">Story</label>
                <textarea
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  rows={16}
                  placeholder="Start writing your story..."
                  className="mt-3 w-full resize-none rounded-2xl border border-black/10 bg-white p-4 text-base text-gray-900 outline-none focus:border-black/40 focus:ring-2 focus:ring-black/10"
                />
              </div>
            </div>

            <aside className="w-full space-y-6 lg:w-[320px]">
              <div className="rounded-3xl border border-black/10 bg-white/90 p-6">
                <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Cover image</p>
                <div className="mt-4 rounded-2xl border border-dashed border-black/20 bg-white p-4 text-center">
                  {coverPreview ? (
                    <img src={coverPreview} alt="Cover preview" className="h-40 w-full rounded-xl object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-sm text-gray-500">
                      <ImagePlus className="h-6 w-6" />
                      Upload a wide image
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="mt-4 w-full text-sm"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) {
                      handleCoverUpload(file);
                    }
                  }}
                />
              </div>

              <div className="rounded-3xl border border-black/10 bg-white/90 p-6">
                <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Slug</p>
                <input
                  value={slug}
                  onChange={(event) => {
                    setSlug(event.target.value);
                    setSlugLocked(true);
                  }}
                  className="mt-3 w-full rounded-2xl border border-black/10 bg-white px-4 py-2 text-sm text-gray-900 outline-none focus:border-black/40 focus:ring-2 focus:ring-black/10"
                />
                <p className="mt-2 text-xs text-gray-500">Auto-generated from the title unless edited.</p>
              </div>

              <div className="rounded-3xl border border-black/10 bg-white/90 p-6">
                <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Visibility</p>
                <div className="mt-3 flex flex-col gap-2">
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="radio"
                      checked={visibility === Visibility.PUBLIC}
                      onChange={() => setVisibility(Visibility.PUBLIC)}
                    />
                    Public
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="radio"
                      checked={visibility === Visibility.PRIVATE}
                      onChange={() => setVisibility(Visibility.PRIVATE)}
                    />
                    Members only
                  </label>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
