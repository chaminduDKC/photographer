import { Request, Response, NextFunction } from 'express';
import * as imageService from './image.service';
import { successResponse, errorResponse } from '../../utils/response.util';
import { z } from 'zod';

const patchImageSchema = z.object({
  showInSlider: z.boolean().optional(),
  order: z.number().int().optional(),
});

const reorderSchema = z.object({
  items: z.array(z.object({ id: z.string(), order: z.number().int() })),
});

export async function getSliderImages(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const images = await imageService.getSliderImages();
    successResponse(res, images);
  } catch (err) {
    next(err);
  }
}

export async function uploadImages(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const albumId = req.params.albumId as string;
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      errorResponse(res, 'At least one image is required', 400);
      return;
    }

    // sliderFlags come as JSON string in body: e.g. '[true, false, true]'
    let sliderFlags: boolean[] = [];
    try {
      sliderFlags = JSON.parse(req.body.sliderFlags || '[]');
    } catch {
      sliderFlags = [];
    }

    const result = await imageService.uploadImages(
      albumId,
      files.map((f, i) => ({ buffer: f.buffer, sliderFlags: [sliderFlags[i] ?? false] }))
    );
    successResponse(res, result, 'Images uploaded', 201);
  } catch (err) {
    next(err);
  }
}

export async function patchImage(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const imageId = req.params.imageId as string;
    const data = patchImageSchema.parse(req.body);
    const image = await imageService.patchImage(imageId, data);
    successResponse(res, image, 'Image updated');
  } catch (err) {
    next(err);
  }
}

export async function reorderImages(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { items } = reorderSchema.parse(req.body);
    await imageService.reorderImages(items);
    successResponse(res, null, 'Images reordered');
  } catch (err) {
    next(err);
  }
}

export async function deleteImage(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const imageId = req.params.imageId as string;
    await imageService.deleteImage(imageId);
    successResponse(res, null, 'Image deleted');
  } catch (err) {
    next(err);
  }
}
