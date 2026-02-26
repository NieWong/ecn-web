'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { ArticleCard } from '@/components/articles/article-card';
import { usersAPI, postsAPI } from '@/lib/api';
import { PublicProfile, Post, PostStatus } from '@/lib/types';
import { getImageUrl } from '@/lib/helpers';
import { Button } from '@/components/ui/button';
import { Loader2, Mail, Globe, Facebook, Twitter, Linkedin, FileDown } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  const params = useParams();
  const userId = params.id as string;

  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      const data = await postsAPI.list({
        authorId: userId,
        status: PostStatus.PUBLISHED,
        sort: 'PUBLISHED_AT_DESC',
      });
      setPosts(data);
    } catch (err) {
      console.error('Failed to load posts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center py-12">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">{error}</h2>
            <Link href="/">
              <Button variant="outline" className="mt-4">
                Back to Home
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
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Profile Hero */}
        <section className="border-b border-black/5 py-16">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="text-center fade-up">
              {/* Profile Picture */}
              {profile.profilePicture ? (
                <img
                  src={getImageUrl(profile.profilePicture)}
                  alt={profile.name || 'User'}
                  className="mx-auto h-28 w-28 rounded-full object-cover border border-black/10"
                />
              ) : (
                <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-gray-900 text-white text-4xl font-semibold">
                  {profile.name?.[0]?.toUpperCase() || 'U'}
                </div>
              )}

              {/* Name */}
              <h1 className="mt-6 font-serif text-4xl font-semibold text-gray-900">
                {profile.name || 'Anonymous User'}
              </h1>

              {/* About Me */}
              {profile.aboutMe && (
                <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
                  {profile.aboutMe}
                </p>
              )}

              {/* Social Links */}
              <div className="mt-6 flex items-center justify-center space-x-4">
                {profile.website && (
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <Globe className="h-5 w-5" />
                  </a>
                )}
                {profile.facebook && (
                  <a
                    href={profile.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <Facebook className="h-5 w-5" />
                  </a>
                )}
                {profile.twitter && (
                  <a
                    href={profile.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <Twitter className="h-5 w-5" />
                  </a>
                )}
                {profile.linkedin && (
                  <a
                    href={profile.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <Linkedin className="h-5 w-5" />
                  </a>
                )}
              </div>

              {/* CV Download */}
              {profile.cvFile && (
                <div className="mt-6">
                  <a
                    href={getImageUrl(profile.cvFile)}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" className="rounded-full">
                      <FileDown className="mr-2 h-4 w-4" />
                      Download CV
                    </Button>
                  </a>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Articles Section */}
        <section className="py-12">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-8">
              Published Articles ({posts.length})
            </h2>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">No articles published yet.</p>
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
      </main>

      <Footer />
    </div>
  );
}
