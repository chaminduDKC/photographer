import type { Metadata } from 'next';
import Link from 'next/link';
import { getCategoryBySlug, getAlbums, getBusinessInfo } from '@/lib/api';
import { SITE_NAME, FALLBACK_BUSINESS } from '@/lib/fallbacks';
import { getBreadcrumbJsonLd, getCollectionPageJsonLd } from '@/lib/seo';
import JsonLd from '@/components/JsonLd';
import CategoryAlbumsGrid from './CategoryAlbumsGrid';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const [category, business] = await Promise.all([
      getCategoryBySlug(slug),
      getBusinessInfo().catch(() => null),
    ]);

    const info = business ?? FALLBACK_BUSINESS;
    const location = `${info.city}, ${info.province}`;
    const title = `${category.name} Photography Portfolio`;
    const description = `Explore ${category.name.toLowerCase()} photography albums and past work by ${SITE_NAME} in ${location}. Featuring ${category._count.albums} curated galleries with high-resolution photos.`;

    return {
      title,
      description,
      alternates: {
        canonical: `/category/${slug}`,
      },
      openGraph: {
        title: `${title} | ${SITE_NAME}`,
        description,
        url: `/category/${slug}`,
        siteName: SITE_NAME,
        type: 'website',
        images: [
          {
            url: category.thumbnailUrl,
            width: 1200,
            height: 800,
            alt: `${category.name} Photography Portfolio`,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: `${title} | ${SITE_NAME}`,
        description,
        images: [category.thumbnailUrl],
      },
      keywords: [
        `${category.name.toLowerCase()} photography`,
        `${category.name.toLowerCase()} photoshoot`,
        `${category.name.toLowerCase()} photographer ${info.city}`,
        `${category.name.toLowerCase()} albums`,
        'photography portfolio',
      ],
    };
  } catch {
    return {
      title: 'Category Portfolio',
      description: `Browse photography albums by ${SITE_NAME}.`,
    };
  }
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  let category;
  let initialAlbums;

  try {
    [category, initialAlbums] = await Promise.all([
      getCategoryBySlug(slug),
      getAlbums({ categorySlug: slug, limit: 12 }),
    ]);
  } catch {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-brand-900 mb-2">Category Not Found</h1>
          <p className="text-brand-500 mb-4">The category you&apos;re looking for doesn&apos;t exist.</p>
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
    { name: `${category.name} Photography`, url: `${siteUrl}/category/${slug}` },
  ]);
  const collectionJsonLd = getCollectionPageJsonLd(category, siteUrl);

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={collectionJsonLd} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="text-sm text-brand-400 mb-6">
          <ol className="flex items-center gap-2">
            <li>
              <Link href="/" className="hover:text-brand-700 transition-colors">
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <span className="text-brand-700 font-medium">{category.name}</span>
            </li>
          </ol>
        </nav>

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-semibold text-brand-900">
            {category.name} Photography
          </h1>
          <p className="mt-2 text-brand-500">
            {category._count.albums} {category._count.albums === 1 ? 'album' : 'albums'} showcasing our past work
          </p>
        </div>

        {/* Albums Grid */}
        <CategoryAlbumsGrid
          categorySlug={slug}
          initialData={initialAlbums}
        />
      </div>
    </>
  );
}
