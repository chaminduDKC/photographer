'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/cn';
import { SITE_NAME } from '@/lib/fallbacks';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/#categories', label: 'Categories' },
  { href: '/#contact', label: 'Contact' },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-brand-100 transition-shadow">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="text-xl font-semibold tracking-tight text-brand-900 transition-opacity hover:opacity-70"
          >
            {SITE_NAME}
          </Link>

          {/* Desktop Nav */}
          <ul className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    'relative text-sm font-medium transition-colors duration-300 hover:text-brand-900',
                    'after:absolute after:left-0 after:-bottom-1 after:h-px after:bg-brand-900 after:transition-all after:duration-300',
                    pathname === link.href
                      ? 'text-brand-900 after:w-full'
                      : 'text-brand-500 after:w-0 hover:after:w-full'
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-brand-600 hover:text-brand-900 transition-colors"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-all duration-300 origin-center"
                d={mobileOpen ? 'M6 18L18 6M6 6l12 12' : 'M3.75 6.75h16.5'}
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-opacity duration-200"
                style={{ opacity: mobileOpen ? 0 : 1 }}
                d="M3.75 12h16.5"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-all duration-300 origin-center"
                d={mobileOpen ? 'M6 6l12 12' : 'M3.75 17.25h16.5'}
              />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={cn(
            'md:hidden grid transition-all duration-300 ease-out',
            mobileOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
          )}
        >
          <div className="overflow-hidden">
            <ul className="flex flex-col gap-1 pt-3 pb-4 border-t border-brand-100">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'block px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200',
                      pathname === link.href
                        ? 'bg-brand-50 text-brand-900'
                        : 'text-brand-500 hover:bg-brand-50 hover:text-brand-900'
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
}