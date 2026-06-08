import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/db';
import { signJWT } from '@/lib/auth';
import { ensureUserSetup } from '@/lib/user-setup';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(request: Request) {
  try {
    // Rate limiting: 5 registrations per minute per IP
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    if (!rateLimit(`register:${ip}`, 5, 60000)) {
      return NextResponse.json({ error: 'Too many registration attempts. Please try again later.' }, { status: 429 });
    }

    const { name, email, password, username: rawUsername } = await request.json();

    if (!name || !email || !password || !rawUsername) {
      return NextResponse.json({ error: 'Name, email, password, and username are required.' }, { status: 400 });
    }

    const username = rawUsername.toLowerCase().trim();
    if (!/^[a-z0-9_-]{3,20}$/.test(username)) {
      return NextResponse.json({ error: 'Username must be 3-20 characters long and contain only lowercase letters, numbers, hyphens, or underscores.' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists.' }, { status: 400 });
    }

    const existingProfile = await prisma.profile.findUnique({ where: { username } });
    if (existingProfile) {
      return NextResponse.json({ error: 'Username is already taken.' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Create minimal user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash
      }
    });

    // Run user setup synchronously to guarantee profile readiness
    console.log(`[AUTH] Synchronously provisioning profile for registered user ID: ${user.id}`);
    await ensureUserSetup(user.id, user.email, user.name, username);

    const token = await signJWT({ userId: user.id, email: user.email });

    const response = NextResponse.json({
      success: true,
      message: 'User registered successfully!',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        username
      }
    }, { status: 201 });

    response.cookies.set('pertap_jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/'
    });

    return response;
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}

