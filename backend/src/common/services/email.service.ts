import { env } from '../../config/env';
import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private activeProvider: 'gmail' | 'mailtrap' | 'console' = 'console';

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    if (env.emailProvider === 'console') {
      this.activeProvider = 'console';
      console.log('[Email] Console mode enabled.');
      return;
    }

    if (env.emailProvider === 'gmail') {
      if (env.gmailUser && env.gmailPassword) {
        this.transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: env.gmailUser,
            pass: env.gmailPassword,
          },
          tls: {
            // Useful on some local networks with SSL interception.
            rejectUnauthorized: false,
          },
        });
        this.activeProvider = 'gmail';
      } else {
        console.warn('[Email] Gmail selected but credentials are missing. Trying Mailtrap fallback.');
      }
    }

    if (!this.transporter && env.mailtrapToken) {
      this.transporter = nodemailer.createTransport({
        host: env.mailtrapHost,
        port: env.mailtrapPort,
        secure: false,
        auth: {
          user: 'api',
          pass: env.mailtrapToken,
        },
        tls: {
          rejectUnauthorized: false,
        },
      });
      this.activeProvider = 'mailtrap';
    }

    if (!this.transporter) {
      this.activeProvider = 'console';
      console.warn('[Email] No SMTP provider configured. Falling back to console mode.');
      return;
    }

    this.transporter
      .verify()
      .then(() => {
        console.log(`[Email] ${this.activeProvider} transporter is ready.`);
      })
      .catch((error) => {
        console.error(`[Email] ${this.activeProvider} transporter verification failed:`, error);
      });
  }

  async sendPasswordResetEmail(
    email: string,
    resetToken: string,
    userName: string,
  ): Promise<void> {
    const resetUrl = `${env.appUrl}/auth/reset-password?token=${resetToken}`;

    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f4f4f4; padding: 20px; text-align: center; border-bottom: 4px solid #C4B5A0;">
          <h1 style="margin: 0; color: #333;">Revive Egypt</h1>
          <p style="margin: 5px 0 0 0; color: #666;">Password Reset Request</p>
        </div>

        <div style="padding: 30px; background-color: #fff;">
          <p>Hello ${userName},</p>

          <p>We received a request to reset your password. If you did not make this request, please ignore this email and your password will remain unchanged.</p>

          <p>To reset your password, click the button below:</p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #C4B5A0; color: #000; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              Reset Password
            </a>
          </div>

          <p style="font-size: 12px; color: #999;">
            Or copy and paste this link in your browser:<br>
            <span style="word-break: break-all;">${resetUrl}</span>
          </p>

          <p style="color: #999; font-size: 12px;">
            This link will expire in ${env.resetPasswordExpiry} minutes.
          </p>
        </div>
      </div>
    `;

    const text = `
Hello ${userName},

We received a request to reset your password. If you did not make this request, please ignore this email.

To reset your password, visit this link:
${resetUrl}

This link will expire in ${env.resetPasswordExpiry} minutes.
    `;

    await this.send({
      to: email,
      subject: 'Reset Your Revive Egypt Password',
      html,
      text,
    });
  }

  async sendPasswordResetConfirmation(email: string, userName: string): Promise<void> {
    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f4f4f4; padding: 20px; text-align: center; border-bottom: 4px solid #C4B5A0;">
          <h1 style="margin: 0; color: #333;">Revive Egypt</h1>
          <p style="margin: 5px 0 0 0; color: #666;">Password Reset Successful</p>
        </div>

        <div style="padding: 30px; background-color: #fff;">
          <p>Hello ${userName},</p>
          <p>Your password has been successfully reset. You can now log in with your new password.</p>
        </div>
      </div>
    `;

    const text = `
Hello ${userName},

Your password has been successfully reset. You can now log in with your new password.
    `;

    await this.send({
      to: email,
      subject: 'Your Revive Egypt Password Has Been Reset',
      html,
      text,
    });
  }

  private async send(options: EmailOptions): Promise<void> {
    if (!this.transporter) {
      console.log('[Email] Console fallback mode.');
      console.log('[Email] To:', options.to);
      console.log('[Email] Subject:', options.subject);
      return;
    }

    try {
      const info = await this.transporter.sendMail({
        from: env.emailFrom,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });

      console.log(`[Email] Sent successfully via ${this.activeProvider}:`, info.messageId);
    } catch (error) {
      console.error('[Email] Sending failed:', error);
      const message = error instanceof Error ? error.message : 'Unknown error';
      if (this.activeProvider === 'mailtrap' && message.includes('Sending from domain') && message.includes('is not allowed')) {
        throw new Error(
          'Mailtrap rejected EMAIL_FROM domain. Set EMAIL_FROM to an address on a verified Mailtrap Sending Domain (e.g. no-reply@yourdomain.com).',
        );
      }
      if (this.activeProvider === 'gmail' && (message.includes('Invalid login') || message.includes('BadCredentials'))) {
        throw new Error('Gmail authentication failed. Check GMAIL_USER and GMAIL_PASSWORD (App Password) in .env.');
      }
      throw new Error(`Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export const emailService = new EmailService();
