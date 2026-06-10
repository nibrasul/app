'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import LoadingScreen from '@/components/LoadingScreen';
import styles from './page.module.css';

interface TopUser {
  userId: number;
  name: string;
  username: string;
  avatar: string;
  count: number;
}

interface Stats {
  totalConnections: number;
  connectionsToday: number;
  nfcConnections: number;
  qrConnections: number;
  linkConnections: number;
  topUsers: TopUser[];
}

export default function AdminConnectionsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/connections');
      if (res.status === 401 || res.status === 403) {
        setAuthorized(false);
        router.push('/login?redirect=/admin/connections');
        return;
      }
      if (!res.ok) throw new Error('Failed to load connection analytics.');
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
        setAuthorized(true);
      }
    } catch (err: any) {
      setError(err.message || 'Error fetching connection stats.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return <LoadingScreen message="Verifying admin authorization..." />;
  }

  if (!authorized || !stats) {
    return (
      <div className={styles.loadingWrapper}>
        <p style={{ color: 'var(--accent-error)' }}>
          {error || 'Access denied. Admin authorization required.'}
        </p>
      </div>
    );
  }

  const {
    totalConnections,
    connectionsToday,
    nfcConnections,
    qrConnections,
    linkConnections,
    topUsers,
  } = stats;

  const nfcPct = totalConnections > 0 ? Math.round((nfcConnections / totalConnections) * 100) : 0;
  const qrPct = totalConnections > 0 ? Math.round((qrConnections / totalConnections) * 100) : 0;
  const linkPct = totalConnections > 0 ? Math.round((linkConnections / totalConnections) * 100) : 0;

  return (
    <div className={styles.wrapper}>
      <Header />
      <main className={styles.main}>
        <h1 className={styles.title}>Connections Analytics</h1>

        {/* METRICS ROW */}
        <div className={styles.metricsGrid}>
          <div className={`${styles.metricCard} glass-panel`}>
            <span className={styles.metricLabel}>Total Connections</span>
            <span className={styles.metricValue}>{totalConnections}</span>
            <span className={styles.metricDesc}>Relationships stored in DB</span>
          </div>

          <div className={`${styles.metricCard} glass-panel`}>
            <span className={styles.metricLabel}>Connections Today</span>
            <span className={styles.metricValue}>{connectionsToday}</span>
            <span className={styles.metricDesc}>New links created today</span>
          </div>

          <div className={`${styles.metricCard} glass-panel`}>
            <span className={styles.metricLabel}>NFC Tap Share</span>
            <span className={styles.metricValue}>{nfcPct}%</span>
            <span className={styles.metricDesc}>
              {nfcConnections} of {totalConnections} via NFC tags
            </span>
          </div>
        </div>

        {/* DETAIL ROW */}
        <div className={styles.dashboardLayout}>
          {/* LEFT: CONNECTION VIA BREAKDOWN */}
          <div className={`${styles.card} glass-panel`}>
            <h2 className={styles.sectionTitle}>Tap Channels</h2>
            <div className={styles.breakdownList}>
              <div className={styles.breakdownItem}>
                <div className={styles.breakdownInfo}>
                  <span className={styles.breakdownName}>NFC Contact Cards</span>
                  <span className={styles.breakdownCount}>
                    {nfcConnections} ({nfcPct}%)
                  </span>
                </div>
                <div className={styles.progressContainer}>
                  <div
                    className={styles.progressBar}
                    style={{ width: `${nfcPct}%`, backgroundColor: '#6366f1' }}
                  ></div>
                </div>
              </div>

              <div className={styles.breakdownItem}>
                <div className={styles.breakdownInfo}>
                  <span className={styles.breakdownName}>QR Code Scans</span>
                  <span className={styles.breakdownCount}>
                    {qrConnections} ({qrPct}%)
                  </span>
                </div>
                <div className={styles.progressContainer}>
                  <div
                    className={styles.progressBar}
                    style={{ width: `${qrPct}%`, backgroundColor: '#10b981' }}
                  ></div>
                </div>
              </div>

              <div className={styles.breakdownItem}>
                <div className={styles.breakdownInfo}>
                  <span className={styles.breakdownName}>Public Profile Link</span>
                  <span className={styles.breakdownCount}>
                    {linkConnections} ({linkPct}%)
                  </span>
                </div>
                <div className={styles.progressContainer}>
                  <div
                    className={styles.progressBar}
                    style={{ width: `${linkPct}%`, backgroundColor: '#f59e0b' }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: TOP CONNECTED USERS */}
          <div className={`${styles.card} glass-panel`}>
            <h2 className={styles.sectionTitle}>Top Connected Users</h2>
            {topUsers.length === 0 ? (
              <div className={styles.noData}>No connection data to display.</div>
            ) : (
              <div className={styles.usersList}>
                {topUsers.map((user, index) => (
                  <div key={user.userId} className={styles.userRow}>
                    <div className={styles.userInfo}>
                      <img
                        src={user.avatar || '/profile_avatar.png'}
                        alt={user.name}
                        className={styles.avatar}
                      />
                      <div className={styles.userDetails}>
                        <span className={styles.userName}>
                          {index + 1}. {user.name}
                        </span>
                        <span className={styles.userHandle}>@{user.username}</span>
                      </div>
                    </div>
                    <span className={styles.connectionBadge}>{user.count} Connections</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
