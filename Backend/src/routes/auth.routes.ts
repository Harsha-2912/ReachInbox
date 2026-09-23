import { Router } from 'express';
import { authController } from '../controllers/auth.controller';

const router = Router();

router.get('/google', authController.getGoogleAuth);
router.get('/google/callback', authController.getGoogleCallback);
router.get('/me', authController.getMe);
router.post('/logout', authController.logout);

export const authRoutes = router;
