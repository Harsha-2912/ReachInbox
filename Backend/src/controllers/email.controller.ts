import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { esClient } from '../config/elasticsearch';

export const emailController = {
  async getScheduled(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      const where = { status: { in: ['scheduled', 'processing', 'rate_limited'] } };
      const [emails, total] = await Promise.all([
        prisma.email.findMany({ where, skip, take: limit, orderBy: { scheduledAt: 'asc' } }),
        prisma.email.count({ where }),
      ]);

      res.json({
        success: true,
        data: emails,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { message: err.message } });
    }
  },

  async getSent(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      const where = { status: 'sent' };
      const [emails, total] = await Promise.all([
        prisma.email.findMany({ where, skip, take: limit, orderBy: { sentAt: 'desc' } }),
        prisma.email.count({ where }),
      ]);

      res.json({
        success: true,
        data: emails,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { message: err.message } });
    }
  },

  async getFailed(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      const where = { status: 'failed' };
      const [emails, total] = await Promise.all([
        prisma.email.findMany({ where, skip, take: limit, orderBy: { updatedAt: 'desc' } }),
        prisma.email.count({ where }),
      ]);

      res.json({
        success: true,
        data: emails,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { message: err.message } });
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const email = await prisma.email.findUnique({ where: { id: req.params.id } });
      if (!email) return res.status(404).json({ success: false, error: { message: 'Not found' } });
      res.json({ success: true, data: email });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { message: err.message } });
    }
  },

  async search(req: Request, res: Response) {
    try {
      const q = req.query.q as string;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      if (!q) {
        return res.json({ success: true, data: [], pagination: { page, limit, total: 0, totalPages: 0 } });
      }

      try {
        const esResult = await esClient.search({
          index: 'emails',
          from: skip,
          size: limit,
          query: {
            multi_match: {
              query: q,
              fields: ['recipient', 'subject', 'body'],
            },
          },
        });

        const hits = (esResult.hits.hits as any[]).map(hit => hit._source);
        const total = typeof esResult.hits.total === 'number' ? esResult.hits.total : esResult.hits.total?.value || 0;

        return res.json({
          success: true,
          data: hits,
          pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        });
      } catch (esError) {
        // Fallback to Prisma if Elasticsearch is not reachable or fails
        const where = {
          OR: [
            { recipient: { contains: q } },
            { subject: { contains: q } },
            { body: { contains: q } },
          ],
        };
        const [emails, total] = await Promise.all([
          prisma.email.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
          prisma.email.count({ where }),
        ]);

        return res.json({
          success: true,
          data: emails,
          pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        });
      }
    } catch (err: any) {
      res.status(500).json({ success: false, error: { message: err.message } });
    }
  },

  async getStats(req: Request, res: Response) {
    try {
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const [scheduled, sentToday, failed, emailsThisMonth] = await Promise.all([
        prisma.email.count({ where: { status: { in: ['scheduled', 'processing', 'rate_limited'] } } }),
        prisma.email.count({ where: { status: 'sent', sentAt: { gte: startOfDay } } }),
        prisma.email.count({ where: { status: 'failed' } }),
        prisma.email.count({ where: { status: 'sent', sentAt: { gte: startOfMonth } } }),
      ]);

      res.json({
        success: true,
        data: { scheduled, sentToday, failed, emailsThisMonth }
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { message: err.message } });
    }
  }
};
