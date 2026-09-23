import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { env } from '../config/env';

export const slackController = {
  async getAuth(req: Request, res: Response) {
    // Mock Slack OAuth Auth url redirect
    res.redirect(`${env.SLACK_CALLBACK_URL}?mock=true`);
  },

  async getCallback(req: Request, res: Response) {
    const userId = (req.session as any).userId || 'test-user-id'; // using mock user
    
    // Save mock slack connection
    await prisma.slackConnection.upsert({
      where: { userId },
      update: {
        accessToken: 'mock-slack-token',
        channel: '#email-alerts',
        teamName: 'ReachInbox Mock Team',
      },
      create: {
        userId,
        accessToken: 'mock-slack-token',
        channel: '#email-alerts',
        teamName: 'ReachInbox Mock Team',
      }
    });

    res.redirect(`${env.FRONTEND_URL}/settings?slack=connected`);
  },

  async getStatus(req: Request, res: Response) {
    const userId = (req.session as any).userId || 'test-user-id'; // using mock user
    try {
      const conn = await prisma.slackConnection.findUnique({ where: { userId } });
      res.json({
        success: true,
        data: {
          connected: !!conn,
          channel: conn?.channel,
          teamName: conn?.teamName,
          connectedAt: conn?.updatedAt,
        }
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  async disconnect(req: Request, res: Response) {
    const userId = (req.session as any).userId || 'test-user-id'; // using mock user
    try {
      await prisma.slackConnection.delete({ where: { userId } });
      res.json({ success: true, message: 'Disconnected from Slack' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
};
