import { ErrorMsg, JwtTokenPayload, adminPassword, adminUsername, secret_token } from '../config/config';
import prisma from '../db/db';
import { hashPassword } from '../tools/encrypt';
import jwt, { JwtPayload } from "jsonwebtoken";

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
    const session = await prisma.session.findFirst({
        where: {
            token
        }
    });
    if (!session) throw ErrorMsg.authorizationErrorMsg;
    const verified: JwtPayload = jwt.decode(token) as JwtPayload;

    return {
        admin: verified.admin,
        id: verified.id
    };
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