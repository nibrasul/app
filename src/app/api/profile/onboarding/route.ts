import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/db';
import { verifyJWT } from '@/lib/auth';

export async function PUT(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('pertap_jwt')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
    }

    const tokenPayload = await verifyJWT(token);
    if (!tokenPayload) {
      return NextResponse.json({ error: 'Invalid token.' }, { status: 401 });
    }

    const { tagline, bio, avatar, socials, sharingSettings } = await request.json();

    const existingProfile = await prisma.profile.findUnique({
      where: { userId: tokenPayload.userId }
    });

    if (!existingProfile) {
      return NextResponse.json({ error: 'Profile not found. Please log in again.' }, { status: 404 });
    }

    // Map platforms to their proper default icons and colors if not specified
    const getPlatformMetadata = (platform: string) => {
      const lower = platform.toLowerCase();
      if (lower.includes('github')) {
        return { icon: 'github', color: '#24292e' };
      } else if (lower.includes('linkedin')) {
        return { icon: 'linkedin', color: '#0a66c2' };
      } else if (lower.includes('instagram')) {
        return { icon: 'instagram', color: '#e1306c' };
      } else if (lower.includes('whatsapp')) {
        return { icon: 'whatsapp', color: '#25d366' };
      } else {
        return { icon: 'globe', color: '#6366f1' };
      }
    };

    // Perform atomic update inside transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Update Profile fields
      const updatedProfile = await tx.profile.update({
        where: { userId: tokenPayload.userId },
        data: {
          tagline: tagline !== undefined ? tagline : undefined,
          bio: bio !== undefined ? bio : undefined,
          avatar: avatar !== undefined ? avatar : undefined,
        }
      });

      // 2. Re-create socials if provided
      if (socials && Array.isArray(socials)) {
        // Delete all old links
        await tx.socialLink.deleteMany({
          where: { profileId: existingProfile.id }
        });

        // Insert new ones
        if (socials.length > 0) {
          const linksData = socials
            .filter((s: any) => s.url && s.url.trim() !== '')
            .map((s: any) => {
              const meta = getPlatformMetadata(s.platform);
              return {
                profileId: existingProfile.id,
                platform: s.platform,
                handle: s.handle || 'Link',
                url: s.url,
                icon: s.icon || meta.icon,
                color: s.color || meta.color
              };
            });

          if (linksData.length > 0) {
            await tx.socialLink.createMany({
              data: linksData
            });
          }
        }
      }

      // 3. Update SharingSettings if provided
      let updatedSettings = null;
      if (sharingSettings) {
        updatedSettings = await tx.sharingSettings.upsert({
          where: { userId: tokenPayload.userId },
          create: {
            userId: tokenPayload.userId,
            shareName: sharingSettings.shareName ?? true,
            shareEmail: sharingSettings.shareEmail ?? true,
            sharePhone: sharingSettings.sharePhone ?? false,
            shareWhatsapp: sharingSettings.shareWhatsapp ?? true,
            shareLocation: sharingSettings.shareLocation ?? false
          },
          update: {
            shareName: sharingSettings.shareName !== undefined ? sharingSettings.shareName : undefined,
            shareEmail: sharingSettings.shareEmail !== undefined ? sharingSettings.shareEmail : undefined,
            sharePhone: sharingSettings.sharePhone !== undefined ? sharingSettings.sharePhone : undefined,
            shareWhatsapp: sharingSettings.shareWhatsapp !== undefined ? sharingSettings.shareWhatsapp : undefined,
            shareLocation: sharingSettings.shareLocation !== undefined ? sharingSettings.shareLocation : undefined
          }
        });
      }

      return { updatedProfile, updatedSettings };
    });

    return NextResponse.json({
      success: true,
      message: 'Onboarding settings committed successfully!',
      profile: result.updatedProfile,
      sharingSettings: result.updatedSettings
    });
  } catch (error: any) {
    console.error('Onboarding API error:', error);
    return NextResponse.json({ error: 'Something went wrong during onboarding.' }, { status: 500 });
  }
}
