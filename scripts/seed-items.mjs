import { neon } from '@neondatabase/serverless';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('DATABASE_URL is not set');
  process.exit(1);
}

const sql = neon(databaseUrl);

console.log('Seeding RPG data...');

try {
  // Clear existing seed data
  await sql`DELETE FROM quest_definitions`;
  await sql`DELETE FROM badge_definitions`;
  await sql`DELETE FROM items`;
  console.log('  Cleared existing seed data');

  // ── ITEMS ──

  const items = [
    // COMMON (25-100 fish, lvl 1)
    { name: 'Rusty Helmet', description: 'A dented helmet found on the beach.', slot: 'helmet', rarity: 'common', bonus_str: 1, bonus_end: 1, cost: 25, level_required: 1, icon: '🪖' },
    { name: 'Wooden Club', description: 'A simple club carved from driftwood.', slot: 'weapon', rarity: 'common', bonus_str: 2, cost: 30, level_required: 1, icon: '🏏' },
    { name: 'Cloth Tunic', description: 'Basic cloth armor. Better than nothing.', slot: 'armor', rarity: 'common', bonus_end: 2, cost: 35, level_required: 1, icon: '👕' },
    { name: 'Lucky Pebble', description: 'A smooth stone that brings good fortune.', slot: 'accessory', rarity: 'common', bonus_cha: 1, bonus_dex: 1, cost: 25, level_required: 1, icon: '🪨' },
    { name: 'Seaweed Bandana', description: 'Stylish headwear made from kelp.', slot: 'helmet', rarity: 'common', bonus_dex: 2, cost: 40, level_required: 1, icon: '🌿' },
    { name: 'Bone Dagger', description: 'A sharp dagger carved from whale bone.', slot: 'weapon', rarity: 'common', bonus_dex: 2, cost: 45, level_required: 1, icon: '🗡️' },
    { name: 'Leather Vest', description: 'Tanned seal leather for basic protection.', slot: 'armor', rarity: 'common', bonus_str: 1, bonus_end: 1, cost: 50, level_required: 1, icon: '🦺' },
    { name: 'Shell Necklace', description: 'Pretty shells strung together.', slot: 'accessory', rarity: 'common', bonus_cha: 2, cost: 30, level_required: 1, icon: '📿' },

    // UNCOMMON (200-500 fish, lvl 3)
    { name: 'Iron Helm', description: 'Solid iron protection for your head.', slot: 'helmet', rarity: 'uncommon', bonus_str: 2, bonus_end: 2, cost: 200, level_required: 3, icon: '⛑️' },
    { name: 'Swift Blade', description: 'A lightweight sword for quick strikes.', slot: 'weapon', rarity: 'uncommon', bonus_dex: 3, bonus_str: 1, cost: 250, level_required: 3, icon: '⚔️' },
    { name: 'Chainmail', description: 'Interlocking metal rings for solid defense.', slot: 'armor', rarity: 'uncommon', bonus_end: 3, bonus_str: 1, cost: 300, level_required: 3, icon: '🛡️' },
    { name: 'Silver Pendant', description: 'A gleaming pendant that boosts charisma.', slot: 'accessory', rarity: 'uncommon', bonus_cha: 3, bonus_int: 1, cost: 200, level_required: 3, icon: '🔮' },
    { name: 'Scholar Cap', description: 'A cap favored by wise seals.', slot: 'helmet', rarity: 'uncommon', bonus_int: 3, bonus_cha: 1, cost: 250, level_required: 3, icon: '🎓' },
    { name: 'Coral Staff', description: 'A staff infused with ocean magic.', slot: 'weapon', rarity: 'uncommon', bonus_int: 3, bonus_end: 1, cost: 350, level_required: 3, icon: '🪄' },

    // RARE (1000-2500 fish, lvl 5)
    { name: 'Arctic Crown', description: 'Forged in the northern ice fields.', slot: 'helmet', rarity: 'rare', bonus_str: 3, bonus_end: 3, bonus_int: 2, cost: 1000, level_required: 5, icon: '👑' },
    { name: 'Crystal Staff', description: 'Channels pure intellectual energy.', slot: 'weapon', rarity: 'rare', bonus_int: 5, bonus_dex: 2, cost: 1200, level_required: 5, icon: '🔱' },
    { name: 'Mithril Plate', description: 'Legendary lightweight metal armor.', slot: 'armor', rarity: 'rare', bonus_end: 5, bonus_str: 2, cost: 1500, level_required: 5, icon: '🔰' },
    { name: 'Phantom Daggers', description: 'Twin blades that move like shadows.', slot: 'weapon', rarity: 'rare', bonus_dex: 5, bonus_str: 2, cost: 1300, level_required: 5, icon: '🌀' },
    { name: 'Enchanted Robe', description: 'Shimmers with arcane power.', slot: 'armor', rarity: 'rare', bonus_int: 4, bonus_cha: 3, cost: 1400, level_required: 5, icon: '🧥' },
    { name: 'Amulet of Tides', description: 'Controls the flow of ocean currents.', slot: 'accessory', rarity: 'rare', bonus_end: 3, bonus_str: 3, bonus_dex: 2, cost: 2000, level_required: 5, icon: '🌊' },

    // EPIC (5000-10000 fish, lvl 8)
    { name: 'Diamond Helm', description: 'Cut from a single massive diamond.', slot: 'helmet', rarity: 'epic', bonus_str: 5, bonus_end: 5, bonus_dex: 3, cost: 5000, level_required: 8, icon: '💎' },
    { name: "Leviathan's Trident", description: 'Weapon of the ancient sea beast.', slot: 'weapon', rarity: 'epic', bonus_str: 6, bonus_int: 4, bonus_dex: 3, cost: 7500, level_required: 8, icon: '🔱' },
    { name: 'Dragonscale Armor', description: 'Scales from an ice dragon.', slot: 'armor', rarity: 'epic', bonus_end: 7, bonus_str: 4, bonus_dex: 2, cost: 8000, level_required: 8, icon: '🐉' },
    { name: 'Orb of Charisma', description: 'Radiates irresistible charm.', slot: 'accessory', rarity: 'epic', bonus_cha: 8, bonus_int: 3, bonus_end: 2, cost: 6000, level_required: 8, icon: '🌟' },

    // LEGENDARY (25000-50000 fish, lvl 10)
    { name: 'Crown of the Deep', description: 'The ultimate seal crown, worn by kings.', slot: 'helmet', rarity: 'legendary', bonus_str: 8, bonus_end: 8, bonus_int: 5, bonus_cha: 4, cost: 25000, level_required: 10, icon: '🏆' },
    { name: "Poseidon's Trident", description: 'The god of the sea lends his power.', slot: 'weapon', rarity: 'legendary', bonus_str: 10, bonus_int: 6, bonus_dex: 5, bonus_end: 4, cost: 30000, level_required: 10, icon: '⚡' },
    { name: 'Abyssal Plate', description: 'Armor forged in the deepest trench.', slot: 'armor', rarity: 'legendary', bonus_end: 12, bonus_str: 6, bonus_dex: 4, bonus_cha: 3, cost: 35000, level_required: 10, icon: '🌑' },
    { name: 'Heart of the Ocean', description: 'A gem containing the ocean essence.', slot: 'accessory', rarity: 'legendary', bonus_cha: 10, bonus_int: 8, bonus_end: 5, bonus_dex: 2, cost: 50000, level_required: 10, icon: '💙' },
  ];

  for (const item of items) {
    await sql`
      INSERT INTO items (name, description, slot, rarity, bonus_str, bonus_dex, bonus_int, bonus_cha, bonus_end, cost, level_required, icon)
      VALUES (${item.name}, ${item.description}, ${item.slot}, ${item.rarity},
              ${item.bonus_str || 0}, ${item.bonus_dex || 0}, ${item.bonus_int || 0},
              ${item.bonus_cha || 0}, ${item.bonus_end || 0},
              ${item.cost}, ${item.level_required}, ${item.icon})
    `;
  }
  console.log(`  OK: ${items.length} items seeded`);

  // ── BADGES ──

  const badges = [
    { name: 'First Command', description: 'Run your very first command.', icon: '🎯', category: 'milestone' },
    { name: 'Centurion', description: 'Run 100 commands.', icon: '💯', category: 'milestone' },
    { name: 'Commander', description: 'Run 1000 commands.', icon: '⭐', category: 'milestone' },
    { name: 'Fish Mogul', description: 'Earn 1000 fish total.', icon: '🐟', category: 'milestone' },
    { name: 'Millionaire', description: 'Earn 10000 fish total.', icon: '💰', category: 'milestone' },
    { name: 'Social Butterfly', description: 'Refer your first friend.', icon: '🦋', category: 'social' },
    { name: 'The Recruiter', description: 'Refer 5 friends.', icon: '📢', category: 'social' },
    { name: 'Fashionista', description: 'Equip an item in every slot.', icon: '👗', category: 'collection' },
    { name: 'Full Set', description: 'Equip a rare or better item in every slot.', icon: '🎭', category: 'collection' },
    { name: 'Boss Slayer', description: 'Complete a boss quest.', icon: '🗡️', category: 'quest' },
    { name: 'Quest Master', description: 'Complete 10 quests.', icon: '📜', category: 'quest' },
    { name: 'Week Warrior', description: 'Maintain a 7-day login streak.', icon: '🔥', category: 'streak' },
    { name: 'Veteran', description: 'Maintain a 30-day login streak.', icon: '🏅', category: 'streak' },
    { name: 'Marathon Runner', description: 'Run 5000 commands.', icon: '🏃', category: 'milestone' },
    { name: 'Speed Demon', description: 'Run 50 rapid commands in one session.', icon: '⚡', category: 'milestone' },
  ];

  for (const badge of badges) {
    await sql`
      INSERT INTO badge_definitions (name, description, icon, category)
      VALUES (${badge.name}, ${badge.description}, ${badge.icon}, ${badge.category})
    `;
  }
  console.log(`  OK: ${badges.length} badges seeded`);

  // ── QUESTS ──

  const quests = [
    // Daily
    { name: 'Terminal Warmup', description: 'Run 10 commands today.', quest_type: 'daily', metric: 'commands', target: 10, reward_fish: 5, icon: '🏃' },
    { name: 'Busy Seal', description: 'Run 25 commands today.', quest_type: 'daily', metric: 'commands', target: 25, reward_fish: 15, icon: '💪' },
    { name: 'Command Marathon', description: 'Run 50 commands today.', quest_type: 'daily', metric: 'commands', target: 50, reward_fish: 30, icon: '🏅' },
    { name: 'Daily Fisher', description: 'Earn 20 fish today.', quest_type: 'daily', metric: 'fish', target: 20, reward_fish: 10, icon: '🎣' },

    // Weekly
    { name: 'Weekly Earner', description: 'Earn 200 fish this week.', quest_type: 'weekly', metric: 'fish', target: 200, reward_fish: 100, icon: '💰' },
    { name: 'Weekly Grinder', description: 'Run 500 commands this week.', quest_type: 'weekly', metric: 'commands', target: 500, reward_fish: 200, icon: '⚙️' },

    // Boss (one-time)
    { name: 'The Marathon', description: 'Run 10000 total commands.', quest_type: 'boss', metric: 'total_commands', target: 10000, reward_fish: 1000, icon: '🏆' },
    { name: 'Speed Demon', description: 'Run 100 rapid commands in a single session.', quest_type: 'boss', metric: 'rapid_commands', target: 100, reward_fish: 500, icon: '⚡' },
    { name: 'Fish Mogul', description: 'Accumulate 5000 total fish earned.', quest_type: 'boss', metric: 'total_fish', target: 5000, reward_fish: 2000, icon: '🐋' },
    { name: 'The Recruiter', description: 'Refer 3 friends who create characters.', quest_type: 'boss', metric: 'referrals', target: 3, reward_fish: 1500, icon: '📣' },
  ];

  for (const quest of quests) {
    await sql`
      INSERT INTO quest_definitions (name, description, quest_type, metric, target, reward_fish, icon)
      VALUES (${quest.name}, ${quest.description}, ${quest.quest_type}, ${quest.metric},
              ${quest.target}, ${quest.reward_fish}, ${quest.icon})
    `;
  }
  console.log(`  OK: ${quests.length} quests seeded`);

  console.log('\nSeed complete!');
} catch (err) {
  console.error('Seed failed:', err.message);
  process.exit(1);
}
