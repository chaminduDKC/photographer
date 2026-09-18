import { Router } from 'express';
import { uploadImages, patchImage, reorderImages, deleteImage } from './image.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { upload } from '../../middlewares/upload.middleware';

const router = Router({ mergeParams: true });

router.post('/', authenticate, upload.array('images', 100), uploadImages);
router.patch('/reorder', authenticate, reorderImages);
router.patch('/:imageId', authenticate, patchImage);
router.delete('/:imageId', authenticate, deleteImage);

export default router;
