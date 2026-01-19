import { useState } from "react";
import { DailyData } from "@/types/cantine";
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
import { Plus, Pencil } from "lucide-react";

interface DataFormProps {
  data?: DailyData;
  onSave: (data: DailyData) => void;
  mode: "add" | "edit";
  trigger?: React.ReactNode;
}

const emptyData: DailyData = {
  date: 1,
  nbEnfantsALSH: null,
  nbEnfantsCantine: null,
  coutConventionnel: null,
  coutBio: null,
  coutSigo: null,
  prixRevientMoyen: null,
  coutEauParEnfant: null,
  coutPainBioParEnfant: null,
  coutPainConvParEnfant: null,
  coutMaterielParEnfant: null,
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

  const handleOpen = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      setFormData(data || emptyData);
    }
  };

  const handleChange = (field: keyof DailyData, value: string) => {
    const numValue = value === "" ? null : parseFloat(value);
    setFormData((prev) => ({ ...prev, [field]: numValue }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Calculer automatiquement certains champs
    const totalEnfants = (formData.nbEnfantsCantine || 0) + (formData.nbEnfantsALSH || 0);
    const totalCout = (formData.coutBio || 0) + (formData.coutConventionnel || 0) + (formData.coutSigo || 0);
    
    const updatedData = {
      ...formData,
      prixRevientMoyen: totalEnfants > 0 ? parseFloat((totalCout / totalEnfants).toFixed(2)) : null,
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
            {mode === "add" ? "Ajouter une journée" : `Modifier le jour ${formData.date}`}
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
                  <InputField label="Jour du mois" field="date" step="1" />
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
                  <InputField label="Coût SIGO" field="coutSigo" unit="€" />
                  <InputField label="Coût eau/enfant" field="coutEauParEnfant" unit="€" />
                  <InputField label="Coût pain bio/enfant" field="coutPainBioParEnfant" unit="€" />
                  <InputField label="Coût pain conv./enfant" field="coutPainConvParEnfant" unit="€" />
                  <InputField label="Coût matériel/enfant" field="coutMaterielParEnfant" unit="€" />
                  <InputField label="Heures travail agent" field="agentHeuresTravail" unit="h" />
                  <InputField label="Frais personnel agent" field="agentFraisPerso" unit="€" />
                  <InputField label="Coût personnel/enfant" field="coutPersonnelParEnfant" unit="€" />
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
