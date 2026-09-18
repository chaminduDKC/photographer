import type { Metadata } from 'next';
import HeroSection from '@/components/home/HeroSection';
import ImageSlider from '@/components/home/ImageSlider';
import CategoriesSection from '@/components/home/CategoriesSection';
import FeaturedAlbums from '@/components/home/FeaturedAlbums';
import ContactSection from '@/components/home/ContactSection';
import { getBusinessInfo, getSliderImages } from '@/lib/api';
import { SITE_NAME, SITE_DESCRIPTION, FALLBACK_BUSINESS } from '@/lib/fallbacks';

export async function generateMetadata(): Promise<Metadata> {
  const [business, sliderImages] = await Promise.all([
    getBusinessInfo().catch(() => null),
    getSliderImages().catch(() => []),
  ]);

  const info = business ?? FALLBACK_BUSINESS;
  const location = `${info.city}, ${info.province}`;
  const title = `Wedding & Portrait Photographer in ${location}`;
  const description = `${SITE_DESCRIPTION} Professional wedding photography, intimate portraits, and couple shoots in ${location}. Contact us on WhatsApp to book.`;

  const heroImage =
    sliderImages && sliderImages.length > 0
      ? sliderImages[0].url
      : 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&q=80';

  return {
    title,
    description,
    alternates: {
      canonical: '/',
    },
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description,
      url: '/',
      siteName: SITE_NAME,
      locale: 'en_US',
      type: 'website',
      images: [
        {
          url: heroImage,
          width: 1200,
          height: 800,
          alt: `${SITE_NAME} Showcase`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | ${SITE_NAME}`,
      description,
      images: [heroImage],
    },
  };
}

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ImageSlider />
      <CategoriesSection />
      <FeaturedAlbums />
      <ContactSection />
    </>
  );
}
