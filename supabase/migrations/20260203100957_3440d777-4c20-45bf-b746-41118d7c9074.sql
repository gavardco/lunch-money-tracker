-- Créer la table pour stocker les données de cantine
CREATE TABLE public.daily_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date TEXT NOT NULL UNIQUE,
  nb_enfants_alsh INTEGER,
  nb_enfants_cantine INTEGER,
  cout_conventionnel DECIMAL,
  cout_bio DECIMAL,
  cout_siqo DECIMAL,
  prix_revient_moyen DECIMAL,
  cout_eau_par_enfant DECIMAL,
  cout_pain_bio_par_enfant DECIMAL,
  cout_pain_conv_par_enfant DECIMAL,
  cout_matiere_par_enfant DECIMAL,
  agent_heures_travail DECIMAL,
  agent_frais_perso DECIMAL,
  cout_personnel_par_enfant DECIMAL,
  primaires_reel INTEGER,
  primaires_7h INTEGER,
  maternelles_reel INTEGER,
  maternelles_7h INTEGER,
  repas_adultes INTEGER,
  mercredi INTEGER,
  o_merveilles_alsh INTEGER,
  adulte_o_merveilles_alsh INTEGER,
  dechet_primaire_nb_enfants INTEGER,
  dechet_primaire_poids DECIMAL,
  dechet_primaire_par_enfant DECIMAL,
  dechet_maternelle_nb_enfants INTEGER,
  dechet_maternelle_poids DECIMAL,
  dechet_maternelle_par_enfant DECIMAL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Activer RLS
ALTER TABLE public.daily_data ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre la lecture publique (pas d'authentification requise pour ce cas)
CREATE POLICY "Allow public read access"
ON public.daily_data
FOR SELECT
USING (true);

-- Politique pour permettre les insertions publiques
CREATE POLICY "Allow public insert access"
ON public.daily_data
FOR INSERT
WITH CHECK (true);

-- Politique pour permettre les mises à jour publiques
CREATE POLICY "Allow public update access"
ON public.daily_data
FOR UPDATE
USING (true);

-- Politique pour permettre les suppressions publiques
CREATE POLICY "Allow public delete access"
ON public.daily_data
FOR DELETE
USING (true);

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_daily_data_updated_at
BEFORE UPDATE ON public.daily_data
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();