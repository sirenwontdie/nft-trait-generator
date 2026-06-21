import { NextResponse } from 'next/server';
import { layerQueries, traitQueries } from '@/lib/db';

// GET /api/collections/[id]/layers - list layers with traits
export async function GET(request, { params }) {
  try {
    const collectionId = parseInt(params.id);
    const layers = layerQueries.getByCollection(collectionId);
    
    // Attach traits to each layer
    const layersWithTraits = layers.map(layer => ({
      ...layer,
      enabled: layer.enabled === 1,
      traits: traitQueries.getByLayer(layer.id).map(t => ({
        ...t,
        optional: t.optional === 1,
      })),
    }));
    
    return NextResponse.json(layersWithTraits);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/collections/[id]/layers - add layer
export async function POST(request, { params }) {
  try {
    const collectionId = parseInt(params.id);
    const data = await request.json();
    
    if (!data.name || !data.name.trim()) {
      return NextResponse.json({ error: 'Layer name is required' }, { status: 400 });
    }

    // Get current max sort order
    const layers = layerQueries.getByCollection(collectionId);
    const maxOrder = layers.length > 0 ? Math.max(...layers.map(l => l.sort_order)) : -1;
    
    const layer = layerQueries.create(collectionId, data.name.trim(), maxOrder + 1);
    return NextResponse.json(layer, { status: 201 });
  } catch (error) {
    if (error.message.includes('UNIQUE')) {
      return NextResponse.json({ error: 'Layer name already exists in this collection' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/collections/[id]/layers - reorder layers
export async function PUT(request, { params }) {
  try {
    const data = await request.json();
    if (data.layers && Array.isArray(data.layers)) {
      layerQueries.reorder(data.layers);
    }
    return NextResponse.json({ message: 'Layers reordered' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
