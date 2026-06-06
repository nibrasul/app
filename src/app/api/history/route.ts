import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/db';
import { verifyJWT } from '@/lib/auth';

export async function GET() {
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

    const profile = await prisma.profile.findUnique({
      where: { userId: payload.userId }
    });

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found.' }, { status: 404 });
    }

    const events = await prisma.historyEvent.findMany({
      where: { profileId: profile.id },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
      success: true,
      events
    });
  } catch (error: any) {
    console.error('History GET error:', error);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
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

    const { action, details, icon, color } = await request.json();

    if (!action || !details) {
      return NextResponse.json({ error: 'Action and details are required.' }, { status: 400 });
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: payload.userId }
    });

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found.' }, { status: 404 });
    }

    const event = await prisma.historyEvent.create({
      data: {
        profileId: profile.id,
        action,
        details,
        icon,
        color
      }
    });

    return NextResponse.json({
      success: true,
      event
    });
  } catch (error: any) {
    console.error('History POST error:', error);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
