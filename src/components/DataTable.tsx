import { DailyData } from "@/types/cantine";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import { Trash2, Plus } from "lucide-react";
import DataForm from "./DataForm";

interface DataTableProps {
  data: DailyData[];
  onAdd: (data: DailyData) => void;
  onUpdate: (date: number, data: DailyData) => void;
  onDelete: (date: number) => void;
}

const DataTable = ({ data, onAdd, onUpdate, onDelete }: DataTableProps) => {
  const formatCurrency = (value: number | null) => {
    if (value === null) return "—";
    return `${value.toFixed(2)} €`;
  };

  return (
    <div className="stat-card animate-slide-up overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold font-display">
          Données journalières
        </h3>
        <DataForm mode="add" onSave={onAdd} />
      </div>
      
      <ScrollArea className="h-[400px]">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold w-16">Jour</TableHead>
              <TableHead className="font-semibold">Enfants</TableHead>
              <TableHead className="font-semibold">Coût Bio</TableHead>
              <TableHead className="font-semibold">Coût Conv.</TableHead>
              <TableHead className="font-semibold">Coût SIGO</TableHead>
              <TableHead className="font-semibold">Prix Moyen</TableHead>
              <TableHead className="font-semibold">Coût/Enfant</TableHead>
              <TableHead className="font-semibold w-24 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center">
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
                if (totalEnfants === 0 && !row.coutBio && !row.coutConventionnel && !row.coutSigo) return null;
                
                return (
                  <TableRow key={row.date} className="hover:bg-muted/30 transition-colors group">
                    <TableCell className="font-medium">
                      <Badge variant="outline" className="font-mono">
                        {row.date}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-0.5">
                        {row.nbEnfantsCantine !== null && row.nbEnfantsCantine > 0 && (
                          <span className="text-sm">
                            <span className="text-muted-foreground">Cantine:</span>{" "}
                            <span className="font-medium">{row.nbEnfantsCantine}</span>
                          </span>
                        )}
                        {row.nbEnfantsALSH !== null && row.nbEnfantsALSH > 0 && (
                          <span className="text-sm">
                            <span className="text-muted-foreground">ALSH:</span>{" "}
                            <span className="font-medium">{row.nbEnfantsALSH}</span>
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-bio font-medium">
                        {formatCurrency(row.coutBio)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-conventionnel font-medium">
                        {formatCurrency(row.coutConventionnel)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sigo font-medium">
                        {formatCurrency(row.coutSigo)}
                      </span>
                    </TableCell>
                    <TableCell className="font-semibold">
                      {formatCurrency(row.prixRevientMoyen)}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(row.coutPersonnelParEnfant)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
                                Êtes-vous sûr de vouloir supprimer les données du jour {row.date} ?
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
      </ScrollArea>
    </div>
  );
};

export default DataTable;
