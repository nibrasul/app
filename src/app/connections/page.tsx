'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import LoadingScreen from '@/components/LoadingScreen';
import styles from './page.module.css';

interface Tag {
  id?: number;
  text: string;
  type: string;
}

interface SocialLink {
  id: number;
  platform: string;
  handle: string;
  url: string;
  icon: string;
  color: string;
}

interface PendingRequest {
  id: number;
  via: string;
  createdAt: string;
  requester: {
    userId: number;
    name: string;
    avatar: string;
    tagline: string;
    profileId: number | null;
    diamonds: string;
    connectionCount: number;
    tapCount: number;
    tags: Tag[];
  };
}

interface Connection {
  id: number;
  via: string;
  connectedAt: string;
  other: {
    userId: number;
    name: string | null;
    avatar: string;
    tagline: string;
    email: string | null;
    phone: string | null;
    whatsapp: string | null;
    location: string | null;
    tags: Tag[];
    profileId: number | null;
    socials: SocialLink[];
  };
  permissions: {
    shareName: boolean;
    shareEmail: boolean;
    sharePhone: boolean;
    shareWhatsapp: boolean;
    shareLocation: boolean;
    sharedSocialIds: number[];
  };
  myPermissions: {
    shareName: boolean;
    shareEmail: boolean;
    sharePhone: boolean;
    shareWhatsapp: boolean;
    shareLocation: boolean;
    sharedSocialIds: number[];
  };
}

interface OwnProfile {
  id: number;
  socials: SocialLink[];
}

export default function ConnectionsPage() {
  const [activeTab, setActiveTab] = useState<'requests' | 'connections'>('requests');
  const [requests, setRequests] = useState<PendingRequest[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [ownProfile, setOwnProfile] = useState<OwnProfile | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Connection details modal state
  const [selectedConnection, setSelectedConnection] = useState<Connection | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Sharing preferences editing state
  const [shareName, setShareName] = useState(true);
  const [shareEmail, setShareEmail] = useState(true);
  const [sharePhone, setSharePhone] = useState(false);
  const [shareWhatsapp, setShareWhatsapp] = useState(true);
  const [shareLocation, setShareLocation] = useState(false);
  const [sharedSocialIds, setSharedSocialIds] = useState<number[]>([]);
  const [savingSettings, setSavingSettings] = useState(false);

  const fetchData = async () => {
    try {
      const [reqsRes, connsRes, profileRes] = await Promise.all([
        fetch('/api/connections/requests'),
        fetch('/api/connections'),
        fetch('/api/profile'),
      ]);

      if (!reqsRes.ok || !connsRes.ok || !profileRes.ok) {
        throw new Error('Failed to load connections data.');
      }

      const reqsData = await reqsRes.json();
      const connsData = await connsRes.json();
      const profileData = await profileRes.json();

      if (reqsData.success) setRequests(reqsData.requests || []);
      if (connsData.success) setConnections(connsData.connections || []);
      if (profileData.success) setOwnProfile(profileData.profile);
    } catch (err: any) {
      setError(err.message || 'Error loading dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAccept = async (id: number) => {
    try {
      const res = await fetch('/api/connections/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connectionId: id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Accept failed.');

      setSuccess('Connection accepted!');
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Error accepting request.');
      setTimeout(() => setError(''), 5000);
    }
  };

  const handleReject = async (id: number) => {
    try {
      const res = await fetch('/api/connections/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connectionId: id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Reject failed.');

      setSuccess('Request rejected.');
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Error rejecting request.');
      setTimeout(() => setError(''), 5000);
    }
  };

  const openDetails = (conn: Connection) => {
    setSelectedConnection(conn);
    setShareName(conn.myPermissions.shareName);
    setShareEmail(conn.myPermissions.shareEmail);
    setSharePhone(conn.myPermissions.sharePhone);
    setShareWhatsapp(conn.myPermissions.shareWhatsapp);
    setShareLocation(conn.myPermissions.shareLocation);
    setSharedSocialIds(conn.myPermissions.sharedSocialIds || []);
    setShowModal(true);
  };

  const handleSaveVisibility = async () => {
    if (!selectedConnection) return;
    setSavingSettings(true);
    try {
      const res = await fetch('/api/connections/visibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          connectionId: selectedConnection.id,
          shareName,
          shareEmail,
          sharePhone,
          shareWhatsapp,
          shareLocation,
          sharedSocialIds,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save visibility settings.');

      setSuccess('Visibility settings updated!');
      setShowModal(false);
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Error updating visibility.');
      setTimeout(() => setError(''), 5000);
    } finally {
      setSavingSettings(false);
    }
  };

  const toggleSocialId = (id: number) => {
    if (sharedSocialIds.includes(id)) {
      setSharedSocialIds(sharedSocialIds.filter(x => x !== id));
    } else {
      setSharedSocialIds([...sharedSocialIds, id]);
    }
  };

  if (loading) {
    return <LoadingScreen message="Loading your connections..." />;
  }

  return (
    <div className={styles.wrapper}>
      <Header />
      <main className={styles.main}>
        {success && <div className={styles.toastSuccess}>{success}</div>}
        {error && <div className={styles.toastError}>{error}</div>}

        <div className={styles.headerArea}>
          <h1 className={styles.title}>Connections</h1>
          <p className={styles.subtitle}>
            Manage your networking requests and coordinate shared details with accepted connections.
          </p>
        </div>

        {/* TABS CONTAINER */}
        <div className={styles.tabBar}>
          <button
            onClick={() => setActiveTab('requests')}
            className={`${styles.tabBtn} ${activeTab === 'requests' ? styles.activeTab : ''}`}
          >
            Pending Requests ({requests.length})
          </button>
          <button
            onClick={() => setActiveTab('connections')}
            className={`${styles.tabBtn} ${activeTab === 'connections' ? styles.activeTab : ''}`}
          >
            My Connections ({connections.length})
          </button>
        </div>

        {/* MAIN BODY CONTENTS */}
        <div className={styles.contentGrid}>
          {activeTab === 'requests' ? (
            requests.length === 0 ? (
              <div className={`${styles.emptyCard} glass-panel`}>
                <div className={styles.emptyIcon}>📥</div>
                <h3>No Pending Requests</h3>
                <p>When someone wants to connect with you via NFC or QR links, their requests will appear here.</p>
              </div>
            ) : (
              <div className={styles.list}>
                {requests.map(req => (
                  <div key={req.id} className={`${styles.card} glass-panel`}>
                    <div className={styles.cardHeader}>
                      <img src={req.requester.avatar || '/profile_avatar.png'} alt={req.requester.name} className={styles.avatar} />
                      <div className={styles.info}>
                        <h3>{req.requester.name}</h3>
                        {req.requester.tagline && <p className={styles.tagline}>{req.requester.tagline}</p>}
                        
                        <div className={styles.metricsRow}>
                          <span className={styles.metricItem}>💎 {req.requester.diamonds} Pts</span>
                          <span className={styles.metricItem}>👥 {req.requester.connectionCount} connections</span>
                          <span className={styles.metricItem}>⚡ {req.requester.tapCount} taps</span>
                          {req.via === 'nfc' && <span className={styles.nfcBadge}>via NFC</span>}
                        </div>
                      </div>

                      <div className={styles.actions}>
                        <button onClick={() => handleAccept(req.id)} className={styles.acceptBtn}>Accept</button>
                        <button onClick={() => handleReject(req.id)} className={styles.rejectBtn}>Reject</button>
                      </div>
                    </div>

                    {req.requester.tags && req.requester.tags.length > 0 && (
                      <div className={styles.tagsArea}>
                        {req.requester.tags.map((t, idx) => (
                          <span key={idx} className={`${styles.tag} ${t.type === 'location' ? styles.tagLoc : styles.tagRole}`}>
                            {t.type === 'location' ? '📍 ' : '⚙️ '}
                            {t.text}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )
          ) : (
            connections.length === 0 ? (
              <div className={`${styles.emptyCard} glass-panel`}>
                <div className={styles.emptyIcon}>👥</div>
                <h3>No Connections Yet</h3>
                <p>Share your NFC profile or QR links to start building your professional database.</p>
              </div>
            ) : (
              <div className={styles.connectionsGrid}>
                {connections.map(conn => (
                  <div
                    key={conn.id}
                    onClick={() => openDetails(conn)}
                    className={`${styles.connCard} glass-panel`}
                  >
                    <img src={conn.other.avatar || '/profile_avatar.png'} alt={conn.other.name || 'Anonymous'} className={styles.avatar} />
                    <div className={styles.connInfo}>
                      <h3>{conn.other.name || 'Anonymous'}</h3>
                      {conn.other.tagline && <p className={styles.tagline}>{conn.other.tagline}</p>}
                      <div className={styles.tagsAreaCompact}>
                        {conn.other.tags?.slice(0, 2).map((t, idx) => (
                          <span key={idx} className={`${styles.tagCompact} ${t.type === 'location' ? styles.tagLoc : styles.tagRole}`}>
                            {t.text}
                          </span>
                        ))}
                      </div>
                    </div>
                    {conn.via === 'nfc' && <div className={styles.nfcBadgeMini}>NFC</div>}
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </main>

      {/* DETAILS MODAL */}
      {showModal && selectedConnection && (
        <div className={styles.modalOverlay}>
          <div className={`${styles.modalContent} glass-panel`}>
            {/* Header info */}
            <div className={styles.modalHeader}>
              <img src={selectedConnection.other.avatar || '/profile_avatar.png'} alt={selectedConnection.other.name || 'Anonymous'} className={styles.modalAvatar} />
              <div>
                <h2>{selectedConnection.other.name || 'Anonymous'}</h2>
                {selectedConnection.other.tagline && <p className={styles.modalTagline}>{selectedConnection.other.tagline}</p>}
              </div>
            </div>

            <div className={styles.modalLayoutGrid}>
              {/* Other User's details */}
              <div className={styles.modalCol}>
                <h4 className={styles.colTitle}>Shared Details</h4>
                <div className={styles.detailList}>
                  {selectedConnection.other.email && (
                    <div className={styles.detailRow}>
                      <span className={styles.detailIcon}>📧</span>
                      <span>{selectedConnection.other.email}</span>
                    </div>
                  )}
                  {selectedConnection.other.phone && (
                    <div className={styles.detailRow}>
                      <span className={styles.detailIcon}>📞</span>
                      <span>{selectedConnection.other.phone}</span>
                    </div>
                  )}
                  {selectedConnection.other.whatsapp && (
                    <div className={styles.detailRow}>
                      <span className={styles.detailIcon}>💬</span>
                      <a href={selectedConnection.other.whatsapp} target="_blank" rel="noreferrer">
                        WhatsApp Link
                      </a>
                    </div>
                  )}
                  {selectedConnection.other.location && (
                    <div className={styles.detailRow}>
                      <span className={styles.detailIcon}>📍</span>
                      <span>{selectedConnection.other.location}</span>
                    </div>
                  )}
                  {!selectedConnection.other.email &&
                   !selectedConnection.other.phone &&
                   !selectedConnection.other.whatsapp &&
                   !selectedConnection.other.location && (
                    <p className={styles.noSharedText}>No contact details shared by this user yet.</p>
                  )}
                </div>

                {selectedConnection.other.socials && selectedConnection.other.socials.length > 0 && (
                  <div className={styles.modalLinksSection}>
                    <h4 className={styles.colTitle} style={{ marginTop: '1.5rem' }}>Shared Social Links</h4>
                    <div className={styles.linksGrid}>
                      {selectedConnection.other.socials.map(link => (
                        <a
                          key={link.id}
                          href={link.url}
                          target="_blank"
                          rel="noreferrer"
                          className={styles.linkCard}
                          style={{ borderColor: link.color + '40' }}
                        >
                          <span className={styles.platformBadge} style={{ background: link.color }}>{link.platform}</span>
                          <span className={styles.handleText}>{link.handle}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* My visibility settings for this user */}
              <div className={styles.modalCol} style={{ borderLeft: '1px solid rgba(255,255,255,0.08)', paddingLeft: '1.5rem' }}>
                <h4 className={styles.colTitle}>My Sharing Preferences</h4>
                <p className={styles.modalColDesc}>Choose what details {selectedConnection.other.name || 'Anonymous'} is allowed to see.</p>
                
                <div className={styles.visibilityToggles}>
                  <label className={styles.toggleRow}>
                    <div className={styles.toggleText}>
                      <strong>Name</strong>
                      <span>Share your display name</span>
                    </div>
                    <input type="checkbox" checked={shareName} onChange={(e) => setShareName(e.target.checked)} />
                  </label>
                  <label className={styles.toggleRow}>
                    <div className={styles.toggleText}>
                      <strong>Email</strong>
                      <span>Share your email address</span>
                    </div>
                    <input type="checkbox" checked={shareEmail} onChange={(e) => setShareEmail(e.target.checked)} />
                  </label>
                  <label className={styles.toggleRow}>
                    <div className={styles.toggleText}>
                      <strong>Phone</strong>
                      <span>Share your phone number</span>
                    </div>
                    <input type="checkbox" checked={sharePhone} onChange={(e) => setSharePhone(e.target.checked)} />
                  </label>
                  <label className={styles.toggleRow}>
                    <div className={styles.toggleText}>
                      <strong>WhatsApp</strong>
                      <span>Share your WhatsApp link</span>
                    </div>
                    <input type="checkbox" checked={shareWhatsapp} onChange={(e) => setShareWhatsapp(e.target.checked)} />
                  </label>
                  <label className={styles.toggleRow}>
                    <div className={styles.toggleText}>
                      <strong>Location</strong>
                      <span>Share your location details</span>
                    </div>
                    <input type="checkbox" checked={shareLocation} onChange={(e) => setShareLocation(e.target.checked)} />
                  </label>
                </div>

                {ownProfile?.socials && ownProfile.socials.length > 0 && (
                  <div className={styles.socialVisibilityToggles} style={{ marginTop: '1.5rem' }}>
                    <h5 className={styles.togglesSubtitle}>Share Social Links</h5>
                    <div className={styles.socialCheckList}>
                      {ownProfile.socials.map(link => (
                        <label key={link.id} className={styles.socialCheckRow}>
                          <input
                            type="checkbox"
                            checked={sharedSocialIds.includes(link.id)}
                            onChange={() => toggleSocialId(link.id)}
                          />
                          <span className={styles.platformLabel} style={{ color: link.color }}>{link.platform}</span>
                          <span className={styles.handleLabel}>({link.handle})</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal actions */}
            <div className={styles.modalCtaRow}>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className={styles.modalCancel}
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleSaveVisibility}
                disabled={savingSettings}
                className={styles.modalSubmit}
              >
                {savingSettings ? 'Saving Settings...' : 'Save Settings'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
