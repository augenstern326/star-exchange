import crypto from 'crypto';

// Simple password hashing using crypto (for production, use bcryptjs or argon2)
export function hashPassword(password: string): string {
  return crypto
    .pbkdf2Sync(password, 'star_book_salt', 1000, 64, 'sha512')
    .toString('hex');
}

export function verifyPassword(password: string, hash: string): boolean {
  const passwordHash = hashPassword(password);
  return passwordHash === hash;
}
