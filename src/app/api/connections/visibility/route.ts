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
      shareName,
      shareEmail,
      sharePhone,
      shareWhatsapp,
      shareLocation,
      sharedSocialIds,
    }: {
      connectionId: number;
      shareName: boolean;
      shareEmail: boolean;
      sharePhone: boolean;
      shareWhatsapp: boolean;
      shareLocation: boolean;
      sharedSocialIds: number[];
    } = await request.json();

    if (connectionId === undefined || connectionId === null) {
      return NextResponse.json({ error: 'connectionId is required.' }, { status: 400 });
    }

    // Check if the connection exists, is accepted, and includes the user
    const connection = await prisma.connection.findUnique({
      where: { id: connectionId },
    });

    if (!connection) {
      return NextResponse.json({ error: 'Connection not found.' }, { status: 404 });
    }

    if (connection.status !== 'accepted') {
      return NextResponse.json({ error: 'Connection must be accepted to customize visibility.' }, { status: 400 });
    }

    if (connection.requesterId !== payload.userId && connection.receiverId !== payload.userId) {
      return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
    }

    // Upsert visibility settings for this user on this connection
    const visibility = await prisma.connectionVisibility.upsert({
      where: {
        connectionId_userId: {
          connectionId,
          userId: payload.userId,
        },
      },
      update: {
        shareName,
        shareEmail,
        sharePhone,
        shareWhatsapp,
        shareLocation,
        sharedSocialIds,
      },
      create: {
        connectionId,
        userId: payload.userId,
        shareName,
        shareEmail,
        sharePhone,
        shareWhatsapp,
        shareLocation,
        sharedSocialIds,
      },
    });

    return NextResponse.json({ success: true, visibility });
  } catch (error: any) {
    console.error('Connection visibility update error:', error);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
