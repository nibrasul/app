import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { calculateProfileScore } from '@/lib/score';

export async function POST(request: Request) {
  try {
    const { profileId } = await request.json();

    if (!profileId) {
      return NextResponse.json({ error: 'Profile ID is required.' }, { status: 400 });
    }

    const profile = await prisma.profile.update({
      where: { id: parseInt(profileId) },
      data: {
        tapCount: {
          increment: 1
        }
      },
      include: {
        tags: true,
        socials: true
      }
    });

    await prisma.historyEvent.create({
      data: {
        profileId: profile.id,
        action: 'NFC Connection',
        details: 'A user successfully connected with you through NFC or public web link.',
        icon: '🔗',
        color: 'var(--accent-glow)'
      }
    });

    const scoreData = calculateProfileScore(profile);
    const updatedProfile = await prisma.profile.update({
      where: { id: profile.id },
      data: {
        diamonds: String(scoreData.score)
      },
      include: {
        tags: true,
        socials: true
      }
    });

    return NextResponse.json({
      success: true,
      profile: updatedProfile,
      score: scoreData.score
    });
  } catch (error: any) {
    console.error('Tap count error:', error);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
