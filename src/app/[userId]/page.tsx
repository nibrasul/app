import { notFound } from 'next/navigation';
import prisma from '@/lib/db';
import ConnectButton from '@/components/ConnectButton';
import styles from './page.module.css';

export default async function PublicProfile({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;

  let profile = null;

  // 1. Try finding by numeric userId first
  const parsedUserId = parseInt(userId, 10);
  if (!isNaN(parsedUserId)) {
    profile = await prisma.profile.findUnique({
      where: { userId: parsedUserId },
      include: { tags: true, socials: true }
    });
  }

  // 2. Fallback to finding by slugified name
  if (!profile) {
    const slugify = (text: string) =>
      text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

    const normalizedParam = userId.toLowerCase().trim();

    // Fast path: query database replacing hyphens with spaces
    const spaceSeparated = normalizedParam.replace(/-/g, ' ');
    profile = await prisma.profile.findFirst({
      where: {
        name: {
          equals: spaceSeparated,
          mode: 'insensitive'
        }
      },
      include: { tags: true, socials: true }
    });

    // Full in-memory search fallback (handles cases where name slugification is complex)
    if (!profile) {
      const allProfiles = await prisma.profile.findMany({
        include: { tags: true, socials: true }
      });
      profile = allProfiles.find(p => slugify(p.name) === normalizedParam) || null;
    }
  }

  if (!profile) {
    return notFound();
  }

  return (
    <div className={styles.wrapper}>
      <div className={`${styles.profileCard} glass-panel`}>
        {/* 1. HOME TAB VIEW (Profile Header) */}
        <div className={styles.homeTabView}>
          <img
            src={profile.avatar || '/profile_avatar.png'}
            alt={profile.name}
            className={styles.avatar}
          />
          <h1 className={styles.name}>{profile.name}</h1>
          <p className={styles.profileTagline}>{profile.tagline}</p>
        </div>

        {/* 2. CONNECT WITH ME BUTTON */}
        <div className={styles.actionContainer}>
          <ConnectButton profileId={profile.id} initialTapCount={profile.tapCount} />
        </div>

        {/* 3. DYNAMIC QUOTE BAR */}
        <div className={styles.quoteBar}>
          <p>Design is not just what it looks like, it's how it connects.</p>
        </div>

        {/* 4. BIO AND DETAILS */}
        <div className={styles.detailsSection}>
          {profile.bio && (
            <div className={styles.bioBlock}>
              <h2>About</h2>
              <p>{profile.bio}</p>
            </div>
          )}

          {profile.tags && profile.tags.length > 0 && (
            <div className={styles.tagsBlock}>
              {profile.tags.map((t: any, idx: number) => (
                <span
                  key={idx}
                  className={`${styles.tag} ${t.type === 'location' ? styles.tagLoc : styles.tagRole}`}
                >
                  {t.type === 'location' ? '📍 ' : '⚙️ '}
                  {t.text}
                </span>
              ))}
            </div>
          )}

          {profile.socials && profile.socials.length > 0 && (
            <div className={styles.socialsBlock}>
              <h2>Links</h2>
              <div className={styles.socialGrid}>
                {profile.socials.map((s: any, idx: number) => (
                  <a
                    key={idx}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.socialLinkCard}
                    style={{ '--hover-color': s.color } as React.CSSProperties}
                  >
                    <span className={styles.platformName}>{s.platform}</span>
                    <span className={styles.platformHandle}>{s.handle}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
