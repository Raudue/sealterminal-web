import Image from 'next/image';

const features = [
  {
    icon: '>>>',
    title: 'MULTI-TAB',
    desc: 'Run multiple terminals side by side with colored tabs and split panes. Up to 3-way splits per tab.',
  },
  {
    icon: '[P]',
    title: 'PROFILES',
    desc: 'Save entire workspace setups as profiles. Switch between projects with one click.',
  },
  {
    icon: '{Q}',
    title: 'QUICK CMD',
    desc: 'One-click quick commands per tab or globally. Launch Claude, run builds, deploy — instantly.',
  },
  {
    icon: '~$~',
    title: 'PROCESS MGR',
    desc: 'See every running process per terminal. Monitor CPU and memory. Kill rogue processes on the spot.',
  },
  {
    icon: '<g>',
    title: 'GIT BAR',
    desc: 'Live git status in every tab — branch, ahead/behind, staged changes. Quick commit & push built in.',
  },
  {
    icon: '⚔️',
    title: 'RPG MODE',
    desc: 'Your terminal is an RPG. Earn fish, level up your seal, equip gear, complete quests, and climb the ranks.',
  },
  {
    icon: '🛡️',
    title: 'SEAL CLASSES',
    desc: 'Choose your class: Brawler, Swift, Sage, Diplomat, or Guardian. Each with unique stat bonuses.',
  },
  {
    icon: '🏪',
    title: 'SHOP & GEAR',
    desc: 'Spend fish in the shop. Buy helmets, weapons, armor, and accessories. Equip items for stat boosts.',
  },
];

const rpgFeatures = [
  { label: 'Daily Quests', value: 'Earn fish by completing terminal challenges' },
  { label: '12 Seal Ranks', value: 'From Baby Seal to Diamond Seal' },
  { label: '5 Seal Classes', value: 'Each with unique abilities and bonuses' },
  { label: 'Badges & Streaks', value: 'Collect badges and maintain daily streaks' },
  { label: 'Referral System', value: 'Invite friends, earn bonus fish' },
  { label: 'Item Rarities', value: 'Common, Uncommon, Rare, Epic, Legendary' },
];

export default function Home() {
  const windowsUrl =
    'https://github.com/Raudue/sealterminal-releases/releases/download/v1.1.0/SealTerminal-Setup.exe';

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
            href="#rpg"
            style={{
              fontFamily: 'var(--mono-font)',
              fontSize: 13,
              color: 'var(--text-dim)',
              textDecoration: 'none',
            }}
          >
            RPG
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
            width={136}
            height={257}
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
          TERMINAL RPG v1.1
        </p>

        <p
          style={{
            fontFamily: 'var(--mono-font)',
            fontSize: 16,
            color: 'var(--text-dim)',
            maxWidth: 560,
            lineHeight: 1.7,
            marginBottom: 40,
            animation: 'pixelFadeIn 0.8s ease-out 0.4s both',
          }}
        >
          A multi-terminal manager where every command counts.{' '}
          <span style={{ color: 'var(--green)' }}>Tabs</span>,{' '}
          <span style={{ color: '#f59e0b' }}>profiles</span>,{' '}
          <span style={{ color: '#ec4899' }}>split panes</span>, and a full{' '}
          <span style={{ color: '#a855f7' }}>RPG system</span> — earn fish, level up your seal,
          and gear up.
        </p>

        {/* Terminal preview block */}
        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '2px solid var(--border)',
            borderRadius: 0,
            padding: 0,
            maxWidth: 600,
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
            <div style={{ color: 'var(--text-dim)', fontSize: 11, marginBottom: 6 }}>
              {'┌──────────────────────────────────────┐'}
            </div>
            <div style={{ color: 'var(--text-dim)', fontSize: 11 }}>
              {'│'} <span style={{ color: 'var(--accent-light)' }}>Tab 1</span>{' · '}
              <span style={{ color: '#22c55e' }}>frontend</span>{'  '}
              <span style={{ color: 'var(--accent-light)' }}>Tab 2</span>{' · '}
              <span style={{ color: '#f59e0b' }}>backend</span>{'  '}
              <span style={{ color: 'var(--accent-light)' }}>Tab 3</span>{' · '}
              <span style={{ color: '#ec4899' }}>deploy</span> {'│'}
            </div>
            <div style={{ color: 'var(--text-dim)', fontSize: 11, marginBottom: 6 }}>
              {'└──────────────────────────────────────┘'}
            </div>
            <div>
              <span style={{ color: '#a855f7' }}>🧠 Sage Seal</span>
              <span style={{ color: 'var(--text-dim)' }}> · Lv.6 · </span>
              <span style={{ color: '#f59e0b' }}>847 fish</span>
              <span style={{ color: 'var(--text-dim)' }}> · streak: </span>
              <span style={{ color: '#22c55e' }}>5d</span>
            </div>
            <div style={{ color: 'var(--text-dim)', marginTop: 2 }}>
              Quest: <span style={{ color: '#f59e0b' }}>Run 10 commands</span> [████████░░] 8/10
            </div>
            <div style={{ color: 'var(--green)', marginTop: 6 }}>
              + Equipped <span style={{ color: '#a855f7' }}>Arcane Staff</span> (epic) — INT +12
            </div>
            <div style={{ marginTop: 6 }}>
              <span style={{ color: 'var(--green)' }}>~</span>
              <span style={{ color: 'var(--text-dim)' }}> $ </span>
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

        {/* Quick download CTA under hero */}
        <a
          href={windowsUrl}
          style={{
            marginTop: 40,
            fontFamily: 'var(--pixel-font)',
            fontSize: 11,
            color: '#fff',
            backgroundColor: 'var(--accent)',
            padding: '14px 32px',
            textDecoration: 'none',
            border: '2px solid var(--accent-light)',
            boxShadow: '4px 4px 0 rgba(99, 102, 241, 0.3)',
            animation: 'pixelFadeIn 0.8s ease-out 0.8s both',
          }}
        >
          DOWNLOAD FOR WINDOWS
        </a>
        <span
          style={{
            fontFamily: 'var(--mono-font)',
            fontSize: 11,
            color: 'var(--text-dim)',
            marginTop: 8,
            animation: 'pixelFadeIn 0.8s ease-out 1s both',
          }}
        >
          v1.1.0 — Windows 10/11 — macOS coming soon
        </span>
      </section>

      {/* FEATURES */}
      <section
        id="features"
        style={{
          padding: '80px 24px',
          maxWidth: 960,
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
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
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

      {/* RPG SECTION */}
      <section
        id="rpg"
        style={{
          padding: '80px 24px',
          borderTop: '1px solid var(--border)',
        }}
      >
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <h2
            style={{
              fontFamily: 'var(--pixel-font)',
              fontSize: 18,
              color: 'var(--accent-light)',
              textAlign: 'center',
              marginBottom: 16,
              letterSpacing: 3,
            }}
          >
            {'// RPG SYSTEM'}
          </h2>
          <p
            style={{
              fontFamily: 'var(--mono-font)',
              fontSize: 14,
              color: 'var(--text-dim)',
              textAlign: 'center',
              maxWidth: 500,
              margin: '0 auto 48px',
              lineHeight: 1.7,
            }}
          >
            Every command you run earns fish. Level up your seal, complete quests, and collect rare
            gear. Your terminal is now an adventure.
          </p>

          {/* Seal classes */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 16,
              flexWrap: 'wrap',
              marginBottom: 48,
            }}
          >
            {[
              { emoji: '🔥', name: 'Brawler', stat: 'STR', color: '#ef4444' },
              { emoji: '⚡', name: 'Swift', stat: 'DEX', color: '#f59e0b' },
              { emoji: '🧠', name: 'Sage', stat: 'INT', color: '#6366f1' },
              { emoji: '💬', name: 'Diplomat', stat: 'CHA', color: '#ec4899' },
              { emoji: '🛡️', name: 'Guardian', stat: 'END', color: '#22c55e' },
            ].map((c) => (
              <div
                key={c.name}
                style={{
                  backgroundColor: 'var(--bg-card)',
                  border: `2px solid ${c.color}40`,
                  padding: '20px 24px',
                  textAlign: 'center',
                  minWidth: 120,
                }}
              >
                <div style={{ fontSize: 28, marginBottom: 8 }}>{c.emoji}</div>
                <div
                  style={{
                    fontFamily: 'var(--pixel-font)',
                    fontSize: 9,
                    color: c.color,
                    letterSpacing: 1,
                    marginBottom: 4,
                  }}
                >
                  {c.name.toUpperCase()}
                </div>
                <div
                  style={{
                    fontFamily: 'var(--mono-font)',
                    fontSize: 11,
                    color: 'var(--text-dim)',
                  }}
                >
                  Primary: {c.stat}
                </div>
              </div>
            ))}
          </div>

          {/* RPG features list */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: 12,
              maxWidth: 640,
              margin: '0 auto',
            }}
          >
            {rpgFeatures.map((f) => (
              <div
                key={f.label}
                style={{
                  display: 'flex',
                  gap: 12,
                  padding: '12px 16px',
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                }}
              >
                <span style={{ color: 'var(--green)', fontFamily: 'var(--mono-font)', fontSize: 13 }}>
                  +
                </span>
                <div>
                  <div
                    style={{
                      fontFamily: 'var(--pixel-font)',
                      fontSize: 8,
                      color: 'var(--accent-light)',
                      marginBottom: 4,
                      letterSpacing: 1,
                    }}
                  >
                    {f.label.toUpperCase()}
                  </div>
                  <div
                    style={{
                      fontFamily: 'var(--mono-font)',
                      fontSize: 12,
                      color: 'var(--text-dim)',
                    }}
                  >
                    {f.value}
                  </div>
                </div>
              </div>
            ))}
          </div>
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
            maxWidth: 440,
            margin: '0 auto 32px',
            lineHeight: 1.7,
          }}
        >
          Free to use. Available for Windows now. macOS and Linux coming soon.
        </p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a
            href={windowsUrl}
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
          <span
            style={{
              fontFamily: 'var(--pixel-font)',
              fontSize: 11,
              color: 'var(--text-dim)',
              backgroundColor: 'transparent',
              padding: '14px 28px',
              border: '2px solid var(--border)',
              boxShadow: '4px 4px 0 rgba(99, 102, 241, 0.1)',
              opacity: 0.5,
            }}
          >
            macOS — COMING SOON
          </span>
        </div>
        <p
          style={{
            fontFamily: 'var(--mono-font)',
            fontSize: 11,
            color: 'var(--text-dim)',
            marginTop: 16,
            opacity: 0.6,
          }}
        >
          v1.1.0 — Windows 10/11 (x64) — ~170 MB
        </p>
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
