import { notFound } from 'next/navigation';
import prisma from '@/lib/db';
import styles from './page.module.css';

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export default async function ConnectRedirectPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  // Resolve username → profile
  const slug = username.toLowerCase().trim();
  const spaceSeparated = slug.replace(/-/g, ' ');

  let profile = await prisma.profile.findFirst({
    where: { name: { equals: spaceSeparated, mode: 'insensitive' } },
    select: { id: true, name: true, avatar: true, tagline: true, userId: true },
  });

  if (!profile) {
    const all = await prisma.profile.findMany({
      select: { id: true, name: true, avatar: true, tagline: true, userId: true },
    });
    profile = all.find(p => slugify(p.name) === slug) || null;
  }

  if (!profile) {
    return notFound();
  }

  const deepLinkUrl = `tapfolio://connect/${username}`;
  const webProfileUrl = `/${username}`;

  return (
    <>
      <title>{`Connect with ${profile.name} — Tapfolio`}</title>
      <meta
        name="description"
        content={`Connect with ${profile.name} on Tapfolio${profile.tagline ? ': ' + profile.tagline : ''}`}
      />
      {/* Auto-try opening the app, fallback to web after 1.5s */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function() {
              var username = ${JSON.stringify(username)};
              var webUrl = ${JSON.stringify(webProfileUrl)};
              var deepLink = ${JSON.stringify(deepLinkUrl)};
              var isMobile = /android|iphone|ipad|ipod/i.test(navigator.userAgent);

              if (isMobile) {
                var start = Date.now();
                var timeout = setTimeout(function() {
                  if (Date.now() - start < 2500) {
                    window.location.replace(webUrl);
                  }
                }, 1500);

                window.addEventListener('blur', function() {
                  clearTimeout(timeout);
                });

                window.location.href = deepLink;
              }
            })();
          `,
        }}
      />
      <div className={styles.wrapper}>
        <div className={styles.card}>
          <img
            src={profile.avatar || '/profile_avatar.png'}
            alt={profile.name}
            className={styles.avatar}
          />
          <h1 className={styles.name}>{profile.name}</h1>
          {profile.tagline && <p className={styles.tagline}>{profile.tagline}</p>}

          <div className={styles.actions}>
            <a href={`tapfolio://connect/${username}`} className={styles.openAppBtn} id="open-app-btn">
              Open in Tapfolio App
            </a>
            <a href={webProfileUrl} className={styles.viewProfileLink} id="view-profile-link">
              View web profile instead
            </a>
          </div>

          <p className={styles.hint}>
            Don&apos;t have Tapfolio?{' '}
            <a href="https://play.google.com/store/apps" target="_blank" rel="noopener noreferrer">
              Download it
            </a>
          </p>
        </div>
      </div>
    </>
  );
}
