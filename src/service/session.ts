import { ErrorMsg, sessionTTL } from '../config/config';
import prisma from '../db/db';
import jwt from "jsonwebtoken";
import { JwtTokenPayload, secret_token } from '../config/config';
import { hashPassword } from '../tools/password';

export async function login(username: string, password: string): Promise<string> {
    const hashedPassword = hashPassword(password);
    const user = await prisma.user.findFirst({
        where: {
            username,
            password: hashedPassword
        }
    })

    if (
        user
    ) {
        const token = generateToken(user.id, user.admin);

        return token;
    }
    throw ErrorMsg.authenticationErrorMsg;
}

function generateToken(id: string, admin: boolean): string {
    return jwt.sign(<JwtTokenPayload>{
        id, admin
    }, secret_token, {
        expiresIn: sessionTTL
    });
}
