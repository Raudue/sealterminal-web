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
        'Generate a 16-bit pixel art style image of a cute cartoon seal character. ' +
        'The seal must be: facing perfectly forward, sitting upright, centered in the image. ' +
        'Round plump body, two small flippers resting at the sides, small tail at the bottom. ' +
        'Head is round with big expressive eyes, small nose, neutral friendly expression. ' +
        'Head at the top third of the image, body in the middle, tail at the bottom. ' +
        'Gray/blue-gray natural seal fur color. No accessories, no items, no hats. ' +
        'This is a BASE TEMPLATE that other variants will be recolored from. ' +
        'Use a retro SNES-era 16-bit pixel art style with clean outlines and limited color palette. ' +
        'The background must be solid bright green #00FF00 for chroma keying.';

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

      const classStyles: Record<string, string> = {
        brawler: 'warm red/orange fur tint, fierce determined eyes',
        swift: 'cool blue/cyan fur tint, sharp alert eyes',
        sage: 'soft purple/violet fur tint, calm wise eyes',
        diplomat: 'warm golden/amber fur tint, friendly smiling eyes',
        guardian: 'cool silver/steel-blue fur tint, determined steady eyes',
      };

      const prompt = customPrompt ||
        'Recreate this EXACT same seal from the reference image with IDENTICAL body shape, pose, proportions, size, and position. ' +
        'Do NOT change ANYTHING about the body silhouette, head shape, flipper position, or pose. ' +
        `The ONLY changes: ${classStyles[id]}. ` +
        'Do NOT add any accessories, hats, items, clothing, spectacles, scarves, or objects of any kind. ' +
        'The seal must be completely bare/naked - just the seal body with a different color tint and eye expression. ' +
        'Keep the exact same 16-bit pixel art style. ' +
        'The background must be solid bright green #00FF00 for chroma keying.';

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
