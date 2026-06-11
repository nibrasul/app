'use client';

import { useState, useEffect } from 'react';
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

/* ─── Platform Icons ─────────────────────────────────────────────────────── */
const getPlatformIcon = (platform: string) => {
  const p = platform.toLowerCase();

  if (p.includes('whatsapp')) {
    return (
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
      </svg>
    );
  }
  if (p.includes('linkedin')) {
    return (
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect x="2" y="9" width="4" height="12" />
        <circle cx="4" cy="4" r="2" />
      </svg>
    );
  }
  if (p.includes('instagram')) {
    return (
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </svg>
    );
  }
  if (p.includes('facebook')) {
    return (
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    );
  }
  if (p.includes('github')) {
    return (
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
      </svg>
    );
  }
  if (p.includes('youtube')) {
    return (
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <rect x="2" y="3" width="20" height="18" rx="5" ry="5" />
        <path d="M10 15l5-3-5-3v6z" />
      </svg>
    );
  }
  if (p.includes('twitter') || p.includes('x.com')) {
    return (
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M4 4l11.733 16h4.267l-11.733-16z" />
        <path d="M4 20l6.768-6.768m2.46-2.46l6.772-6.772" />
      </svg>
    );
  }
  if (p.includes('telegram')) {
    return (
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M21.138 2.853a.5.5 0 0 0-.57-.053L2.23 11.8a.5.5 0 0 0 .03.9l4.58 1.54 2.88 5.76a.5.5 0 0 0 .9-.05l1.9-4.83 5.3 5.3a.5.5 0 0 0 .8-.37l2.8-16.8a.5.5 0 0 0-.28-.397z" />
        <path d="M6.8 13.34l7.2-5.34-5.2 6.34" />
      </svg>
    );
  }
  if (p.includes('email') || p.includes('mail')) {
    return (
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <path d="M22 6l-10 7L2 6" />
      </svg>
    );
  }
  if (p.includes('phone') || p.includes('call') || p.includes('tel')) {
    return (
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
      </svg>
    );
  }
  if (p.includes('dribbble')) {
    return (
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" />
        <path d="M8.56 2.75c4.37 6.03 6.02 9.42 8.03 17.72m2.54-15.38c-3.72 4.35-8.94 5.66-16.88 5.85m19.5 1.9c-3.5-.49-11.05 1-11.6 8.56" />
      </svg>
    );
  }
  if (p.includes('shop') || p.includes('store')) {
    return (
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
    );
  }
  if (p.includes('portfolio') || p.includes('camera')) {
    return (
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
        <circle cx="12" cy="13" r="4" />
      </svg>
    );
  }
  // Default globe
  return (
    <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      <path d="M2 12h20" />
    </svg>
  );
};

/* ─── Component ──────────────────────────────────────────────────────────── */
export default function ConnectClientPage({
  username,
  profile,
  isLoggedIn,
}: ConnectClientPageProps) {
  const [profileData, setProfileData] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [error, setError] = useState('');
  const [aboutOpen, setAboutOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);

  useEffect(() => {
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

    loadPublicData();
  }, [username]);

  /* ── Helpers ── */
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile.name} — Tapfolio`,
          text: `Connect with ${profile.name} on Tapfolio`,
          url: window.location.href,
        });
      } catch {}
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert('Profile link copied to clipboard!');
      } catch {}
    }
  };

  const handleSaveContact = () => {
    const roleText =
      profileData?.tags
        ?.filter((t: any) => t.type === 'role')
        .map((t: any) => t.text)
        .join(', ') || 'Creator';

    const locText =
      profileData?.tags?.find((t: any) => t.type === 'location')?.text || '';

    const emailLink =
      profileData?.socials?.find((s: any) =>
        s.platform.toLowerCase().includes('email')
      )?.url || '';
    const email = emailLink.replace('mailto:', '');

    const phoneLink =
      profileData?.socials?.find(
        (s: any) =>
          s.platform.toLowerCase().includes('phone') ||
          s.platform.toLowerCase().includes('whatsapp') ||
          s.platform.toLowerCase().includes('tel')
      )?.url || '';
    const phone = phoneLink
      .replace('tel:', '')
      .replace('https://wa.me/', '')
      .split('?')[0];

    const vcard = `BEGIN:VCARD\nVERSION:3.0\nFN:${profile.name}\nTITLE:${roleText}\nADR;TYPE=WORK:;;;${locText};;;\nEMAIL;TYPE=PREF,INTERNET:${email}\nTEL;TYPE=CELL:${phone}\nNOTE:Profile: https://www.tapfolio.me/connect/${username}\nEND:VCARD`;

    const blob = new Blob([vcard], { type: 'text/vcard;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.setAttribute('download', `${profile.name.replace(/\s+/g, '_')}_contact.vcf`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const getRoleTagline = () => {
    const roles =
      profileData?.tags
        ?.filter((t: any) => t.type === 'role')
        .map((t: any) => t.text) || [];
    if (roles.length > 0) return roles.join(' • ');
    return profile.tagline || 'Creator • Developer';
  };

  const getLocation = () =>
    profileData?.tags?.find((t: any) => t.type === 'location')?.text || '';

  const getBio = () => profileData?.bio || '';

  const getSocials = () => {
    const list = profileData?.socials || [];
    if (list.length === 0) {
      return [
        { id: 1, platform: 'Email', url: '#' },
        { id: 2, platform: 'LinkedIn', url: '#' },
        { id: 3, platform: 'Instagram', url: '#' },
      ];
    }
    return list;
  };

  const getContactItems = () => {
    const items: { label: string; val: string; href: string }[] = [];
    const emailSocial = profileData?.socials?.find((s: any) =>
      s.platform.toLowerCase().includes('email')
    );
    if (emailSocial)
      items.push({
        label: 'Email',
        val: emailSocial.handle || emailSocial.url.replace('mailto:', ''),
        href: emailSocial.url,
      });

    const phoneSocial = profileData?.socials?.find(
      (s: any) =>
        s.platform.toLowerCase().includes('phone') ||
        s.platform.toLowerCase().includes('whatsapp')
    );
    if (phoneSocial)
      items.push({
        label: 'Phone',
        val:
          phoneSocial.handle ||
          phoneSocial.url.replace('tel:', '').replace('https://wa.me/', '').split('?')[0],
        href: phoneSocial.url,
      });

    const webSocial = profileData?.socials?.find(
      (s: any) =>
        s.platform.toLowerCase().includes('portfolio') ||
        s.platform.toLowerCase().includes('website')
    );
    if (webSocial)
      items.push({
        label: 'Website',
        val: webSocial.handle || webSocial.url,
        href: webSocial.url,
      });

    const loc = getLocation();
    if (loc)
      items.push({
        label: 'Location',
        val: loc,
        href: `https://maps.google.com/?q=${encodeURIComponent(loc)}`,
      });

    return items;
  };

  const tagline = getRoleTagline();
  const location = getLocation();
  const bio = getBio();
  const socials = getSocials();
  const contactItems = getContactItems();

  return (
    <div className={styles.wrapper}>
      {/* ── App Header ── */}
      <h1 className={styles.appTitle}>Tapfolio</h1>

      {/* ── Card ── */}
      <div className={styles.card}>

        {/* Profile Section */}
        <div className={styles.profileSection}>
          {/* Share button top-right */}
          <button
            id="share-btn"
            className={styles.shareBtn}
            onClick={handleShare}
            aria-label="Share profile"
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13" />
            </svg>
          </button>

          {/* Avatar + Info row */}
          <div className={styles.profileRow}>
            <img
              src={profile.avatar || '/profile_avatar.png'}
              alt={profile.name}
              className={styles.avatar}
            />
            <div className={styles.profileInfo}>
              <h2 className={styles.name}>{profile.name}</h2>
              {tagline && <p className={styles.tagline}>{tagline}</p>}
              {location && (
                <span className={styles.location}>
                  <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                    <circle cx="12" cy="9" r="2.5" />
                  </svg>
                  {location}
                </span>
              )}
            </div>
          </div>

          {/* Save Contact button */}
          <button
            id="save-contact-btn"
            className={styles.saveContactBtn}
            onClick={handleSaveContact}
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0z" />
            </svg>
            Save Contact
          </button>
        </div>

        {/* Divider */}
        <div className={styles.divider} />

        {/* Social Grid */}
        <div className={styles.socialGrid}>
          {socials.map((link: any) => (
            <a
              key={link.id}
              id={`social-tile-${link.id}`}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialTile}
            >
              <div className={styles.tileIcon}>{getPlatformIcon(link.platform)}</div>
              <span className={styles.tileName}>{link.platform}</span>
            </a>
          ))}
        </div>

        {error && <p className={styles.error}>{error}</p>}

        {/* About Me + Contact Rows */}
        <div className={styles.listSection}>
          {/* About Me */}
          <button
            id="about-me-btn"
            className={styles.listRow}
            onClick={() => setAboutOpen((o) => !o)}
            aria-expanded={aboutOpen}
          >
            <span className={styles.listRowIcon}>
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0zM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </span>
            <span className={styles.listRowLabel}>About Me</span>
            <span className={styles.listRowChevron}>
              <svg
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
                style={{ transform: aboutOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </button>
          {aboutOpen && bio && (
            <div className={styles.expandedContent}>{bio}</div>
          )}

          {/* Contact */}
          {contactItems.length > 0 && (
            <>
              <button
                id="contact-btn"
                className={styles.listRow}
                onClick={() => setContactOpen((o) => !o)}
                aria-expanded={contactOpen}
              >
                <span className={styles.listRowIcon}>
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0z" />
                  </svg>
                </span>
                <span className={styles.listRowLabel}>Contact</span>
                <span className={styles.listRowChevron}>
                  <svg
                    width="16"
                    height="16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    viewBox="0 0 24 24"
                    style={{ transform: contactOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </button>
              {contactOpen && (
                <div className={styles.expandedContent}>
                  {contactItems.map((item) => (
                    <a key={item.label} href={item.href} target="_blank" rel="noopener noreferrer" className={styles.contactItem}>
                      <strong>{item.label}:</strong> {item.val}
                    </a>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── Footer ── */}
      <div className={styles.footer}>
        <p className={styles.footerPowered}>
          Powered by <strong>Tapfolio</strong>
        </p>
        <a href="/login" id="create-tapfolio-link" className={styles.footerCta}>
          Create your Tapfolio
          <span className={styles.footerCtaArrow}>
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </a>
      </div>
    </div>
  );
}
