import { prisma } from '../../config/prisma';
import { generateUniqueSlug } from '../../utils/slug.util';
import { uploadToCloudinary, destroyFromCloudinary } from '../../utils/cloudinary.util';

export async function getAlbums(options: {
  categoryId?: string;
  categorySlug?: string;
  isFeatured?: boolean;
  page: number;
  limit: number;
}) {
  const { categoryId, categorySlug, isFeatured, page, limit } = options;
  const where: Record<string, unknown> = {};
  if (categoryId) where.categoryId = categoryId;
  if (categorySlug) {
    const cat = await prisma.category.findUnique({ where: { slug: categorySlug } });
    if (cat) where.categoryId = cat.id;
    else return { albums: [], total: 0, page, limit, totalPages: 0 };
  }
  if (isFeatured !== undefined) where.isFeatured = isFeatured;

  const [total, albums] = await prisma.$transaction([
    prisma.album.count({ where }),
    prisma.album.findMany({
      where,
      include: { category: { select: { id: true, name: true, slug: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  return { albums, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getAlbumById(id: string) {
  return prisma.album.findUnique({
    where: { id },
    include: {
      category: true,
      images: { orderBy: { order: 'asc' } },
    },
  });
}

export async function getAlbumBySlug(slug: string) {
  return prisma.album.findUnique({
    where: { slug },
    include: {
      category: true,
      images: { orderBy: { order: 'asc' }, take: 20 },
      _count: { select: { images: true } },
    },
  });
}

export async function getAlbumImages(albumId: string, cursor?: string, limit: number = 20) {
  const images = await prisma.image.findMany({
    where: { albumId },
    orderBy: { order: 'asc' },
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });

  const hasMore = images.length > limit;
  const data = hasMore ? images.slice(0, limit) : images;
  const nextCursor = hasMore ? data[data.length - 1].id : undefined;

  return { images: data, nextCursor, hasMore };
}

export async function createAlbum(
  data: { name: string; categoryId: string; isFeatured: boolean },
  thumbnailBuffer: Buffer
) {
  const slug = await generateUniqueSlug(data.name, 'album');
  const { url, publicId } = await uploadToCloudinary(thumbnailBuffer, `albums`, {
    width: 1600,
    height: 1200,
    quality: 90,
  });

  return prisma.album.create({
    data: {
      name: data.name,
      slug,
      categoryId: data.categoryId,
      isFeatured: data.isFeatured,
      thumbnailUrl: url,
      thumbnailPublicId: publicId,
    },
    include: { category: true },
  });
}

export async function updateAlbum(
  id: string,
  data: { name?: string; categoryId?: string; isFeatured?: boolean },
  thumbnailBuffer?: Buffer
) {
  const existing = await prisma.album.findUniqueOrThrow({ where: { id } });

  let thumbnailUrl = existing.thumbnailUrl;
  let thumbnailPublicId = existing.thumbnailPublicId;

  if (thumbnailBuffer) {
    await destroyFromCloudinary(existing.thumbnailPublicId);
    const uploaded = await uploadToCloudinary(thumbnailBuffer, 'albums', {
      width: 1600,
      height: 1200,
      quality: 90,
    });
    thumbnailUrl = uploaded.url;
    thumbnailPublicId = uploaded.publicId;
  }

  const slug = data.name ? await generateUniqueSlug(data.name, 'album', id) : existing.slug;

  return prisma.album.update({
    where: { id },
    data: { ...data, slug, thumbnailUrl, thumbnailPublicId },
    include: { category: true },
  });
}

export async function deleteAlbum(id: string) {
  const album = await prisma.album.findUniqueOrThrow({
    where: { id },
    include: { images: true },
  });

  // Delete all Cloudinary images
  await Promise.allSettled([
    destroyFromCloudinary(album.thumbnailPublicId),
    ...album.images.map((img) => destroyFromCloudinary(img.publicId)),
  ]);

  return prisma.album.delete({ where: { id } });
}

