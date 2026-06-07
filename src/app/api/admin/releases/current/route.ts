import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/db';
import { verifyJWT } from '@/lib/auth';

async function verifyAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('pertap_jwt')?.value;
  if (!token) return null;

  const payload = await verifyJWT(token);
  if (!payload) return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.userId }
  });

  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    return null;
  }

  return user;
}

export async function PUT(request: Request) {
  try {
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'Missing release id.' }, { status: 400 });
    }

    const targetRelease = await prisma.appVersion.findUnique({
      where: { id: parseInt(id, 10) }
    });

    if (!targetRelease) {
      return NextResponse.json({ error: 'Release not found.' }, { status: 404 });
    }

    // 1. Mark all other releases in the same channel as not current
    await prisma.appVersion.updateMany({
      where: { channel: targetRelease.channel, isCurrent: true },
      data: { isCurrent: false }
    });

    // 2. Set this release as current and undraft it
    const updatedRelease = await prisma.appVersion.update({
      where: { id: targetRelease.id },
      data: {
        isCurrent: true,
        isDraft: false
      }
    });

    return NextResponse.json({ success: true, release: updatedRelease });
  } catch (error: any) {
    console.error('Set active release error:', error);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
