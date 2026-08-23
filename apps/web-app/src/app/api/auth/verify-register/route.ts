import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { verifyOTP, getPendingRegistration, clearPendingRegistration } from '@/lib/otp';

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json({ error: 'Email and OTP are required' }, { status: 400 });
    }

    // Verify OTP
    const valid = verifyOTP(email, otp);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 401 });
    }

    // Get pending registration data
    const pending = getPendingRegistration(email);
    if (!pending) {
      return NextResponse.json(
        { error: 'Registration session expired. Please start over.' },
        { status: 410 }
      );
    }

    // Double-check user doesn't already exist
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: 'Account already exists. Please sign in.' },
        { status: 409 }
      );
    }

    // Create user + empty emergency profile in a transaction
    const user = await prisma.user.create({
      data: {
        email,
        name: pending.name,
        phone: pending.phone || null,
        role: 'PATIENT',
        verified: true,
        emergencyProfile: {
          create: {
            bloodGroup: null,
            allergies: [],
            chronicConditions: [],
            currentMedications: [],
          },
        },
      },
      include: { emergencyProfile: true },
    });

    clearPendingRegistration(email);

    // Set session cookie
    const cookieStore = await cookies();
    cookieStore.set('health-session', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email },
      message: 'Account created successfully',
    });
  } catch (error) {
    console.error('[verify-register] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
