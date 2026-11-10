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
  sommeCoutMatiereParEnfant: number;
  nbJoursCoutMatiere: number;
  sommeCoutPersonnelParEnfant: number;
  nbJoursCoutPersonnel: number;
  coutMatiereParEnfant: number;
  coutPersonnelParEnfant: number;
}

const monthNames = [
  'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc'
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
    sommeCoutMatiereParEnfant: number;
    nbJoursCoutMatiere: number;
    sommeCoutPersonnelParEnfant: number;
    nbJoursCoutPersonnel: number;
  }> = {};

  // Initialiser tous les mois de l'année civile
  for (let i = 0; i < 12; i++) {
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
      sommeCoutMatiereParEnfant: 0,
      nbJoursCoutMatiere: 0,
      sommeCoutPersonnelParEnfant: 0,
      nbJoursCoutPersonnel: 0,
    };
  }

  // Agréger les données réelles
  data.forEach((d) => {
    const date = parseFrenchDate(d.date);
    if (!date) return;

    // Index d'année civile (Jan=0, ..., Déc=11)
    const schoolYearIndex = date.getMonth();

    const isCantine = d.nbEnfantsCantine !== null;
    const duringHolidays = isSchoolHoliday(date);
    const wednesdayOutsideHolidays = isWednesday(date) && !duringHolidays;

    monthlyTotals[schoolYearIndex].totalCoutBio += d.coutBio || 0;
    monthlyTotals[schoolYearIndex].totalCoutConventionnel += d.coutConventionnel || 0;
    monthlyTotals[schoolYearIndex].totalCoutSiqo += d.coutSiqo || 0;

    // Repas Cantine = colonne Repas Enf. Cantine telle quelle
    monthlyTotals[schoolYearIndex].totalEnfantsCantine += d.nbEnfantsCantine || 0;

    // Répartition de la colonne Repas Enf. ALSH selon le calendrier
    const repasAlshCol = d.nbEnfantsALSH || 0;
    if (wednesdayOutsideHolidays) {
      // Mercredi hors vacances → Repas Mercredi
      monthlyTotals[schoolYearIndex].totalRepasMercredi += repasAlshCol;
    } else {
      // Vacances scolaires (mercredis de vacances inclus) et autres → Repas ALSH
      monthlyTotals[schoolYearIndex].totalEnfantsALSH += repasAlshCol;
    }
    monthlyTotals[schoolYearIndex].totalPrimaires += d.primairesReel || 0;
    monthlyTotals[schoolYearIndex].totalMaternelles += d.maternellesReel || 0;
    monthlyTotals[schoolYearIndex].totalDechetsPrimaires += d.dechetPrimairePoids || 0;
    monthlyTotals[schoolYearIndex].totalDechetsMaternelles += d.dechetMaternellePoids || 0;
    monthlyTotals[schoolYearIndex].totalHeuresAgent += d.agentHeuresTravail || 0;
    monthlyTotals[schoolYearIndex].totalFraisPersonnel += d.agentFraisPerso || 0;

    // Moyenne des colonnes "Coût MAT./ENFANT" et "Coût PERS./ENFANT" (jours renseignés)
    if (d.coutMatiereParEnfant !== null && d.coutMatiereParEnfant !== undefined) {
      monthlyTotals[schoolYearIndex].sommeCoutMatiereParEnfant += d.coutMatiereParEnfant;
      monthlyTotals[schoolYearIndex].nbJoursCoutMatiere += 1;
    }
    if (d.coutPersonnelParEnfant !== null && d.coutPersonnelParEnfant !== undefined) {
      monthlyTotals[schoolYearIndex].sommeCoutPersonnelParEnfant += d.coutPersonnelParEnfant;
      monthlyTotals[schoolYearIndex].nbJoursCoutPersonnel += 1;
    }

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
  return monthNames.map((name, index) => {
    const totals = monthlyTotals[index];
    return {
      month: name,
      monthIndex: index,
      ...totals,
      coutMatiereParEnfant:
        totals.nbJoursCoutMatiere > 0
          ? totals.sommeCoutMatiereParEnfant / totals.nbJoursCoutMatiere
          : 0,
      coutPersonnelParEnfant:
        totals.nbJoursCoutPersonnel > 0
          ? totals.sommeCoutPersonnelParEnfant / totals.nbJoursCoutPersonnel
          : 0,
    };
  });
};
