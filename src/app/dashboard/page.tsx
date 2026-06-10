'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import LoadingScreen from '@/components/LoadingScreen';
import styles from './page.module.css';

interface Tag {
  id?: number;
  text: string;
  type: string;
}

interface SocialLink {
  id?: number;
  platform: string;
  handle: string;
  url: string;
  icon: string;
  color: string;
}

interface Profile {
  id: number;
  userId: number;
  name: string;
  username: string;
  tagline: string;
  avatar: string;
  isOnline: boolean;
  bio: string;
  diamonds: string;
  isPremium: boolean;
  tapCount: number;
  tags: Tag[];
  socials: SocialLink[];
  user?: {
    profileReady: boolean;
    connectionCount?: number;
    sharingSettings: {
      shareName: boolean;
      shareEmail: boolean;
      sharePhone: boolean;
      shareWhatsapp: boolean;
      shareLocation: boolean;
    } | null;
  };
}

interface ChecklistItem {
  id: string;
  label: string;
  points: number;
  completed: boolean;
  description: string;
}

interface SharingSettings {
  shareName: boolean;
  shareEmail: boolean;
  sharePhone: boolean;
  shareWhatsapp: boolean;
  shareLocation: boolean;
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

export default function Dashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [historyEvents, setHistoryEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Tabs Navigation
  const [activeTab, setActiveTab] = useState<'overview' | 'customizer' | 'sharing'>('overview');

  // Editable fields
  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('');
  const [isPremium, setIsPremium] = useState(false);

  // Tags states
  const [tags, setTags] = useState<Tag[]>([]);
  const [newTagText, setNewTagText] = useState('');
  const [newTagType, setNewTagType] = useState('role');

  // Socials states
  const [socials, setSocials] = useState<SocialLink[]>([]);
  const [newPlatform, setNewPlatform] = useState('GitHub');
  const [newHandle, setNewHandle] = useState('');
  const [newUrl, setNewUrl] = useState('');

  // Sharing Settings
  const [sharingSettings, setSharingSettings] = useState<SharingSettings>({
    shareName: true,
    shareEmail: true,
    sharePhone: false,
    shareWhatsapp: true,
    shareLocation: false,
  });
  const [savingSharing, setSavingSharing] = useState(false);

  // Score & Checklist
  const [score, setScore] = useState(0);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);

  // Payment Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/profile');
      if (!res.ok) throw new Error('Failed to fetch profile.');
      const data = await res.json();
      if (data.success) {
        setProfile(data.profile);
        setName(data.profile.name);
        setTagline(data.profile.tagline || '');
        setBio(data.profile.bio || '');
        setAvatar(data.profile.avatar);
        setIsPremium(data.profile.isPremium);
        setTags(data.profile.tags || []);
        setSocials(data.profile.socials || []);
        setScore(data.score);
        setChecklist(data.items);
      }
    } catch (err: any) {
      setError(err.message || 'Error loading profile.');
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/history');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setHistoryEvents(data.events || []);
        }
      }
    } catch (err) {
      console.error('Failed to fetch history logs:', err);
    }
  };

  const fetchSharingSettings = async () => {
    try {
      const res = await fetch('/api/connections/settings');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.settings) {
          setSharingSettings(data.settings);
        }
      }
    } catch (err) {
      console.error('Failed to fetch sharing settings:', err);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchHistory();
    fetchSharingSettings();
  }, []);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setSaving(true);
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setAvatar(data.url);
        setSuccess('Avatar uploaded successfully! Save your profile to finalize.');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        throw new Error(data.error || 'Upload failed');
      }
    } catch (err: any) {
      setError(err.message || 'Upload error');
      setTimeout(() => setError(''), 5000);
    } finally {
      setSaving(false);
    }
  };

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagText.trim()) return;
    const isDuplicate = tags.some(
      (t) => t.text.toLowerCase() === newTagText.trim().toLowerCase() && t.type === newTagType
    );
    if (isDuplicate) return;

    setTags([...tags, { text: newTagText.trim(), type: newTagType }]);
    setNewTagText('');
  };

  const handleRemoveTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const handleAddSocial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHandle.trim() || !newUrl.trim()) return;

    const platformSpecs: Record<string, { color: string; icon: string }> = {
      GitHub: { color: '#24292e', icon: 'github' },
      LinkedIn: { color: '#0077b5', icon: 'linkedin' },
      Twitter: { color: '#1da1f2', icon: 'twitter' },
      Instagram: { color: '#e1306c', icon: 'instagram' },
      YouTube: { color: '#ff0000', icon: 'youtube' },
      Website: { color: '#10b981', icon: 'globe' },
    };

    const specs = platformSpecs[newPlatform] || { color: '#6366f1', icon: 'link' };

    setSocials([
      ...socials,
      {
        platform: newPlatform,
        handle: newHandle.trim(),
        url: newUrl.trim().startsWith('http') ? newUrl.trim() : `https://${newUrl.trim()}`,
        icon: specs.icon,
        color: specs.color,
      },
    ]);

    setNewHandle('');
    setNewUrl('');
  };

  const handleRemoveSocial = (index: number) => {
    setSocials(socials.filter((_, i) => i !== index));
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          tagline,
          bio,
          avatar,
          tags,
          socials,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update profile.');

      setSuccess('Profile saved successfully!');
      setProfile(data.profile);
      setScore(data.score);
      setChecklist(data.items);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSharingSettings = async () => {
    setSavingSharing(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/connections/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sharingSettings),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update sharing settings.');

      setSuccess('Sharing preferences updated!');
      setSharingSettings(data.settings);
      
      // Refresh profile to update checklist points
      await fetchProfile();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update settings.');
    } finally {
      setSavingSharing(false);
    }
  };

  const handleUpgradePayment = async () => {
    setPaymentProcessing(true);
    setError('');

    setTimeout(async () => {
      try {
        const res = await fetch('/api/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isPremium: true }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error('Upgrade update failed.');

        setIsPremium(true);
        if (profile) {
          setProfile({ ...profile, isPremium: true });
        }
        setShowPaymentModal(false);
        setSuccess('Upgrade successful! You are now a premium member and eligible for the leaderboard.');
        setTimeout(() => setSuccess(''), 5000);
      } catch (err: any) {
        setError(err.message || 'Upgrade failed.');
      } finally {
        setPaymentProcessing(false);
      }
    }, 2000);
  };

  if (loading) {
    return <LoadingScreen message="Loading your dashboard..." />;
  }

  const publicLink = profile ? `${window.location.origin}/@${profile.username}` : '';

  const calculateProgress = () => {
    let pct = 40;
    const checklistItems = [
      { id: 'signup', label: 'Create Account', completed: true, value: 40, desc: 'Sign up with name & email' },
      { id: 'username', label: 'Customize Username', completed: false, value: 15, desc: 'Set a custom username link' },
      { id: 'photo_headline', label: 'Photo & Headline', completed: false, value: 15, desc: 'Upload an avatar and set tagline' },
      { id: 'sharing', label: 'Sharing Preferences', completed: false, value: 15, desc: 'Set your contact sharing settings' },
      { id: 'socials', label: 'Add Social Link', completed: false, value: 15, desc: 'Add at least one social profile' },
    ];

    if (profile?.user?.profileReady) {
      checklistItems[1].completed = true;
      pct += 15;
    }

    const hasCustomAvatar = profile?.avatar && profile.avatar !== '/profile_avatar.png' && !profile.avatar.includes('profile_avatar.png');
    const hasCustomTagline = profile?.tagline && profile.tagline.trim().length > 0 && profile.tagline !== "Let's connect!";
    if (hasCustomAvatar && hasCustomTagline) {
      checklistItems[2].completed = true;
      pct += 15;
    }

    if (profile?.user?.sharingSettings) {
      checklistItems[3].completed = true;
      pct += 15;
    }

    if (profile?.socials && profile.socials.length >= 1) {
      checklistItems[4].completed = true;
      pct += 15;
    }

    return { percentage: pct, items: checklistItems };
  };

  const progressData = calculateProgress();

  return (
    <div className={styles.wrapper}>
      <Header />
      <main className={styles.main}>
        {success && <div className={styles.toastSuccess}>{success}</div>}
        {error && <div className={styles.toastError}>{error}</div>}

        {/* Tab Navigation Menu */}
        <div className={styles.tabNavContainer}>
          <button
            onClick={() => setActiveTab('overview')}
            className={`${styles.tabBtn} ${activeTab === 'overview' ? styles.activeTab : ''}`}
          >
            <span className={styles.tabIcon}>📊</span> Overview
          </button>
          <button
            onClick={() => setActiveTab('customizer')}
            className={`${styles.tabBtn} ${activeTab === 'customizer' ? styles.activeTab : ''}`}
          >
            <span className={styles.tabIcon}>🪪</span> Customize Card
          </button>
          <button
            onClick={() => setActiveTab('sharing')}
            className={`${styles.tabBtn} ${activeTab === 'sharing' ? styles.activeTab : ''}`}
          >
            <span className={styles.tabIcon}>🔒</span> Privacy & Sharing
          </button>
        </div>

        {/* ==================== TAB 1: OVERVIEW ==================== */}
        {activeTab === 'overview' && (
          <div className={styles.tabContentFade}>
            
            {/* Top Metric Cards Panel */}
            <div className={styles.metricGrid}>
              
              {/* Score / Checklist Widget */}
              <div className={`${styles.card} ${styles.scoreMetricCard} glass-panel`}>
                <div className={styles.metricCardHeader}>
                  <div>
                    <h3 className={styles.metricTitle}>Profile Completeness</h3>
                    <p className={styles.metricSubtitle}>Complete steps to maximize outreach</p>
                  </div>
                  <div className={styles.metricScoreBadge}>{progressData.percentage}%</div>
                </div>
                <div className={styles.metricProgressBg}>
                  <div className={styles.metricProgressFill} style={{ width: `${progressData.percentage}%` }} />
                </div>
                
                {/* Horizontal Checklist summary */}
                <div className={styles.quickChecklist}>
                  {progressData.items.map((item) => (
                    <div key={item.id} className={`${styles.quickCheckItem} ${item.completed ? styles.quickCheckDone : ''}`}>
                      <span className={styles.quickCheckDot}>{item.completed ? '✓' : '○'}</span>
                      <span className={styles.quickCheckLabel}>{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Share NFC Card Widget */}
              <div className={`${styles.card} glass-panel`}>
                <h3 className={styles.metricTitle}>NFC Smart Link</h3>
                <p className={styles.metricSubtitle}>Link programmable to physical NFC tags</p>
                
                <div className={styles.shareInputGroup}>
                  <input readOnly value={publicLink} className={styles.shareUrlField} />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(publicLink);
                      setSuccess('Link copied to clipboard!');
                      setTimeout(() => setSuccess(''), 3000);
                    }}
                    className={styles.shareCopyBtn}
                  >
                    Copy Link
                  </button>
                </div>
                
                <a href={publicLink} target="_blank" className={styles.viewLiveBtn}>
                  View Live Profile Card →
                </a>
              </div>

              {/* Plan Subscription Widget */}
              <div className={`${styles.card} ${styles.subscriptionMetricCard} glass-panel`}>
                {isPremium ? (
                  <div className={styles.subActiveContent}>
                    <div className={styles.goldBannerBadge}>💎 PREMIUM MEMBER</div>
                    <h3 className={styles.subActiveTitle}>Account Status: Pro</h3>
                    <p className={styles.subActiveDesc}>Your card is eligible for the global public leaderboard listings.</p>
                  </div>
                ) : (
                  <div className={styles.subInactiveContent}>
                    <h3 className={styles.subTitle}>Tapfolio Premium</h3>
                    <p className={styles.subDesc}>List your card on the global network rank leaderboards.</p>
                    <button onClick={() => setShowPaymentModal(true)} className={styles.upgradeMetricBtn}>
                      Upgrade for $9.99
                    </button>
                  </div>
                )}
              </div>

            </div>

            {/* Main Overview Columns */}
            <div className={styles.overviewDashboardGrid}>
              
              {/* Left Column: Live Card Preview Mockup */}
              <div className={styles.cardPreviewColumn}>
                <h3 className={styles.gridSectionTitle}>Live Card Mockup</h3>
                <div className={styles.mockCardWrapper}>
                  {/* Holographic design elements and layout mirroring ConnectClientPage */}
                  <div className={styles.mockCardTopBar}>
                    <div className={styles.mockNfcChip}>
                      <div className={styles.mockNfcInner}></div>
                    </div>
                    <div className={styles.mockLogo}>Tap<span>folio</span></div>
                  </div>
                  
                  <div className={styles.mockAvatarArea}>
                    <img src={avatar || '/profile_avatar.png'} alt="Avatar" className={styles.mockAvatar} />
                    <div className={styles.mockAvatarRing}></div>
                    {isPremium && <div className={styles.mockProBadge}>💎 PRO</div>}
                  </div>

                  <h2 className={styles.mockName}>{name || 'Your Name'}</h2>
                  <p className={styles.mockTagline}>{tagline || 'Your tagline goes here...'}</p>
                  {bio && <p className={styles.mockBio}>{bio}</p>}

                  {/* Mock Tags */}
                  {tags.length > 0 && (
                    <div className={styles.mockTagsContainer}>
                      {tags.map((t, idx) => (
                        <span key={idx} className={t.type === 'location' ? styles.mockTagLoc : styles.mockTagRole}>
                          {t.type === 'location' ? '📍' : '⚡'} {t.text}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Mock Stats */}
                  <div className={styles.mockStatsRow}>
                    <div className={styles.mockStatItem}>
                      <span className={styles.mockStatVal}>{profile?.diamonds || '0'}</span>
                      <span className={styles.mockStatLabel}>Points</span>
                    </div>
                    <div className={styles.mockStatDivider}></div>
                    <div className={styles.mockStatItem}>
                      <span className={styles.mockStatVal}>{profile?.user?.connectionCount ?? 0}</span>
                      <span className={styles.mockStatLabel}>Connections</span>
                    </div>
                    <div className={styles.mockStatDivider}></div>
                    <div className={styles.mockStatItem}>
                      <span className={styles.mockStatVal}>{profile?.tapCount || '0'}</span>
                      <span className={styles.mockStatLabel}>Taps</span>
                    </div>
                  </div>

                  {/* Mock Social Link Tree */}
                  {socials.length > 0 && (
                    <div className={styles.mockSocialSection}>
                      <span className={styles.mockSocialTitle}>Connected Links ({socials.length})</span>
                      <div className={styles.mockSocialGrid}>
                        {socials.slice(0, 3).map((s, idx) => (
                          <div key={idx} className={styles.mockSocialCard} style={{ borderColor: s.color + '44' }}>
                            <div className={styles.mockSocialLeft}>
                              <div className={styles.mockSocialIconCircle} style={{ color: s.color, background: s.color + '15' }}>
                                {getPlatformIcon(s.platform)}
                              </div>
                              <div className={styles.mockSocialDetails}>
                                <span className={styles.mockPlatformName}>{s.platform}</span>
                                <span className={styles.mockPlatformHandle}>{s.handle}</span>
                              </div>
                            </div>
                            <span className={styles.mockArrow}>↗</span>
                          </div>
                        ))}
                        {socials.length > 3 && (
                          <div className={styles.mockSocialMore}>+ {socials.length - 3} more links</div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className={styles.mockBtn}>Connect with me</div>
                </div>
              </div>

              {/* Right Column: Recent Activity Feed */}
              <div className={`${styles.card} glass-panel`}>
                <h3 className={styles.sectionTitle}>Recent Network Logs</h3>
                {historyEvents.length === 0 ? (
                  <div className={styles.emptyWelcomeState}>
                    <div className={styles.emptyIcon}>👋</div>
                    <h3>Your profile is ready!</h3>
                    <p>When users tap your card or send connection requests, logs will stream here.</p>
                  </div>
                ) : (
                  <div className={styles.recentLogsList}>
                    {historyEvents.slice(0, 6).map((event) => (
                      <div key={event.id} className={styles.logItem}>
                        <span className={styles.logIcon}>{event.icon || '🔗'}</span>
                        <div className={styles.logInfo}>
                          <strong>{event.action}</strong>
                          <p>{event.details}</p>
                          <span className={styles.logTime}>
                            {new Date(event.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                    <Link href="/history" className={styles.viewAllLogs}>
                      View complete logs history →
                    </Link>
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

        {/* ==================== TAB 2: CUSTOMIZER ==================== */}
        {activeTab === 'customizer' && (
          <div className={`${styles.tabContentFade} ${styles.customizerGrid}`}>
            
            {/* Left side: Basic info form details */}
            <div className={`${styles.card} glass-panel`}>
              <h3 className={styles.sectionTitle}>General Card Customizer</h3>
              
              <div className={styles.avatarContainer}>
                <div className={styles.avatarPreviewWrapper}>
                  <img src={avatar || '/profile_avatar.png'} alt="Avatar" className={styles.avatarPreview} />
                  <div className={styles.avatarPreviewRing}></div>
                </div>
                <div>
                  <label htmlFor="avatar-file" className={styles.uploadBtn}>
                    Upload New Photo
                    <input
                      id="avatar-file"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className={styles.fileInput}
                    />
                  </label>
                  <p className={styles.uploadHint}>SVG, PNG, or JPG (max. 2MB)</p>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Display Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Jane Doe" />
              </div>

              <div className={styles.formGroup}>
                <label>Card Tagline</label>
                <input type="text" value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder="e.g. Full Stack Engineer" />
              </div>

              <div className={styles.formGroup}>
                <label>Professional Bio</label>
                <textarea rows={4} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Describe yourself, your work, or networking goals..." />
              </div>

              <button onClick={handleSaveProfile} disabled={saving} className={styles.saveBtn}>
                {saving ? 'Saving Changes...' : 'Save General Details'}
              </button>
            </div>

            {/* Right side: Socials and Skills editor */}
            <div className={styles.midCol}>
              
              {/* SKILLS & LOCATIONS EDITOR */}
              <div className={`${styles.card} glass-panel`}>
                <h3 className={styles.sectionTitle}>Skills & Locations</h3>
                <p className={styles.cardDesc}>Select tags to represent your specialization and location</p>
                
                <form onSubmit={handleAddTag} className={styles.tagFormRow}>
                  <input
                    type="text"
                    placeholder="e.g. Typescript, London..."
                    value={newTagText}
                    onChange={(e) => setNewTagText(e.target.value)}
                    className={styles.tagInputField}
                  />
                  <select value={newTagType} onChange={(e) => setNewTagType(e.target.value)} className={styles.tagSelectField}>
                    <option value="role">Role / Skill</option>
                    <option value="location">Location</option>
                  </select>
                  <button type="submit" className={styles.tagAddBtn}>Add</button>
                </form>

                <div className={styles.tagsContainer}>
                  {tags.map((t, idx) => (
                    <span
                      key={idx}
                      className={`${styles.tagItem} ${t.type === 'location' ? styles.tagLoc : styles.tagRole}`}
                    >
                      {t.type === 'location' ? '📍' : '⚡'} {t.text}
                      <button type="button" onClick={() => handleRemoveTag(idx)} className={styles.tagDelete}>×</button>
                    </span>
                  ))}
                </div>
                <button onClick={handleSaveProfile} disabled={saving} className={styles.saveBtnSecondary}>
                  Save Tags
                </button>
              </div>

              {/* SOCIAL PROFILES EDITOR */}
              <div className={`${styles.card} glass-panel`}>
                <h3 className={styles.sectionTitle}>Social Profiles & Link Tree</h3>
                <p className={styles.cardDesc}>Add external links to build your contact profile hub</p>
                
                <form onSubmit={handleAddSocial} className={styles.socialForm}>
                  <div className={styles.formRow}>
                    <select value={newPlatform} onChange={(e) => setNewPlatform(e.target.value)} className={styles.socialSelect}>
                      <option value="GitHub">GitHub</option>
                      <option value="LinkedIn">LinkedIn</option>
                      <option value="Twitter">Twitter / X</option>
                      <option value="Instagram">Instagram</option>
                      <option value="YouTube">YouTube</option>
                      <option value="Website">Personal Website</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Handle/Username"
                      value={newHandle}
                      onChange={(e) => setNewHandle(e.target.value)}
                      className={styles.socialInput}
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Full Link URL (e.g. https://github.com/name)"
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    className={styles.socialInput}
                  />
                  <button type="submit" className={styles.addButton}>Add New Social Profile</button>
                </form>

                <div className={styles.socialList}>
                  {socials.map((s, idx) => (
                    <div key={idx} className={styles.socialRow} style={{ borderColor: s.color + '44' }}>
                      <div className={styles.socialRowInfo}>
                        <div className={styles.socialLogoBadge} style={{ color: s.color, background: s.color + '15' }}>
                          {getPlatformIcon(s.platform)}
                        </div>
                        <div>
                          <strong>{s.platform}</strong>
                          <span className={styles.socialRowHandle}>{s.handle}</span>
                        </div>
                      </div>
                      <button type="button" onClick={() => handleRemoveSocial(idx)} className={styles.socialDelete}>
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
                <button onClick={handleSaveProfile} disabled={saving} className={styles.saveBtnSecondary}>
                  Save Social Profiles
                </button>
              </div>

            </div>

          </div>
        )}

        {/* ==================== TAB 3: PRIVACY & SHARING ==================== */}
        {activeTab === 'sharing' && (
          <div className={styles.tabContentFade}>
            <div className={`${styles.card} ${styles.sharingSettingsCard} glass-panel`}>
              <h3 className={styles.sectionTitle}>Privacy & Auto-Exchange Settings</h3>
              <p className={styles.cardDesc}>
                Define which contact details are shared automatically when you accept or finalize a connection request with another professional.
              </p>

              <div className={styles.sharingTogglesList}>
                
                {/* Share Name */}
                <div className={styles.toggleRow}>
                  <div className={styles.toggleInfo}>
                    <strong>Share Full Name</strong>
                    <p>Show your real name to accepted connections.</p>
                  </div>
                  <label className={styles.switch}>
                    <input
                      type="checkbox"
                      checked={sharingSettings.shareName}
                      onChange={(e) => setSharingSettings({ ...sharingSettings, shareName: e.target.checked })}
                    />
                    <span className={styles.slider}></span>
                  </label>
                </div>

                {/* Share Email */}
                <div className={styles.toggleRow}>
                  <div className={styles.toggleInfo}>
                    <strong>Share Email Address</strong>
                    <p>Allows connections to email you directly.</p>
                  </div>
                  <label className={styles.switch}>
                    <input
                      type="checkbox"
                      checked={sharingSettings.shareEmail}
                      onChange={(e) => setSharingSettings({ ...sharingSettings, shareEmail: e.target.checked })}
                    />
                    <span className={styles.slider}></span>
                  </label>
                </div>

                {/* Share Phone */}
                <div className={styles.toggleRow}>
                  <div className={styles.toggleInfo}>
                    <strong>Share Phone Number</strong>
                    <p>Provide contact number to connections.</p>
                  </div>
                  <label className={styles.switch}>
                    <input
                      type="checkbox"
                      checked={sharingSettings.sharePhone}
                      onChange={(e) => setSharingSettings({ ...sharingSettings, sharePhone: e.target.checked })}
                    />
                    <span className={styles.slider}></span>
                  </label>
                </div>

                {/* Share Whatsapp */}
                <div className={styles.toggleRow}>
                  <div className={styles.toggleInfo}>
                    <strong>Share WhatsApp Chat Link</strong>
                    <p>Enable direct chat via WhatsApp redirect.</p>
                  </div>
                  <label className={styles.switch}>
                    <input
                      type="checkbox"
                      checked={sharingSettings.shareWhatsapp}
                      onChange={(e) => setSharingSettings({ ...sharingSettings, shareWhatsapp: e.target.checked })}
                    />
                    <span className={styles.slider}></span>
                  </label>
                </div>

                {/* Share Location */}
                <div className={styles.toggleRow}>
                  <div className={styles.toggleInfo}>
                    <strong>Share Location</strong>
                    <p>Show location tags in connection lists.</p>
                  </div>
                  <label className={styles.switch}>
                    <input
                      type="checkbox"
                      checked={sharingSettings.shareLocation}
                      onChange={(e) => setSharingSettings({ ...sharingSettings, shareLocation: e.target.checked })}
                    />
                    <span className={styles.slider}></span>
                  </label>
                </div>

              </div>

              <button
                onClick={handleSaveSharingSettings}
                disabled={savingSharing}
                className={styles.saveBtn}
              >
                {savingSharing ? 'Saving Settings...' : 'Save Sharing Preferences'}
              </button>
            </div>
          </div>
        )}

      </main>

      {/* STRIPE-STYLE PAYMENT MODAL */}
      {showPaymentModal && (
        <div className={styles.modalOverlay}>
          <div className={`${styles.modalContent} glass-panel`}>
            <h2>Tapfolio Checkout</h2>
            <p className={styles.modalSub}>Upgrade profile to Premium membership.</p>
            <div className={styles.stripeForm}>
              <div className={styles.stripeRow}>
                <label>Card Number</label>
                <input type="text" readOnly value="4242 •••• •••• 4242" className={styles.stripeInputReadOnly} />
              </div>
              <div className={styles.stripeGrid}>
                <div>
                  <label>Expires</label>
                  <input type="text" readOnly value="12/28" className={styles.stripeInputReadOnly} />
                </div>
                <div>
                  <label>CVC</label>
                  <input type="text" readOnly value="***" className={styles.stripeInputReadOnly} />
                </div>
              </div>
              <div className={styles.modalCtaRow}>
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  disabled={paymentProcessing}
                  className={styles.modalCancel}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleUpgradePayment}
                  disabled={paymentProcessing}
                  className={styles.modalSubmit}
                >
                  {paymentProcessing ? 'Processing Payment...' : 'Pay $9.99'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
