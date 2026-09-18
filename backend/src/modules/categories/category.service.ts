import { prisma } from '../../config/prisma';
import { generateUniqueSlug } from '../../utils/slug.util';
import { uploadToCloudinary, destroyFromCloudinary } from '../../utils/cloudinary.util';

export async function getAllCategories() {
  return prisma.category.findMany({
    orderBy: { order: 'asc' },
    include: { _count: { select: { albums: true } } },
  });
}

export async function getCategoryBySlug(slug: string) {
  return prisma.category.findUnique({
    where: { slug },
    include: { _count: { select: { albums: true } } },
  });
}

export async function createCategory(
  data: { name: string; order: number },
  thumbnailBuffer: Buffer
) {
  const trimmedName = data.name.trim();

  // Enforce case-insensitive unique category name
  const existing = await prisma.category.findFirst({
    where: {
      name: {
        equals: trimmedName,
        mode: 'insensitive',
      },
    },
  });

  if (existing) {
    throw new Error('CATEGORY_NAME_EXISTS');
  }

  const slug = await generateUniqueSlug(trimmedName, 'category');
  const { url, publicId } = await uploadToCloudinary(thumbnailBuffer, 'categories', {
    width: 1600,
    height: 1200,
    quality: 90,
  });

  return prisma.category.create({
    data: { name: trimmedName, slug, order: data.order, thumbnailUrl: url, thumbnailPublicId: publicId },
  });
}

export async function updateCategory(
  id: string,
  data: { name?: string; order?: number },
  thumbnailBuffer?: Buffer
) {
  const existing = await prisma.category.findUniqueOrThrow({ where: { id } });

  let trimmedName = existing.name;
  if (data.name && data.name.trim()) {
    trimmedName = data.name.trim();
    // Verify uniqueness excluding current category
    const duplicate = await prisma.category.findFirst({
      where: {
        name: {
          equals: trimmedName,
          mode: 'insensitive',
        },
        NOT: { id },
      },
    });

    if (duplicate) {
      throw new Error('CATEGORY_NAME_EXISTS');
    }
  }

  let thumbnailUrl = existing.thumbnailUrl;
  let thumbnailPublicId = existing.thumbnailPublicId;

  if (thumbnailBuffer) {
    await destroyFromCloudinary(existing.thumbnailPublicId);
    const uploaded = await uploadToCloudinary(thumbnailBuffer, 'categories', {
      width: 1600,
      height: 1200,
      quality: 90,
    });
    thumbnailUrl = uploaded.url;
    thumbnailPublicId = uploaded.publicId;
  }

  const slug = data.name ? await generateUniqueSlug(trimmedName, 'category', id) : existing.slug;

  return prisma.category.update({
    where: { id },
    data: { ...data, name: trimmedName, slug, thumbnailUrl, thumbnailPublicId },
  });
}

export async function deleteCategory(id: string) {
  const category = await prisma.category.findUniqueOrThrow({
    where: { id },
    include: { _count: { select: { albums: true } } },
  });

  if (category._count.albums > 0) {
    throw new Error('CATEGORY_HAS_ALBUMS');
  }

  await destroyFromCloudinary(category.thumbnailPublicId);
  return prisma.category.delete({ where: { id } });
}

export async function reorderCategories(items: { id: string; order: number }[]) {
  await prisma.$transaction(
    items.map(({ id, order }) => prisma.category.update({ where: { id }, data: { order } }))
  );
}
