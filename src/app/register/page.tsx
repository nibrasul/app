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
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5 | 6 | 7>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Step 2: Account Creation
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Step 4: Username Customization
  const [username, setUsername] = useState('');
  const [usernameChecking, setUsernameChecking] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [usernameSuggestions, setUsernameSuggestions] = useState<string[]>([]);
  const [usernameError, setUsernameError] = useState('');

  // Step 5: Profile Essentials
  const [tagline, setTagline] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('/profile_avatar.png');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [selectedPresetIndex, setSelectedPresetIndex] = useState<number | null>(null);

  // Step 6: Sharing Preferences
  const [shareName, setShareName] = useState(true);
  const [shareEmail, setShareEmail] = useState(true);
  const [sharePhone, setSharePhone] = useState(false);
  const [shareWhatsapp, setShareWhatsapp] = useState(true);
  const [shareLocation, setShareLocation] = useState(false);

  // Step 7: Social Handles
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
    if (!cleanUsername || step !== 4) {
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
    }, 400);

    return () => {
      if (checkTimeoutRef.current) clearTimeout(checkTimeoutRef.current);
    };
  }, [username, step]);

  // Resolve dashboard redirect
  const resolveRedirect = () => {
    // Clean up redirect state
    sessionStorage.removeItem('pendingIntent');
    localStorage.removeItem('pendingIntent');
    sessionStorage.removeItem('auth_intent');

    router.push('/dashboard');
    router.refresh();
  };

  // Google Sign-up flow
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
      
      setSuccess('Registered successfully with Google!');
      setTimeout(() => {
        setStep(3); // Advance directly to Success Moment
        setSuccess('');
        setLoading(false);
      }, 800);
    } catch (err: any) {
      setError(err.message || 'Google Auth failed.');
      setLoading(false);
    }
  };

  // Step 2 Form Handler (Create account only, username is auto-generated)
  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. POST registration
      const regRes = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const regData = await regRes.json();

      if (!regRes.ok) {
        throw new Error(regData.error || 'Registration failed');
      }

      // 2. Login to obtain cookie session
      const logRes = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!logRes.ok) {
        throw new Error('Registration complete, but login failed. Please sign in manually.');
      }

      // Preset the auto-generated username for customization
      setUsername(regData.user.username);
      setStep(3); // Go directly to First Success Moment!
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 4: Username Customization
  const handleStep4Submit = async () => {
    if (usernameAvailable === false) {
      setError('Please select a unique username or skip to keep the generated handle.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/profile/onboarding', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update username.');

      setStep(5);
    } catch (err: any) {
      setError(err.message || 'Error saving username.');
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

  // Preset Avatar Selection
  const handleSelectPreset = (index: number) => {
    setSelectedPresetIndex(index);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><defs><linearGradient id="g${index}" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${index === 1 ? '#f59e0b' : index === 2 ? '#10b981' : index === 3 ? '#6366f1' : index === 4 ? '#ec4899' : index === 5 ? '#06b6d4' : '#84cc16'}" /><stop offset="100%" stop-color="${index === 1 ? '#ef4444' : index === 2 ? '#3b82f6' : index === 3 ? '#a855f7' : index === 4 ? '#f43f5e' : index === 5 ? '#0891b2' : '#10b981'}" /></linearGradient></defs><rect width="100" height="100" fill="url(#g${index})" /><text x="50%" y="60%" font-size="40" font-family="Outfit, sans-serif" font-weight="bold" fill="white" text-anchor="middle">${name.slice(0,1).toUpperCase() || 'T'}</text></svg>`;
    const dataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
    setAvatar(dataUrl);
  };

  // Final step social submission
  const handleFinalSubmit = async (skip = false) => {
    setLoading(true);
    setError('');

    const socialsList = [];
    if (!skip) {
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
        throw new Error(data.error || 'Failed to finalize profile.');
      }

      setSuccess('Setup complete!');
      setTimeout(() => {
        resolveRedirect();
      }, 800);
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* PROGRESS HEADER */}
      <div className={styles.header}>
        <div className={styles.logo}>
          Tap<span>folio</span>
        </div>
        <div className={styles.stepIndicatorRow}>
          {[1, 2, 3, 4, 5, 6, 7].map((s) => (
            <div
              key={s}
              className={`${styles.stepDot} ${step === s ? styles.activeDot : ''} ${step > s ? styles.completedDot : ''}`}
            >
              <span>{s}</span>
              <label>
                {s === 1 ? 'Welcome' :
                 s === 2 ? 'Register' :
                 s === 3 ? 'Live' :
                 s === 4 ? 'Username' :
                 s === 5 ? 'Bio' :
                 s === 6 ? 'Privacy' : 'Socials'}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.wizardWrapper}>
        <div className={`${styles.wizardCard} glass-panel`}>
          {error && <div className={styles.errorAlert}>{error}</div>}
          {success && <div className={styles.successAlert}>{success}</div>}

          {/* STEP 1: WELCOME SCREEN */}
          {step === 1 && (
            <div className={styles.stepContainer}>
              <div className={styles.authHeader} style={{ textAlign: 'center' }}>
                <h2>Your professional identity.<br/>One tap away.</h2>
                <p>Build and share a premium digital NFC profile in seconds.</p>
              </div>

              <div className={styles.bullets} style={{ margin: '1rem 0' }}>
                <div className={styles.privacyItem}>
                  <span>⚡ Share your profile instantly via NFC</span>
                </div>
                <div className={styles.privacyItem}>
                  <span>👥 Connect and network with nearby builders</span>
                </div>
                <div className={styles.privacyItem}>
                  <span>🔒 Fully control your sharing visibilities</span>
                </div>
              </div>

              <div className={styles.form}>
                <button
                  type="button"
                  onClick={handleGoogleSignup}
                  className={styles.googleBtn}
                >
                  <svg className={styles.googleSvg} viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Continue with Google
                </button>

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className={styles.submitBtn}
                  style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  Continue with Email
                </button>

                <div className={styles.loginBackLink}>
                  Already have an account? <Link href="/login" className={styles.link}>Sign In</Link>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: CREATE ACCOUNT (Email setup, Name/Email/Pass only) */}
          {step === 2 && (
            <form onSubmit={handleStep2Submit} className={styles.form}>
              <div className={styles.authHeader}>
                <h2>Create Account</h2>
                <p>Register to go live instantly</p>
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="name">Full Name</label>
                <input
                  id="name"
                  type="text"
                  required
                  placeholder="Mohammed Nibras"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="mohammed@example.com"
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
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>

                {password && (
                  <div className={styles.strengthMeter}>
                    <div className={`${styles.strengthBar} ${
                      passwordStrength === 'weak' ? styles.weakBar :
                      passwordStrength === 'medium' ? styles.mediumBar :
                      passwordStrength === 'strong' ? styles.strongBar : ''
                    }`} />
                    <span className={styles.strengthText}>
                      Password: <strong>{passwordStrength}</strong>
                    </span>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || password.length < 6}
                className={styles.submitBtn}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>
          )}

          {/* STEP 3: FIRST SUCCESS MOMENT (Celebration) */}
          {step === 3 && (
            <div className={styles.stepContainer} style={{ textAlign: 'center' }}>
              <div className={styles.authHeader}>
                <h2>Welcome, {name.split(' ')[0]}! 🎉</h2>
                <h3 style={{ color: 'var(--accent-success)', marginTop: '0.5rem' }}>Your profile is live!</h3>
              </div>

              <div className={styles.previewCardOuter}>
                <div className={`${styles.glowCard} glass-panel`}>
                  <div className={styles.avatarPreviewWrapper} style={{ margin: '0 auto 1rem auto' }}>
                    <img src={avatar} alt="Avatar" className={styles.avatarPreview} />
                  </div>
                  <div className={styles.cardName}>{name}</div>
                  <div className={styles.cardHandle}>@{username}</div>
                  <div className={styles.cardTagline} style={{ marginTop: '0.5rem' }}>
                    tapfolio.me/@{username}
                  </div>
                </div>
              </div>

              <div className={styles.form} style={{ gap: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className={styles.submitBtn}
                >
                  Continue Setup (Recommended)
                </button>

                <button
                  type="button"
                  onClick={resolveRedirect}
                  className={styles.submitBtn}
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  Explore Dashboard
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: CHOOSE USERNAME */}
          {step === 4 && (
            <div className={styles.stepContainer}>
              <div className={styles.authHeader}>
                <h2>Choose Username</h2>
                <p>Customize your Tapfolio link prefix</p>
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="username">Handle (@username)</label>
                <input
                  id="username"
                  type="text"
                  required
                  placeholder="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                />

                {usernameChecking && <span className={styles.checkingText}>🔄 Checking availability...</span>}
                {usernameAvailable === true && <span className={styles.availableText}>✅ Username available!</span>}
                {usernameAvailable === false && (
                  <div className={styles.takenContainer}>
                    <span className={styles.takenText}>❌ Occupied. {usernameError || 'Try another.'}</span>
                    {usernameSuggestions.length > 0 && (
                      <div className={styles.suggestions}>
                        <span>Suggestions:</span>
                        <div className={styles.chipsRow}>
                          {usernameSuggestions.map((s) => (
                            <button
                              key={s}
                              type="button"
                              className={styles.chip}
                              onClick={() => {
                                setUsername(s);
                                setUsernameAvailable(true);
                              }}
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

              <div className={styles.form} style={{ gap: '1rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={handleStep4Submit}
                  disabled={loading || usernameAvailable === false}
                  className={styles.submitBtn}
                >
                  Save Username
                </button>

                <button
                  type="button"
                  onClick={() => setStep(5)}
                  className={styles.submitBtn}
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
                >
                  Skip
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: PROFILE ESSENTIALS */}
          {step === 5 && (
            <div className={styles.stepContainer}>
              <div className={styles.authHeader}>
                <h2>Profile Essentials</h2>
                <p>Add profile visuals and headlines</p>
              </div>

              <div className={styles.avatarSetupRow}>
                <div className={styles.avatarPreviewWrapper}>
                  {uploadingAvatar ? (
                    <div className={styles.avatarSpinner}></div>
                  ) : (
                    <img src={avatar} alt="Avatar" className={styles.avatarPreview} />
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

                  <div className={styles.presetsLabel}>Choose Preset:</div>
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
                <label htmlFor="tagline">Headline / Tagline</label>
                <input
                  id="tagline"
                  type="text"
                  placeholder="e.g. Software Developer, Founder..."
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="bio">Bio (Optional)</label>
                <textarea
                  id="bio"
                  rows={3}
                  className={styles.textarea}
                  placeholder="Write a brief intro..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
              </div>

              <button
                type="button"
                onClick={() => setStep(6)}
                className={styles.submitBtn}
              >
                Continue
              </button>
            </div>
          )}

          {/* STEP 6: SHARING PREFERENCES */}
          {step === 6 && (
            <div className={styles.stepContainer}>
              <div className={styles.authHeader}>
                <h2>Sharing Preferences</h2>
                <p>Choose your default sharing settings</p>
              </div>

              <div className={styles.privacyToggles}>
                <div className={styles.privacyItem}>
                  <div className={styles.privacyLabelRow}>
                    <span>Display Name</span>
                    <span className={styles.requiredTag}>Required</span>
                  </div>
                  <input type="checkbox" checked={shareName} disabled className={styles.checkbox} />
                </div>

                <div className={styles.privacyItem}>
                  <div className={styles.privacyLabelRow}>
                    <span>Email Address</span>
                    <p className={styles.privacyDesc}>Show email by default</p>
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
                    <p className={styles.privacyDesc}>Show phone by default</p>
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
                    <span>WhatsApp</span>
                    <p className={styles.privacyDesc}>Enable WhatsApp directs</p>
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
                    <p className={styles.privacyDesc}>Show location city</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={shareLocation}
                    onChange={(e) => setShareLocation(e.target.checked)}
                    className={styles.checkbox}
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => setStep(7)}
                className={styles.submitBtn}
              >
                Continue
              </button>
            </div>
          )}

          {/* STEP 7: SOCIAL HANDLES */}
          {step === 7 && (
            <div className={styles.stepContainer}>
              <div className={styles.authHeader}>
                <h2>Link Socials (Optional)</h2>
                <p>Connect your links to build your network</p>
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="linkedin">LinkedIn Handle</label>
                <input
                  id="linkedin"
                  type="text"
                  placeholder="linkedin-username"
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="github">GitHub Handle</label>
                <input
                  id="github"
                  type="text"
                  placeholder="github-username"
                  value={github}
                  onChange={(e) => setGithub(e.target.value)}
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
                <label htmlFor="portfolio">Portfolio Website</label>
                <input
                  id="portfolio"
                  type="text"
                  placeholder="www.yourportfolio.com"
                  value={portfolio}
                  onChange={(e) => setPortfolio(e.target.value)}
                />
              </div>

              <div className={styles.form} style={{ gap: '1rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => handleFinalSubmit(false)}
                  disabled={loading}
                  className={styles.submitBtn}
                >
                  {loading ? 'Saving Setup...' : 'Save & Continue'}
                </button>

                <button
                  type="button"
                  onClick={() => handleFinalSubmit(true)}
                  disabled={loading}
                  className={styles.submitBtn}
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
                >
                  Skip For Now
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
