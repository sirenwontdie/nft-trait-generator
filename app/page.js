'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

function SakuraPetals() {
  return (
    <>
      {Array.from({ length: 18 }, (_, i) => (
        <div key={i} className="petal" />
      ))}
    </>
  );
}

function PixelSakuraTree({ side = 'right', size = 1 }) {
  const w = 300 * size;
  const h = 400 * size;
  return (
    <div className={`sakura-tree-${side} tree-sway`}>
      <svg width={w} height={h} viewBox="0 0 300 400">
        {/* Trunk - pixel style */}
        <rect x="140" y="250" width="20" height="150" fill="#4a2030" />
        <rect x="135" y="300" width="30" height="8" fill="#4a2030" />
        <rect x="130" y="340" width="40" height="10" fill="#3a1828" />
        
        {/* Main branches - pixel rects */}
        <rect x="80" y="220" width="60" height="6" fill="#4a2030" transform="rotate(-15, 140, 223)" />
        <rect x="160" y="200" width="70" height="6" fill="#4a2030" transform="rotate(10, 160, 203)" />
        <rect x="60" y="180" width="50" height="5" fill="#3a1828" transform="rotate(-20, 80, 182)" />
        <rect x="170" y="170" width="60" height="5" fill="#3a1828" transform="rotate(15, 170, 172)" />
        <rect x="90" y="150" width="40" height="4" fill="#3a1828" transform="rotate(-10, 90, 152)" />
        <rect x="180" y="140" width="50" height="4" fill="#3a1828" transform="rotate(8, 180, 142)" />
        
        {/* Foliage clusters - pixel circles with sakura colors */}
        <circle cx="80" cy="200" r="30" fill="#c94068" opacity="0.9" />
        <circle cx="120" cy="170" r="35" fill="#ff6b9d" opacity="0.8" />
        <circle cx="60" cy="160" r="25" fill="#e8507a" opacity="0.7" />
        <circle cx="100" cy="140" r="28" fill="#c94068" opacity="0.6" />
        
        <circle cx="200" cy="180" r="32" fill="#ff8fa3" opacity="0.85" />
        <circle cx="230" cy="150" r="28" fill="#c94068" opacity="0.7" />
        <circle cx="210" cy="130" r="30" fill="#ff6b9d" opacity="0.6" />
        <circle cx="180" cy="120" r="25" fill="#e8507a" opacity="0.5" />
        
        {/* Top canopy */}
        <circle cx="140" cy="100" r="38" fill="#c94068" opacity="0.7" />
        <circle cx="120" cy="80" r="30" fill="#ff8fa3" opacity="0.6" />
        <circle cx="160" cy="90" r="32" fill="#e8507a" opacity="0.5" />
        <circle cx="140" cy="60" r="25" fill="#ff6b9d" opacity="0.4" />
        
        {/* Scattered petals on branches */}
        <circle cx="70" cy="190" r="5" fill="#ffb3c6" opacity="0.9" />
        <circle cx="110" cy="155" r="4" fill="#ffd6e0" opacity="0.8" />
        <circle cx="190" cy="170" r="5" fill="#ffb3c6" opacity="0.9" />
        <circle cx="220" cy="140" r="4" fill="#ffd6e0" opacity="0.8" />
        <circle cx="150" cy="85" r="6" fill="#ffb3c6" opacity="0.9" />
        <circle cx="130" cy="70" r="4" fill="#ffd6e0" opacity="0.7" />
        <circle cx="165" cy="75" r="5" fill="#ffb3c6" opacity="0.8" />
        
        {/* Falling petals from tree */}
        <circle cx="90" cy="230" r="3" fill="#ffb3c6" opacity="0.6">
          <animate attributeName="cy" values="230;350" dur="4s" repeatCount="indefinite" />
          <animate attributeName="cx" values="90;80;95;85" dur="4s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.6;0.3;0" dur="4s" repeatCount="indefinite" />
        </circle>
        <circle cx="210" cy="210" r="3" fill="#ff8fa3" opacity="0.5">
          <animate attributeName="cy" values="210;360" dur="5s" repeatCount="indefinite" />
          <animate attributeName="cx" values="210;220;205;215" dur="5s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.5;0.2;0" dur="5s" repeatCount="indefinite" />
        </circle>
        <circle cx="150" cy="250" r="2" fill="#ffd6e0" opacity="0.4">
          <animate attributeName="cy" values="250;380" dur="6s" repeatCount="indefinite" />
          <animate attributeName="cx" values="150;145;155;140" dur="6s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.4;0.15;0" dur="6s" repeatCount="indefinite" />
        </circle>
      </svg>
    </div>
  );
}

export default function Dashboard() {
  const router = useRouter();
  const [collections, setCollections] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    external_url: '',
    image_base_url: '',
    royalty_wallet: '',
    royalty_fee_basis_points: 0,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchCollections(); }, []);

  const fetchCollections = async () => {
    try {
      const res = await fetch('/api/collections');
      const data = await res.json();
      setCollections(data);
    } catch (error) {
      console.error('Failed to load collections:', error);
    }
  };

  const createCollection = async () => {
    if (!form.name.trim()) return alert('Collection name is required');
    setLoading(true);
    try {
      const res = await fetch('/api/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setShowCreate(false);
        setForm({ name: '', description: '', external_url: '', image_base_url: '', royalty_wallet: '', royalty_fee_basis_points: 0 });
        fetchCollections();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to create');
      }
    } catch (error) {
      alert('Failed to create collection');
    }
    setLoading(false);
  };

  const deleteCollection = async (id, name) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await fetch(`/api/collections/${id}`, { method: 'DELETE' });
      fetchCollections();
    } catch (error) {
      alert('Failed to delete');
    }
  };

  return (
    <div className="min-h-screen pixel-grid relative overflow-hidden">
      <SakuraPetals />
      
      {/* Sakura trees */}
      <PixelSakuraTree side="left" size={0.9} />
      <PixelSakuraTree side="right" size={1.1} />
      
      {/* Ground */}
      <div className="sakura-ground" />

      {/* Header */}
      <header className="relative z-10 border-b-4 border-[#5a2848] bg-[#2a1020]/95 backdrop-blur-sm px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#c94068] pixel-border flex items-center justify-center">
              <span className="text-white text-xs">🌸</span>
            </div>
            <div>
              <h1 className="text-lg text-[#ffb3c6] tracking-wider" style={{ fontFamily: "'Press Start 2P', monospace" }}>
                SAKURA NFT
              </h1>
              <p className="text-xs text-[#e8758a] mt-1" style={{ fontFamily: "'Press Start 2P', monospace" }}>
                TRAIT GENERATOR
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="pixel-btn pixel-btn-accent"
          >
            + NEW
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* Create Modal */}
        {showCreate && (
          <div className="fixed inset-0 modal-overlay flex items-center justify-center z-50">
            <div className="bg-[#2a1020] pixel-border p-6 w-full max-w-lg sakura-glow">
              <h2 className="text-base text-[#ffb3c6] mb-5" style={{ fontFamily: "'Press Start 2P', monospace" }}>
                NEW COLLECTION
              </h2>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-[#e8758a] mb-1" style={{ fontFamily: "'Press Start 2P', monospace" }}>NAME *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full pixel-input"
                    placeholder="My NFT Collection"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#e8758a] mb-1" style={{ fontFamily: "'Press Start 2P', monospace" }}>DESCRIPTION</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full pixel-input h-20 resize-none"
                    placeholder="A unique NFT collection..."
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#e8758a] mb-1" style={{ fontFamily: "'Press Start 2P', monospace" }}>EXTERNAL URL</label>
                  <input type="text" value={form.external_url} onChange={(e) => setForm({ ...form, external_url: e.target.value })} className="w-full pixel-input" placeholder="https://example.com" />
                </div>
                <div>
                  <label className="block text-xs text-[#e8758a] mb-1" style={{ fontFamily: "'Press Start 2P', monospace" }}>IMAGE BASE URL</label>
                  <input type="text" value={form.image_base_url} onChange={(e) => setForm({ ...form, image_base_url: e.target.value })} className="w-full pixel-input" placeholder="https://example.com/media" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-[#e8758a] mb-1" style={{ fontFamily: "'Press Start 2P', monospace" }}>ROYALTY WALLET</label>
                    <input type="text" value={form.royalty_wallet} onChange={(e) => setForm({ ...form, royalty_wallet: e.target.value })} className="w-full pixel-input" placeholder="0x..." />
                  </div>
                  <div>
                    <label className="block text-xs text-[#e8758a] mb-1" style={{ fontFamily: "'Press Start 2P', monospace" }}>FEE (bps)</label>
                    <input type="number" value={form.royalty_fee_basis_points} onChange={(e) => setForm({ ...form, royalty_fee_basis_points: parseInt(e.target.value) || 0 })} className="w-full pixel-input" placeholder="500=5%" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button onClick={() => setShowCreate(false)} className="pixel-btn">CANCEL</button>
                <button onClick={createCollection} disabled={loading} className="pixel-btn pixel-btn-accent">
                  {loading ? '...' : 'CREATE'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Title */}
        <div className="mb-8">
          <h2 className="text-2xl text-[#ffd6e0] tracking-wider" style={{ fontFamily: "'Press Start 2P', monospace" }}>
            COLLECTIONS
          </h2>
          <div className="w-32 h-1 bg-[#c94068] mt-2" />
        </div>

        {/* Collection Grid */}
        {collections.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-6 floating-branch inline-block">🌸</div>
            <p className="text-lg text-[#e8758a]" style={{ fontFamily: "'Press Start 2P', monospace" }}>
              NO COLLECTIONS
            </p>
            <p className="text-xs text-[#7a3860] mt-3" style={{ fontFamily: "'Press Start 2P', monospace" }}>
              Click + NEW to start
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {collections.map((col) => (
              <div
                key={col.id}
                className="bg-[#2a1020]/90 pixel-border p-5 cursor-pointer group hover:sakura-glow transition-all"
                onClick={() => router.push(`/editor/${col.id}`)}
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-sm text-[#ffb3c6] group-hover:text-[#ffd6e0] transition-colors leading-relaxed" style={{ fontFamily: "'Press Start 2P', monospace" }}>
                    {col.name}
                  </h3>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteCollection(col.id, col.name); }}
                    className="text-[#5a2848] hover:text-[#ff4060] text-xs opacity-0 group-hover:opacity-100 transition-all"
                    style={{ fontFamily: "'Press Start 2P', monospace" }}
                  >
                    X
                  </button>
                </div>
                <p className="text-xs text-[#7a3860] mb-4 leading-relaxed" style={{ fontFamily: "'Press Start 2P', monospace" }}>
                  {col.description || 'No description'}
                </p>
                <div className="flex items-center gap-2">
                  {col.external_url && (
                    <span className="text-xs bg-[#3a1830] border border-[#5a2848] px-2 py-1 text-[#e8758a]" style={{ fontFamily: "'Press Start 2P', monospace" }}>
                      URL
                    </span>
                  )}
                  {col.royalty_fee_basis_points > 0 && (
                    <span className="text-xs bg-[#3a1830] border border-[#5a2848] px-2 py-1 text-[#e8758a]" style={{ fontFamily: "'Press Start 2P', monospace" }}>
                      {col.royalty_fee_basis_points / 100}%
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
