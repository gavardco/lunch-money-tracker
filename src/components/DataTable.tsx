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

interface DataTableProps {
  data: DailyData[];
}

const DataTable = ({ data }: DataTableProps) => {
  const formatCurrency = (value: number | null) => {
    if (value === null) return "-";
    return `${value.toFixed(2)} €`;
  };

  const formatNumber = (value: number | null) => {
    if (value === null) return "-";
    return value.toString();
  };

  return (
    <div className="stat-card animate-slide-up overflow-hidden">
      <h3 className="text-lg font-semibold font-display mb-4">
        Données journalières
      </h3>
      <ScrollArea className="h-[400px]">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold">Jour</TableHead>
              <TableHead className="font-semibold">Enfants</TableHead>
              <TableHead className="font-semibold">Coût Bio</TableHead>
              <TableHead className="font-semibold">Coût Conv.</TableHead>
              <TableHead className="font-semibold">Coût SIGO</TableHead>
              <TableHead className="font-semibold">Prix Moyen</TableHead>
              <TableHead className="font-semibold">Coût/Enfant</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row) => {
              const totalEnfants = (row.nbEnfantsCantine || 0) + (row.nbEnfantsALSH || 0);
              if (totalEnfants === 0) return null;
              
              return (
                <TableRow key={row.date} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="font-medium">
                    <Badge variant="outline" className="font-mono">
                      {row.date}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {row.nbEnfantsCantine && (
                        <span className="text-sm">
                          <span className="text-muted-foreground">Cantine:</span>{" "}
                          {row.nbEnfantsCantine}
                        </span>
                      )}
                      {row.nbEnfantsALSH && (
                        <span className="text-sm">
                          <span className="text-muted-foreground">ALSH:</span>{" "}
                          {row.nbEnfantsALSH}
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
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
};

export default DataTable;
