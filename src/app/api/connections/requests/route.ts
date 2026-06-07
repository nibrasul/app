import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/db';
import { verifyJWT } from '@/lib/auth';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('pertap_jwt')?.value;
    if (!token) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });

    const payload = await verifyJWT(token);
    if (!payload) return NextResponse.json({ error: 'Invalid token.' }, { status: 401 });

    const pending = await prisma.connection.findMany({
      where: {
        receiverId: payload.userId,
        status: 'pending',
      },
      orderBy: { createdAt: 'desc' },
      include: {
        requester: {
          include: {
            profile: {
              select: {
                id: true,
                name: true,
                avatar: true,
                tagline: true,
              },
            },
          },
        },
      },
    });

    const requests = pending.map(conn => ({
      id: conn.id,
      via: conn.via,
      createdAt: conn.createdAt,
      requester: {
        userId: conn.requester.id,
        name: conn.requester.profile?.name ?? conn.requester.name,
        avatar: conn.requester.profile?.avatar ?? '/profile_avatar.png',
        tagline: conn.requester.profile?.tagline ?? '',
        profileId: conn.requester.profile?.id ?? null,
      },
    }));

    return NextResponse.json({ success: true, requests });
  } catch (error: any) {
    console.error('Connection requests error:', error);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
