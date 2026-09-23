import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { env } from '../config/env';

export const authController = {
  async getGoogleAuth(req: Request, res: Response) {
    // In a real implementation, redirect to Google OAuth consent screen
    // For this mock implementation, we redirect to callback directly
    res.redirect(`${env.GOOGLE_CALLBACK_URL}?mock=true`);
  },

  async getGoogleCallback(req: Request, res: Response) {
    // Mock OAuth callback logic
    let user = await prisma.user.findUnique({ where: { email: 'test@reachinbox.com' } });
    
    if (!user) {
      user = await prisma.user.create({
        data: {
          name: 'Test User',
          email: 'test@reachinbox.com',
          googleId: 'google-test-id-123',
          avatarUrl: 'https://ui-avatars.com/api/?name=Test+User',
        }
      });
    }

    // Set mock token or session
    (req.session as any).userId = user.id;

    // Redirect to frontend dashboard
    res.redirect(`${env.FRONTEND_URL}/dashboard?token=mock_token_123`);
  },

  async getMe(req: Request, res: Response) {
    const userId = (req.session as any).userId || 'test-user-id'; // using mock ID for now
    try {
      const user = await prisma.user.findFirst({ where: { email: 'test@reachinbox.com' } });
      if (!user) {
        return res.status(401).json({ success: false, error: 'Not authenticated' });
      }
      res.json({ success: true, data: user });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  async logout(req: Request, res: Response) {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ success: false, error: 'Could not log out' });
      }
      res.json({ success: true });
    });
  },
};
