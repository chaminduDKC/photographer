'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { getBusinessInfo } from '@/lib/api';
import { queryKeys } from '@/lib/query-keys';
import { FALLBACK_BUSINESS, SITE_NAME } from '@/lib/fallbacks';

export default function Footer() {
  const { data: business } = useQuery({
    queryKey: queryKeys.business.info,
    queryFn: getBusinessInfo,
  });

  const info = business ?? FALLBACK_BUSINESS;

  return (
    <footer className="bg-brand-50 border-t border-brand-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <Link href="/" className="text-lg font-semibold text-brand-900">
              {SITE_NAME}
            </Link>
            <p className="mt-2 text-sm text-brand-500 max-w-xs">
              Capturing life&apos;s most beautiful moments with artistry and passion.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-brand-900 uppercase tracking-wider">
              Quick Links
            </h3>
            <ul className="mt-3 space-y-2">
              <li>
                <Link href="/" className="text-sm text-brand-500 hover:text-brand-900 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/#categories" className="text-sm text-brand-500 hover:text-brand-900 transition-colors">
                  Categories
                </Link>
              </li>
              <li>
                <Link href="/#contact" className="text-sm text-brand-500 hover:text-brand-900 transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-sm font-semibold text-brand-900 uppercase tracking-wider">
              Get In Touch
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-brand-500">
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                </svg>
                {info.phone1}
              </li>
              {info.phone2 && (
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                  </svg>
                  {info.phone2}
                </li>
              )}
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                {info.address}, {info.city}, {info.province}
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-brand-200 text-center">
          <p className="text-xs text-brand-400">
            &copy; {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
