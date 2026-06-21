import { NextResponse } from 'next/server';
import { traitQueries } from '@/lib/db';

// PUT /api/collections/[id]/layers/[layerId]/traits/[traitId]
export async function PUT(request, { params }) {
  try {
    const traitId = parseInt(params.traitId);
    const data = await request.json();
    
    const existing = traitQueries.getById(traitId);
    if (!existing) {
      return NextResponse.json({ error: 'Trait not found' }, { status: 404 });
    }

    const updateData = {};
    const allowedFields = ['name', 'rarity_weight', 'x', 'y', 'scale', 'opacity', 'optional', 'display_name', 'category_name'];
    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        if (field === 'optional') {
          updateData[field] = data[field] ? 1 : 0;
        } else {
          updateData[field] = data[field];
        }
      }
    }

    const trait = traitQueries.update(traitId, updateData);
    return NextResponse.json({ ...trait, optional: trait.optional === 1 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/collections/[id]/layers/[layerId]/traits/[traitId]
export async function DELETE(request, { params }) {
  try {
    const traitId = parseInt(params.traitId);
    const trait = traitQueries.delete(traitId);
    if (!trait) {
      return NextResponse.json({ error: 'Trait not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Trait deleted', trait });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
