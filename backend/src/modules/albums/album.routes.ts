import { Router } from 'express';
import { getAlbums, getAlbum, getAlbumBySlug, getAlbumImages, createAlbum, updateAlbum, deleteAlbum } from './album.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { upload } from '../../middlewares/upload.middleware';
import imageRoutes from '../images/image.routes';

const router = Router();

router.get('/', getAlbums);
router.get('/slug/:slug', getAlbumBySlug);
router.get('/:id', getAlbum);
router.get('/:id/images', getAlbumImages);
router.post('/', authenticate, upload.single('thumbnail'), createAlbum);
router.put('/:id', authenticate, upload.single('thumbnail'), updateAlbum);
router.delete('/:id', authenticate, deleteAlbum);

// Nested image routes (admin)
router.use('/:albumId/images', imageRoutes);

export default router;
