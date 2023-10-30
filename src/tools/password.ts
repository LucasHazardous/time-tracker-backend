import crypto from 'crypto';

export function hashPassword(password: string): string {
    return crypto
        .createHash('sha512')
        .update(password + process.env.SALT)
        .digest('base64');
}