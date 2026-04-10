import { neon } from '@neondatabase/serverless';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('DATABASE_URL is not set');
  process.exit(1);
}

const sql = neon(databaseUrl);

console.log('Running image migration...');

try {
  // Add image_url column to items table (stores serving path like /api/images/item/UUID)
  await sql`ALTER TABLE items ADD COLUMN IF NOT EXISTS image_url TEXT`;
  console.log('  OK: items.image_url');

  // Add image_data column to items table (stores base64 PNG)
  await sql`ALTER TABLE items ADD COLUMN IF NOT EXISTS image_data TEXT`;
  console.log('  OK: items.image_data');

  // Seal class images table
  await sql`
    CREATE TABLE IF NOT EXISTS seal_class_images (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      seal_class TEXT NOT NULL UNIQUE CHECK (seal_class IN ('brawler','swift','sage','diplomat','guardian')),
      image_url TEXT NOT NULL,
      image_data TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  // Add image_data column if table already existed
  await sql`ALTER TABLE seal_class_images ADD COLUMN IF NOT EXISTS image_data TEXT`;
  console.log('  OK: seal_class_images table');

  // Admin assets table (for reference images etc.)
  await sql`
    CREATE TABLE IF NOT EXISTS admin_assets (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      asset_type TEXT NOT NULL,
      image_url TEXT NOT NULL,
      image_data TEXT,
      metadata JSONB DEFAULT '{}',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  // Add image_data column if table already existed
  await sql`ALTER TABLE admin_assets ADD COLUMN IF NOT EXISTS image_data TEXT`;
  console.log('  OK: admin_assets table');

  console.log('\nImage migration complete!');
} catch (err) {
  console.error('Image migration failed:', err.message);
  process.exit(1);
}
