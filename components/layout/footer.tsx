'use client';

import Link from 'next/link';
import { Facebook, Twitter, Linkedin, Mail, Youtube, Instagram, Rss, ArrowUpRight } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    explore: [
      { label: 'Нийтлэлүүд', href: '/' },
      { label: 'Контент', href: '/search?category=content' },
      { label: 'Судалгаа', href: '/search?category=research' },
      { label: 'Арга хэмжээ', href: '/search?category=events' },
      { label: 'Бүх нийтлэл', href: '/search' },
    ],
    company: [
      { label: 'Бидний тухай', href: '/about' },
      { label: 'Гишүүд', href: '/members' },
      { label: 'Гишүүн болох', href: '/register' },
      { label: 'Холбоо барих', href: '/contact' },
    ],
    legal: [
      { label: 'Үйлчилгээний нөхцөл', href: '/terms' },
      { label: 'Нууцлалын бодлого', href: '/privacy' },
    ],
  };

  const socialLinks = [
    { icon: Facebook, href: 'https://facebook.com', label: 'Facebook' },
    { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
    { icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
    { icon: Youtube, href: 'https://youtube.com', label: 'YouTube' },
    { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
    { icon: Rss, href: '/rss', label: 'RSS' },
  ];

  return (
    <footer className="bg-[#0a0a0a] text-white">
      {/* Newsletter Section */}
      <div className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <h3 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Мэдээлэл авах
              </h3>
              <p className="mt-3 text-white/60 max-w-md">
                Клубын үйл ажиллагаа, арга хэмжээнүүдийн талаарх мэдээллийг цаг алдалгүй аваарай.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 rounded-xl border border-white/10 bg-white/5 px-5 py-3.5 text-sm text-white placeholder:text-white/40 focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/10"
              />
              <button className="rounded-xl bg-[#e63946] px-8 py-3.5 text-sm font-semibold text-white transition-all hover:bg-[#c1121f] whitespace-nowrap">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-6">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#e63946] text-white font-bold text-xl transition-transform group-hover:scale-105">
                E
              </div>
              <div>
                <span className="text-2xl font-bold tracking-tight">ECN</span>
                <span className="text-2xl font-light tracking-tight text-white/60">.Club</span>
              </div>
            </Link>
            <p className="mt-6 text-sm text-white/50 max-w-xs leading-relaxed">
              СЭЗИС-ийн дэргэдэх Эдийн засагчдын клуб. 
              Монгол оюунаар дэлхийг тэтгэнэ.
            </p>
            
            {/* Social Links */}
            <div className="mt-8 flex gap-2">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 text-white/60 transition-all hover:bg-white/10 hover:text-white"
                  aria-label={social.label}
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div className="lg:col-span-4">
            <div className="grid gap-8 sm:grid-cols-3">
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-white/40">
                  Нийтлэлүүд
                </h4>
                <ul className="mt-4 space-y-3">
                  {footerLinks.explore.map((link) => (
                    <li key={link.label}>
                      <Link 
                        href={link.href} 
                        className="group flex items-center text-sm text-white/70 hover:text-white transition-colors"
                      >
                        {link.label}
                        <ArrowUpRight className="ml-1 h-3 w-3 opacity-0 transition-all group-hover:opacity-100" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-white/40">
                  Клуб
                </h4>
                <ul className="mt-4 space-y-3">
                  {footerLinks.company.map((link) => (
                    <li key={link.label}>
                      <Link 
                        href={link.href} 
                        className="group flex items-center text-sm text-white/70 hover:text-white transition-colors"
                      >
                        {link.label}
                        <ArrowUpRight className="ml-1 h-3 w-3 opacity-0 transition-all group-hover:opacity-100" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-white/40">
                  Бусад
                </h4>
                <ul className="mt-4 space-y-3">
                  {footerLinks.legal.map((link) => (
                    <li key={link.label}>
                      <Link 
                        href={link.href} 
                        className="group flex items-center text-sm text-white/70 hover:text-white transition-colors"
                      >
                        {link.label}
                        <ArrowUpRight className="ml-1 h-3 w-3 opacity-0 transition-all group-hover:opacity-100" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-white/10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-white/40">
              © {currentYear} Эдийн засагчдын клуб. Бүх эрх хуулиар хамгаалагдсан.
            </p>
            <div className="flex items-center gap-6">
              <a href="mailto:ecn.club@ufe.edu.mn" className="flex items-center gap-2 text-xs text-white/40 hover:text-white/70 transition-colors">
                <Mail className="h-3.5 w-3.5" />
                ecn.club@ufe.edu.mn
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
