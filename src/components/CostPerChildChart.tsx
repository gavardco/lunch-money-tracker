import { MonthlyData } from "@/utils/dataAggregation";
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface CostPerChildChartProps {
  monthlyData: MonthlyData[];
}

const CostPerChildChart = ({ monthlyData }: CostPerChildChartProps) => {
  const chartData = monthlyData.map((d) => ({
    mois: d.month,
    "Coût MAT./ENFANT": d.nbJoursCoutMatiere > 0 ? d.coutMatiereParEnfant : null,
    "Coût PERS./ENFANT": d.nbJoursCoutPersonnel > 0 ? d.coutPersonnelParEnfant : null,
  }));

  // Moyennes annuelles = moyenne de toutes les journées renseignées
  const sommeMatiere = monthlyData.reduce((s, d) => s + d.sommeCoutMatiereParEnfant, 0);
  const joursMatiere = monthlyData.reduce((s, d) => s + d.nbJoursCoutMatiere, 0);
  const sommePersonnel = monthlyData.reduce((s, d) => s + d.sommeCoutPersonnelParEnfant, 0);
  const joursPersonnel = monthlyData.reduce((s, d) => s + d.nbJoursCoutPersonnel, 0);

  const moyenneMatiere = joursMatiere > 0 ? sommeMatiere / joursMatiere : 0;
  const moyennePersonnel = joursPersonnel > 0 ? sommePersonnel / joursPersonnel : 0;

  return (
    <div className="stat-card animate-slide-up">
      <h3 className="text-lg font-semibold font-display mb-2">
        Coût de revient moyen par enfant (année)
      </h3>
      <div className="flex gap-4 mb-4 text-sm flex-wrap">
        <span className="text-muted-foreground">
          Moyenne annuelle Coût MAT./ENFANT:{" "}
          <strong className="text-green-600">{moyenneMatiere.toFixed(2)} €</strong>
        </span>
        <span className="text-muted-foreground">
          Moyenne annuelle Coût PERS./ENFANT:{" "}
          <strong className="text-primary">{moyennePersonnel.toFixed(2)} €</strong>
        </span>
      </div>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(210, 20%, 90%)" />
            <XAxis
              dataKey="mois"
              tick={{ fill: "hsl(215, 15%, 45%)", fontSize: 12 }}
            />
            <YAxis
              tick={{ fill: "hsl(215, 15%, 45%)", fontSize: 12 }}
              tickFormatter={(value) => `${Number(value).toFixed(1)} €`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(0, 0%, 100%)",
                border: "1px solid hsl(210, 20%, 90%)",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
              formatter={(value: number) =>
                value === null || value === undefined
                  ? ["—", ""]
                  : [`${Number(value).toFixed(2)} €`, ""]
              }
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="Coût MAT./ENFANT"
              stroke="hsl(142, 70%, 45%)"
              strokeWidth={3}
              dot={{ r: 4, fill: "hsl(142, 70%, 45%)" }}
              activeDot={{ r: 6 }}
              connectNulls
            />
            <Line
              type="monotone"
              dataKey="Coût PERS./ENFANT"
              stroke="hsl(210, 60%, 50%)"
              strokeWidth={3}
              dot={{ r: 4, fill: "hsl(210, 60%, 50%)" }}
              activeDot={{ r: 6 }}
              connectNulls
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CostPerChildChart;
