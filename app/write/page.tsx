'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useRouter, useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/lib/store/auth-store';
import { postsAPI, categoriesAPI } from '@/lib/api';
import { uploadArticleCover } from '@/lib/api/local-upload';
import { generateSlug, getImageUrl, getCoverImageUrl } from '@/lib/helpers';
import { PostStatus, Visibility, Post, Category } from '@/lib/types';
import { ImagePlus, Loader2, PenSquare, Eye, EyeOff, Link2, CheckCircle, AlertCircle, Save, Send } from 'lucide-react';

// Dynamically import RichEditor to avoid SSR issues with Quill
const RichEditor = dynamic(() => import('@/components/ui/rich-editor').then(mod => ({ default: mod.RichEditor })), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
    </div>
  ),
});

function WriteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');
  const { user, isAuthenticated } = useAuthStore();

  const [isLoadingPost, setIsLoadingPost] = useState(!!editId);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState<Visibility>(Visibility.PUBLIC);
  const [coverImagePath, setCoverImagePath] = useState<string | null>(null);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [slugLocked, setSlugLocked] = useState(false);

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await categoriesAPI.list();
        setCategories(data);
      } catch (err) {
        console.error('Failed to load categories:', err);
      } finally {
        setIsLoadingCategories(false);
      }
    };
    loadCategories();
  }, []);

  // Load post for editing
  useEffect(() => {
    if (editId) {
      loadPostForEditing(editId);
    }
  }, [editId]);

  const loadPostForEditing = async (id: string) => {
    try {
      setIsLoadingPost(true);
      const post = await postsAPI.get(id);
      setEditingPost(post);
      setTitle(post.title);
      setSlug(post.slug);
      setSummary(post.summary || '');
      setContent(post.contentHtml || '');
      setVisibility(post.visibility);
      // Load cover image - prefer local path, fallback to File object
      if (post.coverImagePath) {
        setCoverImagePath(post.coverImagePath);
      } else if (post.coverFile) {
        setCoverImagePath(getImageUrl(post.coverFile));
      }
      // Load categories
      if (post.categories) {
        setSelectedCategoryIds(post.categories.map(c => c.id));
      }
      setSlugLocked(true);
    } catch (err) {
      console.error('Failed to load post for editing:', err);
      setError('Failed to load article for editing.');
    } finally {
      setIsLoadingPost(false);
    }
  };

  useEffect(() => {
    if (!slugLocked) {
      setSlug(generateSlug(title));
    }
  }, [title, slugLocked]);

  const handleCoverUpload = async (file: File) => {
    try {
      setError(null);
      setIsUploadingCover(true);
      const path = await uploadArticleCover(file);
      setCoverImagePath(path);
    } catch (err) {
      console.error('Cover upload failed:', err);
      setError('Failed to upload cover image. Please try again.');
    } finally {
      setIsUploadingCover(false);
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

      if (editingPost) {
        // Update existing post
        await postsAPI.update(editingPost.id, {
          title: title.trim(),
          slug: slug.trim() || generateSlug(title),
          summary: summary.trim() || undefined,
          contentHtml: content,
          contentJson: {},
          status,
          visibility,
          coverImagePath: coverImagePath || undefined,
          categoryIds: selectedCategoryIds,
        });
        setSuccess(status === PostStatus.PUBLISHED ? 'Нийтлэл амжилттай шинэчлэгдлээ!' : 'Ноорог хадгалагдлаа!');
      } else {
        // Create new post
        await postsAPI.create({
          title: title.trim(),
          slug: slug.trim() || generateSlug(title),
          summary: summary.trim() || undefined,
          contentHtml: content,
          contentJson: {},
          status,
          visibility,
          coverImagePath: coverImagePath || undefined,
          categoryIds: selectedCategoryIds,
        });
        setSuccess(status === PostStatus.PUBLISHED ? 'Нийтлэл амжилттай нийтлэгдлээ!' : 'Ноорог хадгалагдлаа!');
      }

      setTimeout(() => router.push('/'), 1200);
    } catch (err) {
      console.error('Save article failed:', err);
      setError('Нийтлэл хадгалахад алдаа гарлаа.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex flex-col bg-[#fafafa]">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="premium-card max-w-md p-8 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-6">
              <PenSquare className="h-8 w-8 text-gray-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Нийтлэл бичих</h1>
            <p className="mt-3 text-gray-600">Нэвтрж нийтлэл бичиж эхлээрэй.</p>
            <div className="mt-6">
              <Link href="/login">
                <Button className="btn-primary">Нэвтрэх</Button>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#fafafa]">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
          {/* Page Header */}
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#e63946] mb-2">{editingPost ? 'Засах' : 'Бүтээх'}</p>
            <h1 className="text-3xl font-bold text-gray-900">{editingPost ? 'Нийтлэлийг засах' : 'Шинэ нийтлэл бичих'}</h1>
          </div>

          <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
            {/* Main Editor */}
            <div className="flex-1 space-y-6">
              {/* Action Bar */}
              <div className="premium-card p-4 flex flex-wrap items-center gap-3">
                <Button
                  className="btn-primary"
                  disabled={isSaving}
                  onClick={() => handleSave(PostStatus.PUBLISHED)}
                >
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                  Нийтлэх
                </Button>
                <Button
                  variant="outline"
                  className="rounded-xl"
                  disabled={isSaving}
                  onClick={() => handleSave(PostStatus.DRAFT)}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Ноорог хадгалах
                </Button>
                <div className="ml-auto flex items-center gap-2 text-sm text-gray-500">
                  {visibility === Visibility.PUBLIC ? (
                    <Eye className="h-4 w-4" />
                  ) : (
                    <EyeOff className="h-4 w-4" />
                  )}
                  <span className="capitalize">{visibility.toLowerCase()}</span>
                </div>
              </div>

              {/* Messages */}
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {success && (
                <div className="rounded-xl border border-green-200 bg-green-50 p-4 flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <p className="text-sm text-green-700">{success}</p>
                </div>
              )}

              {/* Title */}
              <div className="premium-card p-6">
                <label className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-3 block">
                  Гарчиг
                </label>
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Нийтлэлийн гарчиг..."
                  className="w-full border-b-2 border-gray-200 bg-transparent pb-4 text-3xl font-bold text-gray-900 placeholder:text-gray-300 outline-none focus:border-[#e63946] transition-colors"
                />
              </div>

              {/* Summary */}
              <div className="premium-card p-6">
                <label className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-3 block">
                  Товч агуулга
                </label>
                <textarea
                  value={summary}
                  onChange={(event) => setSummary(event.target.value)}
                  rows={3}
                  placeholder="Богино тайлбар..."
                  className="input-premium resize-none"
                />
              </div>

              {/* Content */}
              <div className="premium-card p-6">
                <label className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-3 block">
                  Контент
                </label>
                <RichEditor
                  value={content}
                  onChange={setContent}
                  placeholder="Нийтлэлээ бичиж эхлээрэй..."
                />
              </div>
            </div>

            {/* Sidebar */}
            <aside className="w-full space-y-6 lg:w-[320px]">
              {/* Cover Image */}
              <div className="premium-card p-6">
                <p className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-4">Нүүрний зураг</p>
                <div 
                  className={`rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 p-4 text-center hover:border-[#e63946] hover:bg-red-50/30 transition-colors cursor-pointer ${isUploadingCover ? 'opacity-50 pointer-events-none' : ''}`}
                  onClick={() => document.getElementById('cover-upload')?.click()}
                >
                  {isUploadingCover ? (
                    <div className="flex flex-col items-center gap-3 py-6 text-gray-400">
                      <Loader2 className="h-10 w-10 animate-spin text-[#e63946]" />
                      <span className="text-sm font-medium">Байршуулж байна...</span>
                    </div>
                  ) : coverImagePath ? (
                    <img src={coverImagePath} alt="Cover preview" className="h-40 w-full rounded-lg object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-3 py-6 text-gray-400">
                      <ImagePlus className="h-10 w-10" />
                      <span className="text-sm font-medium">Зураг оруулах</span>
                      <span className="text-xs">Санал болгох: 1200 x 630px</span>
                    </div>
                  )}
                </div>
                {coverImagePath && (
                  <button
                    type="button"
                    onClick={() => setCoverImagePath(null)}
                    className="mt-2 text-xs text-red-600 hover:text-red-800"
                  >
                    Зураг устгах
                  </button>
                )}
                <input
                  id="cover-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) {
                      handleCoverUpload(file);
                    }
                  }}
                />
              </div>

              {/* Slug */}
              <div className="premium-card p-6">
                <p className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-4">URL Холбоос</p>
                <div className="relative">
                  <Link2 className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    value={slug}
                    onChange={(event) => {
                      setSlug(event.target.value);
                      setSlugLocked(true);
                    }}
                    className="input-premium pl-12"
                  />
                </div>
                <p className="mt-3 text-xs text-gray-500">Гарчигаас автоматаар үүсгэгдэнэ.</p>
              </div>

              {/* Visibility */}
              <div className="premium-card p-6">
                <p className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-4">Харагдац</p>
                <div className="space-y-3">
                  <label className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer border-2 transition-colors ${
                    visibility === Visibility.PUBLIC 
                      ? 'border-[#e63946] bg-red-50/50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <input
                      type="radio"
                      checked={visibility === Visibility.PUBLIC}
                      onChange={() => setVisibility(Visibility.PUBLIC)}
                      className="sr-only"
                    />
                    <Eye className={`h-5 w-5 ${visibility === Visibility.PUBLIC ? 'text-[#e63946]' : 'text-gray-400'}`} />
                    <div>
                      <p className="font-medium text-gray-900">Олонд нээлттэй</p>
                      <p className="text-xs text-gray-500">Хэн ч унших боломжтой</p>
                    </div>
                  </label>
                  <label className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer border-2 transition-colors ${
                    visibility === Visibility.PRIVATE 
                      ? 'border-[#e63946] bg-red-50/50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <input
                      type="radio"
                      checked={visibility === Visibility.PRIVATE}
                      onChange={() => setVisibility(Visibility.PRIVATE)}
                      className="sr-only"
                    />
                    <EyeOff className={`h-5 w-5 ${visibility === Visibility.PRIVATE ? 'text-[#e63946]' : 'text-gray-400'}`} />
                    <div>
                      <p className="font-medium text-gray-900">Гишүүдэд зориулсан</p>
                      <p className="text-xs text-gray-500">Зөвхөн нэвтэрсэн хүмүүс унших</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Categories */}
              <div className="premium-card p-6">
                <p className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-4">Ангилал</p>
                {isLoadingCategories ? (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                  </div>
                ) : categories.length === 0 ? (
                  <p className="text-sm text-gray-500">Ангилал алга</p>
                ) : (
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <label key={category.id} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          checked={selectedCategoryIds.includes(category.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedCategoryIds([...selectedCategoryIds, category.id]);
                            } else {
                              setSelectedCategoryIds(selectedCategoryIds.filter(id => id !== category.id));
                            }
                          }}
                          className="w-4 h-4 rounded"
                        />
                        <span className="text-sm font-medium text-gray-900">{category.name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function WritePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col bg-[#fafafa]">
          <Header />
          <main className="flex-1 flex items-center justify-center px-4 py-16">
            <div className="text-center">
              <Loader2 className="h-10 w-10 animate-spin text-[#e63946] mx-auto" />
              <p className="mt-4 text-sm text-gray-500">Уншиж байна...</p>
            </div>
          </main>
          <Footer />
        </div>
      }
    >
      <WriteContent />
    </Suspense>
  );
}
