import { useState } from "react";
import { DailyData, getTodayFrenchDate, isValidFrenchDate } from "@/types/cantine";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Pencil, Calendar } from "lucide-react";

interface DataFormProps {
  data?: DailyData;
  onSave: (data: DailyData) => void;
  mode: "add" | "edit";
  trigger?: React.ReactNode;
}

const emptyData: DailyData = {
  date: getTodayFrenchDate(),
  nbEnfantsALSH: null,
  nbEnfantsCantine: null,
  coutConventionnel: null,
  coutBio: null,
  coutSiqo: null,
  coutMatiereTotal: null,
  prixRevientMoyen: null,
  coutEauParEnfant: null,
  coutPainBioParEnfant: null,
  coutPainConvParEnfant: null,
  coutMatiereParEnfant: null,
  agentHeuresTravail: null,
  agentFraisPerso: null,
  coutPersonnelParEnfant: null,
  primairesReel: null,
  primaires7h: null,
  maternellesReel: null,
  maternelles7h: null,
  repasAdultes: null,
  mercredi: null,
  oMerveillesALSH: null,
  adulteOMerveillesALSH: null,
  dechetPrimaireNbEnfants: null,
  dechetPrimairePoids: null,
  dechetPrimaireParEnfant: null,
  dechetMaternelleNbEnfants: null,
  dechetMaternellePoids: null,
  dechetMaternelleParEnfant: null,
};

const DataForm = ({ data, onSave, mode, trigger }: DataFormProps) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<DailyData>(data || emptyData);
  const [dateError, setDateError] = useState<string | null>(null);

  const handleOpen = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      setFormData(data || { ...emptyData, date: getTodayFrenchDate() });
      setDateError(null);
    }
  };

  const handleDateChange = (value: string) => {
    // Permettre la saisie libre, validation à la soumission
    setFormData((prev) => ({ ...prev, date: value }));
    
    // Validation en temps réel pour feedback utilisateur
    if (value.length === 10) {
      if (!isValidFrenchDate(value)) {
        setDateError("Format invalide. Utilisez jj/mm/aaaa");
      } else {
        setDateError(null);
      }
    } else {
      setDateError(null);
    }
  };

  const handleChange = (field: keyof DailyData, value: string) => {
    if (field === "date") {
      handleDateChange(value);
      return;
    }
    const numValue = value === "" ? null : parseFloat(value);
    setFormData((prev) => ({ ...prev, [field]: numValue }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Valider la date
    if (!isValidFrenchDate(formData.date)) {
      setDateError("Date invalide. Utilisez le format jj/mm/aaaa (ex: 15/01/2026)");
      return;
    }
    
    // Calculer automatiquement certains champs
    const totalEnfants = (formData.nbEnfantsCantine || 0) + (formData.nbEnfantsALSH || 0);
    const coutMatiereTotal = (formData.coutBio || 0) + (formData.coutConventionnel || 0) + (formData.coutSiqo || 0);
    const coutMatiereParEnfant = totalEnfants > 0 ? coutMatiereTotal / totalEnfants : null;
    const coutPersonnelParEnfant = totalEnfants > 0 && formData.agentFraisPerso 
      ? formData.agentFraisPerso / totalEnfants 
      : null;
    
    const updatedData = {
      ...formData,
      coutMatiereTotal: coutMatiereTotal > 0 ? parseFloat(coutMatiereTotal.toFixed(2)) : null,
      coutMatiereParEnfant: coutMatiereParEnfant ? parseFloat(coutMatiereParEnfant.toFixed(2)) : null,
      coutPersonnelParEnfant: coutPersonnelParEnfant ? parseFloat(coutPersonnelParEnfant.toFixed(2)) : null,
      prixRevientMoyen: totalEnfants > 0 ? parseFloat((coutMatiereTotal / totalEnfants).toFixed(2)) : null,
      dechetPrimaireParEnfant: formData.dechetPrimaireNbEnfants && formData.dechetPrimairePoids 
        ? parseFloat((formData.dechetPrimairePoids / formData.dechetPrimaireNbEnfants).toFixed(3)) 
        : null,
      dechetMaternelleParEnfant: formData.dechetMaternelleNbEnfants && formData.dechetMaternellePoids 
        ? parseFloat((formData.dechetMaternellePoids / formData.dechetMaternelleNbEnfants).toFixed(3)) 
        : null,
    };
    
    onSave(updatedData);
    setOpen(false);
  };

  const InputField = ({ 
    label, 
    field, 
    unit = "", 
    step = "0.01" 
  }: { 
    label: string; 
    field: keyof DailyData; 
    unit?: string;
    step?: string;
  }) => (
    <div className="space-y-1.5">
      <Label htmlFor={field} className="text-sm font-medium">
        {label} {unit && <span className="text-muted-foreground">({unit})</span>}
      </Label>
      <Input
        id={field}
        type="number"
        step={step}
        value={formData[field] ?? ""}
        onChange={(e) => handleChange(field, e.target.value)}
        className="h-9"
        placeholder="—"
      />
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant={mode === "add" ? "default" : "ghost"} size={mode === "add" ? "default" : "icon"}>
            {mode === "add" ? (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter une journée
              </>
            ) : (
              <Pencil className="h-4 w-4" />
            )}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {mode === "add" ? "Ajouter une journée" : `Modifier le ${formData.date}`}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-4">
              <TabsTrigger value="general">Général</TabsTrigger>
              <TabsTrigger value="couts">Coûts</TabsTrigger>
              <TabsTrigger value="effectifs">Effectifs</TabsTrigger>
              <TabsTrigger value="dechets">Déchets</TabsTrigger>
            </TabsList>
            
            <ScrollArea className="h-[400px] pr-4">
              <TabsContent value="general" className="mt-0 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="date" className="text-sm font-medium flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Date <span className="text-muted-foreground">(jj/mm/aaaa)</span>
                    </Label>
                    <Input
                      id="date"
                      type="text"
                      value={formData.date}
                      onChange={(e) => handleDateChange(e.target.value)}
                      className={`h-9 ${dateError ? 'border-destructive' : ''}`}
                      placeholder="15/01/2026"
                      maxLength={10}
                    />
                    {dateError && (
                      <p className="text-xs text-destructive">{dateError}</p>
                    )}
                  </div>
                  <InputField label="Nb enfants cantine" field="nbEnfantsCantine" step="1" />
                  <InputField label="Nb enfants ALSH" field="nbEnfantsALSH" step="1" />
                  <InputField label="Repas adultes" field="repasAdultes" step="1" />
                  <InputField label="Mercredi (enfants)" field="mercredi" step="1" />
                </div>
              </TabsContent>
              
              <TabsContent value="couts" className="mt-0 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <InputField label="Coût Bio" field="coutBio" unit="€" />
                  <InputField label="Coût Conventionnel" field="coutConventionnel" unit="€" />
                  <InputField label="Coût SIQO" field="coutSiqo" unit="€" />
                  <div className="space-y-1.5 bg-primary/10 p-3 rounded-lg col-span-2">
                    <Label className="text-sm font-medium text-primary">
                      Coût matière total <span className="text-muted-foreground">(calculé auto: Bio + Conv. + SIQO)</span>
                    </Label>
                    <div className="text-xl font-bold text-primary">
                      {((formData.coutBio || 0) + (formData.coutConventionnel || 0) + (formData.coutSiqo || 0)).toFixed(2)} €
                    </div>
                  </div>
                  <div className="space-y-1.5 bg-accent/10 p-3 rounded-lg col-span-2">
                    <Label className="text-sm font-medium text-accent">
                      Coût matière/enfant <span className="text-muted-foreground">(calculé auto: Coût matière ÷ Nb repas)</span>
                    </Label>
                    <div className="text-xl font-bold text-accent">
                      {(() => {
                        const totalEnfants = (formData.nbEnfantsCantine || 0) + (formData.nbEnfantsALSH || 0);
                        const coutTotal = (formData.coutBio || 0) + (formData.coutConventionnel || 0) + (formData.coutSiqo || 0);
                        return totalEnfants > 0 ? (coutTotal / totalEnfants).toFixed(2) : '—';
                      })()} €
                    </div>
                  </div>
                  <InputField label="Coût eau/enfant" field="coutEauParEnfant" unit="€" />
                  <InputField label="Coût pain bio/enfant" field="coutPainBioParEnfant" unit="€" />
                  <InputField label="Coût pain conv./enfant" field="coutPainConvParEnfant" unit="€" />
                  <InputField label="Heures travail agent" field="agentHeuresTravail" unit="h" />
                  <InputField label="Frais personnel agent" field="agentFraisPerso" unit="€" />
                  <div className="space-y-1.5 bg-secondary/10 p-3 rounded-lg col-span-2">
                    <Label className="text-sm font-medium text-secondary-foreground">
                      Coût personnel/repas enfant <span className="text-muted-foreground">(calculé auto: Frais perso ÷ Nb repas)</span>
                    </Label>
                    <div className="text-xl font-bold text-secondary-foreground">
                      {(() => {
                        const totalEnfants = (formData.nbEnfantsCantine || 0) + (formData.nbEnfantsALSH || 0);
                        const fraisPerso = formData.agentFraisPerso || 0;
                        return totalEnfants > 0 && fraisPerso > 0 ? (fraisPerso / totalEnfants).toFixed(2) : '—';
                      })()} €
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="effectifs" className="mt-0 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <InputField label="Primaires réel" field="primairesReel" step="1" />
                  <InputField label="Primaires à 7h" field="primaires7h" step="1" />
                  <InputField label="Maternelles réel" field="maternellesReel" step="1" />
                  <InputField label="Maternelles à 7h" field="maternelles7h" step="1" />
                  <InputField label="O Merveilles ALSH" field="oMerveillesALSH" step="1" />
                  <InputField label="Adultes O Merveilles" field="adulteOMerveillesALSH" step="1" />
                </div>
              </TabsContent>
              
              <TabsContent value="dechets" className="mt-0 space-y-4">
                <h4 className="font-medium text-sm text-muted-foreground mb-2">Primaires</h4>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <InputField label="Nb enfants primaires" field="dechetPrimaireNbEnfants" step="1" />
                  <InputField label="Poids total primaires" field="dechetPrimairePoids" unit="kg" step="0.001" />
                </div>
                
                <h4 className="font-medium text-sm text-muted-foreground mb-2">Maternelles</h4>
                <div className="grid grid-cols-2 gap-4">
                  <InputField label="Nb enfants maternelles" field="dechetMaternelleNbEnfants" step="1" />
                  <InputField label="Poids total maternelles" field="dechetMaternellePoids" unit="kg" step="0.001" />
                </div>
              </TabsContent>
            </ScrollArea>
          </Tabs>
          
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit">
              {mode === "add" ? "Ajouter" : "Enregistrer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DataForm;
