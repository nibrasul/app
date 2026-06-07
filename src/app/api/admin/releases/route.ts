import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/db';
import { verifyJWT } from '@/lib/auth';

// Helper to check admin authorization
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

export async function GET() {
  try {
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const releases = await prisma.appVersion.findMany({
      orderBy: { buildNumber: 'desc' }
    });

    return NextResponse.json({ success: true, releases });
  } catch (error: any) {
    console.error('List releases error:', error);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const formData = await request.formData();
    const versionName = formData.get('versionName') as string;
    const buildNumberStr = formData.get('buildNumber') as string;
    const channel = (formData.get('channel') as string) || 'stable';
    const isDraft = formData.get('isDraft') === 'true';
    const forceUpdate = formData.get('forceUpdate') === 'true';
    const changelog = formData.get('changelog') as string;
    const isCurrent = formData.get('isCurrent') === 'true';
    const file = formData.get('file') as File | null;

    if (!versionName || !buildNumberStr || !file) {
      return NextResponse.json({ error: 'Missing required fields (versionName, buildNumber, or file).' }, { status: 400 });
    }

    const buildNumber = parseInt(buildNumberStr, 10);
    if (isNaN(buildNumber)) {
      return NextResponse.json({ error: 'Invalid buildNumber.' }, { status: 400 });
    }

    // Check if a release with the same build number already exists
    const existing = await prisma.appVersion.findFirst({
      where: { buildNumber }
    });
    if (existing) {
      return NextResponse.json({ error: `A release with build number ${buildNumber} already exists.` }, { status: 400 });
    }

    // Upload file to Cloudinary as raw resource
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const mimeType = file.type || 'application/vnd.android.package-archive';
    const base64Data = buffer.toString('base64');
    const dataUrl = `data:${mimeType};base64,${base64Data}`;

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET || 'tapfolio';
    let apkUrl = '';

    if (cloudName) {
      try {
        const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`;
        const uploadForm = new FormData();
        uploadForm.append('file', dataUrl);
        uploadForm.append('upload_preset', uploadPreset);
        uploadForm.append('public_id', `tapfolio-v${versionName}`);

        const uploadResponse = await fetch(cloudinaryUrl, {
          method: 'POST',
          body: uploadForm
        });

        if (uploadResponse.ok) {
          const result = await uploadResponse.json();
          apkUrl = result.secure_url || '';
        } else {
          const errText = await uploadResponse.text();
          console.error('Cloudinary response error:', errText);
          throw new Error('Cloudinary response failed');
        }
      } catch (err) {
        console.error('Failed uploading to Cloudinary:', err);
        return NextResponse.json({ error: 'Failed uploading APK to Cloudinary.' }, { status: 500 });
      }
    } else {
      return NextResponse.json({ error: 'Cloudinary configuration is missing.' }, { status: 500 });
    }

    if (!apkUrl) {
      return NextResponse.json({ error: 'Failed to obtain APK download URL.' }, { status: 500 });
    }

    // If marked as current and is not a draft, we unmark other current versions for the same channel
    if (isCurrent && !isDraft) {
      await prisma.appVersion.updateMany({
        where: { channel, isCurrent: true },
        data: { isCurrent: false }
      });
    }

    // Create the DB record
    const release = await prisma.appVersion.create({
      data: {
        versionName,
        buildNumber,
        channel,
        isDraft,
        forceUpdate,
        changelog,
        isCurrent: isCurrent && !isDraft, // Only sets isCurrent if it is NOT a draft
        apkUrl
      }
    });

    return NextResponse.json({ success: true, release });
  } catch (error: any) {
    console.error('Create release error:', error);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
