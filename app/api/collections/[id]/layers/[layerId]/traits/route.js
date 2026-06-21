import { NextResponse } from 'next/server';
import { traitQueries, collectionQueries } from '@/lib/db';
import { getTraitsDir } from '@/lib/image-utils';
import fs from 'fs';
import path from 'path';

// GET /api/collections/[id]/layers/[layerId]/traits
export async function GET(request, { params }) {
  try {
    const layerId = parseInt(params.layerId);
    const traits = traitQueries.getByLayer(layerId);
    return NextResponse.json(traits.map(t => ({ ...t, optional: t.optional === 1 })));
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/collections/[id]/layers/[layerId]/traits - upload trait(s)
export async function POST(request, { params }) {
  try {
    const collectionId = parseInt(params.id);
    const layerId = parseInt(params.layerId);
    
    const collection = collectionQueries.getById(collectionId);
    if (!collection) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
    }

    const traitsDir = getTraitsDir(collection.name);
    if (!fs.existsSync(traitsDir)) {
      fs.mkdirSync(traitsDir, { recursive: true });
    }

    const formData = await request.formData();
    const files = formData.getAll('files');
    const settingsStr = formData.get('settings');
    const settings = settingsStr ? JSON.parse(settingsStr) : {};

    const createdTraits = [];

    for (const file of files) {
      if (!file || !file.name) continue;
      
      // Validate PNG
      if (!file.name.toLowerCase().endsWith('.png')) {
        continue; // Skip non-PNG files
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Save file
      const filename = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
      const filePath = path.join(traitsDir, filename);
      fs.writeFileSync(filePath, buffer);

      // Create trait record
      const traitName = file.name.replace('.png', '').replace(/_/g, ' ');
      const trait = traitQueries.create(layerId, {
        name: traitName,
        filename: filename,
        rarity_weight: settings.rarity_weight || 1,
        x: settings.x || 0,
        y: settings.y || 0,
        scale: settings.scale || 1.0,
        opacity: settings.opacity || 1.0,
        optional: settings.optional || false,
        display_name: settings.display_name || traitName,
        category_name: settings.category_name || '',
      });

      createdTraits.push(trait);
    }

    if (createdTraits.length === 0) {
      return NextResponse.json({ error: 'No valid PNG files uploaded' }, { status: 400 });
    }

    return NextResponse.json(createdTraits, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
