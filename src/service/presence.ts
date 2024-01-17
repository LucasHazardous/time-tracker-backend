import prisma from '../db/db';
import { authorizeAdmin, authorizeUser } from './user';
import { holidayDays } from '../tools/free_days';
import { ErrorMsg } from '../config/config';

export async function createPresence(type: string, token: string): Promise<void> {
    const session = await authorizeUser(token);

    const currentTime = new Date();
    currentTime.setUTCHours(0, 0, 0, 0);

    if (currentTime.getDay() == 0 || currentTime.getDay() == 6) throw ErrorMsg.unprocessableEntity;

    const freeDays = holidayDays(currentTime.getFullYear());

    for (const day of freeDays) {
        if (currentTime.getDate() === day[0] && currentTime.getMonth() + 1 == day[1]) {
            throw ErrorMsg.unprocessableEntity;
        }
    }

    const vacation = await prisma.vacation.findFirst({
        select: {
            id: true
        },
        where: {
            from: {
                lte: currentTime
            },
            to: {
                gte: currentTime
            },
            userId: session!.id
        }
    });

    const presence = await prisma.presence.findFirst({
        where: {
            userId: session!.id,
            date: currentTime
        }
    });

    if(vacation || presence) throw ErrorMsg.unprocessableEntity;

    await prisma.presence.create({
        data: {
            userId: session!.id,
            date: currentTime,
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
