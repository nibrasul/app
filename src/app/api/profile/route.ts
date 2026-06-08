import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/db';
import { verifyJWT } from '@/lib/auth';
import { calculateProfileScore } from '@/lib/score';
import { ensureUserSetup } from '@/lib/user-setup';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userIdParam = searchParams.get('userId');
    const profileIdParam = searchParams.get('profileId');

    let profile;

    if (userIdParam) {
      profile = await prisma.profile.findUnique({
        where: { userId: parseInt(userIdParam) },
        include: { tags: true, socials: true }
      });
    } else if (profileIdParam) {
      profile = await prisma.profile.findUnique({
        where: { id: parseInt(profileIdParam) },
        include: { tags: true, socials: true }
      });
    } else {
      const cookieStore = await cookies();
      const token = cookieStore.get('pertap_jwt')?.value;
      if (!token) {
        return NextResponse.json({ error: 'Not authenticated and no userId/profileId provided.' }, { status: 400 });
      }
      const payload = await verifyJWT(token);
      if (!payload) {
        return NextResponse.json({ error: 'Invalid token.' }, { status: 401 });
      }
      profile = await prisma.profile.findUnique({
        where: { userId: payload.userId },
        include: { tags: true, socials: true }
      });
    }

    if (!profile) {
      let recovered = false;
      let targetUserId: number | null = null;

      if (userIdParam) {
        targetUserId = parseInt(userIdParam);
      } else {
        const cookieStore = await cookies();
        const token = cookieStore.get('pertap_jwt')?.value;
        if (token) {
          const payload = await verifyJWT(token);
          if (payload) {
            targetUserId = payload.userId;
          }
        }
      }

      if (targetUserId) {
        const user = await prisma.user.findUnique({ where: { id: targetUserId } });
        if (user) {
          console.warn(`[AUTH] Profile missing for user ID: ${targetUserId}. Auto-provisioning via ensureUserSetup fallback.`);
          const tempProfile = await ensureUserSetup(user.id, user.email, user.name);
          profile = await prisma.profile.findUnique({
            where: { id: tempProfile.id },
            include: { tags: true, socials: true }
          });
          recovered = true;
        }
      }

      if (!profile) {
        // Return a safe fallback placeholder profile so the page never crashes with 404
        return NextResponse.json({
          success: true,
          profile: {
            id: 0,
            userId: 0,
            name: "Tapfolio Explorer",
            username: "guest",
            tagline: "Let's connect!",
            avatar: "/profile_avatar.png",
            isOnline: false,
            bio: "Tapfolio member.",
            diamonds: "0",
            isPremium: false,
            tapCount: 0,
            tags: [],
            socials: []
          },
          score: 0,
          items: [],
          qualifiesForLeaderboard: false,
          connectionStatus: null,
          connectionId: null
        });
      }
    }

    const scoreData = calculateProfileScore(profile);

    // Check connection status if caller is authenticated and we are querying someone else
    let connectionStatus: string | null = null;
    let connectionId: number | null = null;

    const cookieStore = await cookies();
    const token = cookieStore.get('pertap_jwt')?.value;
    if (token) {
      const payload = await verifyJWT(token);
      if (payload && payload.userId !== profile.userId) {
        const conn = await prisma.connection.findFirst({
          where: {
            OR: [
              { requesterId: payload.userId, receiverId: profile.userId },
              { requesterId: profile.userId, receiverId: payload.userId },
            ],
          },
        });
        if (conn) {
          connectionStatus = conn.status;
          connectionId = conn.id;
        }
      }
    }

    return NextResponse.json({
      success: true,
      profile,
      score: scoreData.score,
      items: scoreData.items,
      qualifiesForLeaderboard: scoreData.qualifiesForLeaderboard,
      connectionStatus,
      connectionId,
    });
  } catch (error: any) {
    console.error('Profile GET error:', error);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
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

    const { name, tagline, bio, avatar, isPremium, tags, socials } = await request.json();

    const existingProfile = await prisma.profile.findUnique({
      where: { userId: payload.userId }
    });

    if (!existingProfile) {
      return NextResponse.json({ error: 'Profile not found.' }, { status: 404 });
    }

    if (tags !== undefined) {
      await prisma.tag.deleteMany({ where: { profileId: existingProfile.id } });
    }
    if (socials !== undefined) {
      await prisma.socialLink.deleteMany({ where: { profileId: existingProfile.id } });
    }

    const updatedProfile = await prisma.profile.update({
      where: { userId: payload.userId },
      data: {
        name: name !== undefined ? name : existingProfile.name,
        tagline: tagline !== undefined ? tagline : existingProfile.tagline,
        bio: bio !== undefined ? bio : existingProfile.bio,
        avatar: avatar !== undefined ? avatar : existingProfile.avatar,
        isPremium: isPremium !== undefined ? isPremium : existingProfile.isPremium,
        tags: tags ? {
          create: tags.map((t: any) => ({ text: t.text, type: t.type }))
        } : undefined,
        socials: socials ? {
          create: socials.map((s: any) => ({
            platform: s.platform,
            handle: s.handle,
            url: s.url,
            icon: s.icon,
            color: s.color
          }))
        } : undefined
      },
      include: {
        tags: true,
        socials: true
      }
    });

    const scoreData = calculateProfileScore(updatedProfile);

    const finalProfile = await prisma.profile.update({
      where: { id: updatedProfile.id },
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
      profile: finalProfile,
      score: scoreData.score,
      items: scoreData.items,
      qualifiesForLeaderboard: scoreData.qualifiesForLeaderboard
    });
  } catch (error: any) {
    console.error('Profile PUT error:', error);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
