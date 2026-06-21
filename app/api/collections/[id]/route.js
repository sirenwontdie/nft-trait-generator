import { NextResponse } from 'next/server';
import { collectionQueries } from '@/lib/db';

// GET /api/collections/[id]
export async function GET(request, { params }) {
  try {
    const id = parseInt(params.id);
    const collection = collectionQueries.getById(id);
    if (!collection) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
    }
    return NextResponse.json(collection);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/collections/[id]
export async function PUT(request, { params }) {
  try {
    const id = parseInt(params.id);
    const data = await request.json();
    const collection = collectionQueries.update(id, data);
    if (!collection) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
    }
    return NextResponse.json(collection);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/collections/[id]
export async function DELETE(request, { params }) {
  try {
    const id = parseInt(params.id);
    const collection = collectionQueries.delete(id);
    if (!collection) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Deleted', collection });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
