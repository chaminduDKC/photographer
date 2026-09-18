import { z } from 'zod';

export const createAlbumSchema = z.object({
  name: z.string().min(1),
  categoryId: z.string().uuid(),
  isFeatured: z
    .string()
    .optional()
    .transform((v) => v === 'true'),
});

export const updateAlbumSchema = z.object({
  name: z.string().min(1).optional(),
  categoryId: z.string().uuid().optional(),
  isFeatured: z
    .string()
    .optional()
    .transform((v) => (v !== undefined ? v === 'true' : undefined)),
});
