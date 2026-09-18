import { prisma } from '../../config/prisma';
import { uploadToCloudinary, destroyFromCloudinary } from '../../utils/cloudinary.util';

export async function getSliderImages() {
  return prisma.image.findMany({
    where: { showInSlider: true },
    orderBy: { createdAt: 'desc' },
    take: 20,
    select: { id: true, url: true, albumId: true },
  });
}

export async function uploadImages(
  albumId: string,
  files: { buffer: Buffer; sliderFlags: boolean[] }[]
) {
  const album = await prisma.album.findUniqueOrThrow({ where: { id: albumId } });
  const folder = `albums/${album.slug}`;

  const currentMax = await prisma.image.aggregate({
    where: { albumId },
    _max: { order: true },
  });
  let nextOrder = (currentMax._max.order ?? -1) + 1;

  const uploads = await Promise.all(
    files.map(async ({ buffer, sliderFlags }, i) => {
      const { url, publicId } = await uploadToCloudinary(buffer, folder);
      return {
        url,
        publicId,
        showInSlider: sliderFlags[i] ?? false,
        order: nextOrder + i,
        albumId,
      };
    })
  );

  return prisma.image.createMany({ data: uploads });
}

export async function patchImage(
  imageId: string,
  data: { showInSlider?: boolean; order?: number }
) {
  return prisma.image.update({ where: { id: imageId }, data });
}

export async function reorderImages(items: { id: string; order: number }[]) {
  await prisma.$transaction(
    items.map(({ id, order }) => prisma.image.update({ where: { id }, data: { order } }))
  );
}

export async function deleteImage(imageId: string) {
  const image = await prisma.image.findUniqueOrThrow({ where: { id: imageId } });
  await destroyFromCloudinary(image.publicId);
  return prisma.image.delete({ where: { id: imageId } });
}
