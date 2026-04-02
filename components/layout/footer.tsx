'use client';

import Link from 'next/link';
import { Facebook, Twitter, Mail, Youtube, Instagram, ArrowUpRight, MapPin, Phone } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getUTCFullYear();

  const footerLinks = {
    explore: [
      { label: 'Нийтлэлүүд', href: '/' },
      { label: 'Мэдээ, мэдээлэл', href: '/news' },
      { label: 'Around Numbers', href: '/search?q=Around Numbers' },
      { label: 'Highlighting Theory', href: '/search?q=Highlighting Theory' },
      { label: 'ECN NEWS', href: '/search?q=ECN NEWS' },
    ],
    company: [
      { label: 'Бидний тухай', href: '/about' },
      { label: 'Гишүүд', href: '/members' },
      { label: 'Only Members', href: '/only-members' },
      { label: 'Гишүүн болох', href: '/register' },
    ],
  };

  const socialLinks = [
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Twitter, href: '#', label: 'X (Twitter)' },
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Youtube, href: '#', label: 'YouTube' },
  ];

  return (
    <footer suppressHydrationWarning className="bg-[#0a0a0a] text-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-6">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="flex h-12 w-16 items-center justify-center rounded-2xl bg-brand p-1 transition-transform group-hover:scale-105 overflow-hidden">
                <img src="/logo.png" alt="ECN Logo" className="h-full w-full rounded-xl object-cover" />
              </div>
              <div>
                <span className="text-2xl font-bold tracking-tight">ECN</span>
                <span className="text-2xl font-light tracking-tight text-white/60">.Club</span>
              </div>
            </Link>
            <img src="/club_logo.png" alt="ECN Club" className="mt-4 h-6 w-auto object-contain" />
            <p className="mt-6 text-sm text-white/50 max-w-xs leading-relaxed">
              СЭЗИС-ийн дэргэдэх Эдийн засагчдын клуб. 
              Монгол оюунаар дэлхийг тэтгэнэ.
            </p>
            
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
                  Холбоо барих
                </h4>
                <ul className="mt-4 space-y-3">
                  <li className="flex items-start gap-2 text-sm text-white/70">
                    <MapPin className="mt-0.5 h-4 w-4" />
                    <span>СЭЗИС, Улаанбаатар, Монгол Улс</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm text-white/70">
                    <Phone className="h-4 w-4" />
                    <span>+976 0000 0000</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm text-white/70">
                    <Mail className="h-4 w-4" />
                    <span>theeconomistsclub@gmail.com</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-white/40">
              © {currentYear} Эдийн засагчдын клуб. Бүх эрх хуулиар хамгаалагдсан.
            </p>
            <div className="flex items-center gap-6">
              <a href="mailto:theeconomistsclub@gmail.com" className="flex items-center gap-2 text-xs text-white/40 hover:text-white/70 transition-colors">
                <Mail className="h-3.5 w-3.5" />
                theeconomistsclub@gmail.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
