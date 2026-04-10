'use client';

import { useEffect, useState, useCallback } from 'react';

type Tab = 'reference' | 'seals' | 'items';

interface SealClass {
  id: string;
  name: string;
  emoji: string;
  imageUrl: string | null;
}

interface AdminItem {
  id: string;
  name: string;
  description: string;
  slot: string;
  rarity: string;
  icon: string;
  imageUrl: string | null;
  levelRequired: number;
  cost: number;
}

interface ReferenceInfo {
  imageUrl: string;
  updatedAt: string;
}

const RARITY_COLORS: Record<string, string> = {
  common: '#9ca3af',
  uncommon: '#22c55e',
  rare: '#3b82f6',
  epic: '#a855f7',
  legendary: '#f59e0b',
};

export default function AdminPage() {
  const [token, setToken] = useState('');
  const [tab, setTab] = useState<Tab>('reference');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');

  // Reference state
  const [reference, setReference] = useState<ReferenceInfo | null>(null);
  const [refPrompt, setRefPrompt] = useState('');

  // Seals state
  const [sealClasses, setSealClasses] = useState<SealClass[]>([]);

  // Items state
  const [items, setItems] = useState<AdminItem[]>([]);
  const [filterRarity, setFilterRarity] = useState<string>('all');
  const [filterSlot, setFilterSlot] = useState<string>('all');

  // Generating state per ID
  const [generating, setGenerating] = useState<Set<string>>(new Set());

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get('token') || sessionStorage.getItem('admin_token') || '';
    if (t) {
      setToken(t);
      sessionStorage.setItem('admin_token', t);
    }
  }, []);

  const apiUrl = (path: string) => `/api/admin/${path}?token=${token}`;

  const fetchReference = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(apiUrl('reference'));
      const data = await res.json();
      setReference(data.reference);
    } catch { /* ignore */ }
  }, [token]);

  const fetchSeals = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(apiUrl('seals'));
      const data = await res.json();
      setSealClasses(data.sealClasses);
    } catch { /* ignore */ }
  }, [token]);

  const fetchItems = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(apiUrl('items'));
      const data = await res.json();
      setItems(data.items);
    } catch { /* ignore */ }
  }, [token]);

  useEffect(() => {
    if (!token) return;
    fetchReference();
    fetchSeals();
    fetchItems();
  }, [token, fetchReference, fetchSeals, fetchItems]);

  async function generate(type: 'reference' | 'seal' | 'item', id?: string, customPrompt?: string) {
    const genKey = id || type;
    setGenerating((prev) => new Set(prev).add(genKey));
    setError('');
    setStatus(`Generating ${type}${id ? ` (${id})` : ''}...`);

    try {
      const res = await fetch(apiUrl('generate'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, id, customPrompt }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Generation failed');

      setStatus(`Generated! ${data.imageUrl}`);

      // Refresh data
      if (type === 'reference') await fetchReference();
      if (type === 'seal') await fetchSeals();
      if (type === 'item') await fetchItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setGenerating((prev) => {
        const next = new Set(prev);
        next.delete(genKey);
        return next;
      });
    }
  }

  async function generateAllMissing(type: 'seal' | 'item') {
    setLoading(true);
    setError('');

    if (type === 'seal') {
      const missing = sealClasses.filter((s) => !s.imageUrl);
      for (const s of missing) {
        await generate('seal', s.id);
      }
    } else {
      const filtered = getFilteredItems().filter((i) => !i.imageUrl);
      for (const item of filtered) {
        await generate('item', item.id);
      }
    }

    setLoading(false);
  }

  function getFilteredItems(): AdminItem[] {
    return items.filter((i) => {
      if (filterRarity !== 'all' && i.rarity !== filterRarity) return false;
      if (filterSlot !== 'all' && i.slot !== filterSlot) return false;
      return true;
    });
  }

  if (!token) {
    return (
      <div style={styles.container}>
        <h1 style={styles.title}>Admin Panel</h1>
        <p style={styles.text}>No token found. Add ?token=YOUR_TOKEN to the URL.</p>
      </div>
    );
  }

  const filteredItems = getFilteredItems();
  const missingItemCount = filteredItems.filter((i) => !i.imageUrl).length;
  const missingSealCount = sealClasses.filter((s) => !s.imageUrl).length;

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Seal RPG Admin Panel</h1>

      {error && <div style={styles.error}>{error}</div>}
      {status && <div style={styles.status}>{status}</div>}

      {/* Tab bar */}
      <div style={styles.tabBar}>
        {(['reference', 'seals', 'items'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{ ...styles.tabBtn, ...(tab === t ? styles.tabActive : {}) }}
          >
            {t === 'reference' ? '🎨 Reference' : t === 'seals' ? '🦭 Seal Classes' : '⚔️ Items'}
          </button>
        ))}
      </div>

      {/* Reference tab */}
      {tab === 'reference' && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Reference Seal Image</h2>
          <p style={styles.text}>
            This image is used as a style reference when generating seal classes and items.
            Generate it first before creating other images.
          </p>

          <div style={styles.refPreview}>
            {reference ? (
              <div>
                <img
                  src={reference.imageUrl + '?t=' + Date.now()}
                  alt="Reference seal"
                  style={{ ...styles.previewImg, width: 128, height: 128, imageRendering: 'pixelated' as const }}
                />
                <div style={styles.text}>
                  Updated: {new Date(reference.updatedAt).toLocaleString()}
                </div>
              </div>
            ) : (
              <div style={styles.placeholder}>No reference image yet</div>
            )}
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Custom prompt (optional)</label>
            <textarea
              value={refPrompt}
              onChange={(e) => setRefPrompt(e.target.value)}
              style={styles.textarea}
              placeholder="Leave empty for default prompt..."
              rows={3}
            />
          </div>

          <button
            onClick={() => generate('reference', undefined, refPrompt || undefined)}
            disabled={generating.has('reference')}
            style={styles.btn}
          >
            {generating.has('reference') ? 'Generating...' : reference ? 'Regenerate Reference' : 'Generate Reference'}
          </button>
        </div>
      )}

      {/* Seal Classes tab */}
      {tab === 'seals' && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Seal Class Portraits</h2>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <p style={styles.text}>{missingSealCount} of {sealClasses.length} missing images</p>
            {missingSealCount > 0 && (
              <button onClick={() => generateAllMissing('seal')} disabled={loading} style={styles.btn}>
                {loading ? 'Generating...' : `Generate All Missing (${missingSealCount})`}
              </button>
            )}
          </div>

          <div style={styles.grid}>
            {sealClasses.map((sc) => (
              <div key={sc.id} style={styles.card}>
                <div style={styles.cardHeader}>
                  <span style={{ fontSize: 24 }}>{sc.emoji}</span>
                  <span style={styles.cardTitle}>{sc.name}</span>
                </div>
                <div style={styles.cardBody}>
                  {sc.imageUrl ? (
                    <img
                      src={sc.imageUrl + '?t=' + Date.now()}
                      alt={sc.name}
                      style={{ ...styles.previewImg, width: 96, height: 96, imageRendering: 'pixelated' as const }}
                    />
                  ) : (
                    <div style={{ ...styles.placeholder, width: 96, height: 96 }}>No image</div>
                  )}
                </div>
                <button
                  onClick={() => generate('seal', sc.id)}
                  disabled={generating.has(sc.id)}
                  style={{ ...styles.btn, width: '100%', marginTop: 8 }}
                >
                  {generating.has(sc.id) ? 'Generating...' : sc.imageUrl ? 'Regenerate' : 'Generate'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Items tab */}
      {tab === 'items' && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Item Images</h2>

          <div style={styles.filters}>
            <div style={styles.field}>
              <label style={styles.label}>Rarity</label>
              <select value={filterRarity} onChange={(e) => setFilterRarity(e.target.value)} style={styles.select}>
                <option value="all">All</option>
                {['common', 'uncommon', 'rare', 'epic', 'legendary'].map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Slot</label>
              <select value={filterSlot} onChange={(e) => setFilterSlot(e.target.value)} style={styles.select}>
                <option value="all">All</option>
                {['helmet', 'weapon', 'armor', 'accessory'].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div style={{ flex: 1 }} />
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
              <span style={styles.text}>{missingItemCount} of {filteredItems.length} missing</span>
              {missingItemCount > 0 && (
                <button onClick={() => generateAllMissing('item')} disabled={loading} style={styles.btn}>
                  {loading ? 'Generating...' : `Generate Missing (${missingItemCount})`}
                </button>
              )}
            </div>
          </div>

          <div style={styles.table}>
            <div style={styles.tableHeader}>
              <div style={{ width: 50 }}>Image</div>
              <div style={{ flex: 1 }}>Name</div>
              <div style={{ width: 80 }}>Rarity</div>
              <div style={{ width: 80 }}>Slot</div>
              <div style={{ width: 60 }}>Level</div>
              <div style={{ width: 100 }}>Action</div>
            </div>
            {filteredItems.map((item) => (
              <div key={item.id} style={styles.tableRow}>
                <div style={{ width: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl + '?t=' + Date.now()}
                      alt={item.name}
                      style={{ width: 32, height: 32, imageRendering: 'pixelated' as const }}
                    />
                  ) : (
                    <span style={{ fontSize: 20 }}>{item.icon}</span>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: '#e0e0e0' }}>{item.name}</div>
                  <div style={{ fontSize: 11, color: '#888' }}>{item.description}</div>
                </div>
                <div style={{ width: 80 }}>
                  <span style={{ color: RARITY_COLORS[item.rarity] || '#888', fontWeight: 600, fontSize: 12, textTransform: 'capitalize' }}>
                    {item.rarity}
                  </span>
                </div>
                <div style={{ width: 80, fontSize: 12, color: '#aaa', textTransform: 'capitalize' }}>{item.slot}</div>
                <div style={{ width: 60, fontSize: 12, color: '#aaa' }}>Lv.{item.levelRequired}</div>
                <div style={{ width: 100 }}>
                  <button
                    onClick={() => generate('item', item.id)}
                    disabled={generating.has(item.id)}
                    style={{ ...styles.btnSmall }}
                  >
                    {generating.has(item.id) ? '...' : item.imageUrl ? 'Regen' : 'Generate'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: 960,
    margin: '0 auto',
    padding: 24,
    fontFamily: 'Consolas, "Courier New", monospace',
    color: '#e0e0e0',
    backgroundColor: '#0a0a12',
    minHeight: '100vh',
  },
  title: {
    fontSize: 24,
    fontWeight: 700,
    color: '#c7d2fe',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: '#a5b4fc',
    marginBottom: 8,
  },
  text: {
    fontSize: 13,
    color: '#888',
    margin: 0,
  },
  error: {
    padding: '8px 12px',
    backgroundColor: '#7c2d1240',
    border: '1px solid #f87171',
    color: '#f87171',
    fontSize: 12,
    marginBottom: 12,
  },
  status: {
    padding: '8px 12px',
    backgroundColor: '#16653440',
    border: '1px solid #22c55e',
    color: '#22c55e',
    fontSize: 12,
    marginBottom: 12,
  },
  tabBar: {
    display: 'flex',
    gap: 4,
    marginBottom: 24,
    borderBottom: '1px solid #333',
    paddingBottom: 8,
  },
  tabBtn: {
    padding: '8px 16px',
    backgroundColor: 'transparent',
    border: '1px solid #333',
    color: '#888',
    cursor: 'pointer',
    fontSize: 13,
    fontFamily: 'inherit',
  },
  tabActive: {
    backgroundColor: '#1e1e2e',
    borderColor: '#6366f1',
    color: '#c7d2fe',
  },
  section: {
    marginBottom: 32,
  },
  refPreview: {
    display: 'flex',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#181825',
    border: '1px solid #333',
    marginBottom: 16,
  },
  previewImg: {
    border: '1px solid #333',
    backgroundColor: '#0a0a12',
  },
  placeholder: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1e1e2e',
    border: '1px dashed #444',
    color: '#555',
    fontSize: 12,
    padding: 16,
  },
  field: {
    marginBottom: 12,
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  label: {
    fontSize: 11,
    color: '#888',
    textTransform: 'uppercase',
  },
  textarea: {
    backgroundColor: '#181825',
    border: '1px solid #333',
    color: '#e0e0e0',
    padding: 8,
    fontFamily: 'inherit',
    fontSize: 12,
    resize: 'vertical',
  },
  select: {
    backgroundColor: '#181825',
    border: '1px solid #333',
    color: '#e0e0e0',
    padding: '6px 8px',
    fontFamily: 'inherit',
    fontSize: 12,
  },
  btn: {
    padding: '8px 16px',
    backgroundColor: '#4338ca',
    border: '1px solid #6366f1',
    color: '#fff',
    cursor: 'pointer',
    fontSize: 12,
    fontWeight: 700,
    fontFamily: 'inherit',
    textTransform: 'uppercase',
  },
  btnSmall: {
    padding: '4px 8px',
    backgroundColor: '#4338ca',
    border: '1px solid #6366f1',
    color: '#fff',
    cursor: 'pointer',
    fontSize: 10,
    fontWeight: 700,
    fontFamily: 'inherit',
    textTransform: 'uppercase',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: 12,
  },
  card: {
    backgroundColor: '#181825',
    border: '1px solid #333',
    padding: 12,
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: 700,
    color: '#c7d2fe',
  },
  cardBody: {
    display: 'flex',
    justifyContent: 'center',
    padding: 8,
  },
  filters: {
    display: 'flex',
    gap: 16,
    marginBottom: 16,
    alignItems: 'flex-end',
    flexWrap: 'wrap',
  },
  table: {
    border: '1px solid #333',
  },
  tableHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 12px',
    backgroundColor: '#1e1e2e',
    fontSize: 11,
    color: '#888',
    fontWeight: 700,
    textTransform: 'uppercase',
    borderBottom: '1px solid #333',
  },
  tableRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 12px',
    borderBottom: '1px solid #1e1e2e',
  },
};
