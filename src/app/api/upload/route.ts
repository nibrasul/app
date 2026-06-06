import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyJWT } from '@/lib/auth';

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

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Standard base64 fallback
    const mimeType = file.type || 'image/png';
    const base64Data = buffer.toString('base64');
    const dataUrl = `data:${mimeType};base64,${base64Data}`;

    // Cloudinary upload logic if keys exist
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET || 'tapfolio';

    if (cloudName) {
      try {
        const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
        const uploadForm = new FormData();
        uploadForm.append('file', dataUrl);
        uploadForm.append('upload_preset', uploadPreset);

        const uploadResponse = await fetch(cloudinaryUrl, {
          method: 'POST',
          body: uploadForm
        });

        if (uploadResponse.ok) {
          const result = await uploadResponse.json();
          if (result.secure_url) {
            return NextResponse.json({
              success: true,
              url: result.secure_url
            });
          }
        }
      } catch (err) {
        console.error('Failed uploading to Cloudinary, using base64 fallback:', err);
      }
    }

    return NextResponse.json({
      success: true,
      url: dataUrl
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Something went wrong during file upload.' }, { status: 500 });
  }
}
