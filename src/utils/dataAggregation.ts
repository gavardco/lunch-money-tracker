import { DailyData, parseFrenchDate } from "@/types/cantine";

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
    const isALSH = d.nbEnfantsALSH !== null;

    monthlyTotals[schoolYearIndex].totalCoutBio += d.coutBio || 0;
    monthlyTotals[schoolYearIndex].totalCoutConventionnel += d.coutConventionnel || 0;
    monthlyTotals[schoolYearIndex].totalCoutSiqo += d.coutSiqo || 0;
    monthlyTotals[schoolYearIndex].totalEnfantsCantine += d.nbEnfantsCantine || 0;
    monthlyTotals[schoolYearIndex].totalEnfantsALSH += d.nbEnfantsALSH || 0;
    monthlyTotals[schoolYearIndex].totalRepasMercredi += d.mercredi || 0;
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
    if (isALSH) {
      monthlyTotals[schoolYearIndex].heuresAgentALSH += d.agentHeuresTravail || 0;
      monthlyTotals[schoolYearIndex].fraisPersonnelALSH += d.agentFraisPerso || 0;
    }
    // Heures agent pour les mercredis (basé sur le nombre de repas mercredi)
    if (d.mercredi && d.mercredi > 0) {
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
