'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import { Button } from '@/components/ui/button';
import { Search, PenSquare, User, LogOut, Settings, FileText, LayoutDashboard } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { getImageUrl } from '@/lib/helpers';
import { Role } from '@/lib/types';

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-white/80 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-black/10 bg-white text-sm font-semibold text-gray-900">
                ECN
              </div>
              <span className="text-lg font-semibold tracking-tight text-gray-900">ECN News</span>
            </Link>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-full border border-black/10 bg-white/70 py-2 pl-10 pr-4 text-sm text-gray-700 placeholder:text-gray-400 focus:border-black/30 focus:outline-none focus:ring-2 focus:ring-black/10"
                />
              </div>
            </form>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {!isAuthenticated ? (
              <>
                <Link href="/login">
                  <Button variant="ghost" className="text-sm text-gray-700 hover:text-gray-900">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="rounded-full bg-gray-900 text-white hover:bg-gray-800">
                    Get Started
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/write">
                  <Button
                    variant="ghost"
                    className="flex items-center space-x-2 text-sm text-gray-700 hover:text-gray-900"
                  >
                    <PenSquare className="h-4 w-4" />
                    <span className="hidden sm:inline">Write</span>
                  </Button>
                </Link>

                {/* User Menu */}
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 rounded-full focus:outline-none focus:ring-2 focus:ring-black/20 focus:ring-offset-2"
                  >
                    {user?.profilePicture ? (
                      <img
                        src={getImageUrl(user.profilePicture)}
                        alt={user.name || 'User'}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-900 text-white text-sm font-medium">
                        {user?.name?.[0]?.toUpperCase() || user?.email[0]?.toUpperCase() || 'U'}
                      </div>
                    )}
                  </button>

                  {/* Dropdown Menu */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-black/10 bg-white shadow-xl shadow-black/5">
                      <div className="border-b p-4">
                        <div className="flex items-center space-x-3">
                          {user?.profilePicture ? (
                            <img
                              src={getImageUrl(user.profilePicture)}
                              alt={user.name || 'User'}
                              className="h-12 w-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-900 text-white text-lg font-medium">
                              {user?.name?.[0]?.toUpperCase() || user?.email[0]?.toUpperCase() || 'U'}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {user?.name || 'User'}
                            </p>
                            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                          </div>
                        </div>
                      </div>

                      <div className="py-2">
                        <Link
                          href={`/profile/${user?.id}`}
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <User className="h-4 w-4" />
                          <span>My Profile</span>
                        </Link>
                        <Link
                          href="/my-articles"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <FileText className="h-4 w-4" />
                          <span>My Articles</span>
                        </Link>
                        <Link
                          href="/settings"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <Settings className="h-4 w-4" />
                          <span>Settings</span>
                        </Link>

                        {user?.role === Role.ADMIN && (
                          <>
                            <div className="my-2 border-t" />
                            <Link
                              href="/admin"
                              onClick={() => setShowUserMenu(false)}
                              className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              <LayoutDashboard className="h-4 w-4" />
                              <span>Admin Dashboard</span>
                            </Link>
                          </>
                        )}
                      </div>

                      <div className="border-t py-2">
                        <button
                          onClick={handleLogout}
                          className="flex w-full items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Search */}
      <div className="md:hidden border-t border-black/5 px-4 py-3">
        <form onSubmit={handleSearch}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full border border-black/10 bg-white/70 py-2 pl-10 pr-4 text-sm text-gray-700 placeholder:text-gray-400 focus:border-black/30 focus:outline-none focus:ring-2 focus:ring-black/10"
            />
          </div>
        </form>
      </div>
    </header>
  );
}
