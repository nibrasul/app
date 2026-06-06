import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required.' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists.' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        profile: {
          create: {
            name,
            tagline: "Let's connect!",
            avatar: "/profile_avatar.png",
            bio: "I design meaningful experiences.",
            diamonds: "0",
            isPremium: false,
            tapCount: 0,
            tags: {
              createMany: {
                data: [
                  { text: 'Creator', type: 'role' },
                  { text: 'Earth', type: 'location' }
                ]
              }
            }
          }
        }
      }
    });

    return NextResponse.json({ success: true, message: 'User registered successfully!' }, { status: 201 });
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
