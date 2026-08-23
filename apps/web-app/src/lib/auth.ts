import { cookies } from 'next/headers';
import { prisma } from './prisma';

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('health-session');
  if (!sessionCookie?.value) return null;

  try {
    const user = await prisma.user.findUnique({
      where: { id: sessionCookie.value },
      include: { emergencyProfile: true },
    });
    return user;
  } catch {
    return null;
  }
}

export async function getCurrentUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('health-session');
  return sessionCookie?.value || null;
}
