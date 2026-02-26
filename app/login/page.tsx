'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store/auth-store';
import { Button } from '@/components/ui/button';
import { Loader2, Mail, Lock, AlertCircle } from 'lucide-react';

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
        setError('Your account is not approved yet. Please wait for admin approval.');
      } else if (err.response?.status === 400 && err.response?.data?.message?.includes('password')) {
        setError('Please set your password first.');
        setTimeout(() => router.push('/set-password'), 2000);
      } else if (err.response?.status === 401) {
        setError('Invalid email or password.');
      } else {
        setError('An error occurred. Please try again.');
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
            Welcome back
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to continue reading and writing.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4 rounded-3xl border border-black/10 bg-white/90 px-6 py-8">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-2xl border border-black/10 bg-white py-3 pl-11 pr-4 text-gray-900 placeholder-gray-400 focus:border-black/40 focus:outline-none focus:ring-2 focus:ring-black/10"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </Button>
          </div>

          <div className="text-center text-sm">
            <span className="text-gray-600">Don't have an account? </span>
            <Link href="/register" className="font-medium text-gray-900 hover:underline">
              Sign up
            </Link>
          </div>

          <div className="text-center text-sm">
            <Link href="/set-password" className="text-gray-600 hover:text-gray-900 hover:underline">
              Need to set your password?
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
