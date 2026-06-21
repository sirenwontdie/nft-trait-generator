import { NextResponse } from 'next/server';
import { collectionQueries } from '@/lib/db';
import { getTraitsDir } from '@/lib/image-utils';
import fs from 'fs';
import path from 'path';

// GET /api/collections/[id]/traits/[filename] - serve trait image
export async function GET(request, { params }) {
  try {
    const collectionId = parseInt(params.id);
    const filename = params.filename;
    
    const collection = collectionQueries.getById(collectionId);
    if (!collection) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
    }

    const filePath = path.join(getTraitsDir(collection.name), filename);
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
