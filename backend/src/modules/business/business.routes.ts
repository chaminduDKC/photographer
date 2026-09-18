import { Router } from 'express';
import { getBusinessInfo, updateBusinessInfo } from './business.controller';
import { authenticate } from '../../middlewares/auth.middleware';

const router = Router();

router.get('/', getBusinessInfo);
router.put('/', authenticate, updateBusinessInfo);

export default router;
