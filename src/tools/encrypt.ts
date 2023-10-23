import crypto from 'crypto';

export function generateToken(username: string): string {
    return crypto
        .createHash('sha512')
        .update(String(Date.now()) + username + Math.random())
        .digest('hex');
}

export function hashPassword(password: string): string {
    return crypto
        .createHash('sha512')
        .update(password + process.env.SALT)
        .digest('base64');
}