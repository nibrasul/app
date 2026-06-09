import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/db';
import { signJWT } from '@/lib/auth';
import { ensureUserSetup } from '@/lib/user-setup';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(request: Request) {
  try {
    // Rate limiting: 10 login attempts per minute per IP
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    if (!rateLimit(`login:${ip}`, 10, 60000)) {
      return NextResponse.json({ error: 'Too many login attempts. Please try again later.' }, { status: 429 });
    }

    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { profile: true }
    });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      console.warn(`[AUTH] Failed login attempt for email=${email}: invalid credentials`);
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    // Run user setup synchronously to guarantee profile readiness before redirection
    try {
      await ensureUserSetup(user.id, user.email, user.name);
    } catch (err) {
      console.error(`[AUTH] Synchronous ensureUserSetup failed for user ${user.id} on login:`, err);
    }

    console.log(`[AUTH] Successful login for email=${email}, userId=${user.id}`);

    const token = await signJWT({ userId: user.id, email: user.email });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        profileId: user.profile?.id
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
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}

