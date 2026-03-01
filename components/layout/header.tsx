'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import { Button } from '@/components/ui/button';
import { Search, PenSquare, User, LogOut, Settings, FileText, LayoutDashboard, Menu, X, Bell, Zap } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { getImageUrl, getProfileImageUrl } from '@/lib/helpers';
import { Role } from '@/lib/types';

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Track scroll position
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
      setShowMobileMenu(false);
    }
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    router.push('/');
  };

  const navItems = [
    { label: 'Бидний тухай', href: '/about' },
    { label: 'Гишүүд', href: '/members' },
    { label: 'Нийтлэлүүд', href: '/' },
    { label: 'Контент', href: '/search?category=content' },
  ];

  return (
    <>
      <header className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-[#0a0a0a]/95 backdrop-blur-xl shadow-lg shadow-black/5' 
          : 'bg-[#0a0a0a]'
      }`}>
        {/* Top Bar */}
        <div className="border-b border-white/10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-12 items-center justify-between">
              {/* Live indicator */}
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#e63946] opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#e63946]"></span>
                </span>
                <span className="text-xs font-semibold uppercase tracking-wider text-white/70">Эдийн засагчдын клуб</span>
              </div>

              {/* Date */}
              <div className="hidden sm:block text-xs text-white/50">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>

              {/* Subscribe CTA */}
              <Link 
                href="/register" 
                className="flex items-center gap-1.5 rounded-full bg-[#e63946] px-3 py-1.5 text-xs font-semibold text-white transition-all hover:bg-[#c1121f]"
              >
                <Zap className="h-3 w-3" />
                <span>Гишүүн болох</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Main Header */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-8">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e63946] text-white font-bold text-lg transition-transform group-hover:scale-105">
                E
              </div>
              <div className="hidden sm:block">
                <span className="text-xl font-bold tracking-tight text-white">ECN</span>
                <span className="text-xl font-light tracking-tight text-white/60">.Club</span>
              </div>
            </Link>

            {/* Navigation - Desktop */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="px-4 py-2 text-sm font-medium text-white/70 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Search Bar - Desktop */}
            <div className="hidden md:flex flex-1 max-w-md">
              <form onSubmit={handleSearch} className="w-full">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                  <input
                    type="text"
                    placeholder="Search stories..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-full border border-white/10 bg-white/5 py-2.5 pl-11 pr-4 text-sm text-white placeholder:text-white/40 focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/10 transition-all"
                  />
                </div>
              </form>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {!isAuthenticated ? (
                <>
                  {/* <Link href="/login" className="hidden sm:block">
                    <Button variant="ghost" className="text-sm text-white/70 hover:text-white hover:bg-white/10">
                      Нэвтрэх
                    </Button>
                  </Link> */}
                  <Link href="/login" className="hidden sm:block">
                    <Button className="rounded-full bg-white text-[#0a0a0a] hover:bg-white/90 font-semibold px-5">
                      Нэвтрэх
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  {/* Notifications */}
                  <button className="relative p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-[#e63946]"></span>
                  </button>

                  {/* Write Button */}
                  <Link href="/write" className="hidden sm:flex">
                    <Button
                      variant="ghost"
                      className="flex items-center gap-2 text-sm text-white/70 hover:text-white hover:bg-white/10 rounded-full"
                    >
                      <PenSquare className="h-4 w-4" />
                      <span>Write</span>
                    </Button>
                  </Link>

                  {/* User Menu */}
                  <div className="relative" ref={menuRef}>
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center gap-2 rounded-full p-1 pr-3 bg-white/5 hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-white/20"
                    >
                      {(user?.profilePicturePath || user?.profilePicture) ? (
                        <img
                          src={getProfileImageUrl(user.profilePicturePath, user.profilePicture)}
                          alt={user.name || 'User'}
                          className="h-8 w-8 rounded-full object-cover ring-2 ring-white/20"
                        />
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#e63946] to-[#f472b6] text-white text-sm font-semibold">
                          {user?.name?.[0]?.toUpperCase() || user?.email[0]?.toUpperCase() || 'U'}
                        </div>
                      )}
                      <span className="hidden sm:block text-sm font-medium text-white/90 max-w-[100px] truncate">
                        {user?.name || 'User'}
                      </span>
                    </button>

                    {/* Dropdown Menu */}
                    {showUserMenu && (
                      <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-white/10 bg-[#1a1a1a] shadow-2xl shadow-black/50 overflow-hidden scale-in">
                        <div className="p-4 bg-gradient-to-br from-[#e63946]/10 to-transparent">
                          <div className="flex items-center gap-3">
                            {(user?.profilePicturePath || user?.profilePicture) ? (
                              <img
                                src={getProfileImageUrl(user.profilePicturePath, user.profilePicture)}
                                alt={user.name || 'User'}
                                className="h-12 w-12 rounded-full object-cover ring-2 ring-white/20"
                              />
                            ) : (
                              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#e63946] to-[#f472b6] text-white text-lg font-semibold">
                                {user?.name?.[0]?.toUpperCase() || user?.email[0]?.toUpperCase() || 'U'}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-white truncate">
                                {user?.name || 'User'}
                              </p>
                              <p className="text-xs text-white/50 truncate">{user?.email}</p>
                            </div>
                          </div>
                        </div>

                        <div className="py-2">
                          <Link
                            href={`/profile/${user?.id}`}
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/80 hover:text-white hover:bg-white/5 transition-colors"
                          >
                            <User className="h-4 w-4" />
                            <span>My Profile</span>
                          </Link>
                          <Link
                            href="/my-articles"
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/80 hover:text-white hover:bg-white/5 transition-colors"
                          >
                            <FileText className="h-4 w-4" />
                            <span>My Articles</span>
                          </Link>
                          <Link
                            href="/settings"
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/80 hover:text-white hover:bg-white/5 transition-colors"
                          >
                            <Settings className="h-4 w-4" />
                            <span>Settings</span>
                          </Link>

                          {user?.role === Role.ADMIN && (
                            <>
                              <div className="my-2 border-t border-white/10" />
                              <Link
                                href="/admin"
                                onClick={() => setShowUserMenu(false)}
                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#e63946] hover:bg-white/5 transition-colors"
                              >
                                <LayoutDashboard className="h-4 w-4" />
                                <span>Admin Dashboard</span>
                              </Link>
                            </>
                          )}
                        </div>

                        <div className="border-t border-white/10 py-2">
                          <button
                            onClick={handleLogout}
                            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-white/80 hover:text-white hover:bg-white/5 transition-colors"
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

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="lg:hidden p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              >
                {showMobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="lg:hidden border-t border-white/10 bg-[#0a0a0a]">
            <div className="px-4 py-4 space-y-4">
              {/* Mobile Search */}
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                  <input
                    type="text"
                    placeholder="Search stories..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-sm text-white placeholder:text-white/40 focus:border-white/30 focus:outline-none"
                  />
                </div>
              </form>

              {/* Mobile Nav */}
              <nav className="flex flex-col gap-1">
                {navItems.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setShowMobileMenu(false)}
                    className="px-4 py-3 text-sm font-medium text-white/70 hover:text-white rounded-xl hover:bg-white/5 transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>

              {/* Mobile Auth */}
              {!isAuthenticated && (
                <div className="flex gap-3 pt-2">
                  <Link href="/login" className="flex-1">
                    <Button variant="outline" className="w-full rounded-xl border-white/20 text-white hover:bg-white/10">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/register" className="flex-1">
                    <Button className="w-full rounded-xl bg-white text-[#0a0a0a] hover:bg-white/90 font-semibold">
                      Get Started
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
}
