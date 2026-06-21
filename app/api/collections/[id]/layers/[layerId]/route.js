import { NextResponse } from 'next/server';
import { layerQueries, traitQueries } from '@/lib/db';
import fs from 'fs';
import path from 'path';

// PUT /api/collections/[id]/layers/[layerId]
export async function PUT(request, { params }) {
  try {
    const layerId = parseInt(params.layerId);
    const data = await request.json();
    
    if (data.name !== undefined) {
      // Check for duplicate names
      const existing = layerQueries.getById(layerId);
      if (!existing) {
        return NextResponse.json({ error: 'Layer not found' }, { status: 404 });
      }
    }

    const updateData = {};
    if (data.name !== undefined) updateData.name = data.name.trim();
    if (data.enabled !== undefined) updateData.enabled = data.enabled ? 1 : 0;
    if (data.sort_order !== undefined) updateData.sort_order = data.sort_order;

    const layer = layerQueries.update(layerId, updateData);
    return NextResponse.json(layer);
  } catch (error) {
    if (error.message.includes('UNIQUE')) {
      return NextResponse.json({ error: 'Layer name already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/collections/[id]/layers/[layerId]
export async function DELETE(request, { params }) {
  try {
    const layerId = parseInt(params.layerId);
    const layer = layerQueries.getById(layerId);
    if (!layer) {
      return NextResponse.json({ error: 'Layer not found' }, { status: 404 });
    }

    // Get traits to delete their files
    const traits = traitQueries.getByLayer(layerId);
    
    layerQueries.delete(layerId);
    
    return NextResponse.json({ message: 'Layer deleted', layer });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
