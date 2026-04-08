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
    VALUES (${userId}, ${token}, ${expiresAt.toISOString()})
  `;

  return token;
}

/**
 * Validate a session token and return the user.
 */
export async function validateSession(token: string): Promise<UserRow | null> {
  const sql = getDb();

  const rows = await sql`
    SELECT u.* FROM users u
    JOIN sessions s ON s.user_id = u.id
    WHERE s.token = ${token}
      AND s.expires_at > now()
  `;

  return rows.length > 0 ? (rows[0] as UserRow) : null;
}

/**
 * Delete a session (logout).
 */
export async function deleteSession(token: string): Promise<void> {
  const sql = getDb();
  await sql`DELETE FROM sessions WHERE token = ${token}`;
}
