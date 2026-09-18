import { Router } from 'express';
import { login, refresh, logout, me, changePassword } from './auth.controller';
import { authenticate } from '../../middlewares/auth.middleware';

const router = Router();

router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, me);
router.put('/password', authenticate, changePassword);

export default router;
