'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import LoadingScreen from '@/components/LoadingScreen';
import styles from './page.module.css';

interface Tag {
  text: string;
  type: string;
}

interface LeaderboardProfile {
  id: number;
  userId: number;
  name: string;
  tagline: string;
  avatar: string;
  bio: string;
  diamonds: string;
  isPremium: boolean;
  tapCount: number;
  score: number;
  tags: Tag[];
}

const slugify = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch('/api/leaderboard');
      if (!res.ok) throw new Error('Failed to fetch leaderboard data.');
      const data = await res.json();
      if (data.success) {
        setLeaderboard(data.leaderboard || []);
      }
    } catch (err: any) {
      setError(err.message || 'Error loading leaderboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  if (loading) {
    return <LoadingScreen message="Loading leaderboard rankings..." />;
  }

  return (
    <div className={styles.wrapper}>
      <Header />
      <main className={styles.main}>
        <div className={styles.headerArea}>
          <h1 className={styles.title}>Tapfolio Leaderboard</h1>
          <p className={styles.subtitle}>
            Discover elite creators and professionals. Only Premium accounts meeting a minimum profile score of 60 qualify.
          </p>
        </div>

        {error && <div className={styles.errorAlert}>{error}</div>}

        <div className={styles.leaderboardContainer}>
          {leaderboard.length === 0 ? (
            <div className={`${styles.emptyCard} glass-panel`}>
              <div className={styles.emptyIcon}>🏆</div>
              <h3>No Qualified Profiles Yet</h3>
              <p>Be the first to upgrade your profile and meet all checklist criteria to rank number one!</p>
              <Link href="/dashboard" className={styles.dashboardCta}>
                Complete Checklist in Dashboard
              </Link>
            </div>
          ) : (
            <div className={styles.rankList}>
              {leaderboard.map((profile, index) => {
                const rank = index + 1;
                return (
                  <div
                    key={profile.id}
                    className={`${styles.rankCard} glass-panel`}
                    style={{
                      borderLeft: rank === 1 ? '4px solid #f59e0b' : rank === 2 ? '4px solid #94a3b8' : rank === 3 ? '4px solid #b45309' : '1px solid var(--border-card)'
                    }}
                  >
                    <div className={styles.rankNumCol}>
                      <span
                        className={`${styles.rankBadge} ${
                          rank === 1 ? styles.rank1 : rank === 2 ? styles.rank2 : rank === 3 ? styles.rank3 : styles.rankOther
                        }`}
                      >
                        {rank}
                      </span>
                    </div>

                    <div className={styles.profileCol}>
                      <img src={profile.avatar} alt={profile.name} className={styles.avatar} />
                      <div className={styles.profileDetails}>
                        <div className={styles.nameRow}>
                          <h3 className={styles.name}>{profile.name}</h3>
                          <span className={styles.premiumBadge}>💎 Premium</span>
                        </div>
                        <p className={styles.tagline}>{profile.tagline}</p>
                        <div className={styles.tags}>
                          {profile.tags.map((t, tIdx) => (
                            <span
                              key={tIdx}
                              className={`${styles.tag} ${t.type === 'location' ? styles.tagLoc : styles.tagRole}`}
                            >
                              {t.text}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className={styles.statsCol}>
                      <div className={styles.statBox}>
                        <span className={styles.statVal}>{profile.score}</span>
                        <span className={styles.statLabel}>Checklist Pts</span>
                      </div>
                      <div className={styles.statBox}>
                        <span className={styles.statVal}>{profile.tapCount}</span>
                        <span className={styles.statLabel}>Taps</span>
                      </div>
                    </div>

                    <div className={styles.actionCol}>
                      <Link href={`/${slugify(profile.name)}`} className={styles.viewBtn}>
                        View Profile
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
