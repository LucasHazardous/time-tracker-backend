import cron from "node-cron";
import { ErrorMsg, sessionTTL } from '../config/config';
import prisma from '../db/db';
import { generateToken, hashPassword } from "../tools/encrypt";

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
        expirationTime.setSeconds(expirationTime.getSeconds() + sessionTTL);

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