export interface DailyData {
  date: string; // Format: "jj/mm/aaaa" (ex: "15/01/2026")
  nbEnfantsALSH: number | null;
  nbEnfantsCantine: number | null;
  coutConventionnel: number | null;
  coutBio: number | null;
  coutSiqo: number | null;
  coutMatiereTotal: number | null; // Calcul auto: Bio + Conv + SIQO
  prixRevientMoyen: number | null;
  coutEauParEnfant: number | null;
  coutPainBioParEnfant: number | null;
  coutPainConvParEnfant: number | null;
  coutMatiereParEnfant: number | null;
  agentHeuresTravail: number | null;
  agentFraisPerso: number | null;
  coutPersonnelParEnfant: number | null;
  primairesReel: number | null;
  primaires7h: number | null;
  maternellesReel: number | null;
  maternelles7h: number | null;
  repasAdultes: number | null;
  mercredi: number | null;
  oMerveillesALSH: number | null;
  adulteOMerveillesALSH: number | null;
  dechetPrimaireNbEnfants: number | null;
  dechetPrimairePoids: number | null;
  dechetPrimaireParEnfant: number | null;
  dechetMaternelleNbEnfants: number | null;
  dechetMaternellePoids: number | null;
  dechetMaternelleParEnfant: number | null;
}

export interface MonthSummary {
  month: string;
  year: number;
  totalEnfants: number;
  totalCoutBio: number;
  totalCoutConventionnel: number;
  totalCoutSiqo: number;
  coutMoyenParEnfant: number;
  totalDechets: number;
}

// Utilitaires de conversion de date
export const formatDateToFrench = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export const parseFrenchDate = (dateStr: string): Date | null => {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const parts = dateStr.split('/');
  if (parts.length !== 3) return null;
  const [day, month, year] = parts.map(Number);
  if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
  return new Date(year, month - 1, day);
};

export const isValidFrenchDate = (dateStr: string): boolean => {
  const regex = /^\d{2}\/\d{2}\/\d{4}$/;
  if (!regex.test(dateStr)) return false;
  const date = parseFrenchDate(dateStr);
  if (!date) return false;
  // Vérifier que la date est valide
  const [day, month, year] = dateStr.split('/').map(Number);
  return date.getDate() === day && date.getMonth() === month - 1 && date.getFullYear() === year;
};

export const getTodayFrenchDate = (): string => {
  return formatDateToFrench(new Date());
};
