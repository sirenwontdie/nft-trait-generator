import { NextResponse } from 'next/server';
import { collectionQueries } from '@/lib/db';
import { validateMetadata } from '@/lib/validation';

// GET /api/collections/[id]/validate
export async function GET(request, { params }) {
  try {
    const collectionId = parseInt(params.id);
    const collection = collectionQueries.getById(collectionId);
    if (!collection) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
    }

    const result = validateMetadata(collection.name);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
