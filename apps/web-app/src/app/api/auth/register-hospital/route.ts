import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateOTP, storeOTP, sendOTPEmail, storePendingRegistration } from '@/lib/otp';

export async function POST(req: Request) {
  try {
    const { name, email, phone } = await req.json();

    if (!name?.trim() || !email?.trim()) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email: email.trim() } });
    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email already exists. Please sign in instead.' },
        { status: 409 }
      );
    }

    storePendingRegistration(email.trim(), { name: name.trim(), phone: phone?.trim() });

    const otp = generateOTP();
    storeOTP(email.trim(), otp);

    const sent = await sendOTPEmail(email.trim(), otp);

    if (sent) {
      return NextResponse.json({ message: 'OTP sent to your email' });
    }

    return NextResponse.json(
      { error: 'Failed to send OTP email. Please try again.' },
      { status: 500 }
    );
  } catch (error) {
    console.error('[register] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
