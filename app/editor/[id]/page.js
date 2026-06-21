'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';

// ── Animated Sakura Petals ──
function SakuraPetals() {
  return (
    <>
      {Array.from({ length: 18 }, (_, i) => (
        <div key={i} className="petal" style={{ animationDelay: `${i * 0.7}s` }} />
      ))}
    </>
  );
}

// ── Pixel Sakura Tree (left side) ──
function SakuraTreeLeft() {
  return (
    <svg className="sakura-tree-left" width="220" height="400" viewBox="0 0 220 400">
      <rect x="100" y="280" width="18" height="120" fill="#4a1838" />
      <rect x="95" y="350" width="28" height="12" fill="#4a1838" />
      <rect x="88" y="360" width="42" height="8" fill="#4a1838" />
      <rect x="60" y="260" width="58" height="6" fill="#4a1838" rx="3" />
      <rect x="40" y="240" width="45" height="5" fill="#4a1838" rx="2" />
      <rect x="110" y="250" width="50" height="5" fill="#4a1838" rx="2" />
      <rect x="120" y="230" width="35" height="4" fill="#4a1838" rx="2" />
      <rect x="80" y="180" width="12" height="12" fill="#ff8fa3" rx="2" />
      <rect x="96" y="175" width="14" height="14" fill="#ffb3c6" rx="2" />
      <rect x="114" y="180" width="10" height="10" fill="#ff8fa3" rx="2" />
      <rect x="88" y="165" width="16" height="16" fill="#c94068" rx="2" />
      <rect x="106" y="168" width="12" height="12" fill="#ffb3c6" rx="2" />
      <rect x="55" y="210" width="14" height="14" fill="#ffb3c6" rx="2" />
      <rect x="72" y="205" width="12" height="12" fill="#ff8fa3" rx="2" />
      <rect x="48" y="225" width="10" height="10" fill="#c94068" rx="2" />
      <rect x="62" y="222" width="14" height="14" fill="#ff8fa3" rx="2" />
      <rect x="80" y="215" width="10" height="10" fill="#ffb3c6" rx="2" />
      <rect x="125" y="200" width="12" height="12" fill="#ffb3c6" rx="2" />
      <rect x="140" y="195" width="14" height="14" fill="#ff8fa3" rx="2" />
      <rect x="155" y="205" width="10" height="10" fill="#c94068" rx="2" />
      <rect x="130" y="215" width="10" height="10" fill="#c94068" rx="2" />
      <rect x="142" y="210" width="12" height="12" fill="#ffb3c6" rx="2" />
      <rect x="42" y="195" width="8" height="8" fill="#ff8fa3" rx="1" />
      <rect x="165" y="185" width="8" height="8" fill="#ffb3c6" rx="1" />
      <rect x="95" y="155" width="6" height="6" fill="#ffb3c6" rx="1" />
      <rect x="118" y="160" width="7" height="7" fill="#c94068" rx="1" />
      <rect x="35" y="280" width="5" height="5" fill="#ff8fa3" rx="1" opacity="0.6">
        <animateTransform attributeName="transform" type="translate" values="0,0; 15,40; 5,80" dur="4s" repeatCount="indefinite" />
      </rect>
      <rect x="170" y="260" width="4" height="4" fill="#ffb3c6" rx="1" opacity="0.5">
        <animateTransform attributeName="transform" type="translate" values="0,0; -10,50; -20,100" dur="5s" repeatCount="indefinite" />
      </rect>
      <rect x="90" y="190" width="4" height="4" fill="#ffb3c6" rx="1" opacity="0.7">
        <animateTransform attributeName="transform" type="translate" values="0,0; 8,60; -5,120" dur="6s" repeatCount="indefinite" />
      </rect>
    </svg>
  );
}

// ── Pixel Sakura Tree (right side, smaller) ──
function SakuraTreeRight() {
  return (
    <svg className="sakura-tree-right" width="160" height="320" viewBox="0 0 160 320">
      <rect x="70" y="220" width="14" height="100" fill="#4a1838" />
      <rect x="65" y="290" width="24" height="10" fill="#4a1838" />
      <rect x="45" y="210" width="38" height="5" fill="#4a1838" rx="2" />
      <rect x="80" y="200" width="35" height="4" fill="#4a1838" rx="2" />
      <rect x="35" y="195" width="30" height="4" fill="#4a1838" rx="2" />
      <rect x="30" y="160" width="12" height="12" fill="#ffb3c6" rx="2" />
      <rect x="46" y="155" width="14" height="14" fill="#ff8fa3" rx="2" />
      <rect x="62" y="158" width="10" height="10" fill="#c94068" rx="2" />
      <rect x="38" y="145" width="10" height="10" fill="#ff8fa3" rx="2" />
      <rect x="55" y="142" width="12" height="12" fill="#ffb3c6" rx="2" />
      <rect x="75" y="150" width="8" height="8" fill="#ff8fa3" rx="1" />
      <rect x="85" y="170" width="10" height="10" fill="#ffb3c6" rx="2" />
      <rect x="98" y="165" width="12" height="12" fill="#c94068" rx="2" />
      <rect x="112" y="172" width="8" height="8" fill="#ff8fa3" rx="1" />
      <rect x="90" y="155" width="8" height="8" fill="#ffb3c6" rx="1" />
      <rect x="25" y="200" width="4" height="4" fill="#ffb3c6" rx="1" opacity="0.6">
        <animateTransform attributeName="transform" type="translate" values="0,0; 10,35; -5,70" dur="4.5s" repeatCount="indefinite" />
      </rect>
      <rect x="110" y="185" width="3" height="3" fill="#ff8fa3" rx="1" opacity="0.5">
        <animateTransform attributeName="transform" type="translate" values="0,0; -8,40; 5,85" dur="5.5s" repeatCount="indefinite" />
      </rect>
    </svg>
  );
}

// ── Helper: open native file picker ──
function openFilePicker(onFiles) {
  const input = document.createElement('input');
  input.type = 'file';
  input.multiple = true;
  input.accept = '.png,image/png';
  input.style.display = 'none';
  document.body.appendChild(input);
  input.addEventListener('change', () => {
    const files = Array.from(input.files || []);
    document.body.removeChild(input);
    if (files.length > 0) onFiles(files);
  });
  // Cleanup on cancel (no change event fires)
  input.addEventListener('blur', () => {
    setTimeout(() => { if (document.body.contains(input)) document.body.removeChild(input); }, 300);
  });
  input.click();
}

// ── Main Editor ──
export default function Editor() {
  const router = useRouter();
  const params = useParams();
  const collectionId = params.id;

  const [collection, setCollection] = useState(null);
  const [layers, setLayers] = useState([]);
  const [selectedLayerId, setSelectedLayerId] = useState(null);
  const [selectedTraitId, setSelectedTraitId] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showGenerate, setShowGenerate] = useState(false);
  const [validation, setValidation] = useState(null);
  const [newLayerName, setNewLayerName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  // Derive selected objects
  const selectedLayer = layers.find(l => l.id === selectedLayerId) || null;
  const selectedTrait = selectedLayer ? selectedLayer.traits.find(t => t.id === selectedTraitId) || null : null;

  const fetchCollection = useCallback(async () => {
    try {
      const res = await fetch(`/api/collections/${collectionId}`);
      if (res.ok) setCollection(await res.json());
    } catch (e) { console.error(e); }
  }, [collectionId]);

  const fetchLayers = useCallback(async () => {
    try {
      const res = await fetch(`/api/collections/${collectionId}/layers`);
      if (res.ok) setLayers(await res.json());
    } catch (e) { console.error(e); }
  }, [collectionId]);

  useEffect(() => { fetchCollection(); fetchLayers(); }, [fetchCollection, fetchLayers]);

  // ── Layer Management ──
  const addLayer = async () => {
    if (!newLayerName.trim()) return;
    const name = newLayerName.trim();
    setNewLayerName('');
    const tempId = -Date.now();
    const newLayer = { id: tempId, name, sort_order: layers.length, enabled: true, traits: [] };
    setLayers(prev => [...prev, newLayer]);
    try {
      const res = await fetch(`/api/collections/${collectionId}/layers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (res.ok) { fetchLayers(); } else {
        const data = await res.json();
        alert(data.error || 'Failed');
        fetchLayers();
      }
    } catch (e) { alert(e.message); fetchLayers(); }
  };

  const deleteLayer = async (layerId) => {
    if (!confirm('Delete this layer and all its traits?')) return;
    setLayers(prev => prev.filter(l => l.id !== layerId));
    if (selectedLayerId === layerId) { setSelectedLayerId(null); setSelectedTraitId(null); }
    try {
      await fetch(`/api/collections/${collectionId}/layers/${layerId}`, { method: 'DELETE' });
      fetchLayers();
    } catch (e) { alert(e.message); fetchLayers(); }
  };

  const toggleLayer = async (layerId, enabled) => {
    setLayers(prev => prev.map(l => l.id === layerId ? { ...l, enabled: !enabled } : l));
    try {
      await fetch(`/api/collections/${collectionId}/layers/${layerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !enabled }),
      });
    } catch (e) { fetchLayers(); }
  };

  const moveLayer = async (layerId, direction) => {
    const idx = layers.findIndex(l => l.id === layerId);
    if (idx === -1) return;
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= layers.length) return;
    const reordered = [...layers];
    [reordered[idx], reordered[swapIdx]] = [reordered[swapIdx], reordered[idx]];
    setLayers(reordered);
    const updates = reordered.map((l, i) => ({ id: l.id, sort_order: i }));
    try {
      await fetch(`/api/collections/${collectionId}/layers`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ layers: updates }),
      });
    } catch (e) { fetchLayers(); }
  };

  // ── Trait Upload ──
  const uploadTraits = async (files) => {
    if (!selectedLayer || files.length === 0) return;
    setUploading(true);
    try {
      const formData = new FormData();
      let count = 0;
      for (const file of files) {
        if (file.name && file.name.toLowerCase().endsWith('.png')) {
          formData.append('files', file, file.name);
          count++;
        }
      }
      if (count === 0) { alert('No PNG files selected'); setUploading(false); return; }
      formData.append('settings', JSON.stringify({
        display_name: '', category_name: selectedLayer.name,
        rarity_weight: 1, x: 0, y: 0, scale: 1.0, opacity: 1.0, optional: false,
      }));
      const res = await fetch(`/api/collections/${collectionId}/layers/${selectedLayer.id}/traits`, {
        method: 'POST', body: formData,
      });
      const data = await res.json();
      if (res.ok) { await fetchLayers(); } else { alert(data.error || 'Upload failed'); }
    } catch (e) { alert('Upload error: ' + e.message); }
    setUploading(false);
  };

  const handlePickFiles = () => {
    openFilePicker((files) => uploadTraits(files));
  };

  const handleDrop = (e) => {
    e.preventDefault(); e.stopPropagation(); setDragOver(false);
    const files = Array.from(e.dataTransfer.files).filter(f => f.name.toLowerCase().endsWith('.png'));
    if (files.length > 0) uploadTraits(files);
  };

  const deleteTrait = async (traitId) => {
    if (!confirm('Delete this trait?')) return;
    setLayers(prev => prev.map(l => l.id === selectedLayerId ? { ...l, traits: l.traits.filter(t => t.id !== traitId) } : l));
    if (selectedTraitId === traitId) setSelectedTraitId(null);
    try {
      await fetch(`/api/collections/${collectionId}/layers/${selectedLayerId}/traits/${traitId}`, { method: 'DELETE' });
      fetchLayers();
    } catch (e) { alert(e.message); fetchLayers(); }
  };

  const updateTrait = async (traitId, data) => {
    setLayers(prev => prev.map(l => l.id === selectedLayerId ? {
      ...l, traits: l.traits.map(t => t.id === traitId ? { ...t, ...data } : t)
    } : l));
    try {
      await fetch(`/api/collections/${collectionId}/layers/${selectedLayerId}/traits/${traitId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
      });
    } catch (e) { fetchLayers(); }
  };

  // ── Cursor Arrow Move ──
  const moveTraitPosition = (dx, dy) => {
    if (!selectedTrait) return;
    const newX = (selectedTrait.x || 0) + dx;
    const newY = (selectedTrait.y || 0) + dy;
    updateTrait(selectedTrait.id, { x: newX, y: newY });
  };

  const generatePreview = async () => {
    try {
      const res = await fetch(`/api/collections/${collectionId}/preview`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}',
      });
      if (res.ok) {
        const blob = await res.blob();
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(URL.createObjectURL(blob));
      }
    } catch (e) { alert(e.message); }
  };

  const batchGenerate = async (supply, confirmOverwrite = false) => {
    setGenerating(true);
    try {
      const res = await fetch(`/api/collections/${collectionId}/generate`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ supply, confirmOverwrite }),
      });
      const data = await res.json();
      if (res.status === 409 && data.needsConfirmation) {
        if (confirm('Already generated. Overwrite?')) return batchGenerate(supply, true);
        setGenerating(false); return;
      }
      if (res.ok) { alert('Generated ' + data.supply + ' NFTs!'); setShowGenerate(false); }
      else { alert(data.error || 'Failed'); }
    } catch (e) { alert(e.message); }
    setGenerating(false);
  };

  const runValidation = async () => {
    try { const res = await fetch(`/api/collections/${collectionId}/validate`); setValidation(await res.json()); }
    catch (e) { alert(e.message); }
  };

  const exportZip = async () => {
    try { window.open(`/api/collections/${collectionId}/export`, '_blank'); }
    catch (e) { alert(e.message); }
  };

  const updateCollection = async (data) => {
    try {
      await fetch(`/api/collections/${collectionId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
      });
      fetchCollection();
    } catch (e) { alert(e.message); }
  };

  if (!collection) {
    return (
      <div className="min-h-screen bg-[#1a0a14] flex items-center justify-center relative overflow-hidden">
        <SakuraTreeLeft />
        <SakuraTreeRight />
        <div className="text-[#e8758a] animate-pulse z-10" style={{ fontFamily: "'Press Start 2P', monospace" }}>LOADING...</div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#1a0a14] flex flex-col overflow-hidden relative pixel-grid">
      <SakuraPetals />
      <SakuraTreeLeft />
      <SakuraTreeRight />

      {/* Header */}
      <header className="relative z-10 border-b-4 border-[#5a2848] bg-[#2a1020]/95 backdrop-blur-sm px-4 py-2 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/')} className="pixel-btn text-xs py-1 px-2">← BACK</button>
          <div className="w-px h-5 bg-[#5a2848]" />
          <span className="text-xs text-[#ffb3c6]" style={{ fontFamily: "'Press Start 2P', monospace" }}>{collection.name}</span>
          <span className="text-xs text-[#5a2848]" style={{ fontFamily: "'Press Start 2P', monospace" }}>512x512</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowSettings(true)} className="pixel-btn text-xs py-1 px-2">⚙</button>
          <button onClick={generatePreview} className="pixel-btn text-xs py-1 px-2">🎲</button>
          <button onClick={() => setShowGenerate(true)} className="pixel-btn pixel-btn-accent text-xs py-1 px-2">⚡ GEN</button>
          <button onClick={runValidation} className="pixel-btn text-xs py-1 px-2">✓</button>
          <button onClick={exportZip} className="pixel-btn text-xs py-1 px-2">📦</button>
        </div>
      </header>

      {/* Main 3-column */}
      <div className="flex flex-1 overflow-hidden relative z-10">
        {/* ── Left: Layers ── */}
        <div className="w-72 border-r-4 border-[#5a2848] bg-[#2a1020]/95 backdrop-blur-sm flex flex-col shrink-0">
          <div className="p-3 border-b-2 border-[#3a1830]">
            <div className="text-xs text-[#e8758a] mb-2" style={{ fontFamily: "'Press Start 2P', monospace" }}>LAYERS</div>
            <div className="flex gap-2">
              <input type="text" value={newLayerName} onChange={(e) => setNewLayerName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addLayer()}
                className="flex-1 pixel-input text-xs" placeholder="New layer..." />
              <button onClick={addLayer}
                style={{
                  background: 'linear-gradient(135deg, #c94068, #ff8fa3)',
                  color: '#fff',
                  border: '2px solid #ffb3c6',
                  borderRadius: '8px',
                  padding: '6px 14px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  fontFamily: "'Press Start 2P', monospace",
                  boxShadow: '0 3px 10px rgba(201,64,104,0.6)',
                }}>
                + ADD
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {layers.map((layer) => (
              <div key={layer.id}
                className={`p-2 border-b border-[#3a1830] cursor-pointer transition-all ${selectedLayerId === layer.id ? 'bg-[#c94068]/20 border-l-4 border-l-[#ff8fa3]' : 'hover:bg-[#3a1830]'}`}
                onClick={() => { setSelectedLayerId(layer.id); setSelectedTraitId(null); }}>
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1">
                    {/* ▲ UP — BIG, BOLD */}
                    <button
                      onClick={(e) => { e.stopPropagation(); moveLayer(layer.id, 'up'); }}
                      title="Move Up"
                      style={{
                        width: '40px', height: '40px',
                        background: '#c94068',
                        color: '#fff',
                        border: '3px solid #ff8fa3',
                        borderRadius: '8px',
                        fontSize: '18px', fontWeight: 'bold',
                        cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 3px 10px rgba(201,64,104,0.6)',
                        flexShrink: 0,
                      }}
                    >▲</button>
                    {/* ▼ DOWN — BIG, BOLD */}
                    <button
                      onClick={(e) => { e.stopPropagation(); moveLayer(layer.id, 'down'); }}
                      title="Move Down"
                      style={{
                        width: '40px', height: '40px',
                        background: '#c94068',
                        color: '#fff',
                        border: '3px solid #ff8fa3',
                        borderRadius: '8px',
                        fontSize: '18px', fontWeight: 'bold',
                        cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 3px 10px rgba(201,64,104,0.6)',
                        flexShrink: 0,
                      }}
                    >▼</button>
                    <div className="flex flex-col min-w-0 ml-1">
                      <span className={`text-xs truncate ${layer.enabled ? 'text-[#ffb3c6]' : 'text-[#5a2848] line-through'}`} style={{ fontFamily: "'Press Start 2P', monospace" }}>{layer.name}</span>
                      <span className="text-[10px] text-[#7a3860]">{layer.traits.length} traits</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {/* Toggle — BIG */}
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleLayer(layer.id, layer.enabled); }}
                      title={layer.enabled ? 'Disable Layer' : 'Enable Layer'}
                      style={{
                        width: '36px', height: '36px',
                        background: layer.enabled ? '#c94068' : '#3a1830',
                        color: '#fff',
                        border: `3px solid ${layer.enabled ? '#ff8fa3' : '#5a2848'}`,
                        borderRadius: '50%',
                        fontSize: '16px', fontWeight: 'bold',
                        cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: layer.enabled ? '0 3px 10px rgba(201,64,104,0.6)' : 'none',
                      }}
                    >{layer.enabled ? '●' : '○'}</button>
                    {/* Delete — BIG */}
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteLayer(layer.id); }}
                      title="Delete Layer"
                      style={{
                        width: '36px', height: '36px',
                        background: '#3a0820',
                        color: '#ff4060',
                        border: '3px solid #ff4060',
                        borderRadius: '8px',
                        fontSize: '14px', fontWeight: 'bold',
                        cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >✕</button>
                  </div>
                </div>
              </div>
            ))}
            {layers.length === 0 && <div className="p-4 text-center text-xs text-[#5a2848]" style={{ fontFamily: "'Press Start 2P', monospace" }}>NO LAYERS YET</div>}
          </div>
        </div>

        {/* ── Center: Traits ── */}
        <div className="flex-1 flex flex-col min-w-0">
          {selectedLayer ? (
            <>
              <div className="p-3 border-b-2 border-[#3a1830] flex items-center justify-between shrink-0">
                <div className="text-xs text-[#e8758a]" style={{ fontFamily: "'Press Start 2P', monospace" }}>{selectedLayer.name} ({selectedLayer.traits.length})</div>
                <div className="flex gap-2 items-center">
                  {uploading && <span className="text-xs text-[#ff8fa3] animate-pulse" style={{ fontFamily: "'Press Start 2P', monospace" }}>SENDING...</span>}
                  <button
                    onClick={handlePickFiles}
                    style={{
                      background: 'linear-gradient(135deg, #c94068, #ff8fa3)',
                      color: '#fff',
                      border: '3px solid #ffb3c6',
                      borderRadius: '10px',
                      padding: '8px 20px',
                      fontSize: '12px', fontWeight: 'bold',
                      cursor: 'pointer',
                      fontFamily: "'Press Start 2P', monospace",
                      boxShadow: '0 4px 15px rgba(201,64,104,0.6)',
                      letterSpacing: '1px',
                    }}
                  >
                    📤 UPLOAD PNG
                  </button>
                </div>
              </div>

              {/* Trait Settings Panel */}
              {selectedTrait && (
                <div className="p-3 border-b-2 border-[#3a1830] bg-[#2a1020] shrink-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs text-[#e8758a]" style={{ fontFamily: "'Press Start 2P', monospace" }}>EDIT: {selectedTrait.display_name || selectedTrait.name}</div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 bg-[#1a0a14] border-2 border-[#c94068] px-3 py-1 rounded">
                        <span className="text-xs text-[#ff8fa3]" style={{ fontFamily: "'Press Start 2P', monospace" }}>X:</span>
                        <span className="text-xs text-[#fff] font-bold" style={{ fontFamily: "'Press Start 2P', monospace" }}>{selectedTrait.x || 0}</span>
                      </div>
                      <div className="flex items-center gap-1 bg-[#1a0a14] border-2 border-[#c94068] px-3 py-1 rounded">
                        <span className="text-xs text-[#ff8fa3]" style={{ fontFamily: "'Press Start 2P', monospace" }}>Y:</span>
                        <span className="text-xs text-[#fff] font-bold" style={{ fontFamily: "'Press Start 2P', monospace" }}>{selectedTrait.y || 0}</span>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    <div>
                      <label className="block text-xs text-[#5a2848] mb-0.5" style={{ fontFamily: "'Press Start 2P', monospace" }}>NAME</label>
                      <input type="text" value={selectedTrait.display_name || ''} onChange={(e) => updateTrait(selectedTrait.id, { display_name: e.target.value })} className="w-full pixel-input text-xs" />
                    </div>
                    <div>
                      <label className="block text-xs text-[#5a2848] mb-0.5" style={{ fontFamily: "'Press Start 2P', monospace" }}>CATEGORY</label>
                      <input type="text" value={selectedTrait.category_name || ''} onChange={(e) => updateTrait(selectedTrait.id, { category_name: e.target.value })} className="w-full pixel-input text-xs" />
                    </div>
                    <div>
                      <label className="block text-xs text-[#5a2848] mb-0.5" style={{ fontFamily: "'Press Start 2P', monospace" }}>WEIGHT</label>
                      <input type="number" min="1" value={selectedTrait.rarity_weight} onChange={(e) => updateTrait(selectedTrait.id, { rarity_weight: parseInt(e.target.value) || 1 })} className="w-full pixel-input text-xs" />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    <div>
                      <label className="block text-xs text-[#5a2848] mb-0.5" style={{ fontFamily: "'Press Start 2P', monospace" }}>SCALE</label>
                      <input type="number" step="0.1" min="0.1" max="5" value={selectedTrait.scale} onChange={(e) => updateTrait(selectedTrait.id, { scale: parseFloat(e.target.value) || 1 })} className="w-full pixel-input text-xs" />
                    </div>
                    <div>
                      <label className="block text-xs text-[#5a2848] mb-0.5" style={{ fontFamily: "'Press Start 2P', monospace" }}>OPACITY</label>
                      <input type="number" step="0.1" min="0" max="1" value={selectedTrait.opacity} onChange={(e) => updateTrait(selectedTrait.id, { opacity: parseFloat(e.target.value) || 1 })} className="w-full pixel-input text-xs" />
                    </div>
                    <div className="flex items-end gap-2 pb-1">
                      <input type="checkbox" checked={selectedTrait.optional} onChange={(e) => updateTrait(selectedTrait.id, { optional: e.target.checked })} className="accent-[#c94068] w-4 h-4" />
                      <label className="text-xs text-[#7a3860]" style={{ fontFamily: "'Press Start 2P', monospace" }}>OPT</label>
                      <button onClick={() => deleteTrait(selectedTrait.id)} style={{ background: '#3a0820', color: '#ff4060', border: '2px solid #ff4060', borderRadius: '6px', padding: '4px 10px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer', fontFamily: "'Press Start 2P', monospace", marginLeft: 'auto' }}>DEL</button>
                    </div>
                  </div>

                  {/* ── D-Pad Controls ── */}
                  <div className="flex items-start gap-4 mt-2">
                    {/* X/Y number inputs */}
                    <div className="flex gap-2 items-end">
                      <div>
                        <label className="block text-xs text-[#5a2848] mb-0.5" style={{ fontFamily: "'Press Start 2P', monospace" }}>X</label>
                        <input type="number" value={selectedTrait.x} onChange={(e) => updateTrait(selectedTrait.id, { x: parseInt(e.target.value) || 0 })} className="w-16 pixel-input text-xs" />
                      </div>
                      <div>
                        <label className="block text-xs text-[#5a2848] mb-0.5" style={{ fontFamily: "'Press Start 2P', monospace" }}>Y</label>
                        <input type="number" value={selectedTrait.y} onChange={(e) => updateTrait(selectedTrait.id, { y: parseInt(e.target.value) || 0 })} className="w-16 pixel-input text-xs" />
                      </div>
                    </div>

                    {/* BIG D-Pad — 10px */}
                    <div style={{ display: 'inline-grid', gridTemplateColumns: '48px 48px 48px', gridTemplateRows: '48px 48px 48px', gap: '3px' }}>
                      <div />
                      <button onPointerDown={() => moveTraitPosition(0, -10)} title="Up 10px"
                        style={{ background: '#c94068', border: '3px solid #ff8fa3', color: '#fff', fontSize: '20px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '10px 10px 0 0', boxShadow: '0 2px 8px rgba(201,64,104,0.6)' }}>▲</button>
                      <div />
                      <button onPointerDown={() => moveTraitPosition(-10, 0)} title="Left 10px"
                        style={{ background: '#c94068', border: '3px solid #ff8fa3', color: '#fff', fontSize: '20px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '10px 0 0 10px', boxShadow: '0 2px 8px rgba(201,64,104,0.6)' }}>◀</button>
                      <div style={{ background: '#1a0a14', border: '3px solid #c94068', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span className="text-xs text-[#ff8fa3] font-bold" style={{ fontFamily: "'Press Start 2P', monospace" }}>10</span>
                      </div>
                      <button onPointerDown={() => moveTraitPosition(10, 0)} title="Right 10px"
                        style={{ background: '#c94068', border: '3px solid #ff8fa3', color: '#fff', fontSize: '20px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '0 10px 10px 0', boxShadow: '0 2px 8px rgba(201,64,104,0.6)' }}>▶</button>
                      <div />
                      <button onPointerDown={() => moveTraitPosition(0, 10)} title="Down 10px"
                        style={{ background: '#c94068', border: '3px solid #ff8fa3', color: '#fff', fontSize: '20px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '0 0 10px 10px', boxShadow: '0 2px 8px rgba(201,64,104,0.6)' }}>▼</button>
                      <div />
                    </div>

                    {/* SMALL D-Pad — 1px fine */}
                    <div style={{ display: 'inline-grid', gridTemplateColumns: '38px 38px 38px', gridTemplateRows: '38px 38px 38px', gap: '2px' }}>
                      <div />
                      <button onPointerDown={() => moveTraitPosition(0, -1)} title="Up 1px"
                        style={{ background: '#3a1830', border: '2px solid #c94068', color: '#ff8fa3', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px 6px 0 0' }}>▴</button>
                      <div />
                      <button onPointerDown={() => moveTraitPosition(-1, 0)} title="Left 1px"
                        style={{ background: '#3a1830', border: '2px solid #c94068', color: '#ff8fa3', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px 0 0 6px' }}>◂</button>
                      <div style={{ background: '#1a0a14', border: '2px solid #c94068', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span className="text-xs text-[#ff8fa3] font-bold" style={{ fontFamily: "'Press Start 2P', monospace" }}>1</span>
                      </div>
                      <button onPointerDown={() => moveTraitPosition(1, 0)} title="Right 1px"
                        style={{ background: '#3a1830', border: '2px solid #c94068', color: '#ff8fa3', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '0 6px 6px 0' }}>▸</button>
                      <div />
                      <button onPointerDown={() => moveTraitPosition(0, 1)} title="Down 1px"
                        style={{ background: '#3a1830', border: '2px solid #c94068', color: '#ff8fa3', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '0 0 6px 6px' }}>▾</button>
                      <div />
                    </div>
                  </div>
                </div>
              )}

              {/* Traits Grid / Drop Zone */}
              <div className={`flex-1 overflow-y-auto p-3 drop-zone ${dragOver ? 'drag-over' : ''}`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={(e) => { e.preventDefault(); setDragOver(false); }}
                onDrop={handleDrop}>
                {dragOver && (
                  <div className="border-2 border-dashed border-[#ff8fa3] p-8 text-center mb-3 bg-[#c94068]/10">
                    <div className="text-3xl mb-2">🌸</div>
                    <div className="text-xs text-[#ff8fa3]" style={{ fontFamily: "'Press Start 2P', monospace" }}>DROP PNG HERE</div>
                  </div>
                )}
                <div className="grid grid-cols-5 gap-3">
                  {selectedLayer.traits.map((trait) => (
                    <div key={trait.id}
                      className={`relative bg-[#2a1020] pixel-border p-2 cursor-pointer transition-all ${selectedTraitId === trait.id ? 'sakura-glow border-[#ff8fa3]!' : ''}`}
                      onClick={() => setSelectedTraitId(trait.id)}>
                      <div className="aspect-square bg-[#1a0a14] mb-2 flex items-center justify-center overflow-hidden border border-[#3a1830]">
                        <img src={`/api/collections/${collectionId}/traits/${trait.filename}`} alt={trait.name}
                          className="max-w-full max-h-full object-contain" style={{ imageRendering: 'pixelated' }} loading="lazy" />
                      </div>
                      <p className="text-xs text-[#e8758a] truncate" style={{ fontFamily: "'Press Start 2P', monospace" }}>{trait.display_name || trait.name}</p>
                      <p className="text-xs text-[#5a2848]">w:{trait.rarity_weight}</p>
                      {trait.optional && <span className="absolute top-1 right-1 text-xs bg-[#5a2848] text-[#ffb3c6] px-1">OPT</span>}
                    </div>
                  ))}
                </div>
                {selectedLayer.traits.length === 0 && !dragOver && (
                  <div className="text-center py-16">
                    <div className="text-4xl mb-4">📁</div>
                    <div className="text-xs text-[#5a2848] mb-4" style={{ fontFamily: "'Press Start 2P', monospace" }}>
                      UPLOAD PNG OR DRAG HERE
                    </div>
                    <button onClick={handlePickFiles}
                      style={{
                        background: 'linear-gradient(135deg, #c94068, #ff8fa3)',
                        color: '#fff',
                        border: '3px solid #ffb3c6',
                        borderRadius: '12px',
                        padding: '12px 28px',
                        fontSize: '13px', fontWeight: 'bold',
                        cursor: 'pointer',
                        fontFamily: "'Press Start 2P', monospace",
                        boxShadow: '0 4px 15px rgba(201,64,104,0.6)',
                      }}
                    >📤 UPLOAD</button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="text-5xl mb-4 floating-branch inline-block">🌸</div>
                <div className="text-xs text-[#5a2848]" style={{ fontFamily: "'Press Start 2P', monospace" }}>SELECT A LAYER</div>
              </div>
            </div>
          )}
        </div>

        {/* ── Right: Preview ── */}
        <div className="w-64 border-l-4 border-[#5a2848] bg-[#2a1020]/95 backdrop-blur-sm flex flex-col shrink-0">
          <div className="p-3 border-b-2 border-[#3a1830]">
            <div className="text-xs text-[#e8758a]" style={{ fontFamily: "'Press Start 2P', monospace" }}>PREVIEW 512x512</div>
          </div>
          <div className="flex-1 flex items-center justify-center p-3">
            {previewUrl ? (
              <div className="pixel-border-light p-1 bg-[#1a0a14]">
                <img src={previewUrl} alt="Preview" className="w-full" style={{ imageRendering: 'pixelated' }} />
              </div>
            ) : (
              <div className="text-center">
                <div className="text-4xl mb-3">🎲</div>
                <div className="text-xs text-[#5a2848]" style={{ fontFamily: "'Press Start 2P', monospace" }}>CLICK RANDOM</div>
              </div>
            )}
          </div>
          <div className="p-3 border-t-2 border-[#3a1830]">
            <button onClick={generatePreview} className="w-full pixel-btn pixel-btn-accent">🎲 RANDOM</button>
          </div>
        </div>
      </div>

      {/* ── Modals ── */}
      {showSettings && (
        <div className="fixed inset-0 modal-overlay flex items-center justify-center z-50">
          <div className="bg-[#2a1020] pixel-border p-6 w-full max-w-lg sakura-glow max-h-[80vh] overflow-y-auto">
            <div className="text-base text-[#ffb3c6] mb-5" style={{ fontFamily: "'Press Start 2P', monospace" }}>SETTINGS</div>
            <div className="space-y-3">
              <div><label className="block text-xs text-[#e8758a] mb-1" style={{ fontFamily: "'Press Start 2P', monospace" }}>NAME</label><input type="text" value={collection.name} onChange={(e) => updateCollection({ name: e.target.value })} className="w-full pixel-input" /></div>
              <div><label className="block text-xs text-[#e8758a] mb-1" style={{ fontFamily: "'Press Start 2P', monospace" }}>DESCRIPTION</label><textarea value={collection.description || ''} onChange={(e) => updateCollection({ description: e.target.value })} className="w-full pixel-input h-20 resize-none" /></div>
              <div><label className="block text-xs text-[#e8758a] mb-1" style={{ fontFamily: "'Press Start 2P', monospace" }}>EXTERNAL URL</label><input type="text" value={collection.external_url || ''} onChange={(e) => updateCollection({ external_url: e.target.value })} className="w-full pixel-input" /></div>
              <div><label className="block text-xs text-[#e8758a] mb-1" style={{ fontFamily: "'Press Start 2P', monospace" }}>IMAGE BASE URL</label><input type="text" value={collection.image_base_url || ''} onChange={(e) => updateCollection({ image_base_url: e.target.value })} className="w-full pixel-input" placeholder="https://example.com/media" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs text-[#e8758a] mb-1" style={{ fontFamily: "'Press Start 2P', monospace" }}>WALLET</label><input type="text" value={collection.royalty_wallet || ''} onChange={(e) => updateCollection({ royalty_wallet: e.target.value })} className="w-full pixel-input" /></div>
                <div><label className="block text-xs text-[#e8758a] mb-1" style={{ fontFamily: "'Press Start 2P', monospace" }}>FEE (bps)</label><input type="number" value={collection.royalty_fee_basis_points || 0} onChange={(e) => updateCollection({ royalty_fee_basis_points: parseInt(e.target.value) || 0 })} className="w-full pixel-input" /></div>
              </div>
            </div>
            <div className="flex justify-end mt-5"><button onClick={() => setShowSettings(false)} className="pixel-btn pixel-btn-accent">DONE</button></div>
          </div>
        </div>
      )}

      {showGenerate && (
        <div className="fixed inset-0 modal-overlay flex items-center justify-center z-50">
          <div className="bg-[#2a1020] pixel-border p-6 w-full max-w-md sakura-glow">
            <div className="text-base text-[#ffb3c6] mb-5" style={{ fontFamily: "'Press Start 2P', monospace" }}>⚡ GENERATE</div>
            {generating ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4 animate-spin-slow inline-block">⚙</div>
                <div className="text-xs text-[#e8758a] mt-3" style={{ fontFamily: "'Press Start 2P', monospace" }}>GENERATING...</div>
              </div>
            ) : (
              <>
                <div className="text-xs text-[#7a3860] mb-4" style={{ fontFamily: "'Press Start 2P', monospace" }}>SELECT SUPPLY</div>
                <div className="grid grid-cols-2 gap-3">
                  {[10, 100, 1000, 10000].map((supply) => (
                    <button key={supply} onClick={() => batchGenerate(supply)} className="pixel-btn pixel-btn-accent py-6 text-center">
                      <div className="text-lg">{supply.toLocaleString()}</div>
                      <div className="text-xs text-[#e8758a] mt-1">NFTs</div>
                    </button>
                  ))}
                </div>
                <div className="flex justify-end mt-4"><button onClick={() => setShowGenerate(false)} className="pixel-btn text-xs">CANCEL</button></div>
              </>
            )}
          </div>
        </div>
      )}

      {validation && (
        <div className="fixed inset-0 modal-overlay flex items-center justify-center z-50">
          <div className="bg-[#2a1020] pixel-border p-6 w-full max-w-lg sakura-glow max-h-[80vh] overflow-y-auto">
            <div className="text-base text-[#ffb3c6] mb-4" style={{ fontFamily: "'Press Start 2P', monospace" }}>✓ VALIDATION</div>
            <div className={`text-sm mb-3 ${validation.valid ? 'text-[#88ffaa]' : 'text-[#ff4060]'}`} style={{ fontFamily: "'Press Start 2P', monospace" }}>
              {validation.valid ? 'ALL PASSED!' : 'ISSUES FOUND'}
            </div>
            {validation.stats && <div className="text-xs text-[#5a2848] mb-3" style={{ fontFamily: "'Press Start 2P', monospace" }}>TOKENS:{validation.stats.totalTokens} IMAGES:{validation.stats.totalImages}</div>}
            {validation.errors.length > 0 && (
              <div className="mb-3">
                <div className="text-xs text-[#ff4060] mb-1" style={{ fontFamily: "'Press Start 2P', monospace" }}>ERRORS</div>
                {validation.errors.map((err, i) => <div key={i} className="text-xs text-[#ff8090] bg-[#3a0820] border border-[#5a1030] px-2 py-1 mb-1">{err}</div>)}
              </div>
            )}
            {validation.warnings.length > 0 && (
              <div className="mb-3">
                <div className="text-xs text-[#e8758a] mb-1" style={{ fontFamily: "'Press Start 2P', monospace" }}>WARNINGS</div>
                {validation.warnings.map((warn, i) => <div key={i} className="text-xs text-[#e8758a] bg-[#3a1830] border border-[#5a2848] px-2 py-1 mb-1">{warn}</div>)}
              </div>
            )}
            <div className="flex justify-end mt-4"><button onClick={() => setValidation(null)} className="pixel-btn pixel-btn-accent">CLOSE</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
