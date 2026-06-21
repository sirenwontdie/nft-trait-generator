import { NextResponse } from 'next/server';
import { collectionQueries } from '@/lib/db';

// GET /api/collections - list all collections
export async function GET() {
  try {
    const collections = collectionQueries.getAll();
    return NextResponse.json(collections);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/collections - create new collection
export async function POST(request) {
  try {
    const data = await request.json();
    if (!data.name || !data.name.trim()) {
      return NextResponse.json({ error: 'Collection name is required' }, { status: 400 });
    }
    const collection = collectionQueries.create(data);
    return NextResponse.json(collection, { status: 201 });
  } catch (error) {
    if (error.message.includes('UNIQUE')) {
      return NextResponse.json({ error: 'Collection name already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
