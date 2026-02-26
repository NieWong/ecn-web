'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/lib/store/auth-store';
import { usersAPI } from '@/lib/api';

export default function SettingsPage() {
  const { user, isAuthenticated, refreshUser } = useAuthStore();
  const [name, setName] = useState('');
  const [aboutMe, setAboutMe] = useState('');
  const [website, setWebsite] = useState('');
  const [twitter, setTwitter] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setAboutMe(user.aboutMe || '');
      setWebsite(user.website || '');
      setTwitter(user.twitter || '');
      setLinkedin(user.linkedin || '');
    }
  }, [user]);

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      await usersAPI.updateProfile({
        name: name.trim() || undefined,
        aboutMe: aboutMe.trim() || undefined,
        website: website.trim() || undefined,
        twitter: twitter.trim() || undefined,
        linkedin: linkedin.trim() || undefined,
      });
      await refreshUser();
      setMessage('Profile updated.');
    } catch (err) {
      console.error('Update profile failed:', err);
      setMessage('Failed to update profile.');
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
            <h1 className="font-serif text-2xl font-semibold text-gray-900">Settings</h1>
            <p className="mt-3 text-sm text-gray-600">Sign in to update your profile settings.</p>
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
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col gap-2">
            <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Settings</p>
            <h1 className="font-serif text-3xl font-semibold text-gray-900">Profile</h1>
          </div>

          <form onSubmit={handleSave} className="mt-8 space-y-6">
            <div className="rounded-3xl border border-black/10 bg-white/90 p-6">
              <label className="text-xs uppercase tracking-[0.2em] text-gray-500">Name</label>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="mt-3 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-black/40 focus:ring-2 focus:ring-black/10"
              />
            </div>

            <div className="rounded-3xl border border-black/10 bg-white/90 p-6">
              <label className="text-xs uppercase tracking-[0.2em] text-gray-500">About</label>
              <textarea
                value={aboutMe}
                onChange={(event) => setAboutMe(event.target.value)}
                rows={5}
                className="mt-3 w-full resize-none rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-black/40 focus:ring-2 focus:ring-black/10"
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-3xl border border-black/10 bg-white/90 p-6">
                <label className="text-xs uppercase tracking-[0.2em] text-gray-500">Website</label>
                <input
                  value={website}
                  onChange={(event) => setWebsite(event.target.value)}
                  className="mt-3 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-black/40 focus:ring-2 focus:ring-black/10"
                />
              </div>
              <div className="rounded-3xl border border-black/10 bg-white/90 p-6">
                <label className="text-xs uppercase tracking-[0.2em] text-gray-500">Twitter</label>
                <input
                  value={twitter}
                  onChange={(event) => setTwitter(event.target.value)}
                  className="mt-3 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-black/40 focus:ring-2 focus:ring-black/10"
                />
              </div>
              <div className="rounded-3xl border border-black/10 bg-white/90 p-6">
                <label className="text-xs uppercase tracking-[0.2em] text-gray-500">LinkedIn</label>
                <input
                  value={linkedin}
                  onChange={(event) => setLinkedin(event.target.value)}
                  className="mt-3 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-black/40 focus:ring-2 focus:ring-black/10"
                />
              </div>
            </div>

            {message && (
              <div className="rounded-2xl border border-black/10 bg-white/90 p-4 text-sm text-gray-600">
                {message}
              </div>
            )}

            <Button
              type="submit"
              disabled={isSaving}
              className="rounded-full bg-gray-900 text-white hover:bg-gray-800"
            >
              {isSaving ? 'Saving...' : 'Save changes'}
            </Button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
