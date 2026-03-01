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

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login(email, password);
      router.push('/');
    } catch (err: any) {
      console.error('Login error:', err);
      
      if (err.response?.status === 403) {
        setError('Таны бүртгэл одоогоор зөвшөөрөгдөөгүй байна. Админы зөвшөөрлийг хүлээнэ үү.');
      } else if (err.response?.status === 400 && err.response?.data?.message?.includes('password')) {
        setError('Эхлээд нууц үгээ тохируулаарай.');
        setTimeout(() => router.push('/set-password'), 2000);
      } else if (err.response?.status === 401) {
        setError('Имэйл эсвэл нууц үг буруу байна.');
      } else {
        setError('Алдаа гарлаа. Дахин оролдоно уу.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0a0a0a] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#e63946]/20 via-transparent to-[#f472b6]/10" />
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03]" />
        
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#e63946] text-white font-bold text-xl transition-transform group-hover:scale-105">
              E
            </div>
            <div>
              <span className="text-2xl font-bold tracking-tight text-white">ECN</span>
              <span className="text-2xl font-light tracking-tight text-white/60">.Club</span>
            </div>
          </Link>
          
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-white/80">
              <Sparkles className="h-4 w-4 text-[#e63946]" />
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
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#e63946] text-white font-bold text-xl">
                E
              </div>
            </Link>
          </div>

          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
              Тавтай морилно уу
            </h2>
            <p className="mt-3 text-gray-600">
              Нэвтрэж унш, бичээрэй.
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
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
                <Link href="/register" className="font-semibold text-[#e63946] hover:text-[#c1121f] transition-colors">
                  Үнэгүй бүртгүүлэх
                </Link>
              </p>
              <p>
                <Link href="/set-password" className="text-gray-500 hover:text-gray-700 transition-colors">
                  Нууц үг тохируулах уу?
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
