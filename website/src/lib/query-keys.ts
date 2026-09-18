export const queryKeys = {
  categories: {
    all: ['categories'] as const,
    bySlug: (slug: string) => ['categories', slug] as const,
  },
  albums: {
    all: ['albums'] as const,
    list: (params: Record<string, unknown>) => ['albums', 'list', params] as const,
    bySlug: (slug: string) => ['albums', slug] as const,
    images: (albumId: string) => ['albums', albumId, 'images'] as const,
  },
  slider: {
    images: ['slider', 'images'] as const,
  },
  business: {
    info: ['business'] as const,
  },
} as const;
