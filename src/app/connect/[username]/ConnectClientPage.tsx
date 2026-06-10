'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

interface ConnectClientPageProps {
  username: string;
  profile: {
    id: number;
    userId: number;
    name: string;
    avatar: string;
    tagline: string;
  };
  isLoggedIn: boolean;
}

// Modern Platform Icon Renderer
const getPlatformIcon = (platform: string) => {
  const p = platform.toLowerCase();
  if (p.includes('github')) {
    return (
      <svg className={styles.socialSvg} fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
      </svg>
    );
  }
  if (p.includes('linkedin')) {
    return (
      <svg className={styles.socialSvg} fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    );
  }
  if (p.includes('twitter') || p.includes('x.com')) {
    return (
      <svg className={styles.socialSvg} fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    );
  }
  if (p.includes('instagram')) {
    return (
      <svg className={styles.socialSvg} fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051c-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4.162 4.162 0 110-8.324A4.162 4.162 0 0112 16zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
      </svg>
    );
  }
  if (p.includes('youtube')) {
    return (
      <svg className={styles.socialSvg} fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M23.498 6.163a3.003 3.003 0 00-2.11-2.113C19.518 3.545 12 3.545 12 3.545s-7.518 0-9.388.505a3.003 3.003 0 00-2.11 2.113C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 002.11 2.113c1.87.505 9.388.505 9.388.505s7.518 0 9.388-.505a3.002 3.002 0 002.11-2.113C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    );
  }
  return (
    <svg className={styles.socialSvg} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
  );
};

export default function ConnectClientPage({
  username,
  profile,
  isLoggedIn,
}: ConnectClientPageProps) {
  const router = useRouter();
  const [profileData, setProfileData] = useState<any>(null);
  const [status, setStatus] = useState<string | null>(null);
  
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingStatus, setLoadingStatus] = useState(isLoggedIn);
  const [loadingAction, setLoadingAction] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Attempt to launch the mobile app if on a mobile device
    const isMobile = /android|iphone|ipad|ipod/i.test(navigator.userAgent);
    if (isMobile) {
      window.location.href = `tapfolio://connect/${username}`;
    }

    async function loadPublicData() {
      try {
        const res = await fetch(`/api/profile/${username}`);
        const data = await res.json();
        if (res.ok && data.success) {
          setProfileData(data.profile);
        }
      } catch (err) {
        console.error('Error fetching public profile:', err);
      } finally {
        setLoadingProfile(false);
      }
    }

    async function loadStatus() {
      if (!isLoggedIn) {
        setLoadingStatus(false);
        return;
      }
      try {
        const res = await fetch(`/api/connections/status/${username}`);
        const data = await res.json();
        if (res.ok && data.success) {
          setStatus(data.connectionStatus);
        }
      } catch (err) {
        console.error('Error fetching connection status:', err);
      } finally {
        setLoadingStatus(false);
      }
    }

    loadPublicData();
    loadStatus();
  }, [username, isLoggedIn]);

  const handleConnect = async () => {
    if (!isLoggedIn) {
      // 3-layer intent preservation
      sessionStorage.setItem('pendingIntent', `connect:${username}`);
      localStorage.setItem('pendingIntent', `connect:${username}`);
      router.push(`/login?redirect=/connect/${username}&intent=connect`);
      return;
    }

    setLoadingAction(true);
    setError('');

    try {
      const res = await fetch('/api/connections/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiverUsername: username, via: 'web' }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Connection request failed.');
      }
      setStatus('pending');
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoadingAction(false);
    }
  };

  const renderTags = () => {
    const tags = profileData?.tags || [];
    if (tags.length === 0) return null;
    return (
      <div className={styles.tagsContainer}>
        {tags.map((t: any) => {
          const isLoc = t.type === 'location';
          return (
            <span key={t.id} className={isLoc ? styles.locationTag : styles.roleTag}>
              <span className={styles.tagEmoji}>{isLoc ? '📍' : '⚡'}</span> {t.text}
            </span>
          );
        })}
      </div>
    );
  };

  const renderSocials = () => {
    const socials = profileData?.socials || [];
    if (socials.length === 0) return null;
    return (
      <div className={styles.socialsSection}>
        <h3 className={styles.sectionTitle}>Link Tree</h3>
        <div className={styles.socialList}>
          {socials.map((link: any) => {
            return (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialCard}
                style={{ '--platform-color': link.color } as React.CSSProperties}
              >
                <div className={styles.socialCardGlow} style={{ background: `${link.color}15` }}></div>
                <div className={styles.socialLeft}>
                  <div className={styles.iconCircle} style={{ color: link.color, background: `${link.color}18` }}>
                    {getPlatformIcon(link.platform)}
                  </div>
                  <div className={styles.socialInfo}>
                    <span className={styles.platform}>{link.platform}</span>
                    <span className={styles.handle}>{link.handle}</span>
                  </div>
                </div>
                <span className={styles.arrowIcon}>
                  <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                  </svg>
                </span>
              </a>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className={styles.wrapper}>
      {/* Dynamic Background Effects */}
      <div className={styles.backgroundGlowBlob1}></div>
      <div className={styles.backgroundGlowBlob2}></div>
      <div className={styles.gridOverlay}></div>

      <div className={styles.card}>
        {/* Holographic shimmer line */}
        <div className={styles.shimmerOverlay}></div>

        {/* Card Header Design Elements */}
        <div className={styles.cardTopBar}>
          <div className={styles.nfcChip}>
            <div className={styles.nfcInnerPattern}></div>
          </div>
          <div className={styles.logoMark}>
            Tap<span>folio</span>
          </div>
        </div>

        {/* Profile Basic Details */}
        <div className={styles.avatarWrapper}>
          <img
            src={profile.avatar || '/profile_avatar.png'}
            alt={profile.name}
            className={styles.avatar}
          />
          <div className={styles.avatarRing}></div>
          {profileData?.isPremium && (
            <div className={styles.premiumBadge}>
              <span className={styles.premiumBadgeIcon}>💎</span> PRO
            </div>
          )}
        </div>

        <h1 className={styles.name}>{profile.name}</h1>
        {profile.tagline && <p className={styles.tagline}>{profile.tagline}</p>}

        {/* Loading Skeleton / Profile Hydration */}
        {loadingProfile ? (
          <div className={styles.skeletonContainer}>
            <div className={styles.skeletonLine}></div>
            <div className={styles.skeletonLineShort}></div>
            <div className={styles.skeletonChips}>
              <div className={styles.skeletonChip}></div>
              <div className={styles.skeletonChip}></div>
            </div>
          </div>
        ) : (
          <>
            {/* Bio Section */}
            {profileData?.bio && (
              <p className={styles.bio}>
                {profileData.bio}
              </p>
            )}

            {/* Tags (Roles/Locations) */}
            {renderTags()}

            {/* Stats Row */}
            <div className={styles.statsRow}>
              <div className={styles.statBox}>
                <span className={styles.statVal}>{profileData?.diamonds || '0'}</span>
                <span className={styles.statLabel}>Points</span>
              </div>
              <div className={styles.statBoxDivider}></div>
              <div className={styles.statBox}>
                <span className={styles.statVal}>{profileData?.connectionCount || '0'}</span>
                <span className={styles.statLabel}>Connections</span>
              </div>
              <div className={styles.statBoxDivider}></div>
              <div className={styles.statBox}>
                <span className={styles.statVal}>{profileData?.tapCount || '0'}</span>
                <span className={styles.statLabel}>Taps</span>
              </div>
            </div>

            {/* Social Links List */}
            {renderSocials()}
          </>
        )}

        {/* Action Button & Badges */}
        <div className={styles.actions}>
          {loadingStatus ? (
            <div className={styles.statusBadgeLoading}>
              <div className={styles.miniSpinner}></div>
              Checking connection status...
            </div>
          ) : (
            <>
              {status === 'pending' && (
                <div className={styles.statusBadgePending}>
                  <span className={styles.statusEmoji}>⏳</span> Connection Request Sent
                </div>
              )}
              {status === 'accepted' && (
                <div className={styles.statusBadgeAccepted}>
                  <span className={styles.statusEmoji}>✅</span> Connected
                </div>
              )}
              {status === 'blocked' && (
                <div className={styles.statusBadgeBlocked}>
                  <span className={styles.statusEmoji}>🚫</span> Blocked
                </div>
              )}
              {(!status || status === 'rejected') && (
                <button
                  onClick={handleConnect}
                  disabled={loadingAction}
                  className={styles.openAppBtn}
                >
                  {loadingAction ? (
                    <div className={styles.miniSpinner}></div>
                  ) : isLoggedIn ? (
                    'Connect with me'
                  ) : (
                    'Sign in to Connect'
                  )}
                </button>
              )}
            </>
          )}

          <a href={`/@${username}`} className={styles.viewProfileLink}>
            View full professional page
          </a>
        </div>

        {error && <p className={styles.error}>{error}</p>}
      </div>
    </div>
  );
}
