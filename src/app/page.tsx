import Link from 'next/link';
import { cookies } from 'next/headers';
import { verifyJWT } from '@/lib/auth';
import styles from './page.module.css';

export default async function Home() {
  const cookieStore = await cookies();
  const token = cookieStore.get('pertap_jwt')?.value;
  let isLoggedIn = false;

  if (token) {
    const payload = await verifyJWT(token);
    if (payload) isLoggedIn = true;
  }

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <div className={styles.navContainer}>
          <div className={styles.logo}>
            Tap<span>folio</span>
          </div>
          <div className={styles.navLinks}>
            {isLoggedIn ? (
              <Link href="/dashboard" className={styles.btnNav}>
                Dashboard
              </Link>
            ) : (
              <Link href="/login" className={styles.btnNav}>
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.heroSection}>
          <div className={styles.nfcTag}>⚡ NFC CONNECTIVITY</div>
          <h1 className={styles.title}>
            Design is not just what it looks like, <br />
            <span>it's how it connects.</span>
          </h1>
          <p className={styles.subtitle}>
            Tapfolio lets you build premium, dynamic digital portfolio pages linked to physical NFC cards.
            Share your work, manage connections, and rank on the leaderboards instantly.
          </p>
          <div className={styles.ctas}>
            {isLoggedIn ? (
              <Link href="/dashboard" className={styles.primaryCta}>
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" className={styles.primaryCta}>
                  Get Started Free
                </Link>
                <Link href="/login?tab=register" className={styles.secondaryCta}>
                  Create Tapfolio Card
                </Link>
              </>
            )}
          </div>
        </div>

        <div className={styles.features}>
          <div className={`${styles.featureCard} glass-panel`}>
            <div className={styles.featureIcon}>⚡</div>
            <h3>Instant NFC Card</h3>
            <p>Share your credentials and socials with a simple physical tap. Works on all modern smartphones instantly.</p>
          </div>
          <div className={`${styles.featureCard} glass-panel`}>
            <div className={styles.featureIcon}>💎</div>
            <h3>Premium Rankings</h3>
            <p>Stand out and verify your status. Upgrade to Premium to join the public rankings.</p>
          </div>
          <div className={`${styles.featureCard} glass-panel`}>
            <div className={styles.featureIcon}>📈</div>
            <h3>Interactive Logs</h3>
            <p>Review and audit all connection events, taps, and views with a built-in event registry.</p>
          </div>
        </div>
      </main>

      <footer className={styles.footer}>
        <p>&copy; {new Date().getFullYear()} Tapfolio. Made for builders and creators.</p>
      </footer>
    </div>
  );
}
