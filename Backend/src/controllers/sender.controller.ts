import { Request, Response } from 'express';
import { prisma } from '../config/database';

export const senderController = {
  async getAll(req: Request, res: Response) {
    const userId = (req.session as any).userId || 'test-user-id'; // mock user
    try {
      const senders = await prisma.sender.findMany({ where: { userId } });
      // If none, create a default one for the mock user
      if (senders.length === 0) {
        let user = await prisma.user.findFirst({ where: { id: userId } });
        if (!user) user = await prisma.user.findFirst(); // fallback for dummy data
        if (user) {
          const defaultSender = await prisma.sender.create({
            data: {
              userId: user.id,
              email: 'default@reachinbox.com',
              displayName: 'Default Sender',
              hourlyLimit: 100,
            }
          });
          return res.json({ success: true, data: [defaultSender] });
        }
      }
      res.json({ success: true, data: senders });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
};
