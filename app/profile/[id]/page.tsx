'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { ArticleCard } from '@/components/articles/article-card';
import { usersAPI, postsAPI } from '@/lib/api';
import { PublicProfile, Post, PostStatus } from '@/lib/types';
import { getImageUrl, getProfileImageUrl } from '@/lib/helpers';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/lib/store/auth-store';
import { Loader2, Facebook, Instagram, Linkedin, Eye, User, ArrowLeft, PenSquare, Settings, Clock, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  const params = useParams();
  const userId = params.id as string;
  const { user } = useAuthStore();

  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [pendingPosts, setPendingPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isOwnProfile = user?.id === userId;

  useEffect(() => {
    if (userId) {
      loadProfile();
      loadUserPosts();
    }
  }, [userId]);

  const loadProfile = async () => {
    try {
      const data = await usersAPI.getPublicProfile(userId);
      setProfile(data);
    } catch (err) {
      console.error('Failed to load profile:', err);
      setError('Failed to load profile.');
    }
  };

  const loadUserPosts = async () => {
    try {
      setIsLoading(true);
      const publishedData = await postsAPI.list({
        authorId: userId,
        status: PostStatus.PUBLISHED,
        sort: 'PUBLISHED_AT_DESC',
      });
      setPosts(publishedData);

      // Load pending posts if this is the user's own profile
      if (isOwnProfile) {
        const pendingData = await postsAPI.list({
          authorId: userId,
          status: PostStatus.DRAFT,
          sort: 'CREATED_AT_DESC',
        });
        // Filter for unapproved posts only
        const unapproved = pendingData.filter((post: any) => !post.isApproved);
        setPendingPosts(unapproved);
      }
    } catch (err) {
      console.error('Failed to load posts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-[#fafafa]">
        <Header />
        <main className="flex-1 flex items-center justify-center py-16 px-4">
          <div className="premium-card max-w-md p-8 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-6">
              <User className="h-8 w-8 text-[#e63946]" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">{error}</h2>
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

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col bg-[#fafafa]">
        <Header />
        <main className="flex-1 flex items-center justify-center py-16">
          <div className="text-center">
            <Loader2 className="h-10 w-10 animate-spin text-[#e63946] mx-auto" />
            <p className="mt-4 text-sm text-gray-500">Профайл ачаалж байна...</p>
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
        {/* Profile Hero */}
        <section className="relative bg-gradient-to-b from-[#0a0a0a] to-[#1a1a1a] py-20">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
          <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="text-center fade-up">
              {/* Profile Picture */}
              {(profile.profilePicturePath || profile.profilePicture) ? (
                <img
                  src={getProfileImageUrl(profile.profilePicturePath, profile.profilePicture)}
                  alt={profile.name || 'User'}
                  className="mx-auto h-32 w-32 rounded-full object-cover ring-4 ring-white/10 shadow-2xl"
                />
              ) : (
                <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-[#e63946] to-[#ff6b6b] text-white text-5xl font-bold ring-4 ring-white/10 shadow-2xl">
                  {profile.name?.[0]?.toUpperCase() || 'U'}
                </div>
              )}

              {/* Name */}
              <h1 className="mt-6 text-4xl font-bold text-white">
                {profile.name || 'Нэргүй хэрэглэгч'}
              </h1>

              {/* About Me */}
              {profile.aboutMe && (
                <p className="mt-4 text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
                  {profile.aboutMe}
                </p>
              )}

              {/* Social Links */}
              <div className="mt-8 flex items-center justify-center gap-4">
                {profile.facebook && (
                  <a
                    href={profile.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-full bg-white/10 text-white hover:bg-[#1877F2] transition-colors"
                    title="Facebook"
                  >
                    <Facebook className="h-5 w-5" />
                  </a>
                )}
                {profile.twitter && (
                  <a
                    href={profile.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-full bg-white/10 text-white hover:bg-black transition-colors"
                    title="Instagram"
                  >
                    <Instagram className="h-5 w-5" />
                  </a>
                )}
                {profile.linkedin && (
                  <a
                    href={profile.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-full bg-white/10 text-white hover:bg-[#0077B5] transition-colors"
                    title="LinkedIn"
                  >
                    <Linkedin className="h-5 w-5" />
                  </a>
                )}
              </div>

              {/* CV Preview & Settings */}
              <div className="mt-8 flex items-center justify-center gap-4">
                {(profile.cvFilePath || profile.cvFile) && (
                  <a
                    href={profile.cvFilePath || getImageUrl(profile.cvFile!)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button className="rounded-xl bg-white text-gray-900 hover:bg-gray-100">
                      <Eye className="mr-2 h-4 w-4" />
                      Анкет үзэх
                    </Button>
                  </a>
                )}
                {isOwnProfile && (
                  <Link href="/settings">
                    <Button className="rounded-xl bg-[#e63946] text-white hover:bg-[#d63041]">
                      <Settings className="mr-2 h-4 w-4" />
                      Тохиргоо
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Pending Articles Section - Only for own profile */}
        {isOwnProfile && pendingPosts.length > 0 && (
          <section className="py-16 bg-orange-50/50">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between mb-10">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-orange-600 mb-1">Хүлээлтэй</p>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Баталгаажаалгахыг хүлээж байгаа нийтлэлүүд
                  </h2>
                  <p className="mt-2 text-sm text-gray-600">Админ баталгаажуулах хүртлээ эдгээр нийтлэл нөлөөллөөгүй харагдана.</p>
                </div>
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 text-sm font-semibold text-orange-700">
                  <Clock className="h-4 w-4" />
                  {pendingPosts.length} нийтлэл
                </span>
              </div>

              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                {pendingPosts.map((post) => (
                  <Link key={post.id} href={`/write?edit=${post.id}`}>
                    <div className="premium-card p-6 hover:shadow-lg transition-all cursor-pointer h-full flex flex-col">
                      {post.coverImagePath && (
                        <img
                          src={post.coverImagePath}
                          alt={post.title}
                          className="w-full h-40 object-cover rounded-lg mb-4"
                        />
                      )}
                      <div className="flex-1">
                        <div className="flex items-start gap-2 mb-2">
                          <AlertCircle className="h-4 w-4 text-orange-600 flex-shrink-0 mt-0.5" />
                          <p className="text-xs font-semibold uppercase tracking-wide text-orange-600">Баталгаажаалгахыг хүлээж байна</p>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">{post.title}</h3>
                        {post.summary && (
                          <p className="text-sm text-gray-600 line-clamp-2 mb-4">{post.summary}</p>
                        )}
                      </div>
                      <Button className="w-full mt-4" variant="outline">
                        <PenSquare className="h-4 w-4 mr-2" />
                        Засах
                      </Button>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Articles Section */}
        <section className="py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-10">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#e63946] mb-1">Нийтлэлүүд</p>
                <h2 className="text-2xl font-bold text-gray-900">
                  Нийтлэгдсэн бүтээл
                </h2>
              </div>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 text-sm font-semibold text-gray-700">
                <PenSquare className="h-4 w-4" />
                {posts.length} нийтлэл
              </span>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-[#e63946]" />
              </div>
            ) : posts.length === 0 ? (
              <div className="premium-card p-12 text-center">
                <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-6">
                  <PenSquare className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Нийтлэл байхгүй байна</h3>
                <p className="text-gray-600">Энэ зохиогч одоогоор нийтлэл нийтлээгүй байна.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                {posts.map((post) => (
                  <ArticleCard key={post.id} post={post} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* CV Preview Section */}
        {(profile.cvFilePath || profile.cvFile) && (
          <section className="py-16 bg-gray-50">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between mb-10">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#e63946] mb-1">Анкет</p>
                  <h2 className="text-2xl font-bold text-gray-900">
                    CV / Resume
                  </h2>
                </div>
                <a
                  href={profile.cvFilePath || getImageUrl(profile.cvFile!)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold text-[#e63946] hover:text-[#d63041] transition-colors"
                >
                  Бүтнээр нээх →
                </a>
              </div>
              
              <div className="premium-card overflow-hidden">
                <div className="relative w-full" style={{ height: '80vh', minHeight: '600px' }}>
                  <iframe
                    src={profile.cvFilePath || getImageUrl(profile.cvFile!)}
                    className="w-full h-full border-0"
                    title="CV Preview"
                  />
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
