import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/db';
import { verifyJWT } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('pertap_jwt')?.value;
    if (!token) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });

    const payload = await verifyJWT(token);
    if (!payload) return NextResponse.json({ error: 'Invalid token.' }, { status: 401 });

    const {
      connectionId,
      permissions = {},
    }: {
      connectionId: number;
      permissions?: {
        shareName?: boolean;
        shareEmail?: boolean;
        sharePhone?: boolean;
        shareWhatsapp?: boolean;
        shareLocation?: boolean;
      };
    } = await request.json();

    if (!connectionId) {
      return NextResponse.json({ error: 'connectionId is required.' }, { status: 400 });
    }

    const connection = await prisma.connection.findUnique({
      where: { id: connectionId },
      include: {
        requester: { include: { profile: true } },
        receiver: { include: { profile: true } },
      },
    });

    if (!connection) {
      return NextResponse.json({ error: 'Connection not found.' }, { status: 404 });
    }

    // Only the receiver can accept
    if (connection.receiverId !== payload.userId) {
      return NextResponse.json({ error: 'Forbidden. Only the receiver can accept.' }, { status: 403 });
    }

    if (connection.status !== 'pending') {
      return NextResponse.json({ error: `Connection is already ${connection.status}.` }, { status: 400 });
    }

    // Update status and create/update permissions
    await prisma.connection.update({
      where: { id: connectionId },
      data: { status: 'accepted' },
    });

    await prisma.connectionPermission.upsert({
      where: { connectionId },
      create: {
        connectionId,
        shareName: permissions.shareName ?? true,
        shareEmail: permissions.shareEmail ?? true,
        sharePhone: permissions.sharePhone ?? false,
        shareWhatsapp: permissions.shareWhatsapp ?? true,
        shareLocation: permissions.shareLocation ?? false,
      },
      update: {
        shareName: permissions.shareName ?? true,
        shareEmail: permissions.shareEmail ?? true,
        sharePhone: permissions.sharePhone ?? false,
        shareWhatsapp: permissions.shareWhatsapp ?? true,
        shareLocation: permissions.shareLocation ?? false,
      },
    });

    // Log history events for both parties
    const requesterName = connection.requester.profile?.name ?? connection.requester.name;
    const receiverName = connection.receiver.profile?.name ?? connection.receiver.name;

    if (connection.requester.profile) {
      await prisma.historyEvent.create({
        data: {
          profileId: connection.requester.profile.id,
          action: 'Connection Accepted',
          details: `${receiverName} accepted your connection request`,
          icon: '✅',
          color: '#10b981',
        },
      });
    }

    if (connection.receiver.profile) {
      await prisma.historyEvent.create({
        data: {
          profileId: connection.receiver.profile.id,
          action: 'Connection Accepted',
          details: `You are now connected with ${requesterName}`,
          icon: '✅',
          color: '#10b981',
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Connection accept error:', error);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
