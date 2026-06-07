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
    }: {
      connectionId: number;
    } = await request.json();

    if (!connectionId) {
      return NextResponse.json({ error: 'connectionId is required.' }, { status: 400 });
    }

    const connection = await prisma.connection.findUnique({
      where: { id: connectionId },
      include: {
        requester: {
          include: {
            profile: { include: { socials: true } },
            sharingSettings: true,
          },
        },
        receiver: {
          include: {
            profile: { include: { socials: true } },
            sharingSettings: true,
          },
        },
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

    // Update status
    await prisma.connection.update({
      where: { id: connectionId },
      data: { status: 'accepted' },
    });

    // Create default connection visibilities copying current global settings
    const requesterSocialIds = connection.requester.profile?.socials.map((s) => s.id) ?? [];
    const requesterSettings = connection.requester.sharingSettings;
    await prisma.connectionVisibility.create({
      data: {
        connectionId: connection.id,
        userId: connection.requesterId,
        shareName: requesterSettings?.shareName ?? true,
        shareEmail: requesterSettings?.shareEmail ?? true,
        sharePhone: requesterSettings?.sharePhone ?? false,
        shareWhatsapp: requesterSettings?.shareWhatsapp ?? true,
        shareLocation: requesterSettings?.shareLocation ?? false,
        sharedSocialIds: requesterSocialIds,
      },
    });

    const receiverSocialIds = connection.receiver.profile?.socials.map((s) => s.id) ?? [];
    const receiverSettings = connection.receiver.sharingSettings;
    await prisma.connectionVisibility.create({
      data: {
        connectionId: connection.id,
        userId: connection.receiverId,
        shareName: receiverSettings?.shareName ?? true,
        shareEmail: receiverSettings?.shareEmail ?? true,
        sharePhone: receiverSettings?.sharePhone ?? false,
        shareWhatsapp: receiverSettings?.shareWhatsapp ?? true,
        shareLocation: receiverSettings?.shareLocation ?? false,
        sharedSocialIds: receiverSocialIds,
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
