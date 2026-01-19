import { MonthlyData } from "@/utils/dataAggregation";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface MealsChartProps {
  monthlyData: MonthlyData[];
}

const MealsChart = ({ monthlyData }: MealsChartProps) => {
  const chartData = monthlyData.map((d) => ({
    mois: d.month,
    "Repas Cantine": d.totalEnfantsCantine,
    "Repas ALSH": d.totalEnfantsALSH,
  }));

  // Calculer les totaux annuels
  const totalCantine = monthlyData.reduce((sum, d) => sum + d.totalEnfantsCantine, 0);
  const totalALSH = monthlyData.reduce((sum, d) => sum + d.totalEnfantsALSH, 0);

  return (
    <div className="stat-card animate-slide-up">
      <h3 className="text-lg font-semibold font-display mb-2">
        Nombre de repas annuels
      </h3>
      <div className="flex gap-4 mb-4 text-sm">
        <span className="text-muted-foreground">
          Cantine: <strong className="text-primary">{totalCantine.toLocaleString('fr-FR')}</strong>
        </span>
        <span className="text-muted-foreground">
          ALSH: <strong className="text-warning">{totalALSH.toLocaleString('fr-FR')}</strong>
        </span>
      </div>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(210, 20%, 90%)" />
            <XAxis
              dataKey="mois"
              tick={{ fill: "hsl(215, 15%, 45%)", fontSize: 12 }}
            />
            <YAxis tick={{ fill: "hsl(215, 15%, 45%)", fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(0, 0%, 100%)",
                border: "1px solid hsl(210, 20%, 90%)",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
              formatter={(value: number) => [`${value.toLocaleString('fr-FR')} repas`, ""]}
            />
            <Legend />
            <Bar
              dataKey="Repas Cantine"
              fill="hsl(210, 60%, 50%)"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="Repas ALSH"
              fill="hsl(38, 92%, 50%)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MealsChart;
