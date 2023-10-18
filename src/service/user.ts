import crypto from 'crypto';
import { ErrorMsg, adminPassword, adminUsername, session_ttl } from '../config/config';
import prisma from '../db/db';

function generateToken(username: string) {
    return crypto
        .createHash('sha512')
        .update(String(Date.now()) + username + Math.random())
        .digest('hex');
}

function hashPassword(password: string) {
    return crypto
        .createHash('sha512')
        .update(password + process.env.SALT)
        .digest('base64');
}

async function createAdminIfNeeded() {
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

export async function login(username: string, password: string) {
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
