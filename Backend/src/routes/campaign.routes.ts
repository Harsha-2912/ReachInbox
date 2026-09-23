import { Router } from 'express';
import { campaignController } from '../controllers/campaign.controller';

const router = Router();

router.post('/', campaignController.create);
router.get('/', campaignController.getAll);
router.get('/:id', campaignController.getById);
router.post('/:id/cancel', campaignController.cancel);

export const campaignRoutes = router;
