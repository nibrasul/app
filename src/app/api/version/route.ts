import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const channel = searchParams.get('channel') || 'stable';

    // 1. Try to find the version marked as current
    let currentVersion = await prisma.appVersion.findFirst({
      where: {
        isCurrent: true,
        isDraft: false,
        channel: channel
      }
    });

    // 2. Fallback to the latest version based on buildNumber
    if (!currentVersion) {
      currentVersion = await prisma.appVersion.findFirst({
        where: {
          isDraft: false,
          channel: channel
        },
        orderBy: {
          buildNumber: 'desc'
        }
      });
    }

    if (!currentVersion) {
      return NextResponse.json({
        success: false,
        error: 'No active release found for the specified channel.'
      }, { status: 404 });
    }

    const changelogLines = currentVersion.changelog
      ? currentVersion.changelog.split('\n').map(line => line.trim()).filter(Boolean)
      : [];

    return NextResponse.json({
      success: true,
      versionName: currentVersion.versionName,
      buildNumber: currentVersion.buildNumber,
      forceUpdate: currentVersion.forceUpdate,
      downloadUrl: currentVersion.apkUrl,
      changelog: changelogLines
    });
  } catch (error: any) {
    console.error('API version check error:', error);
    return NextResponse.json({ success: false, error: 'Something went wrong.' }, { status: 500 });
  }
}
