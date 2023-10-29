import crypto from 'crypto';
import jwt from "jsonwebtoken";
import { JwtTokenPayload, secret_token } from '../config/config';

export function generateToken(id: string, admin: boolean): string {
    return jwt.sign(<JwtTokenPayload>{
        id, admin
    }, secret_token);
}

export function hashPassword(password: string): string {
    return crypto
        .createHash('sha512')
        .update(password + process.env.SALT)
        .digest('base64');
}