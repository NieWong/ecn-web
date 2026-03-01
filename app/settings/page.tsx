'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/lib/store/auth-store';
import { usersAPI } from '@/lib/api';
import { uploadProfilePicture, uploadCV } from '@/lib/api/local-upload';
import { User, Globe, Twitter, Linkedin, CheckCircle, AlertCircle, Camera, FileText, Loader2, X } from 'lucide-react';

export default function SettingsPage() {
  const { user, isAuthenticated, refreshUser } = useAuthStore();
  const [name, setName] = useState('');
  const [aboutMe, setAboutMe] = useState('');
  const [website, setWebsite] = useState('');
  const [twitter, setTwitter] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [profilePicturePath, setProfilePicturePath] = useState<string | null>(null);
  const [cvFilePath, setCvFilePath] = useState<string | null>(null);
  const [isUploadingPicture, setIsUploadingPicture] = useState(false);
  const [isUploadingCV, setIsUploadingCV] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const profilePictureInputRef = useRef<HTMLInputElement>(null);
  const cvInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setAboutMe(user.aboutMe || '');
      setWebsite(user.website || '');
      setTwitter(user.twitter || '');
      setLinkedin(user.linkedin || '');
      setProfilePicturePath(user.profilePicturePath || null);
      setCvFilePath(user.cvFilePath || null);
    }
  }, [user]);

  const handleProfilePictureUpload = async (file: File) => {
    try {
      setIsUploadingPicture(true);
      setMessage(null);
      const path = await uploadProfilePicture(file);
      setProfilePicturePath(path);
      setMessage({ type: 'success', text: 'Зураг амжилттай байршлаа!' });
    } catch (err) {
      console.error('Profile picture upload failed:', err);
      setMessage({ type: 'error', text: 'Зураг байршуулахад алдаа гарлаа.' });
    } finally {
      setIsUploadingPicture(false);
    }
  };

  const handleCVUpload = async (file: File) => {
    try {
      setIsUploadingCV(true);
      setMessage(null);
      const path = await uploadCV(file);
      setCvFilePath(path);
      setMessage({ type: 'success', text: 'CV амжилттай байршлаа!' });
    } catch (err) {
      console.error('CV upload failed:', err);
      setMessage({ type: 'error', text: 'CV байршуулахад алдаа гарлаа.' });
    } finally {
      setIsUploadingCV(false);
    }
  };

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
        profilePicturePath: profilePicturePath,
        cvFilePath: cvFilePath,
      });
      await refreshUser();
      setMessage({ type: 'success', text: 'Профайл амжилттай шинэчлэгдлээ!' });
    } catch (err) {
      console.error('Update profile failed:', err);
      setMessage({ type: 'error', text: 'Профайл шинэчлэхэд алдаа гарлаа.' });
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
              <User className="h-8 w-8 text-gray-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Тохиргоо</h1>
            <p className="mt-3 text-gray-600">Профайлын тохиргоог шинэчлэхийн түлд нэвтрэнэ үү.</p>
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
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#e63946] mb-2">Тохиргоо</p>
            <h1 className="text-3xl font-bold text-gray-900">Профайлын тохиргоо</h1>
            <p className="mt-2 text-gray-600">Олон нийтийн профайлын мэдээллээ засах.</p>
          </div>

          {/* Message */}
          {message && (
            <div className={`mb-6 rounded-xl p-4 flex items-start gap-3 ${
              message.type === 'success' 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              {message.type === 'success' ? (
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
              )}
              <p className={`text-sm ${message.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
                {message.text}
              </p>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-6">
            {/* Profile Picture & CV */}
            <div className="premium-card p-6">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-6">
                Зураг & CV
              </h2>
              
              <div className="grid gap-6 sm:grid-cols-2">
                {/* Profile Picture */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Профайл зураг
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      {profilePicturePath ? (
                        <img
                          src={profilePicturePath}
                          alt="Profile"
                          className="h-20 w-20 rounded-full object-cover ring-2 ring-gray-200"
                        />
                      ) : (
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#e63946] to-[#ff6b6b] text-white text-2xl font-semibold ring-2 ring-gray-200">
                          {user?.name?.[0]?.toUpperCase() || user?.email[0]?.toUpperCase()}
                        </div>
                      )}
                      {profilePicturePath && (
                        <button
                          type="button"
                          onClick={() => setProfilePicturePath(null)}
                          className="absolute -top-1 -right-1 p-1 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                    <div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="rounded-lg"
                        disabled={isUploadingPicture}
                        onClick={() => profilePictureInputRef.current?.click()}
                      >
                        {isUploadingPicture ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Camera className="h-4 w-4 mr-2" />
                        )}
                        Зураг солих
                      </Button>
                      <p className="mt-2 text-xs text-gray-500">JPG, PNG, WebP. Max 5MB</p>
                    </div>
                    <input
                      ref={profilePictureInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleProfilePictureUpload(file);
                      }}
                    />
                  </div>
                </div>

                {/* CV Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    CV / Resume
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-gray-100 border-2 border-dashed border-gray-300">
                      <FileText className={`h-8 w-8 ${cvFilePath ? 'text-[#e63946]' : 'text-gray-400'}`} />
                    </div>
                    <div>
                      {cvFilePath ? (
                        <div className="flex items-center gap-2 mb-2">
                          <a 
                            href={cvFilePath} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-[#e63946] hover:underline"
                          >
                            CV татах
                          </a>
                          <button
                            type="button"
                            onClick={() => setCvFilePath(null)}
                            className="p-1 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ) : null}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="rounded-lg"
                        disabled={isUploadingCV}
                        onClick={() => cvInputRef.current?.click()}
                      >
                        {isUploadingCV ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <FileText className="h-4 w-4 mr-2" />
                        )}
                        {cvFilePath ? 'CV солих' : 'CV байршуулах'}
                      </Button>
                      <p className="mt-2 text-xs text-gray-500">PDF. Max 10MB</p>
                    </div>
                    <input
                      ref={cvInputRef}
                      type="file"
                      accept="application/pdf"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleCVUpload(file);
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Basic Info */}
            <div className="premium-card p-6">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-6">
                Үндсэн мэдээлэл
              </h2>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Нэр
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      className="input-premium pl-12"
                      placeholder="Таны нэр"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Миний тухай
                  </label>
                  <textarea
                    value={aboutMe}
                    onChange={(event) => setAboutMe(event.target.value)}
                    rows={4}
                    className="input-premium resize-none"
                    placeholder="Өөрийнхөө тоймлон хүргээрэй..."
                  />
                  <p className="mt-2 text-xs text-gray-500">
                    Профайлд харагдах тойм. URL болгоно.
                  </p>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="premium-card p-6">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-6">
                Сошиал линк
              </h2>
              
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Вэбсайт
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                      value={website}
                      onChange={(event) => setWebsite(event.target.value)}
                      className="input-premium pl-12"
                      placeholder="https://yoursite.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Twitter
                  </label>
                  <div className="relative">
                    <Twitter className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                      value={twitter}
                      onChange={(event) => setTwitter(event.target.value)}
                      className="input-premium pl-12"
                      placeholder="@username"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    LinkedIn
                  </label>
                  <div className="relative">
                    <Linkedin className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                      value={linkedin}
                      onChange={(event) => setLinkedin(event.target.value)}
                      className="input-premium pl-12"
                      placeholder="https://linkedin.com/in/username"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-4">
              <Link href={`/profile/${user.id}`}>
                <Button type="button" variant="outline" className="rounded-xl">
                  Профайл үзэх
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={isSaving}
                className="btn-primary"
              >
                {isSaving ? 'Хадгалж байна...' : 'Өөрчлөлт хадгалах'}
              </Button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
