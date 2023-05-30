import * as crypto from 'crypto';

export function generatePasswordResetToken(length: number): string {
  const buffer = crypto.randomBytes(length);
  return buffer.toString('hex');
}
