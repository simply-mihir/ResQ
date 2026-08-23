import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateOTP, storeOTP, sendOTPEmail } from '@/lib/otp';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json(
        { error: 'No account found with this email. Please create an account first.' },
        { status: 404 }
      );
    }

    const otp = generateOTP();
    storeOTP(email, otp);

    const sent = await sendOTPEmail(email, otp);

    if (sent) {
      return NextResponse.json({ message: 'OTP sent to your email' });
    }

    return NextResponse.json(
      { error: 'Failed to send OTP email. Please try again.' },
      { status: 500 }
    );
  } catch (error) {
    console.error('[send-otp] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
