import prisma from '../db/db';
import cron from "node-cron";
import { authorizeAdmin, authorizeUser } from './user';
import { holidayDays } from '../tools/free_days';
import { ErrorMsg } from '../config/config';

cron.schedule("0 1 * * *", async () => {
    const currentTime = new Date();
    currentTime.setUTCHours(0, 0, 0, 0);
    if (currentTime.getDay() == 0 || currentTime.getDay() == 6) return;

    const freeDays = holidayDays(currentTime.getFullYear());

    for (const day of freeDays) {
        if (currentTime.getDate() === day[0] && currentTime.getMonth() + 1 == day[1]) {
            return;
        }
    }

    const users = await prisma.user.findMany({
        select: {
            id: true,
        },
        where: {
            NOT: {
                vacations: {
                    some: {
                        from: {
                            lte: currentTime
                        },
                        to: {
                            gte: currentTime
                        }
                    }
                }
            },
            admin: false
        }
    });

    const data = users.map((user) => ({ userId: user.id, date: currentTime }));

    await prisma.absence.createMany({
        data
    });
});

export async function cancelAbsence(token: string): Promise<void> {
    const session = await authorizeUser(token);

    const currentTime = new Date();
    currentTime.setUTCHours(0, 0, 0, 0);
    const { count } = await prisma.absence.deleteMany({
        where: {
            userId: session!.id,
            date: currentTime
        }
    });

    if(count === 0) throw ErrorMsg.notFound;
}

export async function asbsencePresent(token: string): Promise<boolean> {
    const session = await authorizeUser(token);

    const currentTime = new Date();
    currentTime.setUTCHours(0, 0, 0, 0);

    const asbsence = await prisma.absence.findFirst({
        where: {
            userId: session!.id,
            date: currentTime
        }
    });

    return !!asbsence;
}

export async function deleteAbsence(userId: string, date: Date, token: string): Promise<void> {
    await authorizeAdmin(token);

    const { count } = await prisma.absence.deleteMany({
        where: {
            userId,
            date
        }
    });

    if(count === 0) throw ErrorMsg.notFound;
}
