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

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'Missing release id.' }, { status: 400 });
    }

    const targetId = parseInt(id, 10);
    if (isNaN(targetId)) {
      return NextResponse.json({ error: 'Invalid release id.' }, { status: 400 });
    }

    const targetRelease = await prisma.appVersion.findUnique({
      where: { id: targetId }
    });

    if (!targetRelease) {
      return NextResponse.json({ error: 'Release not found.' }, { status: 404 });
    }

    // Delete the database record
    await prisma.appVersion.delete({
      where: { id: targetId }
    });

    return NextResponse.json({ success: true, message: 'Release deleted successfully.' });
  } catch (error: any) {
    console.error('Delete release error:', error);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
