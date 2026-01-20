import { useRef } from "react";
import { DailyData, isValidFrenchDate } from "@/types/cantine";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2, Plus, Download, Upload } from "lucide-react";
import DataForm from "./DataForm";
import { toast } from "sonner";

interface DataTableProps {
  data: DailyData[];
  onAdd: (data: DailyData) => void;
  onUpdate: (date: string, data: DailyData) => void;
  onDelete: (date: string) => void;
  onImport?: (data: DailyData[]) => void;
}

const DataTable = ({ data, onAdd, onUpdate, onDelete, onImport }: DataTableProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseNumber = (value: string): number | null => {
    if (!value || value.trim() === "") return null;
    const cleaned = value.replace(",", ".").trim();
    const num = parseFloat(cleaned);
    return isNaN(num) ? null : num;
  };

  const importFromCSV = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split(/\r?\n/).filter((line) => line.trim() !== "");
        
        if (lines.length < 2) {
          toast.error("Le fichier CSV est vide ou ne contient pas de données");
          return;
        }

        // Ignorer la ligne d'en-tête
        const dataLines = lines.slice(1);
        const importedData: DailyData[] = [];
        let errorsCount = 0;

        dataLines.forEach((line, index) => {
          const values = line.split(";");
          
          if (values.length < 2) return;

          const date = values[0]?.trim();
          
          // Valider le format de date
          if (!date || !isValidFrenchDate(date)) {
            errorsCount++;
            return;
          }

          const entry: DailyData = {
            date,
            nbEnfantsALSH: parseNumber(values[1] || ""),
            nbEnfantsCantine: parseNumber(values[2] || ""),
            coutConventionnel: parseNumber(values[3] || ""),
            coutBio: parseNumber(values[4] || ""),
            coutSiqo: parseNumber(values[5] || ""),
            coutMatiereTotal: parseNumber(values[6] || ""),
            prixRevientMoyen: parseNumber(values[7] || ""),
            coutEauParEnfant: parseNumber(values[8] || ""),
            coutPainBioParEnfant: parseNumber(values[9] || ""),
            coutPainConvParEnfant: parseNumber(values[10] || ""),
            coutMatiereParEnfant: parseNumber(values[11] || ""),
            agentHeuresTravail: parseNumber(values[12] || ""),
            agentFraisPerso: parseNumber(values[13] || ""),
            coutPersonnelParEnfant: parseNumber(values[14] || ""),
            primairesReel: parseNumber(values[15] || ""),
            primaires7h: parseNumber(values[16] || ""),
            maternellesReel: parseNumber(values[17] || ""),
            maternelles7h: parseNumber(values[18] || ""),
            repasAdultes: parseNumber(values[19] || ""),
            mercredi: parseNumber(values[20] || ""),
            oMerveillesALSH: parseNumber(values[21] || ""),
            adulteOMerveillesALSH: parseNumber(values[22] || ""),
            dechetPrimaireNbEnfants: parseNumber(values[23] || ""),
            dechetPrimairePoids: parseNumber(values[24] || ""),
            dechetPrimaireParEnfant: parseNumber(values[25] || ""),
            dechetMaternelleNbEnfants: parseNumber(values[26] || ""),
            dechetMaternellePoids: parseNumber(values[27] || ""),
            dechetMaternelleParEnfant: parseNumber(values[28] || ""),
          };

          importedData.push(entry);
        });

        if (importedData.length === 0) {
          toast.error("Aucune donnée valide trouvée dans le fichier CSV");
          return;
        }

        if (onImport) {
          onImport(importedData);
          toast.success(`${importedData.length} entrée(s) importée(s) avec succès${errorsCount > 0 ? ` (${errorsCount} ligne(s) ignorée(s))` : ""}`);
        }
      } catch (error) {
        console.error("Erreur lors de l'import CSV:", error);
        toast.error("Erreur lors de la lecture du fichier CSV");
      }
    };
    reader.readAsText(file, "UTF-8");
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      importFromCSV(file);
      // Réinitialiser l'input pour permettre de réimporter le même fichier
      event.target.value = "";
    }
  };
  const formatCurrency = (value: number | null) => {
    if (value === null || value === undefined) return "—";
    return `${value.toFixed(2)} €`;
  };

  const formatNumber = (value: number | null) => {
    if (value === null || value === undefined) return "—";
    return value.toString();
  };

  const formatDecimal = (value: number | null, decimals: number = 3) => {
    if (value === null || value === undefined) return "—";
    return value.toFixed(decimals);
  };

  const exportToCSV = () => {
    const headers = [
      "Date",
      "Repas Enf. ALSH",
      "Repas Enf. Cantine",
      "Coût Conventionnel",
      "Coût Bio",
      "Coût SIQO",
      "Coût Matière Total",
      "Prix Revient Moyen",
      "Coût Eau/Enfant",
      "Pain Bio/Enfant",
      "Pain Conv./Enfant",
      "Coût Matière/Enfant",
      "Heures Agent",
      "Frais Personnel",
      "Coût Personnel/Enfant",
      "Primaires Réel",
      "Primaires 7h",
      "Maternelles Réel",
      "Maternelles 7h",
      "Repas Adultes",
      "Mercredi",
      "O Merveilles ALSH",
      "Adulte O Merveilles",
      "Déchet Primaire Nb",
      "Déchet Primaire Poids",
      "Déchet Primaire/Enfant",
      "Déchet Maternelle Nb",
      "Déchet Maternelle Poids",
      "Déchet Maternelle/Enfant",
    ];

    const csvRows = [headers.join(";")];

    data.forEach((row) => {
      const values = [
        row.date,
        row.nbEnfantsALSH ?? "",
        row.nbEnfantsCantine ?? "",
        row.coutConventionnel ?? "",
        row.coutBio ?? "",
        row.coutSiqo ?? "",
        row.coutMatiereTotal ?? "",
        row.prixRevientMoyen ?? "",
        row.coutEauParEnfant ?? "",
        row.coutPainBioParEnfant ?? "",
        row.coutPainConvParEnfant ?? "",
        row.coutMatiereParEnfant ?? "",
        row.agentHeuresTravail ?? "",
        row.agentFraisPerso ?? "",
        row.coutPersonnelParEnfant ?? "",
        row.primairesReel ?? "",
        row.primaires7h ?? "",
        row.maternellesReel ?? "",
        row.maternelles7h ?? "",
        row.repasAdultes ?? "",
        row.mercredi ?? "",
        row.oMerveillesALSH ?? "",
        row.adulteOMerveillesALSH ?? "",
        row.dechetPrimaireNbEnfants ?? "",
        row.dechetPrimairePoids ?? "",
        row.dechetPrimaireParEnfant ?? "",
        row.dechetMaternelleNbEnfants ?? "",
        row.dechetMaternellePoids ?? "",
        row.dechetMaternelleParEnfant ?? "",
      ];
      csvRows.push(values.join(";"));
    });

    const csvContent = csvRows.join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `cantine_donnees_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="stat-card animate-slide-up overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold font-display">
          Données journalières
        </h3>
        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept=".csv"
            className="hidden"
          />
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-4 w-4 mr-2" />
            Importer CSV
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={exportToCSV}
            disabled={data.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Exporter CSV
          </Button>
          <DataForm mode="add" onSave={onAdd} />
        </div>
      </div>
      
      <ScrollArea className="h-[500px] w-full">
        <div className="min-w-[2000px]">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold sticky left-0 bg-muted/50 z-10 w-28">Date</TableHead>
                <TableHead className="font-semibold whitespace-nowrap">Repas Enf. ALSH</TableHead>
                <TableHead className="font-semibold whitespace-nowrap">Repas Enf. Cantine</TableHead>
                <TableHead className="font-semibold whitespace-nowrap text-conventionnel">Coût Conv.</TableHead>
                <TableHead className="font-semibold whitespace-nowrap text-bio">Coût Bio</TableHead>
                <TableHead className="font-semibold whitespace-nowrap text-siqo">Coût SIQO</TableHead>
                <TableHead className="font-semibold whitespace-nowrap bg-primary/10 text-primary">Coût Matière Total</TableHead>
                <TableHead className="font-semibold whitespace-nowrap">Prix Moyen</TableHead>
                <TableHead className="font-semibold whitespace-nowrap">Coût Eau/Enf</TableHead>
                <TableHead className="font-semibold whitespace-nowrap">Pain Bio/Enf</TableHead>
                <TableHead className="font-semibold whitespace-nowrap">Pain Conv./Enf</TableHead>
                <TableHead className="font-semibold whitespace-nowrap">Coût Matière/Enf</TableHead>
                <TableHead className="font-semibold whitespace-nowrap">Heures Agent</TableHead>
                <TableHead className="font-semibold whitespace-nowrap">Frais Perso</TableHead>
                <TableHead className="font-semibold whitespace-nowrap">Coût Pers./Enf</TableHead>
                <TableHead className="font-semibold whitespace-nowrap">Prim. Réel</TableHead>
                <TableHead className="font-semibold whitespace-nowrap">Prim. 7h</TableHead>
                <TableHead className="font-semibold whitespace-nowrap">Mat. Réel</TableHead>
                <TableHead className="font-semibold whitespace-nowrap">Mat. 7h</TableHead>
                <TableHead className="font-semibold whitespace-nowrap">Repas Adultes</TableHead>
                <TableHead className="font-semibold whitespace-nowrap">Mercredi</TableHead>
                <TableHead className="font-semibold whitespace-nowrap">O Merv. ALSH</TableHead>
                <TableHead className="font-semibold whitespace-nowrap">Adulte O Merv.</TableHead>
                <TableHead className="font-semibold whitespace-nowrap">Déch. Prim. Nb</TableHead>
                <TableHead className="font-semibold whitespace-nowrap">Déch. Prim. Poids</TableHead>
                <TableHead className="font-semibold whitespace-nowrap">Déch. Prim./Enf</TableHead>
                <TableHead className="font-semibold whitespace-nowrap">Déch. Mat. Nb</TableHead>
                <TableHead className="font-semibold whitespace-nowrap">Déch. Mat. Poids</TableHead>
                <TableHead className="font-semibold whitespace-nowrap">Déch. Mat./Enf</TableHead>
                <TableHead className="font-semibold w-24 text-right sticky right-0 bg-muted/50 z-10">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={29} className="h-32 text-center">
                    <div className="flex flex-col items-center gap-3 text-muted-foreground">
                      <p>Aucune donnée pour ce mois</p>
                      <DataForm 
                        mode="add" 
                        onSave={onAdd}
                        trigger={
                          <Button variant="outline" size="sm">
                            <Plus className="h-4 w-4 mr-2" />
                            Ajouter la première journée
                          </Button>
                        }
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                data.map((row) => {
                  const totalEnfants = (row.nbEnfantsCantine || 0) + (row.nbEnfantsALSH || 0);
                  if (totalEnfants === 0 && !row.coutBio && !row.coutConventionnel && !row.coutSiqo) return null;
                  
                  return (
                    <TableRow key={row.date} className="hover:bg-muted/30 transition-colors group">
                      <TableCell className="font-medium sticky left-0 bg-card group-hover:bg-muted/30 z-10">
                        <Badge variant="outline" className="font-mono text-xs">
                          {row.date}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatNumber(row.nbEnfantsALSH)}</TableCell>
                      <TableCell>{formatNumber(row.nbEnfantsCantine)}</TableCell>
                      <TableCell className="text-conventionnel font-medium">{formatCurrency(row.coutConventionnel)}</TableCell>
                      <TableCell className="text-bio font-medium">{formatCurrency(row.coutBio)}</TableCell>
                      <TableCell className="text-siqo font-medium">{formatCurrency(row.coutSiqo)}</TableCell>
                      <TableCell className="bg-primary/10 font-bold text-primary">{formatCurrency(row.coutMatiereTotal)}</TableCell>
                      <TableCell className="font-semibold">{formatCurrency(row.prixRevientMoyen)}</TableCell>
                      <TableCell>{formatCurrency(row.coutEauParEnfant)}</TableCell>
                      <TableCell>{formatCurrency(row.coutPainBioParEnfant)}</TableCell>
                      <TableCell>{formatCurrency(row.coutPainConvParEnfant)}</TableCell>
                      <TableCell>{formatCurrency(row.coutMatiereParEnfant)}</TableCell>
                      <TableCell>{formatNumber(row.agentHeuresTravail)}</TableCell>
                      <TableCell>{formatCurrency(row.agentFraisPerso)}</TableCell>
                      <TableCell>{formatCurrency(row.coutPersonnelParEnfant)}</TableCell>
                      <TableCell>{formatNumber(row.primairesReel)}</TableCell>
                      <TableCell>{formatNumber(row.primaires7h)}</TableCell>
                      <TableCell>{formatNumber(row.maternellesReel)}</TableCell>
                      <TableCell>{formatNumber(row.maternelles7h)}</TableCell>
                      <TableCell>{formatNumber(row.repasAdultes)}</TableCell>
                      <TableCell>{formatNumber(row.mercredi)}</TableCell>
                      <TableCell>{formatNumber(row.oMerveillesALSH)}</TableCell>
                      <TableCell>{formatNumber(row.adulteOMerveillesALSH)}</TableCell>
                      <TableCell>{formatNumber(row.dechetPrimaireNbEnfants)}</TableCell>
                      <TableCell>{formatDecimal(row.dechetPrimairePoids)} kg</TableCell>
                      <TableCell>{formatDecimal(row.dechetPrimaireParEnfant)}</TableCell>
                      <TableCell>{formatNumber(row.dechetMaternelleNbEnfants)}</TableCell>
                      <TableCell>{formatDecimal(row.dechetMaternellePoids)} kg</TableCell>
                      <TableCell>{formatDecimal(row.dechetMaternelleParEnfant)}</TableCell>
                      <TableCell className="sticky right-0 bg-card group-hover:bg-muted/30 z-10">
                        <div className="flex items-center justify-end gap-1">
                          <DataForm 
                            mode="edit" 
                            data={row} 
                            onSave={(updatedData) => onUpdate(row.date, updatedData)} 
                          />
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Supprimer cette entrée ?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Êtes-vous sûr de vouloir supprimer les données du {row.date} ?
                                  Cette action est irréversible.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => onDelete(row.date)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Supprimer
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      
      <p className="text-xs text-muted-foreground mt-3 text-center">
        ← Faites défiler horizontalement pour voir toutes les colonnes →
      </p>
    </div>
  );
};

export default DataTable;
