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

// Persist store on globalThis so it survives Next.js hot reloads in dev
const globalForOtp = globalThis as unknown as {
  __otpStore?: Map<string, { otp: string; expiresAt: number }>;
  __otpCleanupStarted?: boolean;
};

// In-memory OTP store: email → { otp, expiresAt }
const otpStore = globalForOtp.__otpStore ??= new Map<string, { otp: string; expiresAt: number }>();

// Clean up expired entries every 60s (only start once)
if (!globalForOtp.__otpCleanupStarted) {
  globalForOtp.__otpCleanupStarted = true;
  setInterval(() => {
    const now = Date.now();
    for (const [k, v] of otpStore) if (v.expiresAt < now) otpStore.delete(k);
  }, 60_000);
}

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function storeOTP(email: string, otp: string): void {
  otpStore.set(email.toLowerCase(), {
    otp,
    expiresAt: Date.now() + 5 * 60 * 1000,
  });
}

export function verifyOTP(email: string, otp: string): boolean {
  const stored = otpStore.get(email.toLowerCase());
  if (!stored) return false;
  if (stored.expiresAt < Date.now()) {
    otpStore.delete(email.toLowerCase());
    return false;
  }
  if (stored.otp !== otp) return false;
  otpStore.delete(email.toLowerCase());
  return true;
}

export async function sendOTPEmail(email: string, otp: string): Promise<boolean> {
  try {
    await transporter.sendMail({
      from: `"HEALTH Platform" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: `${otp} — your HEALTH verification code`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <div style="display: inline-block; background: linear-gradient(135deg, #3b82f6, #8b5cf6); width: 48px; height: 48px; border-radius: 12px; line-height: 48px; color: white; font-weight: bold; font-size: 20px;">H</div>
            <h1 style="margin: 12px 0 4px; font-size: 22px; color: #1e293b;">HEALTH Platform</h1>
            <p style="margin: 0; color: #64748b; font-size: 14px;">Hospital Staff Portal</p>
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
