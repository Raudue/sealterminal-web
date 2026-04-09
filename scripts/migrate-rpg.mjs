import { neon } from '@neondatabase/serverless';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('DATABASE_URL is not set');
  process.exit(1);
}

const sql = neon(databaseUrl);

console.log('Running RPG migration...');

try {
  // ALTER users table — add RPG columns
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS seal_class TEXT CHECK (seal_class IN ('brawler','swift','sage','diplomat','guardian'))`;
  console.log('  OK: users.seal_class');

  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS stat_str INTEGER DEFAULT 3`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS stat_dex INTEGER DEFAULT 3`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS stat_int INTEGER DEFAULT 3`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS stat_cha INTEGER DEFAULT 3`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS stat_end INTEGER DEFAULT 3`;
  console.log('  OK: users.stat_*');

  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS total_commands INTEGER DEFAULT 0`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS total_fish_earned INTEGER DEFAULT 0`;
  console.log('  OK: users.total_commands, total_fish_earned');

  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_code VARCHAR(8) UNIQUE`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES users(id)`;
  console.log('  OK: users.referral_code, referred_by');

  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS longest_streak INTEGER DEFAULT 0`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_date DATE`;
  console.log('  OK: users.streak columns');

  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS character_created BOOLEAN DEFAULT false`;
  console.log('  OK: users.character_created');

  // username column (may already exist)
  try {
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(20) UNIQUE`;
  } catch { /* may already exist */ }

  // fish column (may already exist)
  try {
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS fish INTEGER DEFAULT 0`;
  } catch { /* may already exist */ }

  // Items table
  await sql`
    CREATE TABLE IF NOT EXISTS items (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      slot TEXT NOT NULL CHECK (slot IN ('helmet','weapon','armor','accessory')),
      rarity TEXT NOT NULL CHECK (rarity IN ('common','uncommon','rare','epic','legendary')),
      bonus_str INTEGER DEFAULT 0,
      bonus_dex INTEGER DEFAULT 0,
      bonus_int INTEGER DEFAULT 0,
      bonus_cha INTEGER DEFAULT 0,
      bonus_end INTEGER DEFAULT 0,
      fish_multiplier NUMERIC(4,2) DEFAULT 1.0,
      cost INTEGER NOT NULL,
      level_required INTEGER DEFAULT 1,
      icon TEXT DEFAULT '🔹',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  console.log('  OK: items table');

  // User items (inventory)
  await sql`
    CREATE TABLE IF NOT EXISTS user_items (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
      equipped BOOLEAN DEFAULT false,
      acquired_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      UNIQUE(user_id, item_id)
    )
  `;
  console.log('  OK: user_items table');

  // Quest definitions
  await sql`
    CREATE TABLE IF NOT EXISTS quest_definitions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      quest_type TEXT NOT NULL CHECK (quest_type IN ('daily','weekly','boss')),
      metric TEXT NOT NULL,
      target INTEGER NOT NULL,
      reward_fish INTEGER NOT NULL,
      reward_badge_id UUID,
      icon TEXT DEFAULT '📜',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  console.log('  OK: quest_definitions table');

  // User quests
  await sql`
    CREATE TABLE IF NOT EXISTS user_quests (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      quest_id UUID NOT NULL REFERENCES quest_definitions(id) ON DELETE CASCADE,
      progress INTEGER DEFAULT 0,
      completed BOOLEAN DEFAULT false,
      reward_claimed BOOLEAN DEFAULT false,
      started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      completed_at TIMESTAMPTZ,
      expires_at TIMESTAMPTZ
    )
  `;
  console.log('  OK: user_quests table');

  // Badge definitions
  await sql`
    CREATE TABLE IF NOT EXISTS badge_definitions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      icon TEXT DEFAULT '🏅',
      category TEXT NOT NULL CHECK (category IN ('milestone','quest','social','streak','collection')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  console.log('  OK: badge_definitions table');

  // User badges
  await sql`
    CREATE TABLE IF NOT EXISTS user_badges (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      badge_id UUID NOT NULL REFERENCES badge_definitions(id) ON DELETE CASCADE,
      earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      UNIQUE(user_id, badge_id)
    )
  `;
  console.log('  OK: user_badges table');

  // Referral earnings
  await sql`
    CREATE TABLE IF NOT EXISTS referral_earnings (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      referrer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      earner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      level INTEGER NOT NULL CHECK (level BETWEEN 1 AND 3),
      fish_earned INTEGER NOT NULL,
      fish_given INTEGER NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  console.log('  OK: referral_earnings table');

  // Daily login log
  await sql`
    CREATE TABLE IF NOT EXISTS daily_login_log (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      login_date DATE NOT NULL,
      streak_day INTEGER NOT NULL,
      fish_awarded INTEGER NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      UNIQUE(user_id, login_date)
    )
  `;
  console.log('  OK: daily_login_log table');

  // Indexes
  await sql`CREATE INDEX IF NOT EXISTS idx_user_items_user ON user_items(user_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_user_quests_user ON user_quests(user_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_user_badges_user ON user_badges(user_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_referral_earnings_referrer ON referral_earnings(referrer_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_daily_login_user ON daily_login_log(user_id)`;
  console.log('  OK: indexes');

  console.log('\nRPG migration complete!');
} catch (err) {
  console.error('RPG migration failed:', err.message);
  process.exit(1);
}
