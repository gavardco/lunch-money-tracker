// Vacances scolaires — Zone B (France)
// Chaque période : [premier jour de vacances, dernier jour de vacances] inclus
// (le jour de reprise n'est PAS inclus)

const holidayRanges: Array<[string, string]> = [
  // 2024-2025
  ["2024-10-19", "2024-11-03"], // Toussaint
  ["2024-12-21", "2025-01-05"], // Noël
  ["2025-02-22", "2025-03-09"], // Hiver
  ["2025-04-19", "2025-05-04"], // Printemps
  ["2025-07-05", "2025-08-31"], // Été
  // 2025-2026
  ["2025-10-18", "2025-11-02"], // Toussaint
  ["2025-12-20", "2026-01-04"], // Noël
  ["2026-02-14", "2026-03-01"], // Hiver
  ["2026-04-11", "2026-04-26"], // Printemps
  ["2026-07-04", "2026-08-31"], // Été
  // 2026-2027
  ["2026-10-17", "2026-11-01"], // Toussaint
  ["2026-12-19", "2027-01-03"], // Noël
  ["2027-02-13", "2027-02-28"], // Hiver
  ["2027-04-10", "2027-04-25"], // Printemps
  ["2027-07-03", "2027-08-31"], // Été
];

const parsedRanges = holidayRanges.map(([start, end]) => [
  new Date(start + "T00:00:00").getTime(),
  new Date(end + "T23:59:59").getTime(),
] as const);

export const isSchoolHoliday = (date: Date): boolean => {
  const t = date.getTime();
  return parsedRanges.some(([s, e]) => t >= s && t <= e);
};

export const isWednesday = (date: Date): boolean => date.getDay() === 3;
