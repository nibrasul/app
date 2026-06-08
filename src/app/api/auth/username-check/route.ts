import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { rateLimit } from '@/lib/rate-limit';

export async function GET(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    // 30 requests per minute to handle debounced keypresses safely
    if (!rateLimit(`username-check:${ip}`, 30, 60000)) {
      return NextResponse.json({ error: 'Too many checks. Please wait a moment.' }, { status: 429 });
    }

    const { searchParams } = new URL(request.url);
    const usernameParam = searchParams.get('username');

    if (!usernameParam) {
      return NextResponse.json({ error: 'Username parameter is required.' }, { status: 400 });
    }

    const username = usernameParam.toLowerCase().trim();

    // Check formatting
    if (!/^[a-z0-9_-]{3,20}$/.test(username)) {
      return NextResponse.json({
        available: false,
        error: 'Username must be 3-20 characters long and contain only lowercase letters, numbers, hyphens, or underscores.',
        suggestions: [],
        checkedAt: new Date()
      });
    }

    const existingProfile = await prisma.profile.findUnique({
      where: { username }
    });

    if (!existingProfile) {
      return NextResponse.json({
        available: true,
        suggestions: [],
        checkedAt: new Date()
      });
    }

    // Generate 3 suggestions if taken
    const suggestions: string[] = [];
    let attempts = 0;
    while (suggestions.length < 3 && attempts < 50) {
      attempts++;
      const randNum = Math.floor(Math.random() * 90) + 10;
      const candidate = `${username}${randNum}`;
      
      const candidateExists = await prisma.profile.findUnique({
        where: { username: candidate }
      });

      if (!candidateExists && !suggestions.includes(candidate)) {
        suggestions.push(candidate);
      }
    }

    // Fallback if random loops failed to find open spots
    while (suggestions.length < 3) {
      suggestions.push(`${username}_${Math.floor(Math.random() * 1000)}`);
    }

    return NextResponse.json({
      available: false,
      suggestions,
      checkedAt: new Date()
    });
  } catch (error: any) {
    console.error('Username check error:', error);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
