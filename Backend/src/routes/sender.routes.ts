import { Router } from 'express';
import { senderController } from '../controllers/sender.controller';

const router = Router();

router.get('/', senderController.getAll);

export const senderRoutes = router;
