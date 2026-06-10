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

// Helper to check user online status
const getIsOnline = (profileData: any) => {
  return profileData?.isOnline !== false;
};

// Platform Custom Icon Renderer with Telegram, Behance, Resume & Link support
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
  if (p.includes('whatsapp')) {
    return (
      <svg className={styles.socialSvg} fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.717-1.456L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.413 9.863-9.83.001-2.624-1.013-5.092-2.859-6.944-1.846-1.853-4.306-2.873-6.93-2.875-5.437 0-9.863 4.414-9.866 9.833-.001 1.762.478 3.486 1.385 5.018l-.995 3.637 3.762-.99zM17.72 14.88c-.31-.155-1.832-.903-2.113-1.005-.28-.102-.485-.155-.688.155-.203.31-.787.983-.965 1.187-.177.203-.355.228-.665.073-1.077-.54-1.867-1.01-2.6-1.64-.574-.492-.942-1.084-1.055-1.278-.113-.193-.012-.298.086-.395.09-.088.203-.228.305-.34.1-.114.133-.19.2-.317.066-.127.033-.24-.017-.343-.05-.102-.485-1.168-.665-1.6-.174-.42-.35-.363-.48-.363-.125-.002-.27-.002-.413-.002-.143 0-.376.053-.572.27-.197.216-.75.733-.75 1.79 0 1.057.77 2.08.877 2.224.11.143 1.516 2.313 3.67 3.242.513.22 1.05.353 1.536.505.518.163.99.14 1.36.084.412-.06 1.832-.75 2.087-1.472.254-.722.254-1.343.178-1.473-.076-.13-.28-.203-.59-.358z"/>
      </svg>
    );
  }
  if (p.includes('telegram')) {
    return (
      <svg className={styles.socialSvg} fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.56 8.61l-1.92 9.07c-.14.65-.53.81-1.08.5l-2.93-2.16-1.41 1.36c-.16.16-.29.29-.6.29l.21-2.97 5.41-4.89c.23-.21-.05-.32-.36-.12L8.2 14.51l-2.88-.9c-.63-.2-1.07-.63.04-.9L16.2 4.9c.5-.18 1 .16.8.96z"/>
      </svg>
    );
  }
  if (p.includes('behance')) {
    return (
      <svg className={styles.socialSvg} fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M8.2 20H3V4h5.2a4 4 0 011.6.3 3.6 3.6 0 012.3 3.4 3.4 0 01-1.1 2.6 3.8 3.8 0 011.6 3.2v.3A4.2 4.2 0 0110.9 18a4.6 4.6 0 01-2.7 2zm.2-9.6H5v3.1h3.4A1.6 1.6 0 0010 12a1.5 1.5 0 00-1.6-1.6zm-.2-4.4H5V9h3.2a1.5 1.5 0 001.5-1.5A1.5 1.5 0 008.2 6zm13.8 6.5h-7.6a3.8 3.8 0 00.9 2.5 3.3 3.3 0 002.5.9 3.5 3.5 0 002.8-1.2l1.4 1A5.3 5.3 0 0117.8 18c-3.1 0-5.3-2.2-5.3-5.5S14.7 7 17.7 7c2.8 0 4.9 2 4.9 5v.5zM17.6 9c-1 0-1.8.6-2.1 1.5h4.2c0-1-.8-1.5-2.1-1.5zm.9-4.5H15V6h3.5V4.5z"/>
      </svg>
    );
  }
  if (p.includes('resume') || p.includes('cv') || p.includes('download')) {
    return (
      <svg className={styles.socialSvg} fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
      </svg>
    );
  }
  if (p.includes('portfolio') || p.includes('link') || p.includes('website')) {
    return (
      <svg className={styles.socialSvg} fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/>
      </svg>
    );
  }
  return (
    <svg className={styles.socialSvg} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
  );
};

// Platform Custom App icon Background Colors
const getPlatformColor = (platform: string, customColor?: string) => {
  if (customColor) return customColor;
  const p = platform.toLowerCase();
  if (p.includes('instagram')) return 'linear-gradient(135deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)';
  if (p.includes('linkedin')) return '#0a66c2';
  if (p.includes('telegram')) return '#229ed9';
  if (p.includes('whatsapp')) return '#25d366';
  if (p.includes('behance')) return '#0057ff';
  if (p.includes('github')) return '#181717';
  if (p.includes('twitter') || p.includes('x.com')) return '#000000';
  if (p.includes('youtube')) return '#ff0000';
  if (p.includes('resume') || p.includes('cv') || p.includes('download')) return '#2563eb';
  if (p.includes('portfolio') || p.includes('link') || p.includes('website')) return '#1d4ed8';
  return '#64748b';
};

// SVG Icon selector for profile tag items
const getTagIcon = (text: string, type: string) => {
  const t = text.toLowerCase();
  if (type === 'role' || t.includes('designer') || t.includes('developer') || t.includes('creator')) {
    if (t.includes('creator') || t.includes('artist') || t.includes('media') || t.includes('video')) {
      // Video camera
      return (
        <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M23 6.999l-7 5.6v-4.6c0-.55-.45-1-1-1h-14c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h14c.55 0 1-.45 1-1v-4.6l7 5.6v-13z"/>
        </svg>
      );
    }
    // Profile User silhouette
    return (
      <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
      </svg>
    );
  }
  if (type === 'location' || t.includes('india') || t.includes('bangalore') || t.includes('earth')) {
    // Map pin marker
    return (
      <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
      </svg>
    );
  }
  return '⚡';
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
    if (tags.length === 0) {
      // Return beautiful default tags if not yet fetched
      return (
        <div className={styles.tagsStack}>
          <div className={styles.profileTag}>
            <div className={styles.tagIconWrapper}>
              {getTagIcon('UI/UX Designer', 'role')}
            </div>
            <span>UI/UX Designer</span>
          </div>
          <div className={styles.profileTag}>
            <div className={styles.tagIconWrapper}>
              {getTagIcon('Digital Creator', 'role')}
            </div>
            <span>Digital Creator</span>
          </div>
          <div className={styles.profileTag}>
            <div className={styles.tagIconWrapper}>
              {getTagIcon('Bangalore, India', 'location')}
            </div>
            <span>Bangalore, India</span>
          </div>
        </div>
      );
    }
    return (
      <div className={styles.tagsStack}>
        {tags.map((t: any) => {
          return (
            <div key={t.id} className={styles.profileTag}>
              <div className={styles.tagIconWrapper}>
                {getTagIcon(t.text, t.type)}
              </div>
              <span>{t.text}</span>
            </div>
          );
        })}
      </div>
    );
  };

  const renderSocials = () => {
    const socials = profileData?.socials || [];
    if (socials.length === 0) return null;
    return (
      <div className={styles.linkTreeCard}>
        <div className={styles.linkTreeHeader}>
          <span>•••</span> Connect with me <span>•••</span>
        </div>
        <div className={styles.socialList}>
          {socials.map((link: any) => {
            return (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialRow}
              >
                <div className={styles.socialRowLeft}>
                  <div 
                    className={styles.socialIconWrapper} 
                    style={{ background: getPlatformColor(link.platform, link.color) }}
                  >
                    {getPlatformIcon(link.platform)}
                  </div>
                  <div className={styles.socialLabels}>
                    <span className={styles.socialPlatformName}>{link.platform}</span>
                    <span className={styles.socialPlatformHandle}>{link.handle}</span>
                  </div>
                </div>
                <span className={styles.socialRowRight}>
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
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
      <div className={styles.card}>
        
        {/* Top Bar Logo and Counter */}
        <div className={styles.cardTopBar}>
          <div className={styles.logoMark}>
            <div className={styles.logoIcon}>T</div>
            <span className={styles.logoText}>tapfolio</span>
          </div>
          
          <div className={styles.pointsCapsule}>
            <span>💎 {profileData?.diamonds || '12000'}</span>
            <div className={styles.pointsPlusBtn}>+</div>
          </div>
        </div>

        {/* Profile Name & Squiggly tagline */}
        <div className={styles.profileIntro}>
          <div className={styles.greetingText}>👋 Hey, i am</div>
          <h1 className={styles.name}>{profile.name}</h1>
          <div className={styles.squigglyUnderline}>{profile.tagline || "Let's connect!"}</div>
        </div>

        {/* Profile Avatar double border and active status + Tags Stack side-by-side */}
        <div className={styles.profileIdentityRow}>
          <div className={styles.avatarWrapper}>
            <img
              src={profile.avatar || '/profile_avatar.png'}
              alt={profile.name}
              className={styles.avatar}
            />
            {getIsOnline(profileData) && (
              <div className={styles.onlineIndicator} title="Online now"></div>
            )}
          </div>

          {/* Tags Stack on the right side */}
          {renderTags()}
        </div>

        {/* Bio text block with highlighted words */}
        {profileData?.bio && (
          <p className={styles.bioText}>
            {profileData.bio.includes('connect brands') ? (
              <>
                {profileData.bio.split('connect brands')[0]}
                <strong>connect brands</strong>
                {profileData.bio.split('connect brands')[1]}
              </>
            ) : (
              profileData.bio
            )}
          </p>
        )}

        {/* Social Links tree white card */}
        {renderSocials()}

        {/* Main Action Buttons */}
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

        {/* Quote Banner with script signature */}
        <div className={styles.quoteBanner}>
          <div className={styles.quoteLeftIcon}>“</div>
          <p className={styles.quoteText}>
            Design is not just what it looks like, it's how it connects.
          </p>
          <div className={styles.quoteSignature}>
            {profile.name}
          </div>
        </div>

      </div>
    </div>
  );
}
