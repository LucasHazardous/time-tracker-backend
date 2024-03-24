import prisma from '../db/db';
import { authorizeAdmin, authorizeUser } from './user';
import { holidayDays } from '../tools/free_days';
import { ErrorMsg, prismaNotFoundError } from '../config/config';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

export async function createCurrentUserPresence(type: string, token: string): Promise<void> {
    const session = await authorizeUser(token);

    const currentTime = new Date();
    currentTime.setUTCHours(0, 0, 0, 0);

    await createPresence(type, session!.id, currentTime);
}

export async function createPastUserPresence(type: string, date: Date, userId: string, token: string): Promise<void> {
    await authorizeAdmin(token);

    const currentDate = new Date();
    currentDate.setUTCHours(0,0,0,0);
    date.setUTCHours(0,0,0,0);

    if(date > currentDate) throw ErrorMsg.unprocessableEntity;

    await createPresence(type, userId, date);
}

async function createPresence(type: string, userId: string, date: Date): Promise<void> {
    if (date.getDay() == 0 || date.getDay() == 6) throw ErrorMsg.unprocessableEntity;

    const freeDays = holidayDays(date.getFullYear());

    for (const day of freeDays) {
        if (date.getDate() === day[0] && date.getMonth() + 1 == day[1]) {
            throw ErrorMsg.unprocessableEntity;
        }
    }

    const vacation = await prisma.vacation.findFirst({
        select: {
            id: true
        },
        where: {
            from: {
                lte: date
            },
            to: {
                gte: date
            },
            userId
        }
    });

    const presence = await prisma.presence.findFirst({
        where: {
            userId,
            date: date
        }
    });

    if(vacation || presence) throw ErrorMsg.alreadyExistsErrorMsg;

    await prisma.presence.create({
        data: {
            userId,
            date: date,
            type
        }
    });
}

export async function presencePresent(token: string): Promise<string> {
    const session = await authorizeUser(token);

    const currentTime = new Date();
    currentTime.setUTCHours(0, 0, 0, 0);

    const presence = await prisma.presence.findFirst({
        where: {
            userId: session!.id,
            date: currentTime
        }
    });

    return !presence ? "none" : presence.type;
}

export async function deletePresence(userId: string, date: Date, token: string): Promise<void> {
    await authorizeAdmin(token);

    const { count } = await prisma.presence.deleteMany({
        where: {
            userId,
            date
        }
    });

    if(count === 0) throw ErrorMsg.notFound;
}

export async function editPresence(type: string, presenceId: string, token: string): Promise<void> {
    await authorizeAdmin(token);

    try {
            await prisma.presence.update({
        where: {
            id: presenceId
        },
        data: {
            type
        }
    });
    } catch (err: any) {
        if (err instanceof PrismaClientKnownRequestError && err.code === prismaNotFoundError) {
            throw ErrorMsg.notFound;
        }
        throw err;
    }
}
