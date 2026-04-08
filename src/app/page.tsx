import Image from 'next/image';

const features = [
  {
    icon: '>>>',
    title: 'MULTI-TAB',
    desc: 'Run multiple terminals side by side with colored tabs and split panes.',
  },
  {
    icon: '[P]',
    title: 'PROFILES',
    desc: 'Save your workspace setups as profiles. Switch between projects instantly.',
  },
  {
    icon: '{Q}',
    title: 'QUICK CMD',
    desc: 'One-click quick commands per tab or globally. Automate your workflows.',
  },
  {
    icon: '</>',
    title: 'OPEN SRC',
    desc: 'Built with Electron, React, xterm.js. Fork it. Hack it. Make it yours.',
  },
];

export default function Home() {
  return (
    <main>
      {/* NAV */}
      <nav
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 32px',
          backgroundColor: 'rgba(10, 10, 18, 0.9)',
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Image
            src="/terminalseal.png"
            alt="SealTerminal"
            width={32}
            height={32}
            style={{ imageRendering: 'auto' }}
          />
          <span
            style={{
              fontFamily: 'var(--pixel-font)',
              fontSize: 11,
              color: 'var(--accent-light)',
              letterSpacing: 2,
            }}
          >
            SEALTERMINAL
          </span>
        </div>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          <a
            href="#features"
            style={{
              fontFamily: 'var(--mono-font)',
              fontSize: 13,
              color: 'var(--text-dim)',
              textDecoration: 'none',
            }}
          >
            Features
          </a>
          <a
            href="#download"
            style={{
              fontFamily: 'var(--pixel-font)',
              fontSize: 10,
              color: '#fff',
              backgroundColor: 'var(--accent)',
              padding: '8px 16px',
              textDecoration: 'none',
              border: '2px solid var(--accent-light)',
              boxShadow: '3px 3px 0 rgba(99, 102, 241, 0.3)',
            }}
          >
            DOWNLOAD
          </a>
        </div>
      </nav>

      {/* HERO */}
      <section
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '120px 24px 80px',
          position: 'relative',
        }}
      >
        {/* Grid background */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'linear-gradient(rgba(99,102,241,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.05) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
            pointerEvents: 'none',
          }}
        />

        <div
          style={{
            animation: 'float 4s ease-in-out infinite',
            marginBottom: 32,
          }}
        >
          <Image
            src="/terminalseal.png"
            alt="SealTerminal Mascot"
            width={200}
            height={200}
            priority
            style={{
              imageRendering: 'auto',
              filter: 'drop-shadow(0 0 40px rgba(99, 102, 241, 0.5))',
            }}
          />
        </div>

        <h1
          style={{
            fontFamily: 'var(--pixel-font)',
            fontSize: 'clamp(24px, 5vw, 42px)',
            color: 'var(--accent-light)',
            marginBottom: 8,
            textShadow: '3px 3px 0 #312e81, 6px 6px 0 #1e1b4b',
            letterSpacing: 3,
            animation: 'pixelFadeIn 0.8s ease-out',
          }}
        >
          SEALTERMINAL
        </h1>

        <p
          style={{
            fontFamily: 'var(--pixel-font)',
            fontSize: 'clamp(8px, 1.5vw, 11px)',
            color: 'var(--accent)',
            letterSpacing: 4,
            marginBottom: 32,
            animation: 'pixelFadeIn 0.8s ease-out 0.2s both',
          }}
        >
          MULTI-TERMINAL MANAGER v1.0
        </p>

        <p
          style={{
            fontFamily: 'var(--mono-font)',
            fontSize: 16,
            color: 'var(--text-dim)',
            maxWidth: 520,
            lineHeight: 1.7,
            marginBottom: 40,
            animation: 'pixelFadeIn 0.8s ease-out 0.4s both',
          }}
        >
          A terminal multiplexer for developers who want{' '}
          <span style={{ color: 'var(--green)' }}>tabs</span>,{' '}
          <span style={{ color: '#f59e0b' }}>profiles</span>, and{' '}
          <span style={{ color: '#ec4899' }}>quick commands</span> — without the config hell.
        </p>

        {/* Terminal preview block */}
        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '2px solid var(--border)',
            borderRadius: 0,
            padding: 0,
            maxWidth: 560,
            width: '100%',
            textAlign: 'left',
            boxShadow: '6px 6px 0 rgba(99, 102, 241, 0.15)',
            animation: 'pixelFadeIn 0.8s ease-out 0.6s both',
          }}
        >
          {/* Title bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 12px',
              backgroundColor: '#1a1a3e',
              borderBottom: '2px solid var(--border)',
            }}
          >
            <div style={{ width: 10, height: 10, backgroundColor: '#ef4444', border: '1px solid #dc2626' }} />
            <div style={{ width: 10, height: 10, backgroundColor: '#f59e0b', border: '1px solid #d97706' }} />
            <div style={{ width: 10, height: 10, backgroundColor: '#22c55e', border: '1px solid #16a34a' }} />
            <span
              style={{
                fontFamily: 'var(--pixel-font)',
                fontSize: 8,
                color: 'var(--text-dim)',
                marginLeft: 8,
              }}
            >
              seal@terminal ~
            </span>
          </div>
          {/* Terminal content */}
          <div
            style={{
              padding: '16px 16px',
              fontFamily: 'var(--mono-font)',
              fontSize: 13,
              lineHeight: 1.8,
            }}
          >
            <div>
              <span style={{ color: 'var(--green)' }}>seal@dev</span>
              <span style={{ color: 'var(--text-dim)' }}>:</span>
              <span style={{ color: '#60a5fa' }}>~/projects</span>
              <span style={{ color: 'var(--text-dim)' }}>$ </span>
              <span style={{ color: 'var(--text)' }}>sealterminal --launch</span>
            </div>
            <div style={{ color: 'var(--accent-light)' }}>
              {'>'} Loading 3 profiles...
            </div>
            <div style={{ color: 'var(--accent-light)' }}>
              {'>'} Opening 8 terminal tabs...
            </div>
            <div style={{ color: 'var(--green)' }}>
              {'>'} Ready in 0.4s
            </div>
            <div style={{ marginTop: 4 }}>
              <span style={{ color: 'var(--green)' }}>seal@dev</span>
              <span style={{ color: 'var(--text-dim)' }}>:</span>
              <span style={{ color: '#60a5fa' }}>~/projects</span>
              <span style={{ color: 'var(--text-dim)' }}>$ </span>
              <span
                style={{
                  display: 'inline-block',
                  width: 8,
                  height: 16,
                  backgroundColor: 'var(--accent)',
                  animation: 'blink 1s step-end infinite',
                  verticalAlign: 'text-bottom',
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section
        id="features"
        style={{
          padding: '80px 24px',
          maxWidth: 900,
          margin: '0 auto',
        }}
      >
        <h2
          style={{
            fontFamily: 'var(--pixel-font)',
            fontSize: 18,
            color: 'var(--accent-light)',
            textAlign: 'center',
            marginBottom: 48,
            letterSpacing: 3,
          }}
        >
          {'// FEATURES'}
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 20,
          }}
        >
          {features.map((f) => (
            <div
              key={f.title}
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '2px solid var(--border)',
                padding: 24,
                transition: 'border-color 0.2s, box-shadow 0.2s',
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--pixel-font)',
                  fontSize: 16,
                  color: 'var(--accent)',
                  marginBottom: 12,
                }}
              >
                {f.icon}
              </div>
              <div
                style={{
                  fontFamily: 'var(--pixel-font)',
                  fontSize: 10,
                  color: 'var(--accent-light)',
                  marginBottom: 10,
                  letterSpacing: 1,
                }}
              >
                {f.title}
              </div>
              <div
                style={{
                  fontFamily: 'var(--mono-font)',
                  fontSize: 13,
                  color: 'var(--text-dim)',
                  lineHeight: 1.6,
                }}
              >
                {f.desc}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* DOWNLOAD / CTA */}
      <section
        id="download"
        style={{
          padding: '80px 24px',
          textAlign: 'center',
          borderTop: '1px solid var(--border)',
        }}
      >
        <h2
          style={{
            fontFamily: 'var(--pixel-font)',
            fontSize: 18,
            color: 'var(--accent-light)',
            marginBottom: 16,
            letterSpacing: 3,
          }}
        >
          {'> DOWNLOAD'}
        </h2>
        <p
          style={{
            fontFamily: 'var(--mono-font)',
            fontSize: 14,
            color: 'var(--text-dim)',
            marginBottom: 32,
            maxWidth: 400,
            margin: '0 auto 32px',
          }}
        >
          Free to use. Open source. Available for Windows, macOS, and Linux.
        </p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a
            href="#"
            style={{
              fontFamily: 'var(--pixel-font)',
              fontSize: 11,
              color: '#fff',
              backgroundColor: 'var(--accent)',
              padding: '14px 28px',
              textDecoration: 'none',
              border: '2px solid var(--accent-light)',
              boxShadow: '4px 4px 0 rgba(99, 102, 241, 0.3)',
              transition: 'transform 0.1s, box-shadow 0.1s',
            }}
          >
            WINDOWS .EXE
          </a>
          <a
            href="#"
            style={{
              fontFamily: 'var(--pixel-font)',
              fontSize: 11,
              color: 'var(--accent-light)',
              backgroundColor: 'transparent',
              padding: '14px 28px',
              textDecoration: 'none',
              border: '2px solid var(--border)',
              boxShadow: '4px 4px 0 rgba(99, 102, 241, 0.1)',
              transition: 'transform 0.1s, box-shadow 0.1s',
            }}
          >
            macOS .DMG
          </a>
          <a
            href="#"
            style={{
              fontFamily: 'var(--pixel-font)',
              fontSize: 11,
              color: 'var(--accent-light)',
              backgroundColor: 'transparent',
              padding: '14px 28px',
              textDecoration: 'none',
              border: '2px solid var(--border)',
              boxShadow: '4px 4px 0 rgba(99, 102, 241, 0.1)',
              transition: 'transform 0.1s, box-shadow 0.1s',
            }}
          >
            LINUX .DEB
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer
        style={{
          padding: '32px 24px',
          textAlign: 'center',
          borderTop: '1px solid var(--border)',
        }}
      >
        <p
          style={{
            fontFamily: 'var(--pixel-font)',
            fontSize: 8,
            color: 'var(--text-dim)',
            letterSpacing: 2,
          }}
        >
          {'// BUILT BY SEAL DEVS // 2026'}
        </p>
      </footer>
    </main>
  );
}
