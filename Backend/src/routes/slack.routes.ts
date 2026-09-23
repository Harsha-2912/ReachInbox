import { Router } from 'express';
import { slackController } from '../controllers/slack.controller';

const router = Router();

router.get('/auth', slackController.getAuth);
router.get('/auth/callback', slackController.getCallback);
router.get('/status', slackController.getStatus);
router.post('/disconnect', slackController.disconnect);

export const slackRoutes = router;
