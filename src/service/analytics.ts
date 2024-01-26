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
                    username: true,
                    presences: {
                        select: {
                            type: true
                        }
                    }
                }, where: {
                    presences: {
                        some: {
                            date: currentDay
                        }
                    },
                    admin: false
                }
            });

            resolve(users.map(res => ({
                ...res,
                status: 'obecny'
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
                    },
                    admin: false
                }
            });

            resolve(users.map(res => ({
                ...res,
                status: 'urlop'
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
                                }
                            },
                            {
                                presences: {
                                    some: {
                                        date: currentDay
                                    }
                                }
                            }
                        ]
                    },
                    admin: false
                }
            });

            resolve(users.map(res => ({
                ...res,
                status: 'nieobecny'
            })));
        })
    ]);

    return {
        data: data.flat()
    };
}

export async function getCsv(year: string, month: string, token: string): Promise<string> {
    await authorizeAdmin(token);

    return json2csv(
        await prisma.$queryRaw`
            SELECT User.username AS username, COUNT(Presence.id) AS presences, CONVERT(COALESCE(SUM(Vacation.days), 0), INT) AS vacations
            FROM User
            LEFT JOIN Presence ON User.id=Presence.userId AND (YEAR(Presence.date)=${year} AND MONTH(Presence.date)=${month})
            LEFT JOIN Vacation ON User.id=Vacation.userId AND (YEAR(Vacation.from)=${year} AND MONTH(Vacation.from)=${month})
            WHERE User.admin=0
            GROUP BY User.id;
        `
    );
}
