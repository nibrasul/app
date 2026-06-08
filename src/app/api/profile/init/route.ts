import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyJWT } from '@/lib/auth';
import prisma from '@/lib/db';
import { ensureUserSetup } from '@/lib/user-setup';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('pertap_jwt')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
    }

    const payload = await verifyJWT(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token.' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    // Call user setup idempotently
    const profile = await ensureUserSetup(user.id, user.email, user.name);

    return NextResponse.json({
      success: true,
      message: 'Profile verified and provisioned successfully.',
      profile
    });
  } catch (error: any) {
    console.error('Profile init endpoint error:', error);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
