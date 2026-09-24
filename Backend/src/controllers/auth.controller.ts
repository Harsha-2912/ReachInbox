import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { env } from '../config/env';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';

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

    if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
       return res.status(500).send("Google OAuth is not configured on the server. Please add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to the environment variables.");
    }

    const oauth2Client = new OAuth2Client(
      env.GOOGLE_CLIENT_ID,
      env.GOOGLE_CLIENT_SECRET,
      callbackUrl
    );

    const authorizeUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'select_account',
      scope: [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email'
      ],
      // Pass the clientUrl via state parameter so we know where to redirect back
      state: Buffer.from(JSON.stringify({ returnTo: clientUrl })).toString('base64')
    });

    res.redirect(authorizeUrl);
  },

  async getGoogleCallback(req: Request, res: Response) {
    const code = req.query.code as string;
    const stateStr = req.query.state as string;
    
    let returnTo = env.FRONTEND_URL || 'https://reachinbox-1-kvm1.onrender.com';
    if (stateStr) {
      try {
        const state = JSON.parse(Buffer.from(stateStr, 'base64').toString('utf8'));
        if (state.returnTo) returnTo = state.returnTo;
      } catch (e) {}
    }

    const targetUrl = returnTo.replace(/\/+$/, '');

    if (!code) {
      return res.redirect(`${targetUrl}/login?error=no_code_provided`);
    }

    const protocol = (req.headers['x-forwarded-proto'] as string) || req.protocol || 'https';
    const host = req.get('host');
    const dynamicCallback = `${protocol}://${host}/api/auth/google/callback`;
    const callbackUrl = (env.GOOGLE_CALLBACK_URL && !env.GOOGLE_CALLBACK_URL.includes('localhost'))
      ? env.GOOGLE_CALLBACK_URL
      : dynamicCallback;

    try {
      const oauth2Client = new OAuth2Client(
        env.GOOGLE_CLIENT_ID,
        env.GOOGLE_CLIENT_SECRET,
        callbackUrl
      );

      const { tokens } = await oauth2Client.getToken(code);
      oauth2Client.setCredentials(tokens);

      const userInfo = await oauth2Client.request<{
        id: string;
        email: string;
        name: string;
        picture: string;
      }>({ url: 'https://www.googleapis.com/oauth2/v1/userinfo' });

      const profile = userInfo.data;

      // Find user by email
      let user = await prisma.user.findFirst({ where: { email: profile.email } });
      
      if (!user) {
        user = await prisma.user.create({
          data: {
            name: profile.name,
            email: profile.email,
            googleId: profile.id,
            avatarUrl: profile.picture,
          }
        });
      } else {
        // Update user's google profile info in case it changed or they previously signed up differently
        user = await prisma.user.update({
          where: { id: user.id },
          data: { googleId: profile.id, avatarUrl: profile.picture, name: profile.name }
        });
      }

      // Generate a real JWT token
      const token = jwt.sign({ userId: user.id }, env.JWT_SECRET as string, { expiresIn: '7d' });

      // Keep session for backward compatibility
      (req.session as any).userId = user.id;

      // Redirect back to frontend with the new JWT
      res.redirect(`${targetUrl}/?token=${token}`);
    } catch (err: any) {
      console.error("Google OAuth Error:", err.response?.data || err.message);
      res.redirect(`${targetUrl}/login?error=auth_failed`);
    }
  },

  async getMe(req: Request, res: Response) {
    try {
      let userId: string | undefined = (req.session as any)?.userId;

      // Extract JWT from Bearer token if present
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        try {
          // verify token
          const decoded = jwt.verify(token, env.JWT_SECRET as string) as { userId: string };
          userId = decoded.userId;
        } catch (e) {
          // Invalid token, continue and see if session works
        }
      }

      if (!userId) {
         return res.status(401).json({ success: false, error: 'Not authenticated' });
      }

      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        return res.status(401).json({ success: false, error: 'User not found' });
      }

      res.json({ 
        success: true, 
        data: {
          ...user,
          googleConnected: !!user.googleId,
          role: 'User'
        } 
      });
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
