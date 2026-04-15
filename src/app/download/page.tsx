'use client';

import { useEffect, useState } from 'react';

type Platform = 'windows' | 'mac' | 'other';

function detectPlatform(): Platform {
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes('win')) return 'windows';
  if (ua.includes('mac')) return 'mac';
  return 'other';
}

interface VersionInfo {
  version: string;
  releaseNotes: string;
  windowsUrl: string;
  macUrl: string;
}

export default function DownloadPage() {
  const [platform, setPlatform] = useState<Platform>('other');
  const [info, setInfo] = useState<VersionInfo | null>(null);

  useEffect(() => {
    setPlatform(detectPlatform());
    fetch('/api/version')
      .then((r) => r.json())
      .then(setInfo)
      .catch(() => {});
  }, []);

  const version = info?.version ?? '...';

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0a0a0a',
        color: '#e5e5e5',
        fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
      }}
    >
      <h1 style={{ fontSize: 36, fontWeight: 700, marginBottom: 8 }}>
        SealTerminal
      </h1>
      <p style={{ fontSize: 16, color: '#a3a3a3', marginBottom: 40 }}>
        Version {version}
      </p>

      <div
        style={{
          display: 'flex',
          gap: 20,
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}
      >
        <DownloadCard
          label="Windows"
          ext=".exe"
          url={info?.windowsUrl}
          recommended={platform === 'windows'}
        />
        <DownloadCard
          label="macOS"
          ext=".zip"
          url={info?.macUrl}
          recommended={platform === 'mac'}
        />
      </div>

      {info?.releaseNotes && (
        <div
          style={{
            marginTop: 48,
            maxWidth: 520,
            textAlign: 'center',
          }}
        >
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
            Release Notes
          </h2>
          <p style={{ fontSize: 14, color: '#a3a3a3', whiteSpace: 'pre-line' }}>
            {info.releaseNotes}
          </p>
        </div>
      )}
    </div>
  );
}

function DownloadCard({
  label,
  ext,
  url,
  recommended,
}: {
  label: string;
  ext: string;
  url?: string;
  recommended: boolean;
}) {
  return (
    <a
      href={url || '#'}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '24px 40px',
        background: recommended ? '#1e1b4b' : '#171717',
        border: recommended ? '2px solid #6366f1' : '1px solid #333',
        borderRadius: 10,
        textDecoration: 'none',
        color: '#e5e5e5',
        minWidth: 180,
        transition: 'border-color 0.15s',
      }}
    >
      <span style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>
        {label}
      </span>
      <span style={{ fontSize: 12, color: '#a3a3a3' }}>{ext}</span>
      {recommended && (
        <span
          style={{
            marginTop: 10,
            fontSize: 11,
            background: '#6366f1',
            color: '#fff',
            padding: '2px 10px',
            borderRadius: 10,
          }}
        >
          Recommended
        </span>
      )}
    </a>
  );
}
