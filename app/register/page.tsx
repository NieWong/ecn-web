'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store/auth-store';
import { Button } from '@/components/ui/button';
import { Loader2, Mail, User as UserIcon, AlertCircle, CheckCircle } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
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
    } catch (err: any) {
      console.error('Registration error:', err);
      
      if (err.response?.status === 409) {
        setError('An account with this email already exists.');
      } else {
        setError('An error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-green-200 bg-green-50">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="mt-6 font-serif text-3xl font-semibold tracking-tight text-gray-900">
              Registration submitted
            </h2>
            <div className="mt-4 rounded-3xl border border-green-200 bg-green-50 p-6">
              <p className="text-sm text-gray-700 mb-4">
                Thank you for registering. Your account is pending approval.
              </p>
              <p className="text-sm text-gray-600">
                You'll receive a notification once an admin approves your account.
                Then you can set your password and start writing.
              </p>
            </div>
            <div className="mt-6 space-y-3">
              <Link href="/">
                <Button className="w-full rounded-full bg-gray-900 text-white hover:bg-gray-800">
                  Back to Home
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" className="w-full rounded-full">
                  Go to Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
            Join ECN News
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Start your journey as a writer today.
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
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email address <span className="text-red-500">*</span>
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
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full name <span className="text-gray-400 text-xs">(optional)</span>
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-2xl border border-black/10 bg-white py-3 pl-11 pr-4 text-gray-900 placeholder-gray-400 focus:border-black/40 focus:outline-none focus:ring-2 focus:ring-black/10"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div className="rounded-2xl bg-blue-50 border border-blue-200 p-4">
              <p className="text-xs text-blue-800">
                <strong>Note:</strong> Your registration will be reviewed by an admin. 
                You'll be able to set your password after approval.
              </p>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-full bg-gray-900 py-6 text-base font-medium text-white hover:bg-gray-800"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Create Account'
              )}
            </Button>
          </div>

          <div className="text-center text-sm">
            <span className="text-gray-600">Already have an account? </span>
            <Link href="/login" className="font-medium text-gray-900 hover:underline">
              Sign in
            </Link>
          </div>

          <p className="text-center text-xs text-gray-500">
            By signing up, you agree to our{' '}
            <Link href="/terms" className="underline hover:text-gray-900">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="underline hover:text-gray-900">
              Privacy Policy
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
