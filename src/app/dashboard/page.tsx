'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
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
  tagline: string;
  avatar: string;
  isOnline: boolean;
  bio: string;
  diamonds: string;
  isPremium: boolean;
  tapCount: number;
  tags: Tag[];
  socials: SocialLink[];
}

interface ChecklistItem {
  id: string;
  label: string;
  points: number;
  completed: boolean;
  description: string;
}

export default function Dashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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

  useEffect(() => {
    fetchProfile();
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
    return (
      <div className={styles.loadingWrapper}>
        <div className={styles.spinner}></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  const publicLink = profile ? `${window.location.origin}/${profile.userId}` : '';

  return (
    <div className={styles.wrapper}>
      <Header />
      <main className={styles.main}>
        {success && <div className={styles.toastSuccess}>{success}</div>}
        {error && <div className={styles.toastError}>{error}</div>}

        <div className={styles.dashboardGrid}>
          {/* LEFT: EDITING PROFILE CARD */}
          <div className={`${styles.card} glass-panel`}>
            <h2 className={styles.sectionTitle}>Edit Card details</h2>
            <div className={styles.avatarContainer}>
              <img src={avatar || '/profile_avatar.png'} alt="Avatar" className={styles.avatarPreview} />
              <label htmlFor="avatar-file" className={styles.uploadBtn}>
                Upload Photo
                <input
                  id="avatar-file"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className={styles.fileInput}
                />
              </label>
            </div>

            <div className={styles.formGroup}>
              <label>Full Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div className={styles.formGroup}>
              <label>Card Tagline</label>
              <input type="text" value={tagline} onChange={(e) => setTagline(e.target.value)} />
            </div>

            <div className={styles.formGroup}>
              <label>Professional Bio</label>
              <textarea rows={4} value={bio} onChange={(e) => setBio(e.target.value)} />
            </div>

            <button onClick={handleSaveProfile} disabled={saving} className={styles.saveBtn}>
              {saving ? 'Saving...' : 'Save Profile Card'}
            </button>
          </div>

          {/* MIDDLE: TAGS AND SOCIALS */}
          <div className={styles.midCol}>
            {/* TAGS */}
            <div className={`${styles.card} glass-panel`}>
              <h2 className={styles.sectionTitle}>Skills & Location Tags</h2>
              <form onSubmit={handleAddTag} className={styles.tagForm}>
                <input
                  type="text"
                  placeholder="e.g. Designer, London..."
                  value={newTagText}
                  onChange={(e) => setNewTagText(e.target.value)}
                />
                <select value={newTagType} onChange={(e) => setNewTagType(e.target.value)}>
                  <option value="role">Role / Skill</option>
                  <option value="location">Location</option>
                </select>
                <button type="submit" className={styles.addButton}>Add</button>
              </form>

              <div className={styles.tagsContainer}>
                {tags.map((t, idx) => (
                  <span
                    key={idx}
                    className={`${styles.tagItem} ${t.type === 'location' ? styles.tagLoc : styles.tagRole}`}
                  >
                    {t.text}
                    <button type="button" onClick={() => handleRemoveTag(idx)} className={styles.tagDelete}>×</button>
                  </span>
                ))}
              </div>
            </div>

            {/* SOCIALS */}
            <div className={`${styles.card} glass-panel`}>
              <h2 className={styles.sectionTitle}>Social Profiles</h2>
              <form onSubmit={handleAddSocial} className={styles.socialForm}>
                <div className={styles.formRow}>
                  <select value={newPlatform} onChange={(e) => setNewPlatform(e.target.value)}>
                    <option value="GitHub">GitHub</option>
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="Twitter">Twitter</option>
                    <option value="Instagram">Instagram</option>
                    <option value="YouTube">YouTube</option>
                    <option value="Website">Website</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Username / Handle"
                    value={newHandle}
                    onChange={(e) => setNewHandle(e.target.value)}
                  />
                </div>
                <input
                  type="text"
                  placeholder="Full URL (e.g. github.com/username)"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                />
                <button type="submit" className={styles.addButton}>Add Social Link</button>
              </form>

              <div className={styles.socialList}>
                {socials.map((s, idx) => (
                  <div key={idx} className={styles.socialRow} style={{ borderColor: s.color + '30' }}>
                    <div className={styles.socialRowInfo}>
                      <span className={styles.socialDot} style={{ background: s.color }} />
                      <strong>{s.platform}</strong>: {s.handle}
                    </div>
                    <button type="button" onClick={() => handleRemoveSocial(idx)} className={styles.socialDelete}>
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: CHECKLIST, NFC SHARE LINK, & PREMIUM */}
          <div className={styles.rightCol}>
            {/* PUBLIC NFC LINK */}
            <div className={`${styles.card} glass-panel`}>
              <h2 className={styles.sectionTitle}>Share NFC card</h2>
              <p className={styles.cardDesc}>This link can be coded directly to any NFC tag or card.</p>
              <div className={styles.linkShareBox}>
                <input readOnly value={publicLink} className={styles.shareInput} />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(publicLink);
                    setSuccess('Link copied to clipboard!');
                    setTimeout(() => setSuccess(''), 3000);
                  }}
                  className={styles.copyBtn}
                >
                  Copy
                </button>
              </div>
              <a href={publicLink} target="_blank" className={styles.viewPublicLink}>
                View Public Profile Card →
              </a>
            </div>

            {/* GAMIFIED SCORE CHECKLIST */}
            <div className={`${styles.card} glass-panel`}>
              <div className={styles.scoreHeader}>
                <h2 className={styles.sectionTitle}>Profile Score</h2>
                <div className={styles.scoreBadge}>{score} / 100</div>
              </div>
              <div className={styles.progressBarBg}>
                <div className={styles.progressBarFill} style={{ width: `${score}%` }} />
              </div>
              <div className={styles.checklistContainer}>
                {checklist.map((item) => (
                  <div key={item.id} className={styles.checkItem}>
                    <div className={styles.checkStatus}>
                      {item.completed ? (
                        <span className={styles.checkDone}>✓</span>
                      ) : (
                        <span className={styles.checkPending}>○</span>
                      )}
                    </div>
                    <div className={styles.checkDetails}>
                      <strong>
                        {item.label} <span className={styles.pointsLabel}>+{item.points} pts</span>
                      </strong>
                      <p>{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SUBSCRIPTION PLAN */}
            <div className={`${styles.card} ${styles.premiumCard} glass-panel`}>
              {isPremium ? (
                <div className={styles.premiumActive}>
                  <div className={styles.goldBadge}>💎 PREMIUM MEMBER</div>
                  <p>
                    Your subscription is active. Complete profile criteria to show up on the public rankings
                    leaderboard.
                  </p>
                </div>
              ) : (
                <div className={styles.premiumInactive}>
                  <h3>Tapfolio Premium</h3>
                  <p>Upgrade to premium to list your card in the global leaderboards.</p>
                  <button onClick={() => setShowPaymentModal(true)} className={styles.premiumUpgradeBtn}>
                    Upgrade for $9.99
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
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
