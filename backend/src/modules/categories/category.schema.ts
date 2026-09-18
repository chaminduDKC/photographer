import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(1),
  order: z.coerce.number().int().default(0),
});

export const updateCategorySchema = createCategorySchema.partial();

export const reorderSchema = z.object({
  items: z.array(z.object({ id: z.string(), order: z.number().int() })),
});
