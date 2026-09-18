import { Router } from 'express';
import {
  getCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories,
} from './category.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { upload } from '../../middlewares/upload.middleware';

const router = Router();

router.get('/', getCategories);
router.get('/:slug', getCategoryBySlug);
router.post('/', authenticate, upload.single('thumbnail'), createCategory);
router.put('/:id', authenticate, upload.single('thumbnail'), updateCategory);
router.patch('/reorder', authenticate, reorderCategories);
router.delete('/:id', authenticate, deleteCategory);

export default router;
