import type { BusinessInfo, AlbumDetail, Category } from './api';
import { SITE_NAME, SITE_DESCRIPTION } from './fallbacks';

export function getPhotographyBusinessJsonLd(
  business: BusinessInfo | null,
  siteUrl: string = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
) {
  const phone = business?.whatsapp || business?.phone1 || '+94771234567';
  const cleanPhone = phone.replace(/[^0-9+]/g, '');
  const waUrl = `https://wa.me/${cleanPhone.replace('+', '')}`;

  return {
    '@context': 'https://schema.org',
    '@type': ['LocalBusiness', 'ProfessionalService', 'PhotographyBusiness'],
    '@id': `${siteUrl}/#business`,
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: siteUrl,
    telephone: business?.phone1 || phone,
    image: `${siteUrl}/images/hero-showcase.jpg`,
    priceRange: '$$',
    currenciesAccepted: 'USD, LKR',
    paymentAccepted: 'Cash, Credit Card, Bank Transfer',
    address: {
      '@type': 'PostalAddress',
      streetAddress: business?.address || 'Main Street',
      addressLocality: business?.city || 'Colombo',
      addressRegion: business?.province || 'Western',
      addressCountry: 'LK',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: '6.9271',
      longitude: '79.8612',
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: [
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
          'Sunday',
        ],
        opens: '08:00',
        closes: '20:00',
      },
    ],
    sameAs: [waUrl],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Photography Services',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Wedding Photography',
            description: 'Full-day wedding ceremony, reception, and couple photography sessions.',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Pre-Shoot Photography',
            description: 'Outdoor, scenic location pre-wedding photoshoots.',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Portrait & Couple Sessions',
            description: 'Professional studio and outdoor portrait photography.',
          },
        },
      ],
    },
  };
}

export function getBreadcrumbJsonLd(
  items: Array<{ name: string; url: string }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function getCollectionPageJsonLd(
  category: Category,
  siteUrl: string = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${category.name} Photography Portfolio`,
    description: `Curated ${category.name.toLowerCase()} photography galleries and albums by ${SITE_NAME}.`,
    url: `${siteUrl}/category/${category.slug}`,
    image: category.thumbnailUrl,
    about: {
      '@type': 'Thing',
      name: `${category.name} Photography`,
    },
  };
}

export function getImageGalleryJsonLd(
  album: AlbumDetail,
  siteUrl: string = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ImageGallery',
    name: album.name,
    description: `Photo album in ${album.category.name} photography collection by ${SITE_NAME}.`,
    url: `${siteUrl}/album/${album.slug}`,
    thumbnailUrl: album.thumbnailUrl,
    image: album.images.map((img) => img.url),
    creator: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: siteUrl,
    },
  };
}
