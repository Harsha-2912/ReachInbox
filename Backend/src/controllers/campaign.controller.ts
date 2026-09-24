import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { emailQueue } from '../queues/email.queue';
import { z } from 'zod';
import { env } from '../config/env';

const createCampaignSchema = z.object({
  subject: z.string().min(1),
  body: z.string().min(1),
  senderId: z.string(),
  startTime: z.string(),
  delayMs: z.number().min(0),
  hourlyLimit: z.number().min(1),
  recipients: z.array(z.string()).min(1),
  name: z.string().optional(),
});

export const campaignController = {
  async create(req: Request, res: Response) {
    try {
      const validated = createCampaignSchema.parse(req.body);
      const uniqueRecipients = Array.from(new Set(validated.recipients));

      // 1. Get Sender and User (mocking user id for now)
      const sender = await prisma.sender.findUnique({ where: { id: validated.senderId } });
      if (!sender) {
        return res.status(404).json({ success: false, error: { message: 'Sender not found' } });
      }

      // 2. Create Campaign and Emails in DB
      const campaign = await prisma.$transaction(async (tx) => {
        const camp = await tx.campaign.create({
          data: {
            userId: sender.userId,
            senderId: sender.id,
            subject: validated.subject,
            body: validated.body,
            startTime: new Date(validated.startTime),
            delayMs: validated.delayMs,
            hourlyLimit: validated.hourlyLimit,
            totalRecipients: uniqueRecipients.length,
            status: 'active', // assuming active directly
          },
        });

        const emailsToCreate = uniqueRecipients.map((recipient) => ({
          campaignId: camp.id,
          senderId: sender.id,
          recipient,
          subject: validated.subject,
          body: validated.body,
          scheduledAt: new Date(validated.startTime),
          status: 'scheduled',
        }));

        await tx.email.createMany({ data: emailsToCreate });
        return camp;
      });

      // 3. Schedule Jobs in BullMQ
      const emails = await prisma.email.findMany({ where: { campaignId: campaign.id } });
      
      const startTime = new Date(validated.startTime).getTime();
      const delayMs = validated.delayMs;

      const jobs = emails.map((email, index) => {
        const jobDelay = Math.max(0, startTime + (index * delayMs) - Date.now());
        return {
          name: 'send-email',
          data: { emailId: email.id, campaignId: campaign.id, senderId: sender.id },
          opts: { delay: jobDelay, jobId: `email-${email.id}` },
        };
      });

      await emailQueue.addBulk(jobs);

      res.json({
        success: true,
        data: {
          campaign,
          recipientStatistics: {
            total: uniqueRecipients.length,
            duplicatesRemoved: validated.recipients.length - uniqueRecipients.length,
          }
        },
      });

    } catch (err: any) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: err.issues } });
      }
      res.status(500).json({ success: false, error: { message: err.message } });
    }
  },

  async getAll(req: Request, res: Response) {
    try {
      const status = req.query.status as string;
      const where = status && status !== 'all' ? { status } : {};
      
      const campaigns = await prisma.campaign.findMany({
        where,
        include: { sender: true },
        orderBy: { createdAt: 'desc' },
      });

      const formatted = campaigns.map((c) => ({
        ...c,
        name: c.subject,
        recipientCount: c.totalRecipients,
        delaySeconds: c.delayMs ? Math.round(c.delayMs / 1000) : 0,
        senderEmail: c.sender?.email || '',
      }));

      res.json({ success: true, data: formatted });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { message: err.message } });
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const campaign = await prisma.campaign.findUnique({
        where: { id: req.params.id as string },
        include: { sender: true },
      });
      if (!campaign) {
        return res.status(404).json({ success: false, error: { message: 'Not found' } });
      }
      res.json({
        success: true,
        data: {
          ...campaign,
          name: campaign.subject,
          recipientCount: campaign.totalRecipients,
          delaySeconds: campaign.delayMs ? Math.round(campaign.delayMs / 1000) : 0,
          senderEmail: campaign.sender?.email || '',
        },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { message: err.message } });
    }
  },

  async cancel(req: Request, res: Response) {
    try {
      const campaignId = req.params.id as string;
      
      await prisma.$transaction(async (tx) => {
        await tx.campaign.update({
          where: { id: campaignId },
          data: { status: 'cancelled' },
        });

        await tx.email.updateMany({
          where: { campaignId, status: { in: ['scheduled', 'rate_limited'] } },
          data: { status: 'cancelled' },
        });
      });

      // Attempt to remove delayed jobs from BullMQ
      const emails = await prisma.email.findMany({ where: { campaignId, status: 'cancelled' } });
      for (const email of emails) {
        const job = await emailQueue.getJob(`email-${email.id}`);
        if (job) {
          const state = await job.getState();
          if (state === 'delayed' || state === 'waiting') {
            await job.remove();
          }
        }
      }

      res.json({ success: true, message: 'Campaign cancelled' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { message: err.message } });
    }
  },
};
