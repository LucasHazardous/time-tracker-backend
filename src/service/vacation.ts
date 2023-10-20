import prisma from '../db/db';
import { authorizeUser } from './user';
import { free_days } from "../config/free_days";

export async function createVacation(from: Date, to: Date, category: string, token: string): Promise<void> {
    const session = await authorizeUser(token);

    let alreadyFree = 0;

    const startYear = from.getFullYear();
    const endYear = to.getFullYear();
    
    for(let year = startYear; year <= endYear; year++) {
        for(const freeDay of free_days(year)) {
            const freeDayDate = new Date(year, freeDay[1]-1, freeDay[0]);

            alreadyFree +=+ (freeDayDate >= from && freeDayDate <= to);
        }
    }

    let count = 0;
    while (from <= to) {
        const dayOfWeek = from.getDay();
        count +=+ (dayOfWeek >= 1 && dayOfWeek <= 5);
        from.setDate(from.getDate() + 1);
    }

    const workdays = count-alreadyFree;

    await prisma.vacation.create({
        data: {
            userId: session!.userId,
            from,
            to,
            days: workdays,
            category
        }
    });
}
