'use client';

import Link from 'next/link';
import { Facebook, Twitter, Linkedin, Mail } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-black/5 bg-white/70">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center space-x-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-black/10 bg-white text-sm font-semibold text-gray-900">
                ECN
              </div>
              <span className="text-lg font-semibold tracking-tight text-gray-900">ECN News</span>
            </Link>
            <p className="mt-4 text-sm text-gray-600 max-w-md">
              A calm place to read and share stories, ideas, and informed takes.
            </p>
            
            {/* Social Links */}
            <div className="mt-6 flex space-x-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-700 transition-colors"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-700 transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-700 transition-colors"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href="mailto:contact@ecnnews.com"
                className="text-gray-400 hover:text-gray-700 transition-colors"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-[0.2em]">
              Company
            </h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link href="/about" className="text-sm text-gray-600 hover:text-gray-900">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-gray-600 hover:text-gray-900">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-sm text-gray-600 hover:text-gray-900">
                  Careers
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-[0.2em]">
              Legal
            </h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link href="/terms" className="text-sm text-gray-600 hover:text-gray-900">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-sm text-gray-600 hover:text-gray-900">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-sm text-gray-600 hover:text-gray-900">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t border-black/5 pt-8">
          <p className="text-center text-xs uppercase tracking-[0.2em] text-gray-500">
            © {currentYear} ECN News. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
