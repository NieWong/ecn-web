'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store/auth-store';
import { Button } from '@/components/ui/button';
import { Loader2, Mail, Lock, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const forgotPassword = useAuthStore((state) => state.forgotPassword);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [forgotMessage, setForgotMessage] = useState<string | null>(null);
  const [showResetForm, setShowResetForm] = useState(false);

  const getLoginErrorMessage = (err: unknown) => {
    const status =
      typeof err === 'object' && err !== null && 'response' in err
        ? (err as { response?: { status?: number; data?: { message?: string } } }).response?.status
        : undefined;

    const message =
      typeof err === 'object' && err !== null && 'response' in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;

    if (status === 403) {
      return 'Таны бүртгэл одоогоор зөвшөөрөгдөөгүй байна. Админы зөвшөөрлийг хүлээнэ үү.';
    }
    if (status === 400 && typeof message === 'string' && message.toLowerCase().includes('password')) {
      return 'Эхлээд нууц үгээ тохируулна уу.';
    }
    if (status === 401) {
      return 'Имэйл эсвэл нууц үг буруу байна.';
    }
    return 'Алдаа гарлаа. Дахин оролдоно уу.';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login(email, password);
      router.push('/');
    } catch (err: unknown) {
      const status =
        typeof err === 'object' && err !== null && 'response' in err
          ? (err as { response?: { status?: number } }).response?.status
          : undefined;

      if (!status || status >= 500) {
        console.error('Login error:', err);
      }

      const resolvedMessage = getLoginErrorMessage(err);
      setError(resolvedMessage);

      if (status === 400 && resolvedMessage.includes('нууц үгээ')) {
        setTimeout(() => router.push('/set-password'), 2000);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setError('Нууц үг сэргээхийн тулд имэйлээ оруулна уу.');
      return;
    }

    try {
      setError(null);
      setShowResetForm(true);
      const response = await forgotPassword(email.trim());
      setForgotMessage(response.message || 'Нууц үг сэргээх хүсэлт илгээгдлээ. Админ шалгасны дараа дахин нууц үг тохируулах боломжтой болно.');
    } catch {
      setShowResetForm(true);
      setForgotMessage('Нууц үг сэргээх хүсэлт илгээгдлээ. Админ шалгасны дараа дахин нууц үг тохируулах боломжтой болно.');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0a0a0a] relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-brand/20 via-transparent to-[#f472b6]/10" />
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03]" />
        
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <Link href="/" className="flex items-center gap-3 group">
            <img src="/club_logo.png" alt="ECN Club" className="h-12 w-auto object-contain transition-transform group-hover:scale-105" />
            <div>
              <span className="text-2xl font-bold tracking-tight text-white">ECN</span>
              <span className="text-2xl font-light tracking-tight text-white/60">.Club</span>
            </div>
          </Link>
          
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-white/80">
              <Sparkles className="h-4 w-4 text-brand" />
              <span>Эдийн засагчдын клуб</span>
            </div>
            <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight">
              Монгол оюунаар{' '}
              <span className="gradient-text">дэлхийг тэтгэнэ</span>
            </h1>
            <p className="text-lg text-white/60 max-w-md">
              Өөрсдийн сонирхлоо нээн хөгжүүлж, хамтдаа тасралтгүй хичээн суралцаж 
              гишүүд болон нийгэмдээ үнэ цэнийг бүтээнэ.
            </p>
          </div>
          
          <div className="flex items-center gap-8">
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 lg:px-12 bg-white">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <img src="/club_logo.png" alt="ECN Club" className="h-10 w-auto object-contain" />
            </Link>
          </div>

          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
              {showResetForm ? 'Нууц үг сэргээлт' : 'Тавтай морилно уу'}
            </h2>
            {/* <p className="mt-3 text-gray-600">
              {showResetForm ? 'Таны хүсэлт илгээгдлээ' : 'Нэвтрэж унш, бичээрэй.'}
            </p> */}
          </div>

          {showResetForm ? (
            <div className="space-y-6">
              <div className="rounded-2xl border border-green-200 bg-green-50 p-6">
                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-green-100 p-3 mt-1">
                    <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-green-900">Нууц үг сэргээх хүсэлт илгээгдлээ</p>
                    <p className="mt-1 text-sm text-green-700">{forgotMessage}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 rounded-xl bg-gray-50 p-6 border border-gray-200">
                <h3 className="font-semibold text-gray-900">Дараагийн алхамууд:</h3>
                <ol className="space-y-3 text-sm text-gray-700">
                  <li className="flex gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-900 text-white text-xs font-semibold shrink-0">1</span>
                    <span>Админ таны хүсэлтийг шалгач баталгаажуулна</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-900 text-white text-xs font-semibold shrink-0">2</span>
                    <span>Зөвшөөрлийн мэдэгдэл авах болно</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-900 text-white text-xs font-semibold shrink-0">3</span>
                    <span>Нууц үг шинэчлэх хуудсыг нээж шинэ нууц үг тохируулна</span>
                  </li>
                </ol>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={() => {
                    setShowResetForm(false);
                    setForgotMessage(null);
                    setPassword('');
                  }}
                  className="w-full btn-primary h-12"
                >
                  Нэвтрэх дээр буцах
                </Button>
                <Link href="/notifications">
                  <Button variant="outline" className="w-full h-12">
                    Мэдэгдэло хүлээх
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            )}

            {forgotMessage && (
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                <p className="text-sm text-blue-800">{forgotMessage}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Имэйл хаяг
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-premium ml-12"
                    placeholder="таны@имэйл.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Нууц үг
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-premium ml-12"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary h-12 text-base"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Нэвтэрч байна...
                </>
              ) : (
                <>
                  Нэвтрэх
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-4 text-gray-500">эсвэл</span>
              </div>
            </div>

            <div className="space-y-3 text-center text-sm">
              <p>
                <span className="text-gray-600">Бүртгэлгүй юу? </span>
                <Link href="/register" className="font-semibold text-brand hover:text-brand-dark transition-colors">
                  Бүртгүүлэх
                </Link>
              </p>
              <p>
                <span className="text-gray-600">Шинэ хэрэглэгч үү? </span>
                <Link
                  href={email.trim() ? `/set-password?email=${encodeURIComponent(email.trim())}` : '/set-password'}
                  className="font-semibold text-brand hover:text-brand-dark transition-colors"
                >
                  Нууц үг тохируулах
                </Link>
              </p>
              <p>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Нууц үгээ мартсан уу?
                </button>
              </p>
            </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
