import { useRef, useState, useMemo } from "react";
import { DailyData, formatDateToFrench, isValidFrenchDate } from "@/types/cantine";
import * as XLSX from "xlsx";
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
import { Trash2, Plus, Download, Upload, Save } from "lucide-react";
import DataForm from "./DataForm";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type NumericField = Exclude<keyof DailyData, "date">;

interface DataTableProps {
  data: DailyData[];
  onAdd: (data: DailyData) => void;
  onUpdate: (date: string, data: DailyData) => void;
  onDelete: (date: string) => void;
  onImport?: (data: DailyData[]) => Promise<boolean> | boolean;
}

const DataTable = ({ data, onAdd, onUpdate, onDelete, onImport }: DataTableProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [edits, setEdits] = useState<Record<string, Partial<Record<NumericField, string>>>>({});
  const [saving, setSaving] = useState(false);

  const pendingCount = useMemo(
    () => Object.values(edits).reduce((acc, e) => acc + Object.keys(e).length, 0),
    [edits]
  );

  const getCellValue = (row: DailyData, field: NumericField): string => {
    const pending = edits[row.date]?.[field];
    if (pending !== undefined) return pending;
    const v = row[field] as number | null | undefined;
    return v == null ? "" : String(v).replace(".", ",");
  };

  const setCellValue = (date: string, field: NumericField, value: string) => {
    setEdits((prev) => ({
      ...prev,
      [date]: { ...(prev[date] || {}), [field]: value },
    }));
  };

  const parseCell = (value: string): number | null => {
    const v = value.trim().replace(",", ".");
    if (v === "") return null;
    const n = parseFloat(v);
    return isNaN(n) ? null : n;
  };

  const saveAllEdits = async () => {
    if (pendingCount === 0) return;
    setSaving(true);
    try {
      for (const row of data) {
        const rowEdits = edits[row.date];
        if (!rowEdits) continue;
        const updated: DailyData = { ...row };
        for (const [field, raw] of Object.entries(rowEdits)) {
          (updated as any)[field] = parseCell(raw as string);
        }
        await onUpdate(row.date, updated);
      }
      setEdits({});
      toast.success(`${pendingCount} modification(s) enregistrée(s)`);
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  const discardEdits = () => setEdits({});



  const parseNumber = (value: string): number | null => {
    if (!value || value.trim() === "") return null;
    const cleaned = value.replace(",", ".").trim();
    const num = parseFloat(cleaned);
    return isNaN(num) ? null : num;
  };

  // Convertir une date du format Excel "05-janv" + mois + année en "jj/mm/aaaa"
  const parseExcelDate = (dateStr: string, monthName: string, year: string): string | null => {
    const monthMap: { [key: string]: string } = {
      "janvier": "01", "janv": "01",
      "février": "02", "févr": "02", "fevrier": "02", "fevr": "02",
      "mars": "03",
      "avril": "04", "avr": "04",
      "mai": "05",
      "juin": "06",
      "juillet": "07", "juil": "07",
      "août": "08", "aout": "08",
      "septembre": "09", "sept": "09",
      "octobre": "10", "oct": "10",
      "novembre": "11", "nov": "11",
      "décembre": "12", "dec": "12", "decembre": "12"
    };

    // Extraire le jour du format "05-janv"
    const dayMatch = dateStr.match(/^(\d{1,2})/);
    if (!dayMatch) return null;
    
    const day = dayMatch[1].padStart(2, "0");
    const monthKey = monthName.toLowerCase().trim();
    const month = monthMap[monthKey];
    const yearNum = year.trim();
    
    if (!month || !yearNum || isNaN(parseInt(yearNum))) return null;
    
    return `${day}/${month}/${yearNum}`;
  };

  const MONTH_NAMES = new Set([
    "janvier","janv","février","fevrier","févr","fevr","mars","avril","avr",
    "mai","juin","juillet","juil","août","aout","septembre","sept","octobre",
    "oct","novembre","nov","décembre","decembre","dec"
  ]);

  const isMonthName = (v: string) => MONTH_NAMES.has(v.toLowerCase().trim());
  const isYearLike = (v: string) => /^(19|20)\d{2}$/.test(v.trim());

  const parseImportedDate = (rawValue: string, monthName?: string, year?: string): string | null => {
    const value = rawValue.trim();

    if (!value) return null;

    if (isValidFrenchDate(value)) {
      return value;
    }

    if (value.includes("-") && !value.includes("/") && monthName && year) {
      const excelDate = parseExcelDate(value, monthName, year);
      if (excelDate && isValidFrenchDate(excelDate)) {
        return excelDate;
      }
    }

    // Format US "1/1/26" ou "01/01/2026" => essayer DD/MM/YYYY puis MM/DD/YYYY
    const slashMatch = value.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
    if (slashMatch) {
      let [, a, b, y] = slashMatch;
      if (y.length === 2) y = (parseInt(y) > 50 ? "19" : "20") + y;
      const dd = a.padStart(2, "0");
      const mm = b.padStart(2, "0");
      const candidate = `${dd}/${mm}/${y}`;
      if (isValidFrenchDate(candidate)) return candidate;
    }

    const parsedDate = new Date(value);
    if (!Number.isNaN(parsedDate.getTime())) {
      return formatDateToFrench(parsedDate);
    }

    return null;
  };


  const importFromCSV = (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
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

        dataLines.forEach((line) => {
          const values = line.split(";");
          
          if (values.length < 3) return;

          // Détecter le format du CSV
          let date: string | null = null;
          let dataOffset = 0;

          const firstCol = values[0]?.trim() || "";
          const secondCol = values[1]?.trim() || "";
          const thirdCol = values[2]?.trim() || "";

          // Si col B = nom de mois et col C = année => format avec 3 colonnes de date
          if (isMonthName(secondCol) && isYearLike(thirdCol)) {
            date = parseImportedDate(firstCol, secondCol, thirdCol);
            dataOffset = 3;
          } else if (firstCol.includes("-") && !firstCol.includes("/")) {
            date = parseImportedDate(firstCol, secondCol, thirdCol);
            dataOffset = 3;
          } else {
            date = parseImportedDate(firstCol);
            dataOffset = 1;
          }

          if (!date || !isValidFrenchDate(date)) {
            errorsCount++;
            return;
          }


          const entry: DailyData = {
            date,
            nbEnfantsALSH: parseNumber(values[dataOffset] || ""),
            nbEnfantsCantine: parseNumber(values[dataOffset + 1] || ""),
            coutConventionnel: parseNumber(values[dataOffset + 2] || ""),
            coutBio: parseNumber(values[dataOffset + 3] || ""),
            coutSiqo: parseNumber(values[dataOffset + 4] || ""),
            prixRevientMoyen: parseNumber(values[dataOffset + 5] || ""),
            coutEauParEnfant: parseNumber(values[dataOffset + 6] || ""),
            coutPainBioParEnfant: parseNumber(values[dataOffset + 7] || ""),
            coutPainConvParEnfant: parseNumber(values[dataOffset + 8] || ""),
            coutMatiereParEnfant: parseNumber(values[dataOffset + 9] || ""),
            agentHeuresTravail: parseNumber(values[dataOffset + 10] || ""),
            agentFraisPerso: parseNumber(values[dataOffset + 11] || ""),
            coutPersonnelParEnfant: parseNumber(values[dataOffset + 12] || ""),
            primairesReel: parseNumber(values[dataOffset + 13] || ""),
            primaires7h: parseNumber(values[dataOffset + 14] || ""),
            maternellesReel: parseNumber(values[dataOffset + 15] || ""),
            maternelles7h: parseNumber(values[dataOffset + 16] || ""),
            repasAdultes: parseNumber(values[dataOffset + 17] || ""),
            mercredi: parseNumber(values[dataOffset + 18] || ""),
            oMerveillesALSH: parseNumber(values[dataOffset + 19] || ""),
            adulteOMerveillesALSH: parseNumber(values[dataOffset + 20] || ""),
            dechetPrimaireNbEnfants: parseNumber(values[dataOffset + 21] || ""),
            dechetPrimairePoids: parseNumber(values[dataOffset + 22] || ""),
            dechetPrimaireParEnfant: parseNumber(values[dataOffset + 23] || ""),
            dechetMaternelleNbEnfants: parseNumber(values[dataOffset + 24] || ""),
            dechetMaternellePoids: parseNumber(values[dataOffset + 25] || ""),
            dechetMaternelleParEnfant: parseNumber(values[dataOffset + 26] || ""),
          };

          importedData.push(entry);
        });

        if (importedData.length === 0) {
          toast.error("Aucune donnée valide trouvée dans le fichier CSV");
          return;
        }

        if (onImport) {
          const importSucceeded = await onImport(importedData);
          if (importSucceeded === false) return;
          toast.success(`${importedData.length} entrée(s) importée(s) avec succès${errorsCount > 0 ? ` (${errorsCount} ligne(s) ignorée(s))` : ""}`);
        }
      } catch (error) {
        console.error("Erreur lors de l'import CSV:", error);
        toast.error("Erreur lors de la lecture du fichier CSV");
      }
    };
    reader.readAsText(file, "UTF-8");
  };

  const importFromExcel = (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        
        // Prendre la première feuille
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convertir en tableau de tableaux
        const rows: (string | number | null)[][] = XLSX.utils.sheet_to_json(worksheet, { 
          header: 1,
          raw: false,
          defval: ""
        });
        
        if (rows.length < 2) {
          toast.error("Le fichier Excel est vide ou ne contient pas de données");
          return;
        }

        // Ignorer la ligne d'en-tête
        const dataRows = rows.slice(1);
        const importedData: DailyData[] = [];
        let errorsCount = 0;

        dataRows.forEach((row) => {
          if (!row || row.length < 3) return;
          
          const values = row.map(v => String(v ?? ""));

          // Détecter le format
          let date: string | null = null;
          let dataOffset = 0;

          const firstCol = values[0]?.trim() || "";
          const secondCol = values[1]?.trim() || "";
          const thirdCol = values[2]?.trim() || "";

          if (isMonthName(secondCol) && isYearLike(thirdCol)) {
            date = parseImportedDate(firstCol, secondCol, thirdCol);
            dataOffset = 3;
          } else if (firstCol.includes("-") && !firstCol.includes("/")) {
            date = parseImportedDate(firstCol, secondCol, thirdCol);
            dataOffset = 3;
          } else {
            date = parseImportedDate(firstCol);
            dataOffset = 1;
          }

          
          if (!date || !isValidFrenchDate(date)) {
            errorsCount++;
            return;
          }

          const entry: DailyData = {
            date,
            nbEnfantsALSH: parseNumber(values[dataOffset] || ""),
            nbEnfantsCantine: parseNumber(values[dataOffset + 1] || ""),
            coutConventionnel: parseNumber(values[dataOffset + 2] || ""),
            coutBio: parseNumber(values[dataOffset + 3] || ""),
            coutSiqo: parseNumber(values[dataOffset + 4] || ""),
            prixRevientMoyen: parseNumber(values[dataOffset + 5] || ""),
            coutEauParEnfant: parseNumber(values[dataOffset + 6] || ""),
            coutPainBioParEnfant: parseNumber(values[dataOffset + 7] || ""),
            coutPainConvParEnfant: parseNumber(values[dataOffset + 8] || ""),
            coutMatiereParEnfant: parseNumber(values[dataOffset + 9] || ""),
            agentHeuresTravail: parseNumber(values[dataOffset + 10] || ""),
            agentFraisPerso: parseNumber(values[dataOffset + 11] || ""),
            coutPersonnelParEnfant: parseNumber(values[dataOffset + 12] || ""),
            primairesReel: parseNumber(values[dataOffset + 13] || ""),
            primaires7h: parseNumber(values[dataOffset + 14] || ""),
            maternellesReel: parseNumber(values[dataOffset + 15] || ""),
            maternelles7h: parseNumber(values[dataOffset + 16] || ""),
            repasAdultes: parseNumber(values[dataOffset + 17] || ""),
            mercredi: parseNumber(values[dataOffset + 18] || ""),
            oMerveillesALSH: parseNumber(values[dataOffset + 19] || ""),
            adulteOMerveillesALSH: parseNumber(values[dataOffset + 20] || ""),
            dechetPrimaireNbEnfants: parseNumber(values[dataOffset + 21] || ""),
            dechetPrimairePoids: parseNumber(values[dataOffset + 22] || ""),
            dechetPrimaireParEnfant: parseNumber(values[dataOffset + 23] || ""),
            dechetMaternelleNbEnfants: parseNumber(values[dataOffset + 24] || ""),
            dechetMaternellePoids: parseNumber(values[dataOffset + 25] || ""),
            dechetMaternelleParEnfant: parseNumber(values[dataOffset + 26] || ""),
          };

          importedData.push(entry);
        });

        if (importedData.length === 0) {
          toast.error("Aucune donnée valide trouvée dans le fichier Excel");
          return;
        }

        if (onImport) {
          const importSucceeded = await onImport(importedData);
          if (importSucceeded === false) return;
          toast.success(`${importedData.length} entrée(s) importée(s) avec succès${errorsCount > 0 ? ` (${errorsCount} ligne(s) ignorée(s))` : ""}`);
        }
      } catch (error) {
        console.error("Erreur lors de l'import Excel:", error);
        toast.error("Erreur lors de la lecture du fichier Excel");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const extension = file.name.split('.').pop()?.toLowerCase();
      if (extension === 'xlsx' || extension === 'xls') {
        importFromExcel(file);
      } else {
        importFromCSV(file);
      }
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
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold font-display">
            Données journalières
          </h3>
          {pendingCount > 0 && (
            <Badge variant="outline" className="border-orange-500 text-orange-600">
              {pendingCount} modif. non enregistrée(s)
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept=".csv,.xlsx,.xls"
            className="hidden"
          />
          {pendingCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={discardEdits}
              disabled={saving}
            >
              Annuler
            </Button>
          )}
          <Button
            variant={pendingCount > 0 ? "default" : "outline"}
            size="sm"
            onClick={saveAllEdits}
            disabled={pendingCount === 0 || saving}
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Enregistrement..." : "Enregistrer"}
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-4 w-4 mr-2" />
            Importer
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
                  <TableCell colSpan={28} className="h-32 text-center">
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
                      {([
                        ["nbEnfantsALSH", ""],
                        ["nbEnfantsCantine", ""],
                        ["coutConventionnel", "text-conventionnel font-medium"],
                        ["coutBio", "text-bio font-medium"],
                        ["coutSiqo", "text-siqo font-medium"],
                        ["prixRevientMoyen", "font-semibold"],
                        ["coutEauParEnfant", ""],
                        ["coutPainBioParEnfant", ""],
                        ["coutPainConvParEnfant", ""],
                        ["coutMatiereParEnfant", ""],
                        ["agentHeuresTravail", ""],
                        ["agentFraisPerso", ""],
                        ["coutPersonnelParEnfant", ""],
                        ["primairesReel", ""],
                        ["primaires7h", ""],
                        ["maternellesReel", ""],
                        ["maternelles7h", ""],
                        ["repasAdultes", ""],
                        ["mercredi", ""],
                        ["oMerveillesALSH", ""],
                        ["adulteOMerveillesALSH", ""],
                        ["dechetPrimaireNbEnfants", ""],
                        ["dechetPrimairePoids", ""],
                        ["dechetPrimaireParEnfant", ""],
                        ["dechetMaternelleNbEnfants", ""],
                        ["dechetMaternellePoids", ""],
                        ["dechetMaternelleParEnfant", ""],
                      ] as [NumericField, string][]).map(([field, klass]) => {
                        const isDirty = edits[row.date]?.[field] !== undefined;
                        return (
                          <TableCell key={field} className={cn("p-1", klass)}>
                            <input
                              type="text"
                              inputMode="decimal"
                              value={getCellValue(row, field)}
                              onChange={(e) => setCellValue(row.date, field, e.target.value)}
                              className={cn(
                                "w-24 bg-transparent border border-transparent rounded px-2 py-1 text-sm",
                                "hover:border-border focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary",
                                isDirty && "border-orange-400 bg-orange-50 dark:bg-orange-950/30"
                              )}
                            />
                          </TableCell>
                        );
                      })}

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
