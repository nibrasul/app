import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/db';
import { verifyJWT } from '@/lib/auth';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('pertap_jwt')?.value;
    if (!token) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });

    const payload = await verifyJWT(token);
    if (!payload) return NextResponse.json({ error: 'Invalid token.' }, { status: 401 });

    const accepted = await prisma.connection.findMany({
      where: {
        status: 'accepted',
        OR: [
          { requesterId: payload.userId },
          { receiverId: payload.userId },
        ],
      },
      orderBy: { updatedAt: 'desc' },
      include: {
        requester: {
          include: {
            profile: {
              include: { tags: true, socials: true },
            },
            sharingSettings: true,
          },
        },
        receiver: {
          include: {
            profile: {
              include: { tags: true, socials: true },
            },
            sharingSettings: true,
          },
        },
        visibilities: true,
      },
    });

    const connections = accepted.map(conn => {
      // The "other" user is the one who is not the caller
      const isRequester = conn.requesterId === payload.userId;
      const otherUser = isRequester ? conn.receiver : conn.requester;
      const otherProfile = otherUser.profile;
      const otherSettings = otherUser.sharingSettings;

      // Find the visibility set by the other user for this connection
      const otherVisibility = conn.visibilities.find(v => v.userId === otherUser.id);
      const shareName = otherVisibility ? otherVisibility.shareName : (otherSettings?.shareName ?? true);
      const shareEmail = otherVisibility ? otherVisibility.shareEmail : (otherSettings?.shareEmail ?? true);
      const sharePhone = otherVisibility ? otherVisibility.sharePhone : (otherSettings?.sharePhone ?? false);
      const shareWhatsapp = otherVisibility ? otherVisibility.shareWhatsapp : (otherSettings?.shareWhatsapp ?? true);
      const shareLocation = otherVisibility ? otherVisibility.shareLocation : (otherSettings?.shareLocation ?? false);

      const otherSocials = otherProfile?.socials ?? [];
      const filteredSocials = otherVisibility
        ? otherSocials.filter(s => otherVisibility.sharedSocialIds.includes(s.id))
        : otherSocials;

      // Find the visibility set by the current caller for this connection
      const myVisibility = conn.visibilities.find(v => v.userId === payload.userId);
      const myUser = isRequester ? conn.requester : conn.receiver;
      const mySettings = myUser.sharingSettings;
      const myProfile = myUser.profile;

      const myPermissions = {
        shareName: myVisibility ? myVisibility.shareName : (mySettings?.shareName ?? true),
        shareEmail: myVisibility ? myVisibility.shareEmail : (mySettings?.shareEmail ?? true),
        sharePhone: myVisibility ? myVisibility.sharePhone : (mySettings?.sharePhone ?? false),
        shareWhatsapp: myVisibility ? myVisibility.shareWhatsapp : (mySettings?.shareWhatsapp ?? true),
        shareLocation: myVisibility ? myVisibility.shareLocation : (mySettings?.shareLocation ?? false),
        sharedSocialIds: myVisibility
          ? myVisibility.sharedSocialIds
          : myProfile?.socials.map(s => s.id) ?? [],
      };

      return {
        id: conn.id,
        via: conn.via,
        connectedAt: conn.updatedAt,
        other: {
          userId: otherUser.id,
          email: shareEmail ? otherUser.email : null,
          name: shareName ? (otherProfile?.name ?? otherUser.name) : null,
          avatar: otherProfile?.avatar ?? '/profile_avatar.png',
          tagline: otherProfile?.tagline ?? '',
          phone: sharePhone ? (otherProfile?.phone ?? null) : null,
          whatsapp: shareWhatsapp ? (otherProfile?.whatsapp ?? null) : null,
          location: shareLocation ? (otherProfile?.location ?? null) : null,
          tags: otherProfile?.tags ?? [],
          profileId: otherProfile?.id ?? null,
          socials: filteredSocials,
        },
        permissions: {
          shareName,
          shareEmail,
          sharePhone,
          shareWhatsapp,
          shareLocation,
          sharedSocialIds: otherVisibility ? otherVisibility.sharedSocialIds : otherSocials.map(s => s.id),
        },
        myPermissions,
      };
    });

    return NextResponse.json({ success: true, connections });
  } catch (error: any) {
    console.error('Connections list error:', error);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
