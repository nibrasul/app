'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // States
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  
  // Intent-aware states
  const [inviteUser, setInviteUser] = useState<string | null>(null);
  const [inviteName, setInviteName] = useState<string | null>(null);

  // Load and check pending intents
  useEffect(() => {
    const redirectParam = searchParams.get('redirect');
    const intentParam = searchParams.get('intent');
    
    let targetUsername = '';
    
    // Parse redirect url for username (e.g. /connect/antony)
    if (redirectParam && redirectParam.includes('/connect/')) {
      targetUsername = redirectParam.split('/connect/')[1]?.split('?')[0] || '';
    } else if (redirectParam && redirectParam.startsWith('/') && redirectParam.length > 1 && !redirectParam.includes('/dashboard') && !redirectParam.includes('/api')) {
      targetUsername = redirectParam.slice(1).split('?')[0];
    }

    // Storage check
    const sessionIntent = sessionStorage.getItem('pendingIntent');
    const localIntent = localStorage.getItem('pendingIntent');
    const intentVal = sessionIntent || localIntent;
    
    if (intentVal && intentVal.startsWith('connect:')) {
      targetUsername = intentVal.split(':')[1] || '';
    }

    if (targetUsername) {
      setInviteUser(targetUsername);
      // Fetch public profile name of the inviter
      fetch(`/api/profile/${targetUsername}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.profile) {
            setInviteName(data.profile.name);
          }
        })
        .catch(err => console.error('Failed to load inviter profile:', err));
    }
  }, [searchParams]);

  // Handle Intent Redirect Resolution
  const resolveRedirect = () => {
    const redirectParam = searchParams.get('redirect');
    const intentParam = searchParams.get('intent');
    
    let targetRedirect = '/dashboard';

    if (redirectParam) {
      targetRedirect = redirectParam;
    } else {
      const sessionIntent = sessionStorage.getItem('pendingIntent');
      const localIntent = localStorage.getItem('pendingIntent');
      const intentVal = sessionIntent || localIntent;
      if (intentVal && intentVal.startsWith('connect:')) {
        const targetUser = intentVal.split(':')[1];
        targetRedirect = `/connect/${targetUser}`;
      }
    }

    // Clean up session and local storage to prevent stale redirects
    sessionStorage.removeItem('pendingIntent');
    localStorage.removeItem('pendingIntent');
    sessionStorage.removeItem('auth_intent');

    router.push(targetRedirect);
    router.refresh();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      setMessage('Success! Redirecting...');
      setTimeout(() => {
        resolveRedirect();
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError('');
    
    try {
      // Simulate/Stub Google OAuth
      // Creates a mock token with random suffix to ensure unique testing
      const randomSuffix = Math.floor(Math.random() * 1000);
      const mockIdToken = `mock_google_user_${randomSuffix}`;
      
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idToken: mockIdToken,
          email: `google.test.${randomSuffix}@tapfolio.me`,
          name: `Google Explorer ${randomSuffix}`
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Google Login failed');
      }

      setMessage('Google Login Successful! Redirecting...');
      setTimeout(() => {
        resolveRedirect();
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Google Sign-In failed.');
      setGoogleLoading(false);
    }
  };

  const handleContinueAsGuest = (e: React.MouseEvent) => {
    e.preventDefault();
    if (inviteUser) {
      router.push(`/connect/${inviteUser}`);
    } else {
      router.push('/');
    }
  };

  return (
    <div className={styles.container}>
      {/* LEFT BRAND PANEL */}
      <div className={styles.brandPanel}>
        <div className={styles.brandBgGlow}></div>
        <div className={styles.brandContent}>
          <div className={styles.brandLogo}>
            Tap<span>folio</span>
          </div>
          <h1 className={styles.brandTitle}>Your identity. One tap away.</h1>
          <p className={styles.brandSubtitle}>
            Tapfolio is your NFC-powered digital identity & networking profile. Connect instantly and control what you share.
          </p>

          <div className={styles.bullets}>
            <div className={styles.bulletItem}>
              <span className={styles.bulletCheck}>✔</span>
              <span>NFC-based instant connections</span>
            </div>
            <div className={styles.bulletItem}>
              <span className={styles.bulletCheck}>✔</span>
              <span>Username-based public profile</span>
            </div>
            <div className={styles.bulletItem}>
              <span className={styles.bulletCheck}>✔</span>
              <span>Full control over shared info</span>
            </div>
            <div className={styles.bulletItem}>
              <span className={styles.bulletCheck}>✔</span>
              <span>Real-time connection tracking</span>
            </div>
          </div>

          {/* Premium Animated Profile Mockup */}
          <div className={styles.cardPreviewContainer}>
            <div className={styles.glowCard}>
              <div className={styles.mockAvatar}></div>
              <div className={styles.mockName}>Alex Rivera</div>
              <div className={styles.mockTagline}>Full-Stack Developer | Creator</div>
              
              <div className={styles.mockStats}>
                <div className={styles.mockStat}>
                  <div className={styles.mockStatVal}>💎 120</div>
                  <div className={styles.mockStatLabel}>Points</div>
                </div>
                <div className={styles.mockStat}>
                  <div className={styles.mockStatVal}>👥 48</div>
                  <div className={styles.mockStatLabel}>Connects</div>
                </div>
              </div>

              <div className={styles.nfcWaveContainer}>
                <div className={styles.nfcRing}></div>
                <div className={styles.nfcRingDelay}></div>
                <span className={styles.nfcIcon}>⚡</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT AUTH PANEL */}
      <div className={styles.authPanel}>
        <div className={styles.authCardContainer}>
          <div className={styles.mobileHeader}>
            <div className={styles.brandLogo}>
              Tap<span>folio</span>
            </div>
            <p className={styles.mobileTagline}>Your identity. One tap away.</p>
          </div>

          <div className={`${styles.authCard} glass-panel`}>
            {/* Intent Banner */}
            {inviteUser && (
              <div className={styles.intentBanner}>
                <span className={styles.intentIcon}>✉️</span>
                <span className={styles.intentText}>
                  You were invited to connect with <strong>{inviteName || `@${inviteUser}`}</strong>. Sign in to accept.
                </span>
              </div>
            )}

            <div className={styles.authHeader}>
              <h2>Welcome back</h2>
              <p>Sign in to continue your connections</p>
            </div>

            {error && <div className={styles.errorAlert}>{error}</div>}
            {message && <div className={styles.successAlert}>{message}</div>}

            {/* Social Authentication */}
            <button
              onClick={handleGoogleLogin}
              disabled={googleLoading || loading}
              className={styles.googleBtn}
            >
              <svg className={styles.googleSvg} viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              {googleLoading ? 'Connecting...' : 'Continue with Google'}
            </button>

            <div className={styles.divider}>
              <span>or email login</span>
            </div>

            {/* Email Login Form */}
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.inputGroup}>
                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading || googleLoading}
                />
              </div>

              <div className={styles.inputGroup}>
                <div className={styles.labelRow}>
                  <label htmlFor="password">Password</label>
                </div>
                <div className={styles.passwordWrapper}>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading || googleLoading}
                  />
                  <button
                    type="button"
                    className={styles.togglePasswordBtn}
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" /><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" /><path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" /><line x1="2" y1="2" x2="22" y2="22" /></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0z" /><circle cx="12" cy="12" r="3" /></svg>
                    )}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading || googleLoading} className={styles.submitBtn}>
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>

            <div className={styles.actionsRow}>
              <span>New to Tapfolio? <Link href="/register" className={styles.link}>Create account</Link></span>
            </div>

            {/* Guest Bypass */}
            <div className={styles.guestSection}>
              <a href="#" onClick={handleContinueAsGuest} className={styles.guestLink}>
                Continue as Guest (View Only)
              </a>
            </div>

            {/* Security Trust Text */}
            <p className={styles.trustText}>
              🛡️ We never share your password. Your profile visibility is fully controlled by you.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className={styles.suspenseWrapper}>
        <div className={styles.spinner}></div>
        <p>Preparing Tapfolio gateway...</p>
      </div>
    }>
      <LoginFormContent />
    </Suspense>
  );
}
