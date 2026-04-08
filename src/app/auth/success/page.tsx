'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import Image from 'next/image';

function AuthSuccessContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [launched, setLaunched] = useState(false);

  useEffect(() => {
    if (token) {
      // Try to open the custom protocol
      window.location.href = `sealterminal://auth/callback?token=${token}`;
      setLaunched(true);
    }
  }, [token]);

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <div
        style={{
          backgroundColor: 'var(--bg-card)',
          border: '2px solid var(--border)',
          padding: '48px 40px',
          maxWidth: 440,
          width: '100%',
          textAlign: 'center',
          boxShadow: '6px 6px 0 rgba(99, 102, 241, 0.15)',
        }}
      >
        <Image
          src="/terminalseal.png"
          alt="SealTerminal"
          width={64}
          height={64}
          style={{ imageRendering: 'auto', marginBottom: 20 }}
        />

        <h1
          style={{
            fontFamily: 'var(--pixel-font)',
            fontSize: 14,
            color: '#22c55e',
            marginBottom: 16,
            letterSpacing: 2,
          }}
        >
          AUTH COMPLETE!
        </h1>

        <p
          style={{
            fontFamily: 'var(--mono-font)',
            fontSize: 13,
            color: 'var(--text-dim)',
            marginBottom: 24,
            lineHeight: 1.6,
          }}
        >
          {launched
            ? 'SealTerminal should open automatically. If not, click the button below.'
            : 'Something went wrong. No token received.'}
        </p>

        {token && (
          <a
            href={`sealterminal://auth/callback?token=${token}`}
            style={{
              display: 'inline-block',
              padding: '14px 28px',
              fontFamily: 'var(--pixel-font)',
              fontSize: 10,
              color: '#fff',
              backgroundColor: 'var(--accent)',
              border: '2px solid var(--accent-light)',
              textDecoration: 'none',
              letterSpacing: 1,
              boxShadow: '4px 4px 0 rgba(99, 102, 241, 0.3)',
              cursor: 'pointer',
            }}
          >
            OPEN SEALTERMINAL
          </a>
        )}

        <p
          style={{
            fontFamily: 'var(--mono-font)',
            fontSize: 11,
            color: 'var(--text-dim)',
            marginTop: 20,
          }}
        >
          You can close this tab after returning to the app.
        </p>
      </div>
    </main>
  );
}

export default function AuthSuccessPage() {
  return (
    <Suspense
      fallback={
        <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ fontFamily: 'var(--pixel-font)', fontSize: 11, color: 'var(--accent)' }}>LOADING...</p>
        </main>
      }
    >
      <AuthSuccessContent />
    </Suspense>
  );
}
