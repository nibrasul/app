'use client';

import React from 'react';
import styles from './LoadingScreen.module.css';

interface LoadingScreenProps {
  message?: string;
}

export default function LoadingScreen({ message = 'Loading Tapfolio...' }: LoadingScreenProps) {
  return (
    <div className={styles.loadingWrapper}>
      {/* Dynamic Background Glows */}
      <div className={styles.bgBlob1}></div>
      <div className={styles.bgBlob2}></div>
      <div className={styles.gridOverlay}></div>

      {/* Main Loading Visual Group */}
      <div className={styles.loaderContainer}>
        <div className={styles.spinnerWrapper}>
          <div className={styles.ringOuter}></div>
          <div className={styles.ringMiddle}></div>
          <div className={styles.ringInner}></div>
          <div className={styles.centerLogo}>
            <span>⚡</span>
          </div>
        </div>

        {/* Text Area */}
        <div className={styles.textContainer}>
          <h2 className={styles.logoText}>
            Tap<span>folio</span>
          </h2>
          <div className={styles.typingWrapper}>
            <p className={styles.loadingMessage}>{message}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
