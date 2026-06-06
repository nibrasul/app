'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import styles from './page.module.css';

interface HistoryEvent {
  id: number;
  action: string;
  details: string;
  icon: string | null;
  color: string | null;
  createdAt: string;
}

export default function HistoryPage() {
  const [events, setEvents] = useState<HistoryEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/history');
      if (!res.ok) throw new Error('Failed to fetch connection logs.');
      const data = await res.json();
      if (data.success) {
        setEvents(data.events || []);
      }
    } catch (err: any) {
      setError(err.message || 'Error loading history logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  if (loading) {
    return (
      <div className={styles.loadingWrapper}>
        <div className={styles.spinner}></div>
        <p>Loading connection logs...</p>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <Header />
      <main className={styles.main}>
        <div className={styles.headerArea}>
          <h1 className={styles.title}>Connection Logs</h1>
          <p className={styles.subtitle}>
            Monitor active engagement on your profile. See when and how users connect with your card.
          </p>
        </div>

        {error && <div className={styles.errorAlert}>{error}</div>}

        <div className={styles.timelineContainer}>
          {events.length === 0 ? (
            <div className={`${styles.emptyCard} glass-panel`}>
              <div className={styles.emptyIcon}>📶</div>
              <h3>No Interaction Events</h3>
              <p>Your NFC card has not been scanned or tapped by other users yet.</p>
            </div>
          ) : (
            <div className={styles.timeline}>
              {events.map((event) => (
                <div key={event.id} className={styles.timelineItem}>
                  <div
                    className={styles.timelineDot}
                    style={{ background: event.color || 'var(--accent-glow)' }}
                  >
                    <span className={styles.dotIcon}>{event.icon || '🔗'}</span>
                  </div>
                  <div className={`${styles.timelineContent} glass-panel`}>
                    <div className={styles.eventHeader}>
                      <h3 className={styles.eventAction}>{event.action}</h3>
                      <span className={styles.eventTime}>
                        {new Date(event.createdAt).toLocaleString(undefined, {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </span>
                    </div>
                    <p className={styles.eventDetails}>{event.details}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
