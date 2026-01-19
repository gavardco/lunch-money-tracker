export interface DailyData {
  date: number;
  nbEnfantsALSH: number | null;
  nbEnfantsCantine: number | null;
  coutConventionnel: number | null;
  coutBio: number | null;
  coutSigo: number | null;
  prixRevientMoyen: number | null;
  coutEauParEnfant: number | null;
  coutPainBioParEnfant: number | null;
  coutPainConvParEnfant: number | null;
  coutMaterielParEnfant: number | null;
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
  totalCoutSigo: number;
  coutMoyenParEnfant: number;
  totalDechets: number;
}
