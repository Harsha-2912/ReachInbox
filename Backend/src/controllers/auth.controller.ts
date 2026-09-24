import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { env } from '../config/env';

export const authController = {
  async getGoogleAuth(req: Request, res: Response) {
    // Detect frontend client URL from query parameter, referer, or env
    const queryReturnTo = req.query.returnTo as string | undefined;
    const referer = req.headers.referer;
    let clientUrl = env.FRONTEND_URL || 'https://reachinbox-1-kvm1.onrender.com';
    if (queryReturnTo) {
      clientUrl = queryReturnTo;
    } else if (referer) {
      try {
        const parsed = new URL(referer);
        clientUrl = `${parsed.protocol}//${parsed.host}`;
      } catch (e) {}
    }

    // Determine backend callback URL dynamically if env is localhost or missing
    const protocol = (req.headers['x-forwarded-proto'] as string) || req.protocol || 'https';
    const host = req.get('host');
    const dynamicCallback = `${protocol}://${host}/api/auth/google/callback`;
    const callbackUrl = (env.GOOGLE_CALLBACK_URL && !env.GOOGLE_CALLBACK_URL.includes('localhost'))
      ? env.GOOGLE_CALLBACK_URL
      : dynamicCallback;

    res.redirect(`${callbackUrl}?mock=true&returnTo=${encodeURIComponent(clientUrl)}`);
  },

  async getGoogleCallback(req: Request, res: Response) {
    // Mock OAuth callback logic
    let user = await prisma.user.findFirst({ where: { email: 'test@reachinbox.com' } });
    
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

    // Determine target frontend URL
    const returnTo = (req.query.returnTo as string) || env.FRONTEND_URL || 'https://reachinbox-1-kvm1.onrender.com';
    const targetUrl = returnTo.replace(/\/+$/, '');

    // Redirect to frontend root with token (?token=mock_token_123)
    // Root URL is always served by static hosts without 404
    res.redirect(`${targetUrl}/?token=mock_token_123`);
  },

  async getMe(req: Request, res: Response) {
    try {
      let user = await prisma.user.findFirst({ where: { email: 'test@reachinbox.com' } });
      if (!user) {
        user = await prisma.user.create({
          data: {
            name: 'Test User',
            email: 'test@reachinbox.com',
            googleId: 'google-test-id-123',
            avatarUrl: 'https://ui-avatars.com/api/?name=Test+User',
          },
        });
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
