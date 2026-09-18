import { Request, Response, NextFunction } from 'express';
import * as albumService from './album.service';
import { createAlbumSchema, updateAlbumSchema } from './album.schema';
import { successResponse, errorResponse } from '../../utils/response.util';

export async function getAlbums(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 12));
    const categoryId = req.query.categoryId as string | undefined;
    const categorySlug = req.query.categorySlug as string | undefined;
    const isFeatured =
      req.query.featured === 'true' ? true : req.query.featured === 'false' ? false : undefined;

    const result = await albumService.getAlbums({ categoryId, categorySlug, isFeatured, page, limit });
    successResponse(res, result);
  } catch (err) {
    next(err);
  }
}

export async function getAlbum(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const album = await albumService.getAlbumById(req.params.id as string);
    if (!album) {
      errorResponse(res, 'Album not found', 404);
      return;
    }
    successResponse(res, album);
  } catch (err) {
    next(err);
  }
}

export async function getAlbumBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const album = await albumService.getAlbumBySlug(req.params.slug as string);
    if (!album) {
      errorResponse(res, 'Album not found', 404);
      return;
    }
    successResponse(res, album);
  } catch (err) {
    next(err);
  }
}

export async function getAlbumImages(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const albumId = (req.params.id || req.params.albumId) as string;
    const cursor = req.query.cursor as string | undefined;
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));
    const result = await albumService.getAlbumImages(albumId, cursor, limit);
    successResponse(res, result);
  } catch (err) {
    next(err);
  }
}

export async function createAlbum(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.file) {
      errorResponse(res, 'Thumbnail image is required', 400);
      return;
    }
    const data = createAlbumSchema.parse(req.body);
    const album = await albumService.createAlbum(data, req.file.buffer);
    successResponse(res, album, 'Album created', 201);
  } catch (err) {
    next(err);
  }
}

export async function updateAlbum(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = updateAlbumSchema.parse(req.body);
    const album = await albumService.updateAlbum(req.params.id as string, data, req.file?.buffer);
    successResponse(res, album, 'Album updated');
  } catch (err) {
    next(err);
  }
}

export async function deleteAlbum(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await albumService.deleteAlbum(req.params.id as string);
    successResponse(res, null, 'Album deleted');
  } catch (err) {
    next(err);
  }
}
