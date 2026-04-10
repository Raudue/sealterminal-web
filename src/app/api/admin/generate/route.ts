import { NextRequest, NextResponse } from 'next/server';
import { validateAdmin } from '@/lib/admin';
import { generateImage } from '@/lib/gemini';
import { removeGreenScreen, resizeImage } from '@/lib/image-processing';
import { getDb } from '@/lib/db';

const SEAL_CLASSES = ['brawler', 'swift', 'sage', 'diplomat', 'guardian'] as const;

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

async function getReferenceImageData(): Promise<Buffer[]> {
  const sql = getDb();
  const rows = await sql`SELECT image_data FROM admin_assets WHERE asset_type = 'reference-seal' AND image_data IS NOT NULL`;
  if (rows.length > 0 && rows[0].image_data) {
    return [Buffer.from(rows[0].image_data as string, 'base64')];
  }
  return [];
}

export async function POST(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');
  if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 401 });

  const admin = await validateAdmin(token);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

  const body = await request.json();
  const { type, id, customPrompt } = body as {
    type: 'reference' | 'seal' | 'item';
    id?: string;
    customPrompt?: string;
  };

  if (!type) {
    return NextResponse.json({ error: 'Missing type' }, { status: 400 });
  }

  const sql = getDb();

  try {
    if (type === 'reference') {
      const prompt = customPrompt ||
        'Generate a 16-bit pixel art style reference image of a cute cartoon seal character. ' +
        'The seal should be facing forward, sitting upright, with big expressive eyes. ' +
        'Use a retro SNES-era 16-bit pixel art style with clean outlines and limited color palette. ' +
        'The background must be solid bright green #00FF00 for chroma keying. ' +
        'The seal should be centered in the image.';

      const result = await generateImage(prompt);
      const rawBuffer = Buffer.from(result.imageBase64, 'base64');
      const processed = await removeGreenScreen(rawBuffer);
      const resized = await resizeImage(processed, 128, 128);
      const imageBase64 = resized.toString('base64');
      const imageUrl = '/api/images/reference/seal';

      // Store in admin_assets
      const existing = await sql`SELECT id FROM admin_assets WHERE asset_type = 'reference-seal'`;
      if (existing.length > 0) {
        await sql`UPDATE admin_assets SET image_url = ${imageUrl}, image_data = ${imageBase64}, updated_at = now() WHERE asset_type = 'reference-seal'`;
      } else {
        await sql`INSERT INTO admin_assets (asset_type, image_url, image_data) VALUES ('reference-seal', ${imageUrl}, ${imageBase64})`;
      }

      return NextResponse.json({ success: true, imageUrl });
    }

    if (type === 'seal') {
      if (!id || !SEAL_CLASSES.includes(id as typeof SEAL_CLASSES[number])) {
        return NextResponse.json({ error: 'Invalid seal class' }, { status: 400 });
      }

      const referenceImages = await getReferenceImageData();
      const classDescriptions: Record<string, string> = {
        brawler: 'a strong muscular seal with battle scars, red/orange color accents, fierce expression, wearing light combat gear',
        swift: 'a sleek agile seal with lightning bolt markings, blue/yellow color accents, alert nimble posture',
        sage: 'a wise scholarly seal with spectacles, purple/blue color accents, holding a glowing book or scroll',
        diplomat: 'a charming well-dressed seal with a bow tie, gold/green color accents, friendly confident smile',
        guardian: 'a sturdy armored seal with a shield emblem, silver/blue color accents, protective stalwart stance',
      };

      const prompt = customPrompt ||
        `Generate a 16-bit pixel art portrait of a ${id} seal character: ${classDescriptions[id]}. ` +
        'The seal should be facing forward in a front-facing portrait style. ' +
        'Use retro SNES-era 16-bit pixel art style with clean outlines and limited color palette. ' +
        (referenceImages.length > 0 ? 'Match the style of the reference seal image provided. ' : '') +
        'The background must be solid bright green #00FF00 for chroma keying. ' +
        'The character should be centered in the image.';

      const result = await generateImage(prompt, referenceImages);
      const rawBuffer = Buffer.from(result.imageBase64, 'base64');
      const processed = await removeGreenScreen(rawBuffer);
      const resized = await resizeImage(processed, 128, 128);
      const imageBase64 = resized.toString('base64');
      const imageUrl = `/api/images/seal/${id}`;

      // Upsert seal_class_images
      const existing = await sql`SELECT id FROM seal_class_images WHERE seal_class = ${id}`;
      if (existing.length > 0) {
        await sql`UPDATE seal_class_images SET image_url = ${imageUrl}, image_data = ${imageBase64}, updated_at = now() WHERE seal_class = ${id}`;
      } else {
        await sql`INSERT INTO seal_class_images (seal_class, image_url, image_data) VALUES (${id}, ${imageUrl}, ${imageBase64})`;
      }

      return NextResponse.json({ success: true, imageUrl });
    }

    if (type === 'item') {
      if (!id) {
        return NextResponse.json({ error: 'Missing item id' }, { status: 400 });
      }

      const items = await sql`SELECT * FROM items WHERE id = ${id}`;
      if (items.length === 0) {
        return NextResponse.json({ error: 'Item not found' }, { status: 404 });
      }

      const item = items[0];
      const referenceImages = await getReferenceImageData();

      const rarityStyles: Record<string, string> = {
        common: 'simple, basic materials, muted colors',
        uncommon: 'slightly polished, iron/steel materials, subtle glow',
        rare: 'ornate, magical glow, crystal or mythril materials',
        epic: 'highly detailed, intense magical aura, dragon/legendary materials',
        legendary: 'spectacular, divine glow, otherworldly materials, particles',
      };

      const prompt = customPrompt ||
        `Generate a 16-bit pixel art icon of a ${item.rarity} RPG ${item.slot}: "${item.name}". ` +
        `${item.description} ` +
        `Style: ${rarityStyles[item.rarity as string] || rarityStyles.common}. ` +
        'Use retro SNES-era 16-bit pixel art style with clean outlines and limited color palette. ' +
        'The item should be a single object, no characters, centered in the image. ' +
        (referenceImages.length > 0 ? 'Match the pixel art style of the reference image provided. ' : '') +
        'The background must be solid bright green #00FF00 for chroma keying.';

      const result = await generateImage(prompt, referenceImages);
      const rawBuffer = Buffer.from(result.imageBase64, 'base64');
      const processed = await removeGreenScreen(rawBuffer);
      const resized = await resizeImage(processed, 64, 64);
      const imageBase64 = resized.toString('base64');
      const imageUrl = `/api/images/item/${id}`;

      // Update item
      await sql`UPDATE items SET image_url = ${imageUrl}, image_data = ${imageBase64} WHERE id = ${id}`;

      return NextResponse.json({ success: true, imageUrl });
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (err) {
    console.error('Image generation error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Generation failed' },
      { status: 500 }
    );
  }
}
