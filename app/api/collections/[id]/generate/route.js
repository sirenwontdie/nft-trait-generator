import { NextResponse } from 'next/server';
import { collectionQueries, layerQueries, traitQueries } from '@/lib/db';
import { generateCombinations, calculateRarity } from '@/lib/generator';
import { saveMetadataFiles } from '@/lib/metadata';
import { compositeToFile } from '@/lib/image-utils';
import { getGeneratedImagesDir } from '@/lib/image-utils';

// POST /api/collections/[id]/generate - batch generate
export async function POST(request, { params }) {
  try {
    const collectionId = parseInt(params.id);
    const data = await request.json();
    const supply = data.supply || 100;

    const collection = collectionQueries.getById(collectionId);
    if (!collection) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
    }

    // Check if generated images already exist
    const imagesDir = getGeneratedImagesDir(collection.name);
    const fs = await import('fs');
    if (fs.existsSync(imagesDir) && fs.readdirSync(imagesDir).filter(f => f.endsWith('.png')).length > 0) {
      if (!data.confirmOverwrite) {
        return NextResponse.json({ 
          error: 'Already generated. Pass confirmOverwrite: true to regenerate.',
          needsConfirmation: true
        }, { status: 409 });
      }
      // Clean old generated files
      const oldFiles = fs.readdirSync(imagesDir);
      for (const file of oldFiles) {
        fs.unlinkSync(`${imagesDir}/${file}`);
      }
      const metaDir = `${imagesDir.replace('/images', '/metadata')}`;
      if (fs.existsSync(metaDir)) {
        const oldMeta = fs.readdirSync(metaDir);
        for (const file of oldMeta) {
          fs.unlinkSync(`${metaDir}/${file}`);
        }
      }
    }

    // Get layers with traits
    const layers = layerQueries.getByCollection(collectionId).map(layer => ({
      ...layer,
      enabled: layer.enabled === 1,
      traits: traitQueries.getByLayer(layer.id),
    }));

    // Generate combinations
    const combinations = generateCombinations(layers, supply);

    // Generate images
    const generatedDir = imagesDir.replace('/images', '');
    for (const combo of combinations) {
      const outputPath = `${imagesDir}/${combo.tokenId}.png`;
      const selectedTraits = combo.traits.map(t => ({
        filename: t.filename,
        x: t.x,
        y: t.y,
        scale: t.scale,
        opacity: t.opacity,
      }));
      
      await compositeToFile(collection.name, selectedTraits, outputPath);
    }

    // Calculate rarity
    const rarityRanks = calculateRarity(combinations);

    // Save metadata files
    const collectionSettings = {
      name: collection.name,
      description: collection.description,
      external_url: collection.external_url,
      image_base_url: collection.image_base_url,
      royalty_wallet: collection.royalty_wallet,
      royalty_fee_basis_points: collection.royalty_fee_basis_points,
    };

    saveMetadataFiles(collection.name, combinations, rarityRanks, collectionSettings);

    return NextResponse.json({
      success: true,
      supply: combinations.length,
      message: `Successfully generated ${combinations.length} NFTs`,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
