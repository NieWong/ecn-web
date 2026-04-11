'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import DOMPurify from 'dompurify';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { postsAPI, filesAPI } from '@/lib/api';
import { Post, Role } from '@/lib/types';
import {
  getCoverImageUrl,
  getProfileImageUrl,
  formatDate,
  calculateReadTime,
} from '@/lib/helpers';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/lib/store/auth-store';
import {
  Calendar,
  Clock,
  Lock,
  Loader2,
  ArrowLeft,
  Share2,
  Bookmark,
  Twitter,
  Facebook,
  Linkedin,
  Edit,
  Trash2,
  AlertCircle,
  FileText,
  Download,
} from 'lucide-react';

export default function ArticlePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const slug = params.slug as string;

  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [downloadingFileId, setDownloadingFileId] = useState<string | null>(null);

  useEffect(() => {
    if (slug) loadPost();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const loadPost = async () => {
    try {
      setIsLoading(true);
      const data = await postsAPI.get(slug);
      setPost(data);
      setError(null);
    } catch (err: unknown) {
      console.error('Failed to load post:', err);
      const status =
        typeof err === 'object' && err !== null && 'response' in err
          ? (err as { response?: { status?: number } }).response?.status
          : undefined;

      if (status === 404) setError('Article not found.');
      else if (status === 403)
        setError('This article is private. Please sign in to read it.');
      else setError('Failed to load article. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!post) return;
    try {
      setIsDeleting(true);
      await postsAPI.delete(post.id);
      router.push('/');
    } catch (err) {
      console.error('Failed to delete article:', err);
      setDeleteConfirm(false);
      alert('Нийтлэл устгахад алдаа гарлаа.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDownloadAttachment = async (fileId: string, filename: string) => {
    try {
      setDownloadingFileId(fileId);
      const blob = await filesAPI.download(fileId);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download attachment:', err);
      alert('Файл татахад алдаа гарлаа.');
    } finally {
      setDownloadingFileId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#fafafa]">
        <Header />
        <main className="flex-1 flex items-center justify-center py-16">
          <div className="text-center">
            <Loader2 className="h-10 w-10 animate-spin text-[#e63946] mx-auto" />
            <p className="mt-4 text-sm text-gray-500">Нийтлэл ачаалж байна...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex flex-col bg-[#fafafa]">
        <Header />
        <main className="flex-1 flex items-center justify-center py-16 px-4">
          <div className="premium-card max-w-md p-8 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-6">
              <Lock className="h-8 w-8 text-[#e63946]" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              {error || 'Нийтлэл олдсонгүй'}
            </h2>
            <p className="text-gray-600 mb-6">
              Таны хайж буй нийтлэл устгагдсан эсвэл түр хүртээмжгүй байна.
            </p>
            <Link href="/">
              <Button className="btn-primary">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Нүүр хуудас руу
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const canEdit = !!user && (user.id === post.author?.id || user.role === Role.ADMIN);
  const readTime = post.contentHtml ? calculateReadTime(post.contentHtml) : 5;
  const sanitizedContent = post.contentHtml ? DOMPurify.sanitize(post.contentHtml) : '';

  return (
    <div className="min-h-screen flex flex-col bg-[#fafafa]">
      <Header />

      <main className="flex-1">
        {/* Hero Cover */}
        {(post.coverImagePath || post.coverFile) && (
          <section className="relative">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8">
              <div className="relative aspect-[21/9] overflow-hidden rounded-2xl bg-gray-100">
                <img
                  src={getCoverImageUrl(post.coverImagePath, post.coverFile)}
                  alt={post.title}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
              </div>
            </div>
          </section>
        )}

        {/* ONE consistent container for alignment */}
        <article className="pb-16 pt-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Header content */}
            <div className="mx-auto max-w-5xl">
              <div className="flex flex-wrap items-center gap-2">
                {post.visibility === 'PRIVATE' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-700">
                    <Lock className="h-3 w-3" />
                    Гишүүдэд зориулсан
                  </span>
                )}
                {post.categories?.map((category) => (
                  <Link
                    key={category.id}
                    href={`/?category=${category.id}`}
                    className="category-pill"
                  >
                    {category.name}
                  </Link>
                ))}
              </div>

              <h1 className="fade-up mt-5 font-source-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-[1.15] tracking-tight">
                {post.title}
              </h1>

              {post.summary && (
                <p className="mt-6 text-xl text-gray-600 font-source-serif leading-relaxed">
                  {post.summary}
                </p>
              )}

              {post.author && (
                <div className="mt-8 flex items-center justify-between gap-4 py-6 border-y border-gray-200">
                  <div className="flex items-center gap-4">
                    <Link href={`/profile/${post.author.id}`} className="flex-shrink-0">
                      {post.author.profilePicturePath || post.author.profilePicture ? (
                        <img
                          src={getProfileImageUrl(
                            post.author.profilePicturePath,
                            post.author.profilePicture
                          )}
                          alt={post.author.name || 'Author'}
                          className="h-12 w-12 rounded-full object-cover ring-2 ring-white"
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#e63946] to-[#ff6b6b] text-white text-base font-semibold ring-2 ring-white">
                          {post.author.name?.[0]?.toUpperCase() ||
                            post.author.email?.[0]?.toUpperCase()}
                        </div>
                      )}
                    </Link>

                    <div>
                      <Link
                        href={`/profile/${post.author.id}`}
                        className="text-base font-semibold text-gray-900 hover:text-[#e63946] transition-colors"
                      >
                        {post.author.name || 'Anonymous'}
                      </Link>
                      <div className="mt-1 flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="h-4 w-4" />
                          <time>{formatDate(post.publishedAt || post.createdAt)}</time>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="h-4 w-4" />
                          <span>{readTime} min read</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      className="p-2.5 rounded-full bg-gray-100 text-gray-600 hover:bg-[#e63946] hover:text-white transition-colors"
                      title="Хуваалцах"
                      type="button"
                    >
                      <Share2 className="h-4 w-4" />
                    </button>
                    <button
                      className="p-2.5 rounded-full bg-gray-100 text-gray-600 hover:bg-[#e63946] hover:text-white transition-colors"
                      title="Хадгалах"
                      type="button"
                    >
                      <Bookmark className="h-4 w-4" />
                    </button>

                    {canEdit && (
                      <>
                        <Link href={`/write?edit=${post.id}`}>
                          <button
                            className="p-2.5 rounded-full bg-gray-100 text-gray-600 hover:bg-[#e63946] hover:text-white transition-colors"
                            title="Засах"
                            type="button"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        </Link>
                        <button
                          onClick={() => setDeleteConfirm(true)}
                          className="p-2.5 rounded-full bg-gray-100 text-gray-600 hover:bg-red-600 hover:text-white transition-colors"
                          title="Устгах"
                          disabled={isDeleting}
                          type="button"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="mx-auto max-w-5xl">
              <div
                className="
      article-content prose prose-lg mx-auto font-source-serif text-gray-800
      break-normal
      prose-pre:max-w-full prose-pre:overflow-x-auto
      prose-table:block prose-table:max-w-full prose-table:overflow-x-auto
      prose-img:max-w-full prose-img:h-auto
    "
                dangerouslySetInnerHTML={{ __html: sanitizedContent }}
              />
            </div>

            {post.images && post.images.length > 0 && (
              <div className="mx-auto mt-8 max-w-5xl">
                <div className="rounded-xl border border-gray-200 bg-white p-5">
                  <h3 className="text-base font-semibold text-gray-900">Хавсралт файлууд</h3>
                  <div className="mt-3 space-y-2">
                    {post.images.map((postImage) => (
                      <div
                        key={postImage.fileId}
                        className="flex items-center justify-between gap-3 rounded-lg border border-gray-100 px-3 py-2"
                      >
                        <div className="min-w-0 flex items-center gap-2">
                          <FileText className="h-4 w-4 text-gray-500" />
                          <span className="truncate text-sm text-gray-700">{postImage.file.originalName}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDownloadAttachment(postImage.file.id, postImage.file.originalName)}
                          disabled={downloadingFileId === postImage.file.id}
                          className="inline-flex items-center gap-1 rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:border-[#e63946] hover:text-[#e63946] disabled:opacity-50"
                        >
                          {downloadingFileId === postImage.file.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Download className="h-3.5 w-3.5" />
                          )}
                          Татах
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Bottom sections */}
            <div className="mx-auto max-w-5xl">
              <div className="mt-12 pt-8 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700">
                    Энэ нийтлэлийг хуваалцах
                  </span>
                  <div className="flex items-center gap-3">
                    <button
                      className="p-2.5 rounded-full bg-gray-100 text-gray-600 hover:text-white transition-colors"
                      title="Twitter"
                      type="button"
                    >
                      <Twitter className="h-4 w-4" />
                    </button>
                    <button
                      className="p-2.5 rounded-full bg-gray-100 text-gray-600 hover:text-white transition-colors"
                      title="Facebook"
                      type="button"
                    >
                      <Facebook className="h-4 w-4" />
                    </button>
                    <button
                      className="p-2.5 rounded-full bg-gray-100 text-gray-600 hover:text-white transition-colors"
                      title="LinkedIn"
                      type="button"
                    >
                      <Linkedin className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {deleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                  <div className="bg-white rounded-2xl p-6 max-w-md mx-4 shadow-lg">
                    <div className="flex items-center gap-3 mb-4">
                      <AlertCircle className="h-6 w-6 text-red-600" />
                      <h3 className="text-lg font-bold text-gray-900">
                        Нийтлэлийг устгах уу?
                      </h3>
                    </div>
                    <p className="text-gray-600 mb-6">
                      Энэ үйлдлийг буцаах боломжгүй. Та нийтлэлээ мөнхөд устгахдаа итгэлтэй
                      байна уу?
                    </p>
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={() => setDeleteConfirm(false)}
                        disabled={isDeleting}
                        className="flex-1"
                      >
                        Цуцлах
                      </Button>
                      <Button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                      >
                        {isDeleting ? 'Устгаж байна...' : 'Устгах'}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {post.author && (
                <div className="mt-10 premium-card p-6">
                  <div className="flex items-start gap-4">
                    <Link href={`/profile/${post.author.id}`} className="flex-shrink-0">
                      {post.author.profilePicturePath || post.author.profilePicture ? (
                        <img
                          src={getProfileImageUrl(
                            post.author.profilePicturePath,
                            post.author.profilePicture
                          )}
                          alt={post.author.name || 'Author'}
                          className="h-16 w-16 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#e63946] to-[#ff6b6b] text-white text-xl font-semibold">
                          {post.author.name?.[0]?.toUpperCase() ||
                            post.author.email?.[0]?.toUpperCase()}
                        </div>
                      )}
                    </Link>

                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                        Бичсэн
                      </p>
                      <Link
                        href={`/profile/${post.author.id}`}
                        className="text-lg font-bold text-gray-900 hover:text-[#e63946] transition-colors"
                      >
                        {post.author.name || 'Нэргүй'}
                      </Link>
                      {post.author.aboutMe && (
                        <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                          {post.author.aboutMe}
                        </p>
                      )}
                      <Link href={`/profile/${post.author.id}`} className="mt-3 inline-block">
                        <Button variant="outline" size="sm" className="rounded-full text-xs">
                          Профайл үзэх
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-10">
                <Link href="/">
                  <Button variant="outline" className="rounded-xl">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Нийтлэлүүд руу
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}