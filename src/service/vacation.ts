import prisma from '../db/db';
import { authorizeUser } from './user';
import { convertNumbersToDate, countFreeDaysInMonth } from "../config/free_days";
import { ErrorMsg } from '../config/config';

export async function createVacation(from: Date, to: Date, category: string, token: string): Promise<number> {
    const session = await authorizeUser(token);

    const interference = await prisma.vacation.findFirst({
        where: {
            from: {
                lte: to
            },
            to: {
                gte: from
            }
        }
    });

    if(interference) {
        console.log("no");
        throw ErrorMsg.alreadyExistsErrorMsg;
    }

    const fromOriginal = new Date(from);

    let finalCount = 0;
    let holiday = 0;
    let count = 0;

    while (from < to) {
        const dayOfWeek = from.getDay();
        count += + (dayOfWeek >= 1 && dayOfWeek <= 5);

        if (isLastDayOfMonth(from)) {
            const holidayDays = countFreeDaysInMonth(from.getFullYear(), from.getMonth() + 1, fromOriginal, to);
            holiday += holidayDays;
            count -= holidayDays;

            await prisma.vacation.create({
                data: {
                    userId: session!.userId,
                    from: new Date(Math.max(fromOriginal.getTime(), convertNumbersToDate(from.getFullYear(), from.getMonth() + 1, 1).getTime())),
                    to: removeHourFromDate(from),
                    days: count,
                    category
                }
            });

            finalCount += count;
            count = 0;
        }

        from.setDate(from.getDate() + 1);
    }

    const dayOfWeek = from.getDay();
    count += + (dayOfWeek >= 1 && dayOfWeek <= 5);
    const holidayDays = countFreeDaysInMonth(from.getFullYear(), from.getMonth() + 1, fromOriginal, to);
    holiday += holidayDays;
    count -= holidayDays;

    await prisma.vacation.create({
        data: {
            userId: session!.userId,
            from: new Date(Math.max(fromOriginal.getTime(), convertNumbersToDate(from.getFullYear(), from.getMonth() + 1, 1).getTime())),
            to: removeHourFromDate(from),
            days: count,
            category
        }
    });

    finalCount += count;

    console.log(finalCount, holiday);

    return finalCount;
}

function isLastDayOfMonth(date: Date): boolean {
    const nextDay = new Date(date);
    nextDay.setDate(date.getDate() + 1);
    return nextDay.getDate() === 1;
}

function removeHourFromDate(date: Date): Date {
    const newDate = new Date(date);
    newDate.setUTCHours(0, 0, 0, 0);
    return newDate;
}
