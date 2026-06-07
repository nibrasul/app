import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/db';
import { verifyJWT } from '@/lib/auth';

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('pertap_jwt')?.value;
    if (!token) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });

    const payload = await verifyJWT(token);
    if (!payload) return NextResponse.json({ error: 'Invalid token.' }, { status: 401 });

    const { receiverUsername, via = 'link' } = await request.json();
    if (!receiverUsername) {
      return NextResponse.json({ error: 'receiverUsername is required.' }, { status: 400 });
    }

    // Resolve receiver username → User
    const slug = receiverUsername.toLowerCase().trim();
    const spaceSeparated = slug.replace(/-/g, ' ');

    let receiverProfile = await prisma.profile.findFirst({
      where: { name: { equals: spaceSeparated, mode: 'insensitive' } },
      include: { user: true },
    });

    if (!receiverProfile) {
      const all = await prisma.profile.findMany({ include: { user: true } });
      receiverProfile = all.find(p => slugify(p.name) === slug) || null;
    }

    if (!receiverProfile) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    if (receiverProfile.userId === payload.userId) {
      return NextResponse.json({ error: 'You cannot connect with yourself.' }, { status: 400 });
    }

    // Check for existing connection
    const existing = await prisma.connection.findFirst({
      where: {
        OR: [
          { requesterId: payload.userId, receiverId: receiverProfile.userId },
          { requesterId: receiverProfile.userId, receiverId: payload.userId },
        ],
      },
    });

    if (existing) {
      if (existing.status === 'rejected') {
        // Allow re-sending if previously rejected
        const updated = await prisma.connection.update({
          where: { id: existing.id },
          data: { status: 'pending', requesterId: payload.userId, receiverId: receiverProfile.userId, via },
        });
        return NextResponse.json({ success: true, connection: updated });
      }
      return NextResponse.json({
        error: `A connection already exists with status: ${existing.status}.`,
        status: existing.status,
      }, { status: 409 });
    }

    const connection = await prisma.connection.create({
      data: {
        requesterId: payload.userId,
        receiverId: receiverProfile.userId,
        via,
      },
    });

    // Log history event for the requester
    const requesterProfile = await prisma.profile.findUnique({ where: { userId: payload.userId } });
    if (requesterProfile) {
      await prisma.historyEvent.create({
        data: {
          profileId: requesterProfile.id,
          action: 'Connection Request Sent',
          details: `You sent a connection request to ${receiverProfile.name}`,
          icon: '🤝',
          color: '#6366f1',
        },
      });
    }

    return NextResponse.json({ success: true, connection });
  } catch (error: any) {
    console.error('Connection request error:', error);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
