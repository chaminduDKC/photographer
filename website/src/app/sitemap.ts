import type { MetadataRoute } from 'next';
import { getCategories, getAlbums } from '@/lib/api';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  let categoriesUrls: MetadataRoute.Sitemap = [];
  let albumsUrls: MetadataRoute.Sitemap = [];

  try {
    const categories = await getCategories();
    categoriesUrls = categories.map((cat) => ({
      url: `${siteUrl}/category/${cat.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));
  } catch (e) {
    console.error('Failed to fetch categories for sitemap', e);
  }

  try {
    const albums = await getAlbums({ limit: 200 });
    albumsUrls = albums.albums.map((album) => ({
      url: `${siteUrl}/album/${album.slug}`,
      lastModified: new Date(album.createdAt),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }));
  } catch (e) {
    console.error('Failed to fetch albums for sitemap', e);
  }

  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    ...categoriesUrls,
    ...albumsUrls,
  ];
}
