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

    // Perform all write operations in a single database transaction to guarantee integrity
    const statusUpdateResult = await prisma.$transaction(async (tx) => {
      // 1. Fetch connection inside transaction to check status atomically
      const txConn = await tx.connection.findUnique({
        where: { id: connectionId }
      });

      if (!txConn) {
        throw new Error('CONNECTION_NOT_FOUND');
      }

      if (txConn.status !== 'pending') {
        if (txConn.status === 'accepted') {
          return { alreadyAccepted: true };
        }
        throw new Error(`CONNECTION_ALREADY_${txConn.status.toUpperCase()}`);
      }

      // 1. Update connection status
      await tx.connection.update({
        where: { id: connectionId },
        data: { status: 'accepted' },
      });

      // 2. Increment atomic user connectionCount counters
      await tx.user.update({
        where: { id: connection.requesterId },
        data: { connectionCount: { increment: 1 } },
      });
      await tx.user.update({
        where: { id: connection.receiverId },
        data: { connectionCount: { increment: 1 } },
      });

      // 3. Create default connection visibilities copying current global settings
      const requesterSocialIds = connection.requester.profile?.socials.map((s) => s.id) ?? [];
      const requesterSettings = connection.requester.sharingSettings;
      await tx.connectionVisibility.create({
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
      await tx.connectionVisibility.create({
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

      // 4. Log history events for both parties
      const requesterName = connection.requester.profile?.name ?? connection.requester.name;
      const receiverName = connection.receiver.profile?.name ?? connection.receiver.name;

      if (connection.requester.profile) {
        await tx.historyEvent.create({
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
        await tx.historyEvent.create({
          data: {
            profileId: connection.receiver.profile.id,
            action: 'Connection Accepted',
            details: `You are now connected with ${requesterName}`,
            icon: '✅',
            color: '#10b981',
          },
        });
      }

      return { alreadyAccepted: false };
    });

    if (statusUpdateResult.alreadyAccepted) {
      console.log(`[CONNECTIONS] Connection ${connectionId} already accepted. Idempotent return.`);
      return NextResponse.json({ success: true, message: 'Already accepted.' });
    }

    console.log(`[CONNECTIONS] Connection ${connectionId} accepted atomically.`);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Connection accept error:', error);
    if (error.message && error.message.startsWith('CONNECTION_ALREADY_')) {
      const status = error.message.replace('CONNECTION_ALREADY_', '').toLowerCase();
      return NextResponse.json({ error: `Connection is already ${status}.` }, { status: 400 });
    }
    if (error.message === 'CONNECTION_NOT_FOUND') {
      return NextResponse.json({ error: 'Connection not found.' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
