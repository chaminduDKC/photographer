import slugify from 'slugify';
import { prisma } from '../config/prisma';

export async function generateUniqueSlug(
  name: string,
  model: 'category' | 'album',
  excludeId?: string
): Promise<string> {
  const base = slugify(name, { lower: true, strict: true });

  const isUnique = async (candidate: string) => {
    if (model === 'category') {
      const existing = await prisma.category.findUnique({ where: { slug: candidate } });
      return !existing || existing.id === excludeId;
    } else {
      const existing = await prisma.album.findUnique({ where: { slug: candidate } });
      return !existing || existing.id === excludeId;
    }
  };

  if (await isUnique(base)) return base;

  let suffix = 1;
  while (true) {
    const candidate = `${base}-${suffix}`;
    if (await isUnique(candidate)) return candidate;
    suffix++;
  }
}
