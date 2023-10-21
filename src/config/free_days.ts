function first_easter_day(year: number): [number, number] {
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const p = (h + l - 7 * m + 114) % 31 + 1;
    const q = Math.floor((h + l - 7 * m + 114) / 31);

    return [p, q];
}

export function free_days(year: number): [number, number][] {
    const easter_day = first_easter_day(year);
    const second_easter_day = convertNumbersToDate(year, easter_day[1], easter_day[0]);
    second_easter_day.setDate(second_easter_day.getDate() + 1);

    const pfingsten = convertNumbersToDate(year, easter_day[1], easter_day[0]);
    pfingsten.setDate(pfingsten.getDate() + 49);

    const corpus_christi = convertNumbersToDate(year, easter_day[1], easter_day[0]);
    corpus_christi.setDate(corpus_christi.getDate() + 60);

    // free day is when it is neither a saturday nor a sunday, otherwise its a weekend-day
    const possibleFreeDays: [number, number][] = [
        [1, 1],
        [6, 1],
        easter_day,
        [second_easter_day.getDate(), second_easter_day.getMonth() + 1],
        [1, 5],
        [3, 5],
        [pfingsten.getDate(), pfingsten.getMonth() + 1],
        [corpus_christi.getDate(), corpus_christi.getMonth() + 1],
        [15, 8],
        [1, 11],
        [11, 11],
        [25, 12],
        [26, 12]
    ];

    const result = [];
    for (const possibleFreeDay of possibleFreeDays) {
        const tmpDate = convertNumbersToDate(year, possibleFreeDay[1], possibleFreeDay[0]);
        if (tmpDate.getDay() !== 0 && tmpDate.getDay() !== 6) {
            result.push(possibleFreeDay);
        }
    }
    return result;
}

export function count_free_days_in_month(year: number, month: number, startDate: Date, endDate: Date): number {
    const freeDays = free_days(year);
    let res = 0;
    for (const day of freeDays) {
        const date = convertNumbersToDate(year, day[1], day[0]);

        res += + (day[1] === month && date >= startDate && date <= endDate);
    }

    return res;
}

export function convertNumbersToDate(year: number, month: number, day: number): Date {
    let newMonth = month.toString();
    if (newMonth.length < 2) newMonth = "0" + month.toString();
    let newDay = day.toString();
    if (newDay.length < 2) newDay = "0" + day.toString();
    return new Date(`${year}-${newMonth}-${newDay}T00:00:00.000Z`);
}
