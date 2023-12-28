import { authorizeAdmin } from "./user";
import { json2csv } from 'json-2-csv';
import prisma from '../db/db';

export async function todayState(token: string): Promise<{}> {
    await authorizeAdmin(token);

    const currentDay = new Date();
    currentDay.setUTCHours(0, 0, 0, 0);

    const data = await Promise.all([
        new Promise(async (resolve, _) => {
            const users = await prisma.user.findMany({
                select: {
                    id: true,
                    username: true
                }, where: {
                    absences: {
                        some: {
                            date: currentDay
                        }
                    }
                }
            });

            resolve(users.map(res => ({
                ...res,
                status: 'nieobecny'
            })));
        }),
        new Promise(async (resolve, _) => {
            const users = await prisma.user.findMany({
                select: {
                    id: true,
                    username: true
                },
                where: {
                    vacations: {
                        some: {
                            from: {
                                lte: currentDay
                            },
                            to: {
                                gte: currentDay
                            }
                        }
                    }
                }
            });

            resolve(users.map(res => ({
                ...res,
                status: 'wakacje'
            })));
        }),
        new Promise(async (resolve, _) => {
            const users = await prisma.user.findMany({
                select: {
                    id: true,
                    username: true
                },
                where: {
                    NOT: {
                        OR: [
                            {
                                vacations: {
                                    some: {
                                        from: {
                                            lte: currentDay
                                        },
                                        to: {
                                            gte: currentDay
                                        }
                                    }
                                },

                            },
                            {
                                absences: {
                                    some: {
                                        date: currentDay
                                    }
                                }
                            }
                        ]
                    }
                }
            });

            resolve(users.map(res => ({
                ...res,
                status: 'obecny'
            })));
        })
    ]);

    return {
        data: data.flat()
    };
}

export async function getCsv(year: string, month: string, token: string): Promise<string> {
    await authorizeAdmin(token);

    let data: {
        username: string,
        absences: number,
        vacations: number
    }[] = await prisma.$queryRaw`
    SELECT User.username AS username, COUNT(Absence.id) AS absences, CONVERT(COALESCE(SUM(Vacation.days), 0), INT) AS vacations
    FROM User
    LEFT JOIN Absence ON User.id=Absence.userId AND (YEAR(Absence.date)=${year} AND MONTH(Absence.date)=${month})
    LEFT JOIN Vacation ON User.id=Vacation.userId AND (YEAR(Vacation.from)=${year} AND MONTH(Vacation.from)=${month})
    GROUP BY User.id;`;

    return json2csv(data);
}
