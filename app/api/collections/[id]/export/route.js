import { NextResponse } from 'next/server';
import { collectionQueries } from '@/lib/db';
import { createExportZip } from '@/lib/export';
import fs from 'fs';
import path from 'path';

// GET /api/collections/[id]/export
export async function GET(request, { params }) {
  try {
    const collectionId = parseInt(params.id);
    const collection = collectionQueries.getById(collectionId);
    if (!collection) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
    }

    // Create ZIP
    const zipPath = await createExportZip(collection.name);
    
    const fileBuffer = fs.readFileSync(zipPath);
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${collection.name}_export.zip"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
