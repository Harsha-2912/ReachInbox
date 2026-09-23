import { prisma } from '../config/database';
import { logger } from '../utils/logger';
import axios from 'axios';

export const slackService = {
  async sendRateLimitNotification(senderId: string, limit: number) {
    try {
      const sender = await prisma.sender.findUnique({
        where: { id: senderId },
        include: { user: { include: { slackConnection: true } } },
      });

      if (!sender || !sender.user.slackConnection || !sender.user.slackConnection.accessToken) {
        return; // No slack connection
      }

      const connection = sender.user.slackConnection;
      const currentHour = new Date().toISOString().slice(11, 16);
      const message = `⚠️ *Email sending rate limit reached*\n\nSender: ${sender.email}\nHourly limit: ${limit}\nCurrent window: ${currentHour}\nRemaining emails have been rescheduled.`;

      // In a real app with proper Slack bot tokens, we'd use chat.postMessage
      // For this assignment, we will simulate the API call if channel is provided
      if (connection.channel) {
        await axios.post('https://slack.com/api/chat.postMessage', {
          channel: connection.channel,
          text: message,
        }, {
          headers: {
            Authorization: `Bearer ${connection.accessToken}`,
            'Content-Type': 'application/json',
          },
        });
        logger.info(`Slack rate limit notification sent for sender ${senderId}`);
      }
    } catch (err: any) {
      logger.error('Failed to send Slack notification:', err.message);
    }
  }
};
