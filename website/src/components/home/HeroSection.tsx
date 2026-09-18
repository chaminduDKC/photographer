'use client';

import { SITE_DESCRIPTION } from '@/lib/fallbacks';

export default function HeroSection() {
  return (
    <section className="relative py-4 sm:py-4 px-4">
      <div className="max-w-3xl mx-auto text-center">
        {/* Logo Placeholder */}
        <div className="mx-auto w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-brand-100 flex items-center justify-center mb-8">
          <svg className="w-10 h-10 sm:w-12 sm:h-12 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
          </svg>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-light text-brand-900 tracking-tight leading-tight">
          Capturing Moments,<br />
          <span className="font-semibold">Creating Memories</span>
        </h1>

        <p className="mt-5 text-base sm:text-lg text-brand-500 max-w-xl mx-auto leading-relaxed">
          {SITE_DESCRIPTION}
        </p>

        <div className="mt-4 flex items-center justify-center gap-4">
          <a
            href="#categories"
            className="px-6 py-2.5 bg-brand-900 text-white text-sm font-medium rounded-full hover:bg-brand-800 transition-colors"
          >
            View Portfolio
          </a>
          <a
            href="#contact"
            className="px-6 py-2 border border-brand-300 text-brand-700 text-sm font-medium rounded-full hover:border-brand-400 hover:text-brand-900 transition-colors"
          >
            Get in Touch
          </a>
        </div>
      </div>
    </section>
  );
}
