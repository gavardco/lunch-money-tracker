import { DailyData, parseFrenchDate } from "@/types/cantine";
import { isSchoolHoliday, isWednesday } from "@/utils/frenchHolidays";

export interface MonthlyData {
  month: string;
  monthIndex: number;
  totalCoutBio: number;
  totalCoutConventionnel: number;
  totalCoutSiqo: number;
  totalEnfantsCantine: number;
  totalEnfantsALSH: number;
  totalRepasMercredi: number;
  totalPrimaires: number;
  totalMaternelles: number;
  totalDechetsPrimaires: number;
  totalDechetsMaternelles: number;
  totalHeuresAgent: number;
  totalFraisPersonnel: number;
  heuresAgentCantine: number;
  heuresAgentALSH: number;
  heuresAgentMercredi: number;
  fraisPersonnelCantine: number;
  fraisPersonnelALSH: number;
  fraisPersonnelMercredi: number;
}

const monthNames = [
  'Sept', 'Oct', 'Nov', 'Déc', 'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'
];

export const aggregateByMonth = (data: DailyData[], selectedMonth: string): MonthlyData[] => {
  // Grouper les données par mois réel
  const monthlyTotals: Record<number, {
    totalCoutBio: number;
    totalCoutConventionnel: number;
    totalCoutSiqo: number;
    totalEnfantsCantine: number;
    totalEnfantsALSH: number;
    totalRepasMercredi: number;
    totalPrimaires: number;
    totalMaternelles: number;
    totalDechetsPrimaires: number;
    totalDechetsMaternelles: number;
    totalHeuresAgent: number;
    totalFraisPersonnel: number;
    heuresAgentCantine: number;
    heuresAgentALSH: number;
    heuresAgentMercredi: number;
    fraisPersonnelCantine: number;
    fraisPersonnelALSH: number;
    fraisPersonnelMercredi: number;
  }> = {};

  // Initialiser tous les mois de l'année scolaire
  for (let i = 0; i < 10; i++) {
    monthlyTotals[i] = {
      totalCoutBio: 0,
      totalCoutConventionnel: 0,
      totalCoutSiqo: 0,
      totalEnfantsCantine: 0,
      totalEnfantsALSH: 0,
      totalRepasMercredi: 0,
      totalPrimaires: 0,
      totalMaternelles: 0,
      totalDechetsPrimaires: 0,
      totalDechetsMaternelles: 0,
      totalHeuresAgent: 0,
      totalFraisPersonnel: 0,
      heuresAgentCantine: 0,
      heuresAgentALSH: 0,
      heuresAgentMercredi: 0,
      fraisPersonnelCantine: 0,
      fraisPersonnelALSH: 0,
      fraisPersonnelMercredi: 0,
    };
  }

  // Agréger les données réelles
  data.forEach((d) => {
    const date = parseFrenchDate(d.date);
    if (!date) return;

    const month = date.getMonth(); // 0-11
    // Convertir en index d'année scolaire (Sept=0, Oct=1, ..., Juin=9)
    let schoolYearIndex = month >= 8 ? month - 8 : month + 4;
    if (schoolYearIndex < 0 || schoolYearIndex > 9) return;

    const isCantine = d.nbEnfantsCantine !== null;
    const duringHolidays = isSchoolHoliday(date);
    const wednesdayOutsideHolidays = isWednesday(date) && !duringHolidays;

    monthlyTotals[schoolYearIndex].totalCoutBio += d.coutBio || 0;
    monthlyTotals[schoolYearIndex].totalCoutConventionnel += d.coutConventionnel || 0;
    monthlyTotals[schoolYearIndex].totalCoutSiqo += d.coutSiqo || 0;

    // Reclassification des repas selon le calendrier scolaire
    const repasJour =
      (d.nbEnfantsCantine || 0) + (d.nbEnfantsALSH || 0) + (d.mercredi || 0);
    if (duringHolidays) {
      // Vacances scolaires (mercredis de vacances inclus) → ALSH
      monthlyTotals[schoolYearIndex].totalEnfantsALSH += repasJour;
    } else if (wednesdayOutsideHolidays) {
      // Mercredi hors vacances → Mercredi
      monthlyTotals[schoolYearIndex].totalRepasMercredi += repasJour;
    } else {
      // Jour d'école classique → Cantine
      monthlyTotals[schoolYearIndex].totalEnfantsCantine += repasJour;
    }
    monthlyTotals[schoolYearIndex].totalPrimaires += d.primairesReel || 0;
    monthlyTotals[schoolYearIndex].totalMaternelles += d.maternellesReel || 0;
    monthlyTotals[schoolYearIndex].totalDechetsPrimaires += d.dechetPrimairePoids || 0;
    monthlyTotals[schoolYearIndex].totalDechetsMaternelles += d.dechetMaternellePoids || 0;
    monthlyTotals[schoolYearIndex].totalHeuresAgent += d.agentHeuresTravail || 0;
    monthlyTotals[schoolYearIndex].totalFraisPersonnel += d.agentFraisPerso || 0;

    if (isCantine) {
      monthlyTotals[schoolYearIndex].heuresAgentCantine += d.agentHeuresTravail || 0;
      monthlyTotals[schoolYearIndex].fraisPersonnelCantine += d.agentFraisPerso || 0;
    }
    // ALSH = uniquement pendant les vacances scolaires (mercredis de vacances inclus)
    if (duringHolidays) {
      monthlyTotals[schoolYearIndex].heuresAgentALSH += d.agentHeuresTravail || 0;
      monthlyTotals[schoolYearIndex].fraisPersonnelALSH += d.agentFraisPerso || 0;
    }
    // Mercredi = uniquement mercredis hors vacances scolaires
    if (wednesdayOutsideHolidays) {
      monthlyTotals[schoolYearIndex].heuresAgentMercredi += d.agentHeuresTravail || 0;
      monthlyTotals[schoolYearIndex].fraisPersonnelMercredi += d.agentFraisPerso || 0;
    }
  });

  // Générer les données pour tous les mois
  return monthNames.map((name, index) => ({
    month: name,
    monthIndex: index,
    ...monthlyTotals[index],
  }));
};
