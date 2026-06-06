import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  try {
    const profiles = await prisma.profile.findMany({
      where: {
        isPremium: true
      },
      include: {
        tags: true,
        socials: true
      }
    });

    const filteredLeaderboard = profiles
      .map((p: any) => ({
        ...p,
        score: parseInt(p.diamonds || '0', 10)
      }))
      .filter((p: any) => p.score >= 60)
      .sort((a: any, b: any) => b.score - a.score);

    return NextResponse.json({
      success: true,
      leaderboard: filteredLeaderboard
    });
  } catch (error: any) {
    console.error('Leaderboard GET error:', error);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
