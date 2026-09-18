import { Request, Response, NextFunction } from 'express';
import * as categoryService from './category.service';
import { createCategorySchema, updateCategorySchema, reorderSchema } from './category.schema';
import { successResponse, errorResponse } from '../../utils/response.util';

export async function getCategories(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const categories = await categoryService.getAllCategories();
    successResponse(res, categories);
  } catch (err) {
    next(err);
  }
}

export async function getCategoryBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const category = await categoryService.getCategoryBySlug(req.params.slug as string);
    if (!category) {
      errorResponse(res, 'Category not found', 404);
      return;
    }
    successResponse(res, category);
  } catch (err) {
    next(err);
  }
}

export async function createCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.file) {
      errorResponse(res, 'Thumbnail image is required', 400);
      return;
    }
    const data = createCategorySchema.parse(req.body);
    const category = await categoryService.createCategory(data, req.file.buffer);
    successResponse(res, category, 'Category created', 201);
  } catch (err) {
    if (err instanceof Error && err.message === 'CATEGORY_NAME_EXISTS') {
      errorResponse(res, 'A category with this name already exists. Category names must be unique.', 409);
      return;
    }
    next(err);
  }
}

export async function updateCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    const data = updateCategorySchema.parse(req.body);
    const category = await categoryService.updateCategory(id, data, req.file?.buffer);
    successResponse(res, category, 'Category updated');
  } catch (err) {
    if (err instanceof Error && err.message === 'CATEGORY_NAME_EXISTS') {
      errorResponse(res, 'A category with this name already exists. Category names must be unique.', 409);
      return;
    }
    next(err);
  }
}

export async function deleteCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    await categoryService.deleteCategory(id);
    successResponse(res, null, 'Category deleted');
  } catch (err) {
    if (err instanceof Error && err.message === 'CATEGORY_HAS_ALBUMS') {
      errorResponse(res, 'Cannot delete category with existing albums', 409);
      return;
    }
    next(err);
  }
}

export async function reorderCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { items } = reorderSchema.parse(req.body);
    await categoryService.reorderCategories(items);
    successResponse(res, null, 'Categories reordered');
  } catch (err) {
    next(err);
  }
}
