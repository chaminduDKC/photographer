import type { Metadata } from 'next';
import Link from 'next/link';
import { getAlbumBySlug, getBusinessInfo } from '@/lib/api';
import { SITE_NAME, FALLBACK_BUSINESS } from '@/lib/fallbacks';
import { getBreadcrumbJsonLd, getImageGalleryJsonLd } from '@/lib/seo';
import JsonLd from '@/components/JsonLd';
import ImageGrid from '@/components/album/ImageGrid';
import WhatsAppButton from '@/components/WhatsAppButton';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const [album, business] = await Promise.all([
      getAlbumBySlug(slug),
      getBusinessInfo().catch(() => null),
    ]);

    const info = business ?? FALLBACK_BUSINESS;
    const photoCount = album._count?.images ?? album.images.length;
    const title = `${album.name} — ${album.category.name} Photography`;
    const description = `View the full ${album.name} photography gallery (${photoCount} photos) in our ${album.category.name.toLowerCase()} collection. Captured by ${SITE_NAME}, serving ${info.city}, ${info.province}.`;

    return {
      title,
      description,
      alternates: {
        canonical: `/album/${slug}`,
      },
      openGraph: {
        title: `${title} | ${SITE_NAME}`,
        description,
        url: `/album/${slug}`,
        siteName: SITE_NAME,
        type: 'article',
        images: [
          {
            url: album.thumbnailUrl,
            width: 1200,
            height: 800,
            alt: `${album.name} - ${album.category.name} Photography`,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: `${title} | ${SITE_NAME}`,
        description,
        images: [album.thumbnailUrl],
      },
      keywords: [
        album.name,
        `${album.category.name.toLowerCase()} photography`,
        `${album.category.name.toLowerCase()} gallery`,
        `${album.category.name.toLowerCase()} photoshoot`,
        `${info.city} wedding photographer`,
        `${info.city} photographer`,
      ],
    };
  } catch {
    return {
      title: 'Photo Gallery',
      description: `View photos in this collection by ${SITE_NAME}.`,
    };
  }
}

export default async function AlbumPage({ params }: Props) {
  const { slug } = await params;
  let album;

  try {
    album = await getAlbumBySlug(slug);
  } catch {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-brand-900 mb-2">Album Not Found</h1>
          <p className="text-brand-500 mb-6">The album you&apos;re looking for doesn&apos;t exist.</p>
          <Link
            href="/"
            className="px-5 py-2.5 bg-brand-900 text-white text-sm font-medium rounded-full hover:bg-brand-800 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const breadcrumbJsonLd = getBreadcrumbJsonLd([
    { name: 'Home', url: siteUrl },
    { name: `${album.category.name} Photography`, url: `${siteUrl}/category/${album.category.slug}` },
    { name: album.name, url: `${siteUrl}/album/${slug}` },
  ]);
  const galleryJsonLd = getImageGalleryJsonLd(album, siteUrl);

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={galleryJsonLd} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="text-sm text-brand-400 mb-6">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/" className="hover:text-brand-700 transition-colors">
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link
                href={`/category/${album.category.slug}`}
                className="hover:text-brand-700 transition-colors"
              >
                {album.category.name}
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <span className="text-brand-800 font-medium">{album.name}</span>
            </li>
          </ol>
        </nav>

        {/* Album Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-6 border-b border-brand-100">
          <div>
            <span className="inline-block px-3 py-1 bg-brand-100 text-brand-700 text-xs font-medium rounded-full mb-3">
              {album.category.name}
            </span>
            <h1 className="text-3xl sm:text-4xl font-semibold text-brand-900 tracking-tight">
              {album.name}
            </h1>
            <p className="mt-2 text-sm text-brand-500">
              {album._count?.images ?? album.images.length} photographs
            </p>
          </div>

          <div>
            <WhatsAppButton
              text="Inquire About This Style"
              message={`Hi! I saw your "${album.name}" album in ${album.category.name} and I'd like to ask about availability.`}
            />
          </div>
        </div>

        {/* Photos Grid with Lightbox & Infinite Scroll */}
        <ImageGrid albumId={album.id} initialImages={album.images} />
      </div>
    </>
  );
}
