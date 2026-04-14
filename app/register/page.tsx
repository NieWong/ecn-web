'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store/auth-store';
import { Button } from '@/components/ui/button';
import { Loader2, Mail, User as UserIcon, AlertCircle, CheckCircle, ArrowRight, Sparkles, PenSquare, BookOpen, Users } from 'lucide-react';

export default function RegisterPage() {
  const register = useAuthStore((state) => state.register);

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await register(email, name || undefined);
      setSuccess(true);
    } catch (err: unknown) {
      console.error('Registration error:', err);

      const status =
        typeof err === 'object' && err !== null && 'response' in err
          ? (err as { response?: { status?: number } }).response?.status
          : undefined;

      if (status === 409) {
        setError('Энэ имэйл хаягаар бүртгэл аль хэдийн үүссэн байна.');
      } else {
        setError('Алдаа гарлаа. Дахин оролдоно уу.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 py-12 bg-gradient-to-br from-gray-50 to-white">
        <div className="w-full max-w-md space-y-8 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-green-100">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
              Бүртгэл амжилттай!
            </h2>
            <div className="mt-6 premium-card p-6 text-left">
              <p className="text-sm text-gray-700 mb-3">
                Бүртгүүлсэнд баярлалаа. Таны хүсэлт админы зөвшөөрлийг хүлээж байна.
              </p>
              <p className="text-sm text-gray-600">
                Зөвшөөрөгдсөний дараа та нууц үгээ тохируулж,
                нийтлэл бичих боломжтой болно.
              </p>
            </div>
          </div>
          <div className="space-y-3">
            <Link href="/">
              <Button className="w-full btn-primary h-12">
                Нүүр хуудас руу
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" className="w-full rounded-xl h-12 border-gray-200">
                Нэвтрэх
              </Button>
            </Link>
            <Link href={email.trim() ? `/set-password?email=${encodeURIComponent(email.trim())}` : '/set-password'}>
              <Button variant="outline" className="w-full rounded-xl h-12 border-gray-200">
                Нууц үг тохируулах хуудас
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0a0a0a] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#e63946]/20 via-transparent to-[#f472b6]/10" />
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03]" />
        
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-12 w-16 items-center justify-center rounded-2xl bg-brand p-1 transition-transform group-hover:scale-105 overflow-hidden">
              <img src="/logo.png" alt="ECN Logo" className="h-full w-full rounded-xl object-cover" />
            </div>
            <div>
              <span className="text-2xl font-bold tracking-tight text-white">ECN</span>
              <span className="text-2xl font-light tracking-tight text-white/60">.Club</span>
            </div>
          </Link>
          
          <div className="space-y-8">
            <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight">
              Эдийн засагчдын клубт{' '}
              <span className="gradient-text">нэгдээрэй</span>
            </h1>
            
            <div className="space-y-4">
              {[
                { icon: PenSquare, text: 'Нийтлэл бичиж, мэдлэгээ хуваалцаарай' },
                { icon: BookOpen, text: 'Академик сургалт, хичээлд хамрагдаарай' },
                { icon: Users, text: '49 гишүүнтэй клубт нэгдээрэй' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-white/80">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-8">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-[#e63946] to-[#ff6b6b] ring-2 ring-[#0a0a0a]"
                />
              ))}
            </div>
            <p className="text-sm text-white/50">
              СЭЗИС-ийн дэргэдэх клуб
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 lg:px-12 bg-white">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="flex h-10 w-13 items-center justify-center rounded-xl bg-brand p-1 overflow-hidden">
                <img src="/logo.png" alt="ECN Logo" className="h-full w-full rounded-lg object-cover" />
              </div>
            </Link>
          </div>

          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#e63946]/10 px-3 py-1.5 text-xs font-semibold text-[#e63946] mb-4">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Гишүүнчлэл</span>
            </div
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
              Бүртгүүлэх
            </h2>
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
                  Имэйл хаяг <span className="text-red-500">*</span>
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
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Бүтэн нэр <span className="text-gray-400 text-xs">(заавал биш)</span>
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input-premium ml-12"
                    placeholder="Таны нэр"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-blue-50 border border-blue-100 p-4">
              <p className="text-xs text-blue-800">
                <strong>Анхаар:</strong> Таны бүртгэлийг админ хянах болно. 
                Зөвшөөрөгдсөний дараа нууц үгээ тохируулах боломжтой.
              </p>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full btn-accent h-12 text-base"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Бүртгэж байна...
                </>
              ) : (
                <>
                  Бүртгүүлэх
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
                <span className="text-gray-600">Бүртгэлтэй юу? </span>
                <Link href="/login" className="font-semibold text-[#e63946] hover:text-[#c1121f] transition-colors">
                  Нэвтрэх
                </Link>
              </p>
            </div>

            <p className="text-center text-xs text-gray-500">
              Бүртгүүлснээр та манай{' '}
              <Link href="/terms" className="text-gray-700 hover:text-[#e63946] transition-colors">
                Үйлчилгээний нөхцөл
              </Link>{' '}
              болон{' '}
              <Link href="/privacy" className="text-gray-700 hover:text-[#e63946] transition-colors">
                Нууцлалын бодлого
              </Link>
              -тай зөвшөөрч байна
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
