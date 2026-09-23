import nodemailer from 'nodemailer';
import { env } from '../config/env';
import { logger } from '../utils/logger';

const transporter = nodemailer.createTransport({
  host: env.ETHEREAL_HOST,
  port: env.ETHEREAL_PORT,
  secure: false, // true for 465, false for other ports
  auth: env.ETHEREAL_USER && env.ETHEREAL_PASSWORD ? {
    user: env.ETHEREAL_USER,
    pass: env.ETHEREAL_PASSWORD,
  } : undefined,
});

export const smtpService = {
  async sendEmail(to: string, subject: string, body: string, senderEmail: string) {
    try {
      const info = await transporter.sendMail({
        from: senderEmail,
        to,
        subject,
        html: body,
      });
      logger.info(`📧 Email sent: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (error: any) {
      logger.error(`❌ Failed to send email to ${to}: ${error.message}`);
      return { success: false, error: error.message };
    }
  },
};
