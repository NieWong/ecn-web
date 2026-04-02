'use client';

import { useState } from 'react';
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store/auth-store';
import { Button } from '@/components/ui/button';
import { Loader2, Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react';

export default function SetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setPasswordAction = useAuthStore((state) => state.setPassword);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPrefilledEmail, setIsPrefilledEmail] = useState(false);

  useEffect(() => {
    const queryEmail = searchParams.get('email');
    if (queryEmail) {
      setEmail(queryEmail);
      setIsPrefilledEmail(true);
      return;
    }
    setIsPrefilledEmail(false);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (password.length < 6) {
      setError('Нууц үг дорх нь 6 тэмдэгт байх ёстой.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Нууц үг таарчхгүй байна.');
      return;
    }

    setIsLoading(true);

    try {
      await setPasswordAction(email, password);
      router.push('/');
    } catch (err: any) {
      console.error('Set password error:', err);
      
      if (err.response?.status === 404) {
        setError('Бүртгэл олдсонгүй.');
      } else if (err.response?.status === 403) {
        setError('Таны бүртгэл одоогоор зөвшөөрөгдөөгүй байна. Админы зөвшөөрлийг хүлээнэ үү.');
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Алдаа гарлаа. Дахин оролдоно уу.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center justify-center space-x-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-black/10 bg-white text-sm font-semibold">
              ECN
            </div>
          </Link>
          <h2 className="mt-6 font-serif text-3xl font-semibold tracking-tight text-gray-900">
            Нууц үг тохируулах
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Бүртгэлээ дүүргэн бичиж эхлээрэй.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-2xl bg-red-50 border border-red-200 p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4 rounded-3xl border border-black/10 bg-white/90 px-6 py-8">
            <div className="rounded-2xl bg-blue-50 border border-blue-200 p-4 mb-4">
              <div className="flex">
                <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="ml-3">
                  <p className="text-sm text-blue-800">
                    Таны бүртгэл зөвшөөрөгдлөө! Бүртгэлээ дүүргэхийн тулд нууц үг тохируулаарай.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Имэйл хаяг
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  readOnly={isPrefilledEmail}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full rounded-2xl border border-black/10 py-3 pl-11 pr-4 text-gray-900 placeholder-gray-400 focus:border-black/40 focus:outline-none focus:ring-2 focus:ring-black/10 ${
                    isPrefilledEmail ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
                  }`}
                  placeholder="таны@имэйл.com"
                />
              </div>
              {isPrefilledEmail && (
                <p className="mt-1 text-xs text-gray-500">Имэйл автоматаар бөглөгдсөн тул өөрчлөхгүй.</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Шинэ нууц үг
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-2xl border border-black/10 bg-white py-3 pl-11 pr-4 text-gray-900 placeholder-gray-400 focus:border-black/40 focus:outline-none focus:ring-2 focus:ring-black/10"
                  placeholder="••••••••"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">Дорх нь 6 тэмдэгт байх</p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Нууц үг баталгаажуулах
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-2xl border border-black/10 bg-white py-3 pl-11 pr-4 text-gray-900 placeholder-gray-400 focus:border-black/40 focus:outline-none focus:ring-2 focus:ring-black/10"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-full bg-gray-900 py-6 text-base font-medium text-white hover:bg-gray-800"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Тохируулж байна...
                </>
              ) : (
                'Нууц үг тохируулах'
              )}
            </Button>
          </div>

          <div className="text-center text-sm">
            <Link href="/login" className="text-gray-600 hover:text-gray-900 hover:underline">
              Нэвтрэх руу буцах
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
