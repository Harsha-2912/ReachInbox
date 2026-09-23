import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import { env } from './config/env';
import { logger } from './utils/logger';

import { authRoutes } from './routes/auth.routes';
import { campaignRoutes } from './routes/campaign.routes';
import { emailRoutes } from './routes/email.routes';
import { slackRoutes } from './routes/slack.routes';
import { senderRoutes } from './routes/sender.routes';

import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { emailQueue } from './queues/email.queue';

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  session({
    secret: env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, // Use secure: true if using https
  })
);

app.use((req, res, next) => {
  logger.info({ method: req.method, url: req.url }, 'Incoming Request');
  next();
});

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    services: {
      api: 'ok',
      // We will add db, redis, es checks here
    },
  });
});

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/admin/queues');

createBullBoard({
  queues: [new BullMQAdapter(emailQueue)],
  serverAdapter: serverAdapter,
});

app.use('/admin/queues', serverAdapter.getRouter());

app.use('/api/auth', authRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/emails', emailRoutes);
app.use('/api/slack', slackRoutes);
app.use('/api/senders', senderRoutes);

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error(err);
  res.status(err.status || 500).json({
    success: false,
    error: {
      message: err.message || 'Internal Server Error',
    },
  });
});

export { app };
