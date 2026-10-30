// Season start date - adjusted so current week = week 4
function getSeasonStartDate() {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const monday = new Date(today);
  monday.setDate(monday.getDate() - daysToMonday);
  monday.setHours(0, 0, 0, 0);
  // Go back 3 weeks (21 days) to make current week = week 4
  monday.setDate(monday.getDate() - 21);
  return monday;
}

export const SEASON_START_DATE = getSeasonStartDate();

export function getCurrentWeek() {
  const today = new Date();
  const daysSinceStart = Math.floor((today.getTime() - SEASON_START_DATE.getTime()) / (1000 * 60 * 60 * 24));
  const weekNumber = Math.floor(daysSinceStart / 7) + 1;
  return Math.max(1, weekNumber);
}

export function getWeekDates(weekNumber: number) {
  const weekStart = new Date(SEASON_START_DATE);
  weekStart.setDate(weekStart.getDate() + (weekNumber - 1) * 7);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  return { start: weekStart, end: weekEnd };
}

export function getWeekNumberForDate(date: Date | string) {
  const d = new Date(date);
  const daysSinceStart = Math.floor((d.getTime() - SEASON_START_DATE.getTime()) / (1000 * 60 * 60 * 24));
  const weekNumber = Math.floor(daysSinceStart / 7) + 1;
  return Math.max(1, weekNumber);
}

export function formatDateRange(start: Date, end: Date) {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const startMonth = months[start.getMonth()];
  const endMonth = months[end.getMonth()];
  const startDay = start.getDate();
  const endDay = end.getDate();

  if (start.getMonth() === end.getMonth()) {
    return `${startMonth} ${startDay} - ${endDay}`;
  }
  return `${startMonth} ${startDay} - ${endMonth} ${endDay}`;
}
