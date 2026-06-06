'use client';

import { useState } from 'react';
import styles from './ConnectButton.module.css';

interface ConnectButtonProps {
  profileId: number;
  initialTapCount: number;
}

export default function ConnectButton({ profileId, initialTapCount }: ConnectButtonProps) {
  const [tapCount, setTapCount] = useState(initialTapCount);
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);

  const handleConnect = async () => {
    if (connected || connecting) return;
    setConnecting(true);

    try {
      const res = await fetch('/api/profile/tap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileId }),
      });
      const data = await res.json();
      if (data.success) {
        setConnected(true);
        setTapCount(prev => prev + 1);
      }
    } catch (err) {
      console.error('Failed to connect:', err);
    } finally {
      setConnecting(false);
    }
  };

  return (
    <div className={styles.container}>
      <button
        onClick={handleConnect}
        className={`${styles.connectBtn} ${connected ? styles.connected : ''}`}
        disabled={connecting || connected}
      >
        {connecting ? 'Connecting...' : connected ? '✓ Connected!' : 'Connect with me'}
      </button>
      <div className={styles.tapStats}>
        <span>⚡ {tapCount} total connections</span>
      </div>
    </div>
  );
}
