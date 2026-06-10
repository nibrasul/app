'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import LoadingScreen from '@/components/LoadingScreen';
import styles from './page.module.css';

interface Release {
  id: number;
  versionName: string;
  buildNumber: number;
  channel: string;
  isDraft: boolean;
  forceUpdate: boolean;
  isCurrent: boolean;
  apkUrl: string;
  changelog: string;
  createdAt: string;
}

export default function AdminReleasesPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Authorization & Releases State
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [releases, setReleases] = useState<Release[]>([]);

  // Form Fields
  const [versionName, setVersionName] = useState('');
  const [buildNumber, setBuildNumber] = useState('');
  const [channel, setChannel] = useState('stable');
  const [isDraft, setIsDraft] = useState(true);
  const [forceUpdate, setForceUpdate] = useState(false);
  const [isCurrent, setIsCurrent] = useState(false);
  const [changelog, setChangelog] = useState('');
  const [file, setFile] = useState<File | null>(null);

  // UI Status
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchReleases = async () => {
    try {
      const res = await fetch('/api/admin/releases');
      if (res.status === 401 || res.status === 403) {
        setAuthorized(false);
        router.push('/login?redirect=/admin/releases');
        return;
      }
      if (!res.ok) throw new Error('Failed to load release history.');
      const data = await res.json();
      if (data.success) {
        setReleases(data.releases || []);
        setAuthorized(true);
      }
    } catch (err: any) {
      setError(err.message || 'Error fetching release info.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReleases();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (!selectedFile.name.endsWith('.apk')) {
        setError('Please select a valid .apk file.');
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        setTimeout(() => setError(''), 4000);
        return;
      }
      setFile(selectedFile);
    }
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!versionName || !buildNumber || !file) {
      setError('Please fill out all required fields and upload an APK file.');
      return;
    }

    setSaving(true);
    const formData = new FormData();
    formData.append('versionName', versionName);
    formData.append('buildNumber', buildNumber);
    formData.append('channel', channel);
    formData.append('isDraft', String(isDraft));
    formData.append('forceUpdate', String(forceUpdate));
    formData.append('isCurrent', String(isCurrent));
    formData.append('changelog', changelog);
    formData.append('file', file);

    try {
      const res = await fetch('/api/admin/releases', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to publish release.');

      setSuccess('Release published successfully!');
      
      // Reset form
      setVersionName('');
      setBuildNumber('');
      setChannel('stable');
      setIsDraft(true);
      setForceUpdate(false);
      setIsCurrent(false);
      setChangelog('');
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';

      fetchReleases();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err: any) {
      setError(err.message || 'An error occurred during release publication.');
      setTimeout(() => setError(''), 4000);
    } finally {
      setSaving(false);
    }
  };

  const handleSetCurrent = async (id: number) => {
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/admin/releases/current', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to activate release.');

      setSuccess('Release marked as current!');
      fetchReleases();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to activate release.');
      setTimeout(() => setError(''), 4000);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this release version record? This action is permanent.')) return;
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`/api/admin/releases/${id}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete release.');

      setSuccess('Release deleted successfully!');
      fetchReleases();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to delete release.');
      setTimeout(() => setError(''), 4000);
    }
  };

  if (loading) {
    return <LoadingScreen message="Verifying admin authorization..." />;
  }

  if (!authorized) {
    return (
      <div className={styles.loadingWrapper}>
        <p style={{ color: 'var(--accent-error)' }}>Access denied. Admin authorization required.</p>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <Header />
      <main className={styles.main}>
        {success && <div className={styles.toastSuccess}>{success}</div>}
        {error && <div className={styles.toastError}>{error}</div>}

        <h1 className="visually-hidden">Tapfolio Release Management</h1>

        <div className={styles.releasesGrid}>
          {/* LEFT: UPLOAD NEW RELEASE CARD */}
          <div className={`${styles.card} glass-panel`}>
            <h2 className={styles.sectionTitle}>Upload New Release</h2>
            <form onSubmit={handlePublish} className={styles.form}>
              <div className={styles.formGroup}>
                <label htmlFor="versionName">Version Name *</label>
                <input
                  id="versionName"
                  type="text"
                  required
                  placeholder="e.g. 1.0.1"
                  value={versionName}
                  onChange={(e) => setVersionName(e.target.value)}
                  disabled={saving}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="buildNumber">Build Number *</label>
                <input
                  id="buildNumber"
                  type="number"
                  required
                  placeholder="e.g. 2"
                  value={buildNumber}
                  onChange={(e) => setBuildNumber(e.target.value)}
                  disabled={saving}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="channel">Release Channel</label>
                <select
                  id="channel"
                  value={channel}
                  onChange={(e) => setChannel(e.target.value)}
                  disabled={saving}
                >
                  <option value="stable">Stable</option>
                  <option value="beta">Beta</option>
                  <option value="internal">Internal</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="apkFile">APK File *</label>
                <input
                  id="apkFile"
                  type="file"
                  accept=".apk"
                  required
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  disabled={saving}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="changelog">Changelog / Release Notes</label>
                <textarea
                  id="changelog"
                  rows={4}
                  placeholder="Enter release notes (one point per line)"
                  value={changelog}
                  onChange={(e) => setChangelog(e.target.value)}
                  disabled={saving}
                />
              </div>

              <div className={styles.checkboxGroup}>
                <input
                  id="isDraft"
                  type="checkbox"
                  checked={isDraft}
                  onChange={(e) => {
                    setIsDraft(e.target.checked);
                    if (e.target.checked) setIsCurrent(false);
                  }}
                  disabled={saving}
                />
                <label htmlFor="isDraft">Publish as Draft</label>
              </div>
              <p className={styles.checkboxDesc}>Drafts are hidden from users and cannot be marked as current.</p>

              <div className={styles.checkboxGroup}>
                <input
                  id="forceUpdate"
                  type="checkbox"
                  checked={forceUpdate}
                  onChange={(e) => setForceUpdate(e.target.checked)}
                  disabled={saving}
                />
                <label htmlFor="forceUpdate">Force Update</label>
              </div>
              <p className={styles.checkboxDesc}>Requires users to update immediately to continue using the app.</p>

              <div className={styles.checkboxGroup}>
                <input
                  id="isCurrent"
                  type="checkbox"
                  checked={isCurrent}
                  disabled={saving || isDraft}
                  onChange={(e) => setIsCurrent(e.target.checked)}
                />
                <label htmlFor="isCurrent">Set as Current Version</label>
              </div>
              <p className={styles.checkboxDesc}>Marks this version as the latest active update for the selected channel.</p>

              <button type="submit" className={styles.publishBtn} disabled={saving}>
                {saving ? 'Uploading APK & Publishing...' : 'Publish Release'}
              </button>
            </form>
          </div>

          {/* RIGHT: RELEASE HISTORY TABLE CARD */}
          <div className={`${styles.card} glass-panel`}>
            <h2 className={styles.sectionTitle}>Release History</h2>
            <div className={styles.tableWrapper}>
              {releases.length === 0 ? (
                <div className={styles.noReleases}>No releases uploaded yet.</div>
              ) : (
                <table className={styles.releasesTable}>
                  <thead>
                    <tr>
                      <th>Version (Build)</th>
                      <th>Channel</th>
                      <th>Status</th>
                      <th>Changelog</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {releases.map((rel) => {
                      let statusBadge = <span className={`${styles.badge} ${styles.badgeArchived}`}>Archived</span>;
                      if (rel.isDraft) {
                        statusBadge = <span className={`${styles.badge} ${styles.badgeDraft}`}>Draft</span>;
                      } else if (rel.isCurrent) {
                        statusBadge = <span className={`${styles.badge} ${styles.badgeCurrent}`}>Current</span>;
                      }

                      return (
                        <tr key={rel.id}>
                          <td>
                            <strong>v{rel.versionName}</strong> ({rel.buildNumber})
                            {rel.forceUpdate && (
                              <span style={{ color: 'var(--accent-error)', fontSize: '0.75rem', display: 'block', fontWeight: 'bold' }}>
                                ⚠️ Force Update
                              </span>
                            )}
                          </td>
                          <td>
                            <span style={{ textTransform: 'capitalize' }}>{rel.channel}</span>
                          </td>
                          <td>{statusBadge}</td>
                          <td className={styles.changelogCell} title={rel.changelog || 'No notes'}>
                            {rel.changelog || 'No notes'}
                          </td>
                          <td className={styles.actionCell}>
                            {!rel.isCurrent && !rel.isDraft && (
                              <button
                                onClick={() => handleSetCurrent(rel.id)}
                                className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}
                                disabled={saving}
                              >
                                Set Current
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(rel.id)}
                              className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                              disabled={saving}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
