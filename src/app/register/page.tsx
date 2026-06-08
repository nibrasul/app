'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';

// Preset avatar options
const AVATAR_PRESETS = [
  '/presets/grad1.png',
  '/presets/grad2.png',
  '/presets/grad3.png',
  '/presets/grad4.png',
  '/presets/grad5.png',
  '/presets/grad6.png',
];

export default function RegisterPage() {
  const router = useRouter();

  // Step state
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Step 1: Basic Identity
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Username validation states
  const [usernameChecking, setUsernameChecking] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [usernameSuggestions, setUsernameSuggestions] = useState<string[]>([]);
  const [usernameError, setUsernameError] = useState('');

  // Step 2: Profile Onboarding Setup
  const [tagline, setTagline] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('/profile_avatar.png');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [selectedPresetIndex, setSelectedPresetIndex] = useState<number | null>(null);

  // Step 3: Default Sharing Preferences
  const [shareName, setShareName] = useState(true);
  const [shareEmail, setShareEmail] = useState(true);
  const [sharePhone, setSharePhone] = useState(false);
  const [shareWhatsapp, setShareWhatsapp] = useState(true);
  const [shareLocation, setShareLocation] = useState(false);

  // Step 4: Social Links Setup
  const [github, setGithub] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [instagram, setInstagram] = useState('');
  const [portfolio, setPortfolio] = useState('');

  // Password strength logic
  const [passwordStrength, setPasswordStrength] = useState<'none' | 'weak' | 'medium' | 'strong'>('none');
  
  // Debounce ref for username checking
  const checkTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check password strength
  useEffect(() => {
    if (!password) {
      setPasswordStrength('none');
      return;
    }
    if (password.length < 6) {
      setPasswordStrength('weak');
      return;
    }

    let score = 0;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) {
      setPasswordStrength('weak');
    } else if (score === 2) {
      setPasswordStrength('medium');
    } else {
      setPasswordStrength('strong');
    }
  }, [password]);

  // Debounced username availability validation
  useEffect(() => {
    if (checkTimeoutRef.current) {
      clearTimeout(checkTimeoutRef.current);
    }

    const cleanUsername = username.trim().toLowerCase();
    if (!cleanUsername) {
      setUsernameAvailable(null);
      setUsernameSuggestions([]);
      setUsernameError('');
      return;
    }

    if (!/^[a-z0-9_-]{3,20}$/.test(cleanUsername)) {
      setUsernameAvailable(false);
      setUsernameError('3-20 chars: lowercase, numbers, - or _ only.');
      setUsernameSuggestions([]);
      return;
    }

    setUsernameError('');
    setUsernameChecking(true);

    checkTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/auth/username-check?username=${cleanUsername}`);
        const data = await res.json();
        
        if (res.ok) {
          setUsernameAvailable(data.available);
          setUsernameSuggestions(data.suggestions || []);
        } else {
          setUsernameError(data.error || 'Failed to check username.');
        }
      } catch (err) {
        console.error('Username check error:', err);
      } finally {
        setUsernameChecking(false);
      }
    }, 500);

    return () => {
      if (checkTimeoutRef.current) clearTimeout(checkTimeoutRef.current);
    };
  }, [username]);

  // Handle Intent Redirect Resolution
  const resolveRedirect = () => {
    let targetRedirect = '/dashboard';
    
    // Check URL redirect or intents in local storage
    const sessionIntent = sessionStorage.getItem('pendingIntent');
    const localIntent = localStorage.getItem('pendingIntent');
    const intentVal = sessionIntent || localIntent;
    
    if (intentVal && intentVal.startsWith('connect:')) {
      const targetUser = intentVal.split(':')[1];
      targetRedirect = `/connect/${targetUser}`;
    }

    // Clean up intent storage
    sessionStorage.removeItem('pendingIntent');
    localStorage.removeItem('pendingIntent');
    sessionStorage.removeItem('auth_intent');

    router.push(targetRedirect);
    router.refresh();
  };

  // Google Sign-up Trigger
  const handleGoogleSignup = async () => {
    setLoading(true);
    setError('');

    try {
      const randomSuffix = Math.floor(Math.random() * 1000);
      const mockIdToken = `mock_google_user_${randomSuffix}`;
      
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idToken: mockIdToken,
          email: `google.test.${randomSuffix}@tapfolio.me`,
          name: `Google Member ${randomSuffix}`
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Google signup failed.');
      }

      setName(`Google Member ${randomSuffix}`);
      setEmail(`google.test.${randomSuffix}@tapfolio.me`);
      setUsername(data.user.username);
      
      // Auto-advance to step 2 onboarding since they are registered & logged in!
      setSuccess('Account created with Google!');
      setTimeout(() => {
        setStep(2);
        setSuccess('');
        setLoading(false);
      }, 800);
    } catch (err: any) {
      setError(err.message || 'Google Auth failed.');
      setLoading(false);
    }
  };

  // Step 1 Form Handler
  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameAvailable) {
      setError('Please choose an available username.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      // 1. POST registration
      const regRes = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, username }),
      });
      const regData = await regRes.json();

      if (!regRes.ok) {
        throw new Error(regData.error || 'Registration failed');
      }

      // Login to obtain cookie session
      const logRes = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!logRes.ok) {
        throw new Error('Registration complete, but login failed. Please sign in manually.');
      }

      setStep(2);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // File Avatar Upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Avatar upload failed.');
      }

      setAvatar(data.url);
      setSelectedPresetIndex(null);
    } catch (err: any) {
      setError(err.message || 'Failed to upload image.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Preset Avatar Selection (mock presets inside app as data URIs or colors)
  const handleSelectPreset = (index: number) => {
    setSelectedPresetIndex(index);
    // Dynamic generated avatar colored gradient
    const gradients = [
      'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
      'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
      'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
      'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)',
      'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
      'linear-gradient(135deg, #84cc16 0%, #10b981 100%)',
    ];
    // Create base64 inline svg of a colored gradient placeholder
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><defs><linearGradient id="g${index}" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${index === 0 ? '#f59e0b' : index === 1 ? '#10b981' : index === 2 ? '#6366f1' : index === 3 ? '#ec4899' : index === 4 ? '#06b6d4' : '#84cc16'}" /><stop offset="100%" stop-color="${index === 0 ? '#ef4444' : index === 1 ? '#3b82f6' : index === 2 ? '#a855f7' : index === 3 ? '#f43f5e' : index === 4 ? '#0891b2' : '#10b981'}" /></linearGradient></defs><rect width="100" height="100" fill="url(#g${index})" /><text x="50%" y="60%" font-size="40" font-family="Outfit, sans-serif" font-weight="bold" fill="white" text-anchor="middle">${name.slice(0,1).toUpperCase()}</text></svg>`;
    const dataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
    setAvatar(dataUrl);
  };

  // Final Step 5 Submission: Atomic onboarding save
  const handleFinalSubmit = async () => {
    setLoading(true);
    setError('');

    // Construct social link list payload
    const socialsList = [];
    if (github) {
      socialsList.push({
        platform: 'GitHub',
        handle: github,
        url: github.startsWith('http') ? github : `https://github.com/${github}`,
      });
    }
    if (linkedin) {
      socialsList.push({
        platform: 'LinkedIn',
        handle: linkedin,
        url: linkedin.startsWith('http') ? linkedin : `https://linkedin.com/in/${linkedin}`,
      });
    }
    if (instagram) {
      socialsList.push({
        platform: 'Instagram',
        handle: instagram,
        url: instagram.startsWith('http') ? instagram : `https://instagram.com/${instagram}`,
      });
    }
    if (portfolio) {
      socialsList.push({
        platform: 'Portfolio',
        handle: 'Website',
        url: portfolio.startsWith('http') ? portfolio : `https://${portfolio}`,
      });
    }

    try {
      const res = await fetch('/api/profile/onboarding', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tagline: tagline || "Let's connect!",
          bio: bio || 'I design meaningful experiences.',
          avatar,
          socials: socialsList,
          sharingSettings: {
            shareName,
            shareEmail,
            sharePhone,
            shareWhatsapp,
            shareLocation,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit profile.');
      }

      setSuccess('Your profile is ready!');
      setTimeout(() => {
        resolveRedirect();
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* WIZARD PROGRESS HEADER */}
      <div className={styles.header}>
        <div className={styles.logo}>
          Tap<span>folio</span>
        </div>
        <div className={styles.stepIndicatorRow}>
          {[1, 2, 3, 4, 5].map((s) => (
            <div
              key={s}
              className={`${styles.stepDot} ${step === s ? styles.activeDot : ''} ${step > s ? styles.completedDot : ''}`}
            >
              <span>{s}</span>
              <label>{s === 1 ? 'Identity' : s === 2 ? 'Profile' : s === 3 ? 'Privacy' : s === 4 ? 'Socials' : 'Finish'}</label>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.wizardWrapper}>
        <div className={`${styles.wizardCard} glass-panel`}>
          {error && <div className={styles.errorAlert}>{error}</div>}
          {success && <div className={styles.successAlert}>{success}</div>}

          {/* STEP 1: IDENTITY */}
          {step === 1 && (
            <form onSubmit={handleStep1Submit} className={styles.form}>
              <div className={styles.authHeader}>
                <h2>Create account</h2>
                <p>Begin your identity configuration</p>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignup}
                disabled={loading}
                className={styles.googleBtn}
              >
                <svg className={styles.googleSvg} viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Sign up with Google
              </button>

              <div className={styles.divider}>
                <span>or email signup</span>
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="name">Full Name</label>
                <input
                  id="name"
                  type="text"
                  required
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="username">Username (@handle)</label>
                <input
                  id="username"
                  type="text"
                  required
                  placeholder="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                />
                
                {/* Username checks indicators */}
                {usernameChecking && <span className={styles.checkingText}>🔄 Checking availability...</span>}
                {usernameAvailable === true && <span className={styles.availableText}>✅ Username is available!</span>}
                {usernameAvailable === false && (
                  <div className={styles.takenContainer}>
                    <span className={styles.takenText}>❌ Taken. {usernameError || 'Try another.'}</span>
                    {usernameSuggestions.length > 0 && (
                      <div className={styles.suggestions}>
                        <span>Suggestions:</span>
                        <div className={styles.chipsRow}>
                          {usernameSuggestions.map((s) => (
                            <button
                              key={s}
                              type="button"
                              className={styles.chip}
                              onClick={() => setUsername(s)}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="password">Password</label>
                <div className={styles.passwordWrapper}>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
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

                {/* Password strength meter */}
                {password && (
                  <div className={styles.strengthMeter}>
                    <div className={`${styles.strengthBar} ${
                      passwordStrength === 'weak' ? styles.weakBar :
                      passwordStrength === 'medium' ? styles.mediumBar :
                      passwordStrength === 'strong' ? styles.strongBar : ''
                    }`} />
                    <span className={styles.strengthText}>
                      Password strength: <strong>{passwordStrength}</strong>
                    </span>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || !usernameAvailable}
                className={styles.submitBtn}
              >
                {loading ? 'Creating account...' : 'Create Account & Continue'}
              </button>

              <div className={styles.loginBackLink}>
                Already have a profile? <Link href="/login" className={styles.link}>Sign In</Link>
              </div>
            </form>
          )}

          {/* STEP 2: PROFILE SETUP */}
          {step === 2 && (
            <div className={styles.stepContainer}>
              <div className={styles.authHeader}>
                <h2>Onboarding: Profile Setup</h2>
                <p>Add some personality to your digital card</p>
              </div>

              <div className={styles.avatarSetupRow}>
                <div className={styles.avatarPreviewWrapper}>
                  {uploadingAvatar ? (
                    <div className={styles.avatarSpinner}></div>
                  ) : (
                    <img src={avatar} alt="Profile Avatar" className={styles.avatarPreview} />
                  )}
                </div>

                <div className={styles.avatarSelectors}>
                  <label className={styles.uploadBtn}>
                    📁 Upload Custom Photo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      style={{ display: 'none' }}
                      disabled={uploadingAvatar}
                    />
                  </label>

                  <div className={styles.presetsLabel}>Or choose preset avatar:</div>
                  <div className={styles.presetsGrid}>
                    {[1, 2, 3, 4, 5, 6].map((idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectPreset(idx)}
                        className={`${styles.presetBtn} ${selectedPresetIndex === idx ? styles.activePreset : ''}`}
                        style={{
                          background: idx === 1 ? 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)' :
                                      idx === 2 ? 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)' :
                                      idx === 3 ? 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)' :
                                      idx === 4 ? 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)' :
                                      idx === 5 ? 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)' :
                                                  'linear-gradient(135deg, #84cc16 0%, #10b981 100%)'
                        }}
                      >
                        {name.slice(0,1).toUpperCase() || 'T'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="tagline">Tagline / Professional Headline</label>
                <input
                  id="tagline"
                  type="text"
                  placeholder="Full-stack Developer | Designer | Creator"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="bio">Bio / About Me</label>
                <textarea
                  id="bio"
                  rows={3}
                  className={styles.textarea}
                  placeholder="Write a brief intro about yourself..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
              </div>

              <div className={styles.btnRow}>
                <button onClick={() => setStep(3)} className={styles.submitBtn}>
                  Next: Sharing Preferences
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: PRIVACY PREFERENCES */}
          {step === 3 && (
            <div className={styles.stepContainer}>
              <div className={styles.authHeader}>
                <h2>Default Sharing Preferences</h2>
                <p>Choose what others see by default when you connect</p>
              </div>

              <div className={styles.privacyToggles}>
                <div className={styles.privacyItem}>
                  <div className={styles.privacyLabelRow}>
                    <span>Display Name</span>
                    <span className={styles.requiredTag}>Always Shared</span>
                  </div>
                  <input type="checkbox" checked={shareName} disabled className={styles.checkbox} />
                </div>

                <div className={styles.privacyItem}>
                  <div className={styles.privacyLabelRow}>
                    <span>Email Address</span>
                    <p className={styles.privacyDesc}>Share your email address automatically</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={shareEmail}
                    onChange={(e) => setShareEmail(e.target.checked)}
                    className={styles.checkbox}
                  />
                </div>

                <div className={styles.privacyItem}>
                  <div className={styles.privacyLabelRow}>
                    <span>Phone Number</span>
                    <p className={styles.privacyDesc}>Show your phone number to connections</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={sharePhone}
                    onChange={(e) => setSharePhone(e.target.checked)}
                    className={styles.checkbox}
                  />
                </div>

                <div className={styles.privacyItem}>
                  <div className={styles.privacyLabelRow}>
                    <span>WhatsApp Number</span>
                    <p className={styles.privacyDesc}>Allow connections to send messages on WhatsApp</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={shareWhatsapp}
                    onChange={(e) => setShareWhatsapp(e.target.checked)}
                    className={styles.checkbox}
                  />
                </div>

                <div className={styles.privacyItem}>
                  <div className={styles.privacyLabelRow}>
                    <span>Location</span>
                    <p className={styles.privacyDesc}>Show your city/location on profile card</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={shareLocation}
                    onChange={(e) => setShareLocation(e.target.checked)}
                    className={styles.checkbox}
                  />
                </div>
              </div>

              <div className={styles.btnRow}>
                <button onClick={() => setStep(4)} className={styles.submitBtn}>
                  Next: Social Links Setup
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: SOCIAL LINKS */}
          {step === 4 && (
            <div className={styles.stepContainer}>
              <div className={styles.authHeader}>
                <h2>Onboarding: Social Links</h2>
                <p>Link your profiles so connections can find you</p>
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="github">GitHub Username</label>
                <input
                  id="github"
                  type="text"
                  placeholder="github-username"
                  value={github}
                  onChange={(e) => setGithub(e.target.value)}
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="linkedin">LinkedIn Username / Profile Handle</label>
                <input
                  id="linkedin"
                  type="text"
                  placeholder="linkedin-username"
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="instagram">Instagram Handle</label>
                <input
                  id="instagram"
                  type="text"
                  placeholder="instagram-handle"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="portfolio">Portfolio URL / Custom Link</label>
                <input
                  id="portfolio"
                  type="text"
                  placeholder="www.yourportfolio.com"
                  value={portfolio}
                  onChange={(e) => setPortfolio(e.target.value)}
                />
              </div>

              <div className={styles.btnRow}>
                <button onClick={() => setStep(5)} className={styles.submitBtn}>
                  Next: Finalize Profile
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: CARD PREVIEW & SUBMIT */}
          {step === 5 && (
            <div className={styles.stepContainer}>
              <div className={styles.authHeader}>
                <h2>Create your profile</h2>
                <p>Your Tapfolio is ready! Review your digital card:</p>
              </div>

              <div className={styles.previewCardOuter}>
                <div className={`${styles.glowCard} glass-panel`}>
                  <img src={avatar} alt="Avatar" className={styles.avatarPreviewCard} />
                  <div className={styles.cardName}>{name || 'Your Name'}</div>
                  <div className={styles.cardHandle}>@{username || 'handle'}</div>
                  {tagline && <div className={styles.cardTagline}>{tagline}</div>}
                  {bio && <p className={styles.cardBio}>{bio}</p>}

                  {/* Social badges simulation */}
                  <div className={styles.cardSocialIcons}>
                    {github && <span className={styles.cardIconChip}>🔗 GitHub</span>}
                    {linkedin && <span className={styles.cardIconChip}>🔗 LinkedIn</span>}
                    {instagram && <span className={styles.cardIconChip}>🔗 Instagram</span>}
                    {portfolio && <span className={styles.cardIconChip}>🔗 Website</span>}
                  </div>
                </div>
              </div>

              <button
                onClick={handleFinalSubmit}
                disabled={loading}
                className={styles.submitBtn}
              >
                {loading ? 'Finalizing Profile...' : 'Create My Tapfolio Profile'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
