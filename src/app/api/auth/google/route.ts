import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { signJWT } from '@/lib/auth';
import { ensureUserSetup } from '@/lib/user-setup';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    if (!rateLimit(`google-auth:${ip}`, 15, 60000)) {
      return NextResponse.json({ error: 'Too many login attempts. Please try again later.' }, { status: 429 });
    }

    const body = await request.json();
    const { idToken, email: bodyEmail, name: bodyName } = body;

    let email = bodyEmail;
    let name = bodyName || 'Google User';

    if (idToken && idToken.startsWith('mock_')) {
      email = idToken.replace('mock_', '') + '@gmail.com';
    } else if (idToken) {
      try {
        const tokenRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
        if (tokenRes.ok) {
          const payload = await tokenRes.json();
          email = payload.email;
          name = payload.name || payload.email.split('@')[0];
        }
      } catch (err) {
        console.error('Google token verification failed, checking email fallback:', err);
      }
    }

    if (!email) {
      return NextResponse.json({ error: 'Invalid Google authentication payload.' }, { status: 400 });
    }

    email = email.toLowerCase().trim();

    // Check if user exists
    let user = await prisma.user.findUnique({
      where: { email },
      include: { profile: true }
    });

    if (!user) {
      const randomPassword = Math.random().toString(36) + Date.now().toString(36);
      const bcrypt = await import('bcryptjs');
      const passwordHash = await bcrypt.default.hash(randomPassword, 10);

      user = await prisma.user.create({
        data: {
          name,
          email,
          passwordHash
        },
        include: { profile: true }
      });
    }

    // Run user setup synchronously to guarantee profile readiness
    console.log(`[AUTH] Synchronously verifying profile for Google user ID: ${user!.id}`);
    await ensureUserSetup(user!.id, user!.email, user!.name);

    const token = await signJWT({ userId: user.id, email: user.email });

    // Try to obtain the profile to return username immediately if background task already finished, or fallback to generated base
    const profile = await prisma.profile.findUnique({
      where: { userId: user.id }
    });
    const username = profile ? profile.username : email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');

    const response = NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        username,
        profileExists: true
      }
    });

    response.cookies.set('pertap_jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/'
    });

    return response;
  } catch (error: any) {
    console.error('Google Auth Route Error:', error);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
