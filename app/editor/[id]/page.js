'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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
  input.addEventListener('blur', () => {
    setTimeout(() => { if (document.body.contains(input)) document.body.removeChild(input); }, 300);
  });
  input.click();
}

// ── Live Canvas Preview ──
function LivePreview({ layers, collectionId, previewUrl, canvasRef }) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = 512, H = 512;
    canvas.width = W;
    canvas.height = H;

    ctx.clearRect(0, 0, W, H);
    // Checkerboard
    for (let y = 0; y < H; y += 16) {
      for (let x = 0; x < W; x += 16) {
        ctx.fillStyle = ((x / 16 + y / 16) % 2 === 0) ? '#2a1020' : '#1a0a14';
        ctx.fillRect(x, y, 16, 16);
      }
    }

    if (previewUrl) {
      const img = new Image();
      img.onload = () => { ctx.drawImage(img, 0, 0, W, H); };
      img.src = previewUrl;
      return;
    }

    const enabledLayers = layers.filter(l => l.enabled && l.traits && l.traits.length > 0);
    if (enabledLayers.length === 0) return;

    let loaded = 0;
    const total = enabledLayers.length;
    enabledLayers.forEach((layer) => {
      const trait = layer.traits[Math.floor(Math.random() * layer.traits.length)];
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const x = trait.x || 0;
        const y = trait.y || 0;
        const scale = trait.scale || 1;
        const opacity = trait.opacity ?? 1;
        ctx.save();
        ctx.globalAlpha = opacity;
        const w = W * scale;
        const h = H * scale;
        ctx.drawImage(img, x, y, w, h);
        ctx.restore();
        loaded++;
      };
      img.onerror = () => { loaded++; };
      img.src = `/api/collections/${collectionId}/traits/${trait.filename}`;
    });
  }, [layers, collectionId, previewUrl]);

  return (
    <div className="w-full h-full flex items-center justify-center p-2">
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          maxWidth: '512px',
          aspectRatio: '1/1',
          imageRendering: 'pixelated',
          border: '3px solid #5a2848',
          borderRadius: '4px',
          background: '#1a0a14'
        }}
      />
    </div>
  );
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
  const [moveStep, setMoveStep] = useState(10);
  const canvasRef = useRef(null);

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

  const moveTraitPosition = (dx, dy) => {
    if (!selectedTrait) return;
    const newX = (selectedTrait.x || 0) + dx;
    const newY = (selectedTrait.y || 0) + dy;
    updateTrait(selectedTrait.id, { x: newX, y: newY });
  };

  const resizeTrait = (delta) => {
    if (!selectedTrait) return;
    const newScale = Math.max(0.1, Math.min(5, (selectedTrait.scale || 1) + delta));
    updateTrait(selectedTrait.id, { scale: newScale });
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
        <div className="text-[#e8758a] animate-pulse z-10" style={{ fontFamily: "'Press Start 2P', monospace" }}>LOADING...</div>
      </div>
    );
  }

  // ── Pixel font style shorthand ──
  const pf = (size, color) => ({ fontFamily: "'Press Start 2P', monospace", fontSize: size, color });

  return (
    <div className="h-screen bg-[#1a0a14] flex flex-col overflow-hidden relative">
      <SakuraPetals />

      {/* Header */}
      <header className="relative z-10 border-b-2 border-[#5a2848] bg-[#2a1020]/95 backdrop-blur-sm px-3 py-1.5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/')} className="text-[8px] text-[#ffb3c6] bg-[#c94068] border border-[#ff8fa3] rounded px-2 py-1 cursor-pointer hover:bg-[#ff8fa3] hover:text-[#1a0a14] transition-all" style={pf('8px', '#fff')}>← BACK</button>
          <div className="w-px h-4 bg-[#5a2848]" />
          <span style={pf('9px', '#ffb3c6')}>{collection.name}</span>
          <span style={pf('7px', '#5a2848')}>512×512</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowSettings(true)} className="text-[9px] text-[#ffb3c6] bg-[#3a1830] border border-[#5a2848] rounded px-2 py-1 cursor-pointer hover:bg-[#5a2848] transition-all">⚙</button>
          <button onClick={generatePreview} className="text-[9px] text-[#ffb3c6] bg-[#3a1830] border border-[#5a2848] rounded px-2 py-1 cursor-pointer hover:bg-[#5a2848] transition-all">🎲</button>
          <button onClick={() => setShowGenerate(true)} className="text-[9px] text-[#fff] bg-gradient-to-r from-[#c94068] to-[#ff8fa3] border border-[#ffb3c6] rounded px-3 py-1 cursor-pointer hover:brightness-110 transition-all" style={pf('8px', '#fff')}>⚡ GEN</button>
          <button onClick={runValidation} className="text-[9px] text-[#ffb3c6] bg-[#3a1830] border border-[#5a2848] rounded px-2 py-1 cursor-pointer hover:bg-[#5a2848] transition-all">✓</button>
          <button onClick={exportZip} className="text-[9px] text-[#ffb3c6] bg-[#3a1830] border border-[#5a2848] rounded px-2 py-1 cursor-pointer hover:bg-[#5a2848] transition-all">📦</button>
        </div>
      </header>

      {/* ═══ 3-COLUMN LAYOUT ═══ */}
      <div className="flex flex-1 overflow-hidden relative z-10">

        {/* ── COL 1: Layers (compact with thumbnails) ── */}
        <div className="w-48 border-r-2 border-[#5a2848] bg-[#2a1020]/95 flex flex-col shrink-0">
          <div className="p-1 border-b border-[#3a1830]">
            <div style={pf('4px', '#e8758a')} className="mb-1 text-center">LAYERS</div>
            <div className="flex gap-0.5">
              <input type="text" value={newLayerName} onChange={(e) => setNewLayerName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addLayer()}
                className="flex-1 bg-[#1a0a14] border border-[#3a1830] text-[#ffb3c6] rounded px-1 py-0.5 outline-none focus:border-[#c94068] min-w-0"
                style={pf('3px', '#ffb3c6')} placeholder="Name..." />
              <button onClick={addLayer}
                className="text-[6px] text-[#fff] bg-gradient-to-r from-[#c94068] to-[#ff8fa3] border border-[#ffb3c6] rounded px-1 py-0.5 cursor-pointer font-bold shrink-0">+</button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {layers.map((layer, idx) => {
              const thumbTrait = selectedLayerId === layer.id && selectedTrait
                ? selectedTrait
                : (layer.traits && layer.traits.length > 0 ? layer.traits[0] : null);
              return (
                <div key={layer.id}
                  className={`flex items-center px-1 py-1 border-b border-[#3a1830] cursor-pointer transition-all gap-1 ${selectedLayerId === layer.id ? 'bg-[#c94068]/25 border-l-2 border-l-[#ff8fa3]' : 'hover:bg-[#3a1830] border-l-2 border-l-transparent'}`}
                  onClick={() => { setSelectedLayerId(layer.id); setSelectedTraitId(null); }}>
                  <span style={pf('3px', '#7a3860')} className="shrink-0">{idx + 1}.</span>
                  <span className={`flex-1 truncate ${layer.enabled ? '' : 'line-through'}`}
                    style={pf('3px', layer.enabled ? '#ffb3c6' : '#5a2848')}>{layer.name}</span>
                  {thumbTrait ? (
                    <div className="w-6 h-6 bg-[#1a0a14] border border-[#3a1830] shrink-0 overflow-hidden rounded-sm">
                      <img src={`/api/collections/${collectionId}/traits/${thumbTrait.filename}`} alt=""
                        className="w-full h-full object-contain" style={{ imageRendering: 'pixelated' }} loading="lazy" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 bg-[#1a0a14] border border-[#3a1830] shrink-0 rounded-sm flex items-center justify-center">
                      <span style={pf('2px', '#5a2848')}>—</span>
                    </div>
                  )}
                  <div className="flex items-center gap-px shrink-0">
                    <button onClick={(e) => { e.stopPropagation(); moveLayer(layer.id, 'up'); }}
                      style={{ width: '10px', height: '10px', background: '#c94068', color: '#fff', border: '1px solid #ff8fa3', borderRadius: '1px', fontSize: '5px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>▲</button>
                    <button onClick={(e) => { e.stopPropagation(); moveLayer(layer.id, 'down'); }}
                      style={{ width: '10px', height: '10px', background: '#c94068', color: '#fff', border: '1px solid #ff8fa3', borderRadius: '1px', fontSize: '5px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>▼</button>
                    <button onClick={(e) => { e.stopPropagation(); toggleLayer(layer.id, layer.enabled); }}
                      style={{ width: '10px', height: '10px', background: layer.enabled ? '#c94068' : '#3a1830', color: '#fff', border: `1px solid ${layer.enabled ? '#ff8fa3' : '#5a2848'}`, borderRadius: '50%', fontSize: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {layer.enabled ? '●' : '○'}
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); deleteLayer(layer.id); }}
                      style={{ width: '10px', height: '10px', background: '#3a0820', color: '#ff4060', border: '1px solid #ff4060', borderRadius: '1px', fontSize: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                  </div>
                </div>
              );
            })}
            {layers.length === 0 && <div className="p-1 text-center" style={pf('3px', '#5a2848')}>EMPTY</div>}
          </div>
        </div>

        {/* ── CENTER: Traits List + Live Preview ── */}
        <div className="flex-1 flex min-w-0">

          {/* ── Center-Left: Traits List ── */}
          <div className="w-[260px] border-r-2 border-[#5a2848] bg-[#2a1020]/95 flex flex-col shrink-0">
            <div className="p-1 border-b border-[#3a1830] flex items-center justify-between">
              <div style={pf('5px', '#e8758a')}>TRAITS</div>
              <div className="flex items-center gap-1">
                {uploading && <span style={pf('4px', '#ff8fa3')} className="animate-pulse">UP...</span>}
                {selectedLayer && (
                  <button onClick={handlePickFiles}
                    className="text-[6px] text-[#fff] bg-gradient-to-r from-[#c94068] to-[#ff8fa3] border border-[#ffb3c6] rounded px-1 py-0.5 cursor-pointer font-bold">📤</button>
                )}
              </div>
            </div>
            {/* Table Header */}
            <div className="flex items-center px-2 py-0.5 border-b border-[#3a1830]" style={pf('3px', '#5a2848')}>
              <span className="w-16">LAYER</span>
              <span className="flex-1">SELECTED TRAIT</span>
            </div>
            {/* Compact traits list */}
            <div className={`flex-1 overflow-y-auto ${dragOver ? 'bg-[#c94068]/10' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={(e) => { e.preventDefault(); setDragOver(false); }}
              onDrop={handleDrop}>
              {dragOver && (
                <div className="border border-dashed border-[#ff8fa3] p-1 text-center bg-[#c94068]/10">
                  <div style={pf('4px', '#ff8fa3')}>DROP HERE</div>
                </div>
              )}
              {layers.map((layer) => {
                const isSelected = selectedLayerId === layer.id;
                const activeTrait = isSelected && selectedTrait
                  ? selectedTrait
                  : (layer.traits && layer.traits.length > 0 ? layer.traits[0] : null);
                return (
                  <div key={layer.id}
                    className={`flex items-center px-2 py-1.5 border-b border-[#3a1830] gap-2 cursor-pointer transition-all ${isSelected ? 'bg-[#c94068]/20' : 'hover:bg-[#3a1830]'}`}
                    onClick={() => { setSelectedLayerId(layer.id); setSelectedTraitId(null); }}>
                    <span className={`w-16 truncate text-[7px] ${layer.enabled ? '' : 'line-through'}`}
                      style={{ color: layer.enabled ? '#ffb3c6' : '#5a2848', fontFamily: "'Press Start 2P', monospace" }}>
                      {layer.name}
                    </span>
                    {activeTrait ? (
                      <div
                        className={`w-10 h-10 bg-[#1a0a14] border flex items-center justify-center shrink-0 overflow-hidden rounded-sm cursor-pointer transition-all ${isSelected ? 'border-[#ff8fa3]' : 'border-[#3a1830] hover:border-[#c94068]'}`}
                        onClick={(e) => { e.stopPropagation(); setSelectedTraitId(activeTrait.id); setSelectedLayerId(layer.id); }}>
                        <img src={`/api/collections/${collectionId}/traits/${activeTrait.filename}`} alt=""
                          className="w-full h-full object-contain" style={{ imageRendering: 'pixelated' }} loading="lazy" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 bg-[#1a0a14] border border-[#3a1830] shrink-0 rounded-sm flex items-center justify-center">
                        <span style={pf('3px', '#5a2848')}>empty</span>
                      </div>
                    )}
                    {activeTrait && (
                      <span className="flex-1 truncate text-[6px]" style={{ color: '#7a3860', fontFamily: "'Press Start 2P', monospace" }}>
                        {activeTrait.display_name || activeTrait.name}
                      </span>
                    )}
                  </div>
                );
              })}
              {layers.length === 0 && (
                <div className="p-2 text-center">
                  <div style={pf('4px', '#5a2848')}>NO LAYERS</div>
                </div>
              )}
            </div>
          </div>

          {/* ── Center-Right: Live Preview ── */}
          <div className="flex-1 bg-[#1a0a14] flex flex-col min-w-0">
            <div className="p-1 border-b border-[#3a1830] flex items-center justify-between shrink-0 bg-[#2a1020]/95">
              <div style={pf('7px', '#e8758a')}>PREVIEW</div>
              <div className="flex items-center gap-2">
                <span style={pf('5px', '#5a2848')}>512×512</span>
                <button onClick={generatePreview} className="text-[7px] text-[#fff] bg-gradient-to-r from-[#c94068] to-[#ff8fa3] border border-[#ffb3c6] rounded px-2 py-0.5 cursor-pointer font-bold">🎲 RANDOM</button>
              </div>
            </div>
            <LivePreview layers={layers} collectionId={collectionId} previewUrl={previewUrl} canvasRef={canvasRef} />
          </div>

        </div>

        {/* ── COL 4: Controls (D-Pad + Resize + Properties) ── */}
        <div className="w-[140px] border-l-2 border-[#5a2848] bg-[#2a1020]/95 flex flex-col shrink-0 overflow-y-auto">
          {selectedTrait ? (
            <>
              {/* Trait info */}
              <div className="p-1 border-b border-[#3a1830]">
                <div style={pf('4px', '#e8758a')} className="truncate">✎ {selectedTrait.display_name || selectedTrait.name}</div>
              </div>

              {/* Move Step Selector */}
              <div className="p-1 border-b border-[#3a1830]">
                <div className="text-center mb-1" style={pf('3px', '#5a2848')}>STEP</div>
                <div className="flex justify-center gap-0.5">
                  {[1, 5, 10, 25].map(s => (
                    <button key={s} onClick={() => setMoveStep(s)}
                      className="text-[5px] font-bold cursor-pointer rounded transition-all"
                      style={{
                        ...pf('5px', '#fff'),
                        width: '24px', height: '16px',
                        background: moveStep === s ? '#c94068' : '#3a1830',
                        border: `1px solid ${moveStep === s ? '#ff8fa3' : '#5a2848'}`,
                      }}>{s}</button>
                  ))}
                </div>
              </div>

              {/* D-Pad: Move */}
              <div className="p-1 border-b border-[#3a1830]">
                <div className="text-center mb-1" style={pf('3px', '#5a2848')}>MOVE</div>
                <div className="flex justify-center">
                  <div style={{ display: 'inline-grid', gridTemplateColumns: '26px 26px 26px', gridTemplateRows: '26px 26px 26px', gap: '2px' }}>
                    <div />
                    <button onPointerDown={() => moveTraitPosition(0, -moveStep)} title={`Up ${moveStep}px`}
                      className="text-[10px] font-bold cursor-pointer rounded-t transition-all hover:brightness-125 active:scale-95"
                      style={{ background: '#c94068', border: '1px solid #ff8fa3', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>▲</button>
                    <div />
                    <button onPointerDown={() => moveTraitPosition(-moveStep, 0)} title={`Left ${moveStep}px`}
                      className="text-[10px] font-bold cursor-pointer rounded-l transition-all hover:brightness-125 active:scale-95"
                      style={{ background: '#c94068', border: '1px solid #ff8fa3', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>◀</button>
                    <div className="rounded" style={{ background: '#1a0a14', border: '1px solid #c94068', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={pf('5px', '#ff8fa3')}>{moveStep}</span>
                    </div>
                    <button onPointerDown={() => moveTraitPosition(moveStep, 0)} title={`Right ${moveStep}px`}
                      className="text-[10px] font-bold cursor-pointer rounded-r transition-all hover:brightness-125 active:scale-95"
                      style={{ background: '#c94068', border: '1px solid #ff8fa3', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>▶</button>
                    <div />
                    <button onPointerDown={() => moveTraitPosition(0, moveStep)} title={`Down ${moveStep}px`}
                      className="text-[10px] font-bold cursor-pointer rounded-b transition-all hover:brightness-125 active:scale-95"
                      style={{ background: '#c94068', border: '1px solid #ff8fa3', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>▼</button>
                    <div />
                  </div>
                </div>
              </div>

              {/* Resize Controls */}
              <div className="p-1 border-b border-[#3a1830]">
                <div className="text-center mb-1" style={pf('3px', '#5a2848')}>RESIZE</div>
                <div className="flex justify-center gap-1">
                  <button onPointerDown={() => resizeTrait(-0.1)}
                    className="cursor-pointer rounded transition-all hover:brightness-125 active:scale-95"
                    style={{ width: '28px', height: '22px', background: '#c94068', border: '1px solid #ff8fa3', color: '#fff', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                  <div style={{ background: '#1a0a14', border: '1px solid #c94068', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px', borderRadius: '4px' }}>
                    <span style={pf('5px', '#ff8fa3')}>{(selectedTrait.scale || 1).toFixed(1)}</span>
                  </div>
                  <button onPointerDown={() => resizeTrait(0.1)}
                    className="cursor-pointer rounded transition-all hover:brightness-125 active:scale-95"
                    style={{ width: '28px', height: '22px', background: '#c94068', border: '1px solid #ff8fa3', color: '#fff', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                </div>
              </div>

              {/* Properties */}
              <div className="p-1 border-b border-[#3a1830] space-y-1">
                <div style={pf('3px', '#5a2848')}>PROPERTIES</div>
                {/* X */}
                <div className="flex items-center justify-between">
                  <label style={pf('4px', '#7a3860')}>X</label>
                  <div className="flex items-center gap-0.5">
                    <button onPointerDown={() => moveTraitPosition(-1, 0)} style={{ width: '12px', height: '12px', background: '#3a1830', border: '1px solid #c94068', color: '#ff8fa3', borderRadius: '2px', fontSize: '7px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>-</button>
                    <span style={pf('5px', '#ff8fa3')} className="w-5 text-center">{selectedTrait.x || 0}</span>
                    <button onPointerDown={() => moveTraitPosition(1, 0)} style={{ width: '12px', height: '12px', background: '#3a1830', border: '1px solid #c94068', color: '#ff8fa3', borderRadius: '2px', fontSize: '7px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                  </div>
                </div>
                {/* Y */}
                <div className="flex items-center justify-between">
                  <label style={pf('4px', '#7a3860')}>Y</label>
                  <div className="flex items-center gap-0.5">
                    <button onPointerDown={() => moveTraitPosition(0, -1)} style={{ width: '12px', height: '12px', background: '#3a1830', border: '1px solid #c94068', color: '#ff8fa3', borderRadius: '2px', fontSize: '7px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>-</button>
                    <span style={pf('5px', '#ff8fa3')} className="w-5 text-center">{selectedTrait.y || 0}</span>
                    <button onPointerDown={() => moveTraitPosition(0, 1)} style={{ width: '12px', height: '12px', background: '#3a1830', border: '1px solid #c94068', color: '#ff8fa3', borderRadius: '2px', fontSize: '7px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                  </div>
                </div>
                {/* Opacity */}
                <div className="flex items-center justify-between">
                  <label style={pf('4px', '#7a3860')}>OPAC</label>
                  <div className="flex items-center gap-0.5">
                    <button onPointerDown={() => updateTrait(selectedTrait.id, { opacity: Math.max(0, (selectedTrait.opacity || 1) - 0.1) })} style={{ width: '12px', height: '12px', background: '#3a1830', border: '1px solid #c94068', color: '#ff8fa3', borderRadius: '2px', fontSize: '7px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>-</button>
                    <span style={pf('5px', '#ff8fa3')} className="w-5 text-center">{(selectedTrait.opacity || 1).toFixed(1)}</span>
                    <button onPointerDown={() => updateTrait(selectedTrait.id, { opacity: Math.min(1, (selectedTrait.opacity || 1) + 0.1) })} style={{ width: '12px', height: '12px', background: '#3a1830', border: '1px solid #c94068', color: '#ff8fa3', borderRadius: '2px', fontSize: '7px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                  </div>
                </div>
                {/* Weight */}
                <div className="flex items-center justify-between">
                  <label style={pf('4px', '#7a3860')}>WEIGHT</label>
                  <div className="flex items-center gap-0.5">
                    <button onPointerDown={() => updateTrait(selectedTrait.id, { rarity_weight: Math.max(1, (selectedTrait.rarity_weight || 1) - 1) })} style={{ width: '12px', height: '12px', background: '#3a1830', border: '1px solid #c94068', color: '#ff8fa3', borderRadius: '2px', fontSize: '7px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>-</button>
                    <span style={pf('5px', '#ff8fa3')} className="w-5 text-center">{selectedTrait.rarity_weight || 1}</span>
                    <button onPointerDown={() => updateTrait(selectedTrait.id, { rarity_weight: (selectedTrait.rarity_weight || 1) + 1 })} style={{ width: '12px', height: '12px', background: '#3a1830', border: '1px solid #c94068', color: '#ff8fa3', borderRadius: '2px', fontSize: '7px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                  </div>
                </div>
                {/* Optional */}
                <div className="flex items-center justify-between">
                  <label style={pf('4px', '#7a3860')}>OPTION</label>
                  <button onClick={() => updateTrait(selectedTrait.id, { optional: !selectedTrait.optional })}
                    className="relative rounded-full cursor-pointer transition-all"
                    style={{ width: '24px', height: '12px', background: selectedTrait.optional ? '#c94068' : '#3a1830', border: `1px solid ${selectedTrait.optional ? '#ff8fa3' : '#5a2848'}` }}>
                    <div className="rounded-full bg-white absolute top-[1px] transition-all"
                      style={{ width: '8px', height: '8px', left: selectedTrait.optional ? '14px' : '1px' }} />
                  </button>
                </div>
              </div>

              {/* Delete */}
              <div className="p-1">
                <button onClick={() => deleteTrait(selectedTrait.id)}
                  className="w-full text-[#ff4060] bg-[#3a0820] border border-[#ff4060] rounded px-1 py-0.5 cursor-pointer hover:bg-[#ff4060] hover:text-[#fff] transition-all"
                  style={pf('4px', '#ff4060')}>🗑 DEL</button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-2">
              <div className="text-center">
                <div className="text-xl mb-1 opacity-50">🎯</div>
                <div style={pf('4px', '#5a2848')}>SELECT TRAIT</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Modals ── */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-[#2a1020] border-2 border-[#5a2848] rounded p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto" style={{ boxShadow: '0 0 40px rgba(201,64,104,0.3)' }}>
            <div className="mb-5" style={pf('12px', '#ffb3c6')}>SETTINGS</div>
            <div className="space-y-3">
              <div><label className="block mb-1" style={pf('8px', '#e8758a')}>NAME</label><input type="text" value={collection.name} onChange={(e) => updateCollection({ name: e.target.value })} className="w-full bg-[#1a0a14] border border-[#3a1830] text-[#ffb3c6] rounded px-3 py-2 outline-none focus:border-[#c94068]" style={pf('9px', '#ffb3c6')} /></div>
              <div><label className="block mb-1" style={pf('8px', '#e8758a')}>DESCRIPTION</label><textarea value={collection.description || ''} onChange={(e) => updateCollection({ description: e.target.value })} className="w-full bg-[#1a0a14] border border-[#3a1830] text-[#ffb3c6] rounded px-3 py-2 outline-none focus:border-[#c94068] h-20 resize-none" style={pf('8px', '#ffb3c6')} /></div>
              <div><label className="block mb-1" style={pf('8px', '#e8758a')}>EXTERNAL URL</label><input type="text" value={collection.external_url || ''} onChange={(e) => updateCollection({ external_url: e.target.value })} className="w-full bg-[#1a0a14] border border-[#3a1830] text-[#ffb3c6] rounded px-3 py-2 outline-none focus:border-[#c94068]" style={pf('9px', '#ffb3c6')} /></div>
              <div><label className="block mb-1" style={pf('8px', '#e8758a')}>IMAGE BASE URL</label><input type="text" value={collection.image_base_url || ''} onChange={(e) => updateCollection({ image_base_url: e.target.value })} className="w-full bg-[#1a0a14] border border-[#3a1830] text-[#ffb3c6] rounded px-3 py-2 outline-none focus:border-[#c94068]" style={pf('9px', '#ffb3c6')} placeholder="https://example.com/media" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block mb-1" style={pf('8px', '#e8758a')}>WALLET</label><input type="text" value={collection.royalty_wallet || ''} onChange={(e) => updateCollection({ royalty_wallet: e.target.value })} className="w-full bg-[#1a0a14] border border-[#3a1830] text-[#ffb3c6] rounded px-3 py-2 outline-none focus:border-[#c94068]" style={pf('9px', '#ffb3c6')} /></div>
                <div><label className="block mb-1" style={pf('8px', '#e8758a')}>FEE (bps)</label><input type="number" value={collection.royalty_fee_basis_points || 0} onChange={(e) => updateCollection({ royalty_fee_basis_points: parseInt(e.target.value) || 0 })} className="w-full bg-[#1a0a14] border border-[#3a1830] text-[#ffb3c6] rounded px-3 py-2 outline-none focus:border-[#c94068]" style={pf('9px', '#ffb3c6')} /></div>
              </div>
            </div>
            <div className="flex justify-end mt-5">
              <button onClick={() => setShowSettings(false)} className="text-[#fff] bg-gradient-to-r from-[#c94068] to-[#ff8fa3] border border-[#ffb3c6] rounded px-4 py-2 cursor-pointer font-bold" style={pf('9px', '#fff')}>DONE</button>
            </div>
          </div>
        </div>
      )}

      {showGenerate && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-[#2a1020] border-2 border-[#5a2848] rounded p-6 w-full max-w-md" style={{ boxShadow: '0 0 40px rgba(201,64,104,0.3)' }}>
            <div className="mb-5" style={pf('12px', '#ffb3c6')}>⚡ GENERATE</div>
            {generating ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4 animate-spin inline-block">⚙</div>
                <div className="mt-3" style={pf('9px', '#e8758a')}>GENERATING...</div>
              </div>
            ) : (
              <>
                <div className="mb-4" style={pf('8px', '#7a3860')}>SELECT SUPPLY</div>
                <div className="grid grid-cols-2 gap-3">
                  {[10, 100, 1000, 10000].map((supply) => (
                    <button key={supply} onClick={() => batchGenerate(supply)}
                      className="text-[#fff] bg-gradient-to-r from-[#c94068] to-[#ff8fa3] border border-[#ffb3c6] rounded py-6 text-center cursor-pointer hover:brightness-110 transition-all">
                      <div className="text-xl font-bold">{supply.toLocaleString()}</div>
                      <div style={pf('7px', '#e8758a')} className="mt-1">NFTs</div>
                    </button>
                  ))}
                </div>
                <div className="flex justify-end mt-4">
                  <button onClick={() => setShowGenerate(false)} className="text-[#ffb3c6] bg-[#3a1830] border border-[#5a2848] rounded px-3 py-1 cursor-pointer hover:bg-[#5a2848] transition-all" style={pf('8px', '#ffb3c6')}>CANCEL</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {validation && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-[#2a1020] border-2 border-[#5a2848] rounded p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto" style={{ boxShadow: '0 0 40px rgba(201,64,104,0.3)' }}>
            <div className="mb-4" style={pf('12px', '#ffb3c6')}>✓ VALIDATION</div>
            <div className="mb-3" style={pf('10px', validation.valid ? '#88ffaa' : '#ff4060')}>
              {validation.valid ? 'ALL PASSED!' : 'ISSUES FOUND'}
            </div>
            {validation.stats && <div className="mb-3" style={pf('7px', '#5a2848')}>TOKENS:{validation.stats.totalTokens} IMAGES:{validation.stats.totalImages}</div>}
            {validation.errors.length > 0 && (
              <div className="mb-3">
                <div className="mb-1" style={pf('8px', '#ff4060')}>ERRORS</div>
                {validation.errors.map((err, i) => <div key={i} className="text-xs text-[#ff8090] bg-[#3a0820] border border-[#5a1030] px-2 py-1 mb-1 rounded">{err}</div>)}
              </div>
            )}
            {validation.warnings.length > 0 && (
              <div className="mb-3">
                <div className="mb-1" style={pf('8px', '#e8758a')}>WARNINGS</div>
                {validation.warnings.map((warn, i) => <div key={i} className="text-xs text-[#e8758a] bg-[#3a1830] border border-[#5a2848] px-2 py-1 mb-1 rounded">{warn}</div>)}
              </div>
            )}
            <div className="flex justify-end mt-4">
              <button onClick={() => setValidation(null)} className="text-[#fff] bg-gradient-to-r from-[#c94068] to-[#ff8fa3] border border-[#ffb3c6] rounded px-4 py-2 cursor-pointer font-bold" style={pf('9px', '#fff')}>CLOSE</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
