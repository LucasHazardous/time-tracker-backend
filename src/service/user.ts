import { ErrorMsg, JwtTokenPayload, adminPassword, adminUsername, prismaAlreadyExistsError, prismaNotFoundError, secret_token } from '../config/config';
import prisma from '../db/db';
import jwt from "jsonwebtoken";
import { hashPassword } from '../tools/password';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

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

createAdminIfNeeded();

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
        if (err instanceof PrismaClientKnownRequestError && err.code === prismaAlreadyExistsError) {
            throw ErrorMsg.alreadyExistsErrorMsg;
        }
        throw err;
    }
}

export async function authorizeUser(token: string): Promise<JwtTokenPayload> {
    try {
        const verified: JwtTokenPayload = jwt.verify(token, secret_token) as JwtTokenPayload;

        return {
            admin: verified.admin,
            id: verified.id
        };
    } catch (err: any) {
        throw ErrorMsg.authorizationErrorMsg;
    }
}

export async function authorizeAdmin(token: string): Promise<JwtTokenPayload> {
    const sessionData = await authorizeUser(token);
    if (!sessionData!.admin) throw ErrorMsg.accessDeniedErrorMsg;
    return sessionData;
}

export async function getUserList(token: string): Promise<{data: {
    id: string,
    username: string,
    admin: boolean
}[]}> {
    await authorizeAdmin(token);

    const data = await prisma.user.findMany({
        select: {
            id: true,
            username: true,
            admin: true
        }
    });
    return {
        data
    };
}

export async function deleteUser(id: string, token: string): Promise<void> {
    const userInfo = await authorizeAdmin(token);

    if (userInfo.id === id) throw ErrorMsg.unprocessableEntity;

    try {
        await prisma.user.delete({
            where: {
                id
            }
        });
    } catch (err: any) {
        if (err instanceof PrismaClientKnownRequestError && err.code === prismaNotFoundError) {
            throw ErrorMsg.notFound;
        }
        throw err;
    }
}

export async function editUser(id: string, username: string | undefined, password: string | undefined, admin: boolean | undefined, token: string): Promise<void> {
    const adminData = await authorizeAdmin(token);

    if (password) password = hashPassword(password);
    if (admin === false && (id === adminData.id || username === adminUsername)) throw ErrorMsg.unprocessableEntity;

    try {
        await prisma.user.update({
            where: {
                id
            },
            data: {
                username,
                password,
                admin
            }
        });
    } catch (err) {
        if (err instanceof PrismaClientKnownRequestError) {
            if (err.code === prismaAlreadyExistsError) {
                throw ErrorMsg.alreadyExistsErrorMsg;
            } else if (err.code === prismaNotFoundError) {
                throw ErrorMsg.notFound;
            }
        }
        throw err;
    }
}

export async function getCurrentUserStats(year: string, month: string, token: string): Promise<{}> {
    const userInfo = await authorizeUser(token);

    return await getUserStats(userInfo.id, year, month);
}

export async function getSelectedUserStats(id: string, year: string, month: string, token: string): Promise<{}> {
    await authorizeAdmin(token);

    return await getUserStats(id, year, month);
}

async function getUserStats(id: string, year: string, month: string): Promise<{}> {
    const data = await Promise.all([
        new Promise((resolve, _) =>
            resolve(prisma.$queryRaw`SELECT date FROM Absence WHERE userId=${id} AND YEAR(date)=${year} AND MONTH(date)=${month};`)),
        new Promise((resolve, _) =>
            resolve(prisma.$queryRaw`SELECT \`from\`, \`to\`, \`days\` FROM Vacation WHERE userId=${id} AND YEAR(\`from\`)=${year} AND MONTH(\`from\`)=${month};`))
    ]);

    return {
        data: data.flat()
    };
}
