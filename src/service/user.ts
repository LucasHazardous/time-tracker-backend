import crypto from 'crypto';
import { ErrorMsg, adminPassword, adminUsername, session_ttl } from '../config/config';
import prisma from '../db/db';
import cron from "node-cron";

function generateToken(username: string): string {
    return crypto
        .createHash('sha512')
        .update(String(Date.now()) + username + Math.random())
        .digest('hex');
}

function hashPassword(password: string): string {
    return crypto
        .createHash('sha512')
        .update(password + process.env.SALT)
        .digest('base64');
}

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

createAdminIfNeeded().catch((err) => console.log(err));

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
        const token = generateToken(username);

        const expirationTime = new Date();
        expirationTime.setSeconds(expirationTime.getSeconds() + session_ttl);

        await prisma.session.create({
            data: {
                userId: user.id,
                token,
                ttl: expirationTime
            }
        });

        return token;
    }
    throw ErrorMsg.authenticationErrorMsg;
}

export async function logout(token: string): Promise<void> {
    try {
        await prisma.session.delete({
            where: {
                token
            }
        });
    } catch (err: any) {
        if (err.code === 'P2025') {
            throw ErrorMsg.notFound;
        } else {
            console.error('Error while attempting to delete the record:', err);
        }
    }
}

cron.schedule("0 * * * *", async () => {
    const currentTime = new Date();
    await prisma.session.deleteMany({
        where: {
            ttl: {
                lte: currentTime
            }
        }
    });
});

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
            throw ErrorMsg.userExistsErrorMsg;
        } else {
            console.error('Error while attempting to create user:', err);
        }
    }
}

export async function authorizeUser(token: string): Promise<{ token: string; userId: string; ttl: Date; } | void> {
    const session = await prisma.session.findFirst({
        where: {
            token
        }
    });
    if (!session) throw ErrorMsg.authorizationErrorMsg;
    return session;
}

export async function authorizeAdmin(token: string): Promise<void> {
    const sessionData = await prisma.session.findFirst({
        where: {
            token
        }
    });
    if (!sessionData) throw ErrorMsg.authorizationErrorMsg;
    const userData = await prisma.user.findFirst({
        where: {
            id: sessionData.userId
        }
    });
    if (!userData!.admin) throw ErrorMsg.accessDeniedErrorMsg;
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
