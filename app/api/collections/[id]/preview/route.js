import { NextResponse } from 'next/server';
import { collectionQueries, layerQueries, traitQueries } from '@/lib/db';
import { compositeTraits } from '@/lib/image-utils';

// POST /api/collections/[id]/preview - generate preview
export async function POST(request, { params }) {
  try {
    const collectionId = parseInt(params.id);
    const data = await request.json();
    
    const collection = collectionQueries.getById(collectionId);
    if (!collection) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
    }

    // Get enabled layers
    const layers = layerQueries.getByCollection(collectionId)
      .filter(l => l.enabled === 1);

    let selectedTraits = [];

    if (data.traits && Array.isArray(data.traits)) {
      // Use specified traits
      selectedTraits = data.traits;
    } else {
      // Random selection
      for (const layer of layers) {
        const traits = traitQueries.getByLayer(layer.id);
        if (traits.length === 0) continue;
        
        // Random selection weighted by rarity
        const totalWeight = traits.reduce((sum, t) => sum + t.rarity_weight, 0);
        let random = Math.random() * totalWeight;
        let selected = traits[0];
        for (const trait of traits) {
          random -= trait.rarity_weight;
          if (random <= 0) {
            selected = trait;
            break;
          }
        }
        
        selectedTraits.push({
          filename: selected.filename,
          x: selected.x,
          y: selected.y,
          scale: selected.scale,
          opacity: selected.opacity,
        });
      }
    }

    // Generate composite image
    const buffer = await compositeTraits(collection.name, selectedTraits);

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
