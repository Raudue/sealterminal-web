import { randomBytes } from 'crypto';
import { getDb } from './db';

export function generateToken(): string {
  return randomBytes(32).toString('hex');
}

export interface UserRow {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  plan: string;
  username: string | null;
  fish: number;
  seal_class: string | null;
  stat_str: number;
  stat_dex: number;
  stat_int: number;
  stat_cha: number;
  stat_end: number;
  total_commands: number;
  total_fish_earned: number;
  referral_code: string | null;
  referred_by: string | null;
  current_streak: number;
  longest_streak: number;
  last_login_date: string | null;
  character_created: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Find or create a user from an OAuth provider.
 * Returns the user row.
 */
export async function findOrCreateUser(opts: {
  email: string;
  name: string | null;
  avatarUrl: string | null;
  provider: 'github' | 'google';
  providerAccountId: string;
  accessToken: string;
}): Promise<UserRow> {
  const sql = getDb();

  // Check if account already exists
  const existing = await sql`
    SELECT u.* FROM users u
    JOIN accounts a ON a.user_id = u.id
    WHERE a.provider = ${opts.provider}
      AND a.provider_account_id = ${opts.providerAccountId}
  `;

  if (existing.length > 0) {
    // Update access token
    await sql`
      UPDATE accounts
      SET access_token = ${opts.accessToken}
      WHERE provider = ${opts.provider}
        AND provider_account_id = ${opts.providerAccountId}
    `;
    return existing[0] as UserRow;
  }

  // Check if user with this email exists (link account)
  const existingUser = await sql`
    SELECT * FROM users WHERE email = ${opts.email}
  `;

  let user: UserRow;

  if (existingUser.length > 0) {
    user = existingUser[0] as UserRow;
  } else {
    // Create new user
    const created = await sql`
      INSERT INTO users (email, name, avatar_url)
      VALUES (${opts.email}, ${opts.name}, ${opts.avatarUrl})
      RETURNING *
    `;
    user = created[0] as UserRow;
  }

  // Create account link
  await sql`
    INSERT INTO accounts (user_id, provider, provider_account_id, access_token)
    VALUES (${user.id}, ${opts.provider}, ${opts.providerAccountId}, ${opts.accessToken})
  `;

  return user;
}

/**
 * Create a session for a user. Returns the session token.
 */
export async function createSession(userId: string): Promise<string> {
  const sql = getDb();
  const token = generateToken();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

  await sql`
    INSERT INTO sessions (user_id, token, expires_at)
    VALUES (${userId}, ${token}, ${expiresAt})
  `;

  // Verify the session was actually stored
  const verify = await sql`SELECT id FROM sessions WHERE token = ${token}`;
  console.log('[auth] createSession: userId=', userId, 'token=', token.slice(0, 8) + '...', 'verified=', verify.length > 0);

  return token;
}

/**
 * Validate a session token and return the user.
 */
export async function validateSession(token: string): Promise<UserRow | null> {
  const sql = getDb();

  // First check if session exists at all
  const sessionCheck = await sql`SELECT id, user_id, expires_at FROM sessions WHERE token = ${token}`;
  console.log('[auth] validateSession: token=', token.slice(0, 8) + '...', 'sessionFound=', sessionCheck.length, sessionCheck.length > 0 ? `expires=${sessionCheck[0].expires_at}` : '');

  const rows = await sql`
    SELECT u.* FROM users u
    JOIN sessions s ON s.user_id = u.id
    WHERE s.token = ${token}
      AND s.expires_at > now()
  `;

  console.log('[auth] validateSession: userFound=', rows.length);
  return rows.length > 0 ? (rows[0] as UserRow) : null;
}

/**
 * Delete a session (logout).
 */
export async function deleteSession(token: string): Promise<void> {
  const sql = getDb();
  await sql`DELETE FROM sessions WHERE token = ${token}`;
}
