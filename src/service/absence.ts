import prisma from '../db/db';
import cron from "node-cron";
import { authorizeUser } from './user';
import { holidayDays } from '../config/free_days';
import { ErrorMsg } from '../config/config';

cron.schedule("0 0 * * *", async () => {
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
            id: true
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
            userId: session!.userId,
            date: currentTime
        }
    });

    if(count === 0) throw ErrorMsg.notFound;
}