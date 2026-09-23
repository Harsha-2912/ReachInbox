import { Router } from 'express';
import { emailController } from '../controllers/email.controller';

const router = Router();

router.get('/stats', emailController.getStats);
router.get('/scheduled', emailController.getScheduled);
router.get('/sent', emailController.getSent);
router.get('/failed', emailController.getFailed);
router.get('/search', emailController.search);
router.get('/:id', emailController.getById);

export const emailRoutes = router;
