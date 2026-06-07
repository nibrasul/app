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

    const { connectionId } = await request.json();
    if (!connectionId) {
      return NextResponse.json({ error: 'connectionId is required.' }, { status: 400 });
    }

    const connection = await prisma.connection.findUnique({ where: { id: connectionId } });

    if (!connection) {
      return NextResponse.json({ error: 'Connection not found.' }, { status: 404 });
    }

    if (connection.receiverId !== payload.userId) {
      return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
    }

    if (connection.status !== 'pending') {
      return NextResponse.json({ error: `Connection is already ${connection.status}.` }, { status: 400 });
    }

    await prisma.connection.update({
      where: { id: connectionId },
      data: { status: 'rejected' },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Connection reject error:', error);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
