import { validateSession, UserRow } from './auth';

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export async function validateAdmin(token: string): Promise<UserRow | null> {
  const user = await validateSession(token);
  if (!user) return null;
  if (!ADMIN_EMAILS.includes(user.email.toLowerCase())) return null;
  return user;
}
