'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import styles from './Header.module.css';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (res.ok) {
        router.push('/login');
        router.refresh();
      }
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link href="/dashboard" className={styles.logo}>
          Tap<span>folio</span>
        </Link>
        <nav className={styles.nav}>
          <Link href="/dashboard" className={`${styles.link} ${pathname === '/dashboard' ? styles.active : ''}`}>
            Dashboard
          </Link>
          <Link href="/connections" className={`${styles.link} ${pathname === '/connections' ? styles.active : ''}`}>
            Connections
          </Link>
          <Link href="/history" className={`${styles.link} ${pathname === '/history' ? styles.active : ''}`}>
            Logs
          </Link>
          <Link href="/leaderboard" className={`${styles.link} ${pathname === '/leaderboard' ? styles.active : ''}`}>
            Leaderboard
          </Link>
        </nav>
        <button onClick={handleLogout} className={styles.logoutBtn}>
          Sign Out
        </button>
      </div>
    </header>
  );
}
