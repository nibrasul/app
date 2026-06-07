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
  initialConnectionStatus: string | null;
}

export default function ConnectClientPage({
  username,
  profile,
  isLoggedIn,
  initialConnectionStatus,
}: ConnectClientPageProps) {
  const router = useRouter();
  const [status, setStatus] = useState<string | null>(initialConnectionStatus);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Attempt to launch the mobile app if on a mobile device
    const isMobile = /android|iphone|ipad|ipod/i.test(navigator.userAgent);
    if (isMobile) {
      window.location.href = `tapfolio://connect/${username}`;
    }
  }, [username]);

  const handleConnect = async () => {
    if (!isLoggedIn) {
      // Store intent in localStorage to preserve user intent across login redirect
      localStorage.setItem('pendingIntent', `connect:${username}`);
      router.push(`/login?redirect=/connect/${username}`);
      return;
    }

    setLoading(true);
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
      setLoading(false);
    }
  };

  return (
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
          {status === 'pending' && (
            <div className={styles.statusBadgePending}>
              ⏳ Request Pending
            </div>
          )}
          {status === 'accepted' && (
            <div className={styles.statusBadgeAccepted}>
              ✅ Already Connected
            </div>
          )}
          {status === 'blocked' && (
            <div className={styles.statusBadgeBlocked}>
              🚫 Blocked
            </div>
          )}
          {!status && (
            <button
              onClick={handleConnect}
              disabled={loading}
              className={styles.openAppBtn}
            >
              {loading ? 'Processing...' : isLoggedIn ? 'Connect with me' : 'Login to Connect'}
            </button>
          )}

          <a href={`/${username}`} className={styles.viewProfileLink}>
            View web profile
          </a>
        </div>

        {error && <p className={styles.error}>{error}</p>}
      </div>
    </div>
  );
}
