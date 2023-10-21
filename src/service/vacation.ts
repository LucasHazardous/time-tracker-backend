import prisma from '../db/db';
import { authorizeUser } from './user';
import { convertNumbersToDate, count_free_days_in_month } from "../config/free_days";

export async function createVacation(from: Date, to: Date, category: string, token: string): Promise<number> {
    const session = await authorizeUser(token);
    const fromOriginal = new Date(from);

    let finalCount = 0;
    let holiday = 0;
    let count = 0;

    while (from <= to) {
        const dayOfWeek = from.getDay();
        count += + (dayOfWeek >= 1 && dayOfWeek <= 5);

        if (isLastDayOfMonth(from)) {
            const holidayDays = count_free_days_in_month(from.getFullYear(), from.getMonth() + 1, fromOriginal, to);
            holiday += holidayDays;
            count -= holidayDays;

            await prisma.vacation.create({
                data: {
                    userId: session!.userId,
                    from: new Date(Math.max(fromOriginal.getTime(), convertNumbersToDate(from.getFullYear(), from.getMonth() + 1, 1).getTime())),
                    to: from,
                    days: count,
                    category
                }
            });

            finalCount += count;
            count = 0;
        }

        from.setDate(from.getDate() + 1);
    }

    await prisma.vacation.create({
        data: {
            userId: session!.userId,
            from: new Date(Math.max(fromOriginal.getTime(), convertNumbersToDate(from.getFullYear(), from.getMonth() + 1, 1).getTime())),
            to: from,
            days: count,
            category
        }
    });
    finalCount += count;

    return finalCount;
}

function isLastDayOfMonth(date: Date): boolean {
    const nextDay = new Date(date);
    nextDay.setDate(date.getDate() + 1);
    return nextDay.getDate() === 1;
}
