import { DailyData } from "@/types/cantine";

export interface MonthlyData {
  month: string;
  monthIndex: number;
  totalCoutBio: number;
  totalCoutConventionnel: number;
  totalCoutSigo: number;
  totalEnfantsCantine: number;
  totalEnfantsALSH: number;
  totalPrimaires: number;
  totalMaternelles: number;
  totalDechetsPrimaires: number;
  totalDechetsMaternelles: number;
  totalHeuresAgent: number;
  totalFraisPersonnel: number;
  heuresAgentCantine: number;
  heuresAgentALSH: number;
  fraisPersonnelCantine: number;
  fraisPersonnelALSH: number;
}

const monthNames = [
  'Sept', 'Oct', 'Nov', 'Déc', 'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'
];

export const aggregateByMonth = (data: DailyData[], selectedMonth: string): MonthlyData[] => {
  // Pour la démo, on simule des données sur plusieurs mois
  // En production, on grouperait par le mois réel de chaque entrée
  
  // Pour l'instant, on utilise les données du mois sélectionné comme base
  const [year, month] = selectedMonth.split('-').map(Number);
  
  // Calculer les totaux du mois actuel
  const monthData = data.reduce((acc, d) => {
    const isCantine = d.nbEnfantsCantine !== null;
    const isALSH = d.nbEnfantsALSH !== null;
    
    return {
      totalCoutBio: acc.totalCoutBio + (d.coutBio || 0),
      totalCoutConventionnel: acc.totalCoutConventionnel + (d.coutConventionnel || 0),
      totalCoutSigo: acc.totalCoutSigo + (d.coutSigo || 0),
      totalEnfantsCantine: acc.totalEnfantsCantine + (d.nbEnfantsCantine || 0),
      totalEnfantsALSH: acc.totalEnfantsALSH + (d.nbEnfantsALSH || 0),
      totalPrimaires: acc.totalPrimaires + (d.primairesReel || 0),
      totalMaternelles: acc.totalMaternelles + (d.maternellesReel || 0),
      totalDechetsPrimaires: acc.totalDechetsPrimaires + (d.dechetPrimairePoids || 0),
      totalDechetsMaternelles: acc.totalDechetsMaternelles + (d.dechetMaternellePoids || 0),
      totalHeuresAgent: acc.totalHeuresAgent + (d.agentHeuresTravail || 0),
      totalFraisPersonnel: acc.totalFraisPersonnel + (d.agentFraisPerso || 0),
      heuresAgentCantine: acc.heuresAgentCantine + (isCantine ? (d.agentHeuresTravail || 0) : 0),
      heuresAgentALSH: acc.heuresAgentALSH + (isALSH ? (d.agentHeuresTravail || 0) : 0),
      fraisPersonnelCantine: acc.fraisPersonnelCantine + (isCantine ? (d.agentFraisPerso || 0) : 0),
      fraisPersonnelALSH: acc.fraisPersonnelALSH + (isALSH ? (d.agentFraisPerso || 0) : 0),
    };
  }, {
    totalCoutBio: 0,
    totalCoutConventionnel: 0,
    totalCoutSigo: 0,
    totalEnfantsCantine: 0,
    totalEnfantsALSH: 0,
    totalPrimaires: 0,
    totalMaternelles: 0,
    totalDechetsPrimaires: 0,
    totalDechetsMaternelles: 0,
    totalHeuresAgent: 0,
    totalFraisPersonnel: 0,
    heuresAgentCantine: 0,
    heuresAgentALSH: 0,
    fraisPersonnelCantine: 0,
    fraisPersonnelALSH: 0,
  });

  // Générer des données simulées pour l'année scolaire
  // Le mois en cours utilise les vraies données, les autres sont des estimations
  const schoolYearMonths = monthNames.map((name, index) => {
    const isCurrentMonth = index === (month - 9 + 12) % 12; // Calcul pour année scolaire sept-juin
    
    if (isCurrentMonth && data.length > 0) {
      return {
        month: name,
        monthIndex: index,
        ...monthData,
      };
    }
    
    // Données simulées pour les autres mois (variation aléatoire de ±20%)
    const variation = () => 0.8 + Math.random() * 0.4;
    return {
      month: name,
      monthIndex: index,
      totalCoutBio: monthData.totalCoutBio * variation(),
      totalCoutConventionnel: monthData.totalCoutConventionnel * variation(),
      totalCoutSigo: monthData.totalCoutSigo * variation(),
      totalEnfantsCantine: Math.round(monthData.totalEnfantsCantine * variation()),
      totalEnfantsALSH: Math.round(monthData.totalEnfantsALSH * variation()),
      totalPrimaires: Math.round(monthData.totalPrimaires * variation()),
      totalMaternelles: Math.round(monthData.totalMaternelles * variation()),
      totalDechetsPrimaires: monthData.totalDechetsPrimaires * variation(),
      totalDechetsMaternelles: monthData.totalDechetsMaternelles * variation(),
      totalHeuresAgent: monthData.totalHeuresAgent * variation(),
      totalFraisPersonnel: monthData.totalFraisPersonnel * variation(),
      heuresAgentCantine: monthData.heuresAgentCantine * variation(),
      heuresAgentALSH: monthData.heuresAgentALSH * variation(),
      fraisPersonnelCantine: monthData.fraisPersonnelCantine * variation(),
      fraisPersonnelALSH: monthData.fraisPersonnelALSH * variation(),
    };
  });

  return schoolYearMonths;
};
