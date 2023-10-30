import { ErrorMsg, JwtTokenPayload, adminPassword, adminUsername, secret_token } from '../config/config';
import prisma from '../db/db';
import jwt from "jsonwebtoken";
import { hashPassword } from '../tools/password';

async function createAdminIfNeeded(): Promise<void> {
    if (
        (await prisma.user.count({
            where: {
                admin: true
            }
        })) === 0
    )
        await prisma.user.create({
            data: {
                username: adminUsername,
                password: hashPassword(adminPassword),
                admin: true
            }
        });
}

createAdminIfNeeded().catch((err) => console.error(err));

export async function createUser(username: string, password: string, admin: boolean, token: string): Promise<void> {
    await authorizeAdmin(token);

    try {
        await prisma.user.create({
            data: {
                username,
                password: hashPassword(password),
                admin
            }
        });
    } catch (err: any) {
        if (err.code === 'P2002') {
            throw ErrorMsg.alreadyExistsErrorMsg;
        } else {
            console.error('Error while attempting to create user:', err);
        }
    }
}

export async function authorizeUser(token: string): Promise<JwtTokenPayload> {
    try {
        const verified: JwtTokenPayload = jwt.verify(token, secret_token) as JwtTokenPayload;

        return {
            admin: verified.admin,
            id: verified.id
        };
    } catch(err: any) {
        throw ErrorMsg.authorizationErrorMsg;
    }
}

export async function authorizeAdmin(token: string): Promise<void> {
    const sessionData = await authorizeUser(token);
    if (!sessionData!.admin) throw ErrorMsg.accessDeniedErrorMsg;
}

export async function getUserList(token: string): Promise<{
    id: string,
    username: string,
    admin: boolean
}[]> {
    await authorizeAdmin(token);

    const res = await prisma.user.findMany({
        select: {
            id: true,
            username: true,
            admin: true
        }
    });
    return res;
}