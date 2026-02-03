import { useState, useEffect, useCallback } from "react";
import { DailyData, parseFrenchDate } from "@/types/cantine";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Mapping entre DailyData et la base de données
const mapToDb = (entry: DailyData) => ({
  date: entry.date,
  nb_enfants_alsh: entry.nbEnfantsALSH,
  nb_enfants_cantine: entry.nbEnfantsCantine,
  cout_conventionnel: entry.coutConventionnel,
  cout_bio: entry.coutBio,
  cout_siqo: entry.coutSiqo,
  prix_revient_moyen: entry.prixRevientMoyen,
  cout_eau_par_enfant: entry.coutEauParEnfant,
  cout_pain_bio_par_enfant: entry.coutPainBioParEnfant,
  cout_pain_conv_par_enfant: entry.coutPainConvParEnfant,
  cout_matiere_par_enfant: entry.coutMatiereParEnfant,
  agent_heures_travail: entry.agentHeuresTravail,
  agent_frais_perso: entry.agentFraisPerso,
  cout_personnel_par_enfant: entry.coutPersonnelParEnfant,
  primaires_reel: entry.primairesReel,
  primaires_7h: entry.primaires7h,
  maternelles_reel: entry.maternellesReel,
  maternelles_7h: entry.maternelles7h,
  repas_adultes: entry.repasAdultes,
  mercredi: entry.mercredi,
  o_merveilles_alsh: entry.oMerveillesALSH,
  adulte_o_merveilles_alsh: entry.adulteOMerveillesALSH,
  dechet_primaire_nb_enfants: entry.dechetPrimaireNbEnfants,
  dechet_primaire_poids: entry.dechetPrimairePoids,
  dechet_primaire_par_enfant: entry.dechetPrimaireParEnfant,
  dechet_maternelle_nb_enfants: entry.dechetMaternelleNbEnfants,
  dechet_maternelle_poids: entry.dechetMaternellePoids,
  dechet_maternelle_par_enfant: entry.dechetMaternelleParEnfant,
});

const mapFromDb = (row: Record<string, unknown>): DailyData => ({
  date: row.date as string,
  nbEnfantsALSH: row.nb_enfants_alsh as number | null,
  nbEnfantsCantine: row.nb_enfants_cantine as number | null,
  coutConventionnel: row.cout_conventionnel as number | null,
  coutBio: row.cout_bio as number | null,
  coutSiqo: row.cout_siqo as number | null,
  prixRevientMoyen: row.prix_revient_moyen as number | null,
  coutEauParEnfant: row.cout_eau_par_enfant as number | null,
  coutPainBioParEnfant: row.cout_pain_bio_par_enfant as number | null,
  coutPainConvParEnfant: row.cout_pain_conv_par_enfant as number | null,
  coutMatiereParEnfant: row.cout_matiere_par_enfant as number | null,
  agentHeuresTravail: row.agent_heures_travail as number | null,
  agentFraisPerso: row.agent_frais_perso as number | null,
  coutPersonnelParEnfant: row.cout_personnel_par_enfant as number | null,
  primairesReel: row.primaires_reel as number | null,
  primaires7h: row.primaires_7h as number | null,
  maternellesReel: row.maternelles_reel as number | null,
  maternelles7h: row.maternelles_7h as number | null,
  repasAdultes: row.repas_adultes as number | null,
  mercredi: row.mercredi as number | null,
  oMerveillesALSH: row.o_merveilles_alsh as number | null,
  adulteOMerveillesALSH: row.adulte_o_merveilles_alsh as number | null,
  dechetPrimaireNbEnfants: row.dechet_primaire_nb_enfants as number | null,
  dechetPrimairePoids: row.dechet_primaire_poids as number | null,
  dechetPrimaireParEnfant: row.dechet_primaire_par_enfant as number | null,
  dechetMaternelleNbEnfants: row.dechet_maternelle_nb_enfants as number | null,
  dechetMaternellePoids: row.dechet_maternelle_poids as number | null,
  dechetMaternelleParEnfant: row.dechet_maternelle_par_enfant as number | null,
});

export const useCanteenData = () => {
  const [data, setData] = useState<DailyData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });

  // Charger les données depuis Supabase
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: rows, error } = await supabase
        .from("daily_data")
        .select("*")
        .order("date", { ascending: true });

      if (error) {
        console.error("Erreur chargement données:", error);
        toast.error("Erreur lors du chargement des données");
        return;
      }

      const mappedData = (rows || []).map(mapFromDb);
      // Trier par date
      const sortedData = mappedData.sort((a, b) => {
        const dateA = parseFrenchDate(a.date);
        const dateB = parseFrenchDate(b.date);
        if (!dateA || !dateB) return 0;
        return dateA.getTime() - dateB.getTime();
      });
      setData(sortedData);
    } catch (err) {
      console.error("Erreur inattendue:", err);
      toast.error("Erreur inattendue");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Ajouter une nouvelle entrée
  const addEntry = useCallback(async (entry: DailyData) => {
    try {
      const { error } = await supabase
        .from("daily_data")
        .insert(mapToDb(entry));

      if (error) {
        console.error("Erreur ajout:", error);
        toast.error("Erreur lors de l'ajout");
        return;
      }

      toast.success("Entrée ajoutée");
      fetchData();
    } catch (err) {
      console.error("Erreur inattendue:", err);
      toast.error("Erreur inattendue");
    }
  }, [fetchData]);

  // Mettre à jour une entrée existante
  const updateEntry = useCallback(async (originalDate: string, entry: DailyData) => {
    try {
      const { error } = await supabase
        .from("daily_data")
        .update(mapToDb(entry))
        .eq("date", originalDate);

      if (error) {
        console.error("Erreur mise à jour:", error);
        toast.error("Erreur lors de la mise à jour");
        return;
      }

      toast.success("Entrée mise à jour");
      fetchData();
    } catch (err) {
      console.error("Erreur inattendue:", err);
      toast.error("Erreur inattendue");
    }
  }, [fetchData]);

  // Supprimer une entrée
  const deleteEntry = useCallback(async (date: string) => {
    try {
      const { error } = await supabase
        .from("daily_data")
        .delete()
        .eq("date", date);

      if (error) {
        console.error("Erreur suppression:", error);
        toast.error("Erreur lors de la suppression");
        return;
      }

      toast.success("Entrée supprimée");
      fetchData();
    } catch (err) {
      console.error("Erreur inattendue:", err);
      toast.error("Erreur inattendue");
    }
  }, [fetchData]);

  // Importer des données (remplace les existantes avec les mêmes dates)
  const importData = useCallback(async (importedData: DailyData[]) => {
    try {
      // Upsert pour remplacer les données existantes avec les mêmes dates
      const dbData = importedData.map(mapToDb);
      
      const { error } = await supabase
        .from("daily_data")
        .upsert(dbData, { onConflict: "date" });

      if (error) {
        console.error("Erreur import:", error);
        toast.error("Erreur lors de l'import");
        return;
      }

      toast.success(`${importedData.length} entrées importées`);
      fetchData();
    } catch (err) {
      console.error("Erreur inattendue:", err);
      toast.error("Erreur inattendue");
    }
  }, [fetchData]);

  // Réinitialiser (supprimer toutes les données)
  const resetToSample = useCallback(async () => {
    try {
      const { error } = await supabase
        .from("daily_data")
        .delete()
        .neq("date", ""); // Supprimer tout

      if (error) {
        console.error("Erreur reset:", error);
        toast.error("Erreur lors de la réinitialisation");
        return;
      }

      toast.success("Données réinitialisées");
      fetchData();
    } catch (err) {
      console.error("Erreur inattendue:", err);
      toast.error("Erreur inattendue");
    }
  }, [fetchData]);

  return {
    data,
    isLoading,
    selectedMonth,
    setSelectedMonth,
    addEntry,
    updateEntry,
    deleteEntry,
    importData,
    resetToSample,
    refetch: fetchData,
  };
};
