import nodemailer from 'nodemailer';

// Gmail SMTP transporter
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // STARTTLS
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

import { cookies } from 'next/headers';
import crypto from 'crypto';

const SECRET = process.env.OTP_SECRET || 'health-mvp-fallback-secret-12345';

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function storeOTP(email: string, otp: string): void {
  const cookieStore = cookies();
  const expiresAt = Date.now() + 5 * 60 * 1000;
  const hash = crypto.createHash('sha256').update(`${email.toLowerCase()}:${otp}:${expiresAt}:${SECRET}`).digest('hex');
  
  cookieStore.set('otp-session', `${expiresAt}:${hash}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 5 * 60, // 5 minutes
    path: '/'
  });
}

export function verifyOTP(email: string, otp: string): boolean {
  const cookieStore = cookies();
  const session = cookieStore.get('otp-session')?.value;
  if (!session) return false;

  const [expiresStr, expectedHash] = session.split(':');
  const expiresAt = parseInt(expiresStr, 10);
  
  if (Date.now() > expiresAt) {
    cookieStore.delete('otp-session');
    return false;
  }

  const actualHash = crypto.createHash('sha256').update(`${email.toLowerCase()}:${otp}:${expiresAt}:${SECRET}`).digest('hex');
  if (actualHash === expectedHash) {
    cookieStore.delete('otp-session');
    return true;
  }
  return false;
}

export function storePendingRegistration(email: string, data: { name: string; phone?: string }): void {
  const cookieStore = cookies();
  const payload = Buffer.from(JSON.stringify(data)).toString('base64');
  cookieStore.set('pending-reg', payload, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 10 * 60, // 10 minutes
    path: '/'
  });
}

export function getPendingRegistration(email: string): { name: string; phone?: string } | null {
  const cookieStore = cookies();
  const session = cookieStore.get('pending-reg')?.value;
  if (!session) return null;
  
  try {
    return JSON.parse(Buffer.from(session, 'base64').toString('utf8'));
  } catch {
    return null;
  }
}

export function clearPendingRegistration(email: string): void {
  const cookieStore = cookies();
  cookieStore.delete('pending-reg');
}

export async function sendOTPEmail(email: string, otp: string): Promise<boolean> {
  try {
    await transporter.sendMail({
      from: `"ResQ Platform" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: `${otp} — your ResQ verification code`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <div style="display: inline-block; background: linear-gradient(135deg, #06b6d4, #3b82f6); width: 48px; height: 48px; border-radius: 12px; line-height: 48px; color: white; font-weight: bold; font-size: 20px;">R</div>
            <h1 style="margin: 12px 0 4px; font-size: 22px; color: #1e293b;">ResQ Platform</h1>
            <p style="margin: 0; color: #64748b; font-size: 14px;">Emergency Medical Dispatch System</p>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 32px; text-align: center;">
            <p style="margin: 0 0 16px; color: #475569; font-size: 15px;">Your verification code is:</p>
            <div style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #1e293b; margin: 16px 0; font-family: monospace;">${otp}</div>
            <p style="margin: 16px 0 0; color: #94a3b8; font-size: 13px;">This code expires in 5 minutes.</p>
          </div>
          <p style="text-align: center; color: #94a3b8; font-size: 12px; margin-top: 24px;">If you didn't request this code, you can safely ignore this email.</p>
        </div>
      `,
    });
    console.log(`[OTP] Email sent to ${email}`);
    return true;
  } catch (err) {
    console.error('[OTP] Failed to send email:', err);
    return false;
  }
}
