import prisma from '../db/db';
import { authorizeAdmin, authorizeUser } from './user';
import { convertNumbersToDate, countFreeDaysInMonth } from "../tools/free_days";
import { ErrorMsg } from '../config/config';

export async function deleteVacation(date: Date, userId: string, token: string): Promise<void> {
    await authorizeAdmin(token);

    const { count } = await prisma.vacation.deleteMany({
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

    if(count === 0) throw ErrorMsg.notFound;
}

export async function createVacation(from: Date, to: Date, category: string, token: string): Promise<number> {
    if(!normalizeValidateDates(from, to)) {
        throw ErrorMsg.unprocessableEntity;
    }

    const session = await authorizeUser(token);

    const interference = await prisma.vacation.findFirst({
        where: {
            from: {
                lte: to
            },
            to: {
                gte: from
            },
            userId: session.id
        }
    });

    if(interference) {
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

            if(count > 0) {
                await prisma.vacation.create({
                    data: {
                        userId: session!.id,
                        from: new Date(Math.max(fromOriginal.getTime(), convertNumbersToDate(from.getFullYear(), from.getMonth() + 1, 1).getTime())),
                        to: removeHourFromDate(from),
                        days: count,
                        category
                    }
                });
            }

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

    if(count > 0) {
        await prisma.vacation.create({
            data: {
                userId: session!.id,
                from: new Date(Math.max(fromOriginal.getTime(), convertNumbersToDate(from.getFullYear(), from.getMonth() + 1, 1).getTime())),
                to: removeHourFromDate(from),
                days: count,
                category
            }
        });
    }

    finalCount += count;

    return finalCount;
}

function normalizeValidateDates(from: Date, to: Date): boolean {
    from.setUTCHours(0,0,0,0);
    to.setUTCHours(0,0,0,0);

    const currentDay = new Date();
    currentDay.setUTCHours(0,0,0,0);

    return currentDay <= from && from <= to;
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
