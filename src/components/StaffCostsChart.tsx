import { MonthlyData } from "@/utils/dataAggregation";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface StaffCostsChartProps {
  monthlyData: MonthlyData[];
}

const StaffCostsChart = ({ monthlyData }: StaffCostsChartProps) => {
  const chartData = monthlyData.map((d) => ({
    mois: d.month,
    "Frais Cantine": d.fraisPersonnelCantine,
    "Frais ALSH": d.fraisPersonnelALSH,
  }));

  // Calculer les totaux annuels
  const totalFraisCantine = monthlyData.reduce((sum, d) => sum + d.fraisPersonnelCantine, 0);
  const totalFraisALSH = monthlyData.reduce((sum, d) => sum + d.fraisPersonnelALSH, 0);

  return (
    <div className="stat-card animate-slide-up">
      <h3 className="text-lg font-semibold font-display mb-2">
        Frais personnel annuels
      </h3>
      <div className="flex gap-4 mb-4 text-sm">
        <span className="text-muted-foreground">
          Cantine: <strong className="text-primary">{totalFraisCantine.toFixed(0)} €</strong>
        </span>
        <span className="text-muted-foreground">
          ALSH: <strong className="text-warning">{totalFraisALSH.toFixed(0)} €</strong>
        </span>
      </div>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorCantine" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(210, 60%, 50%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(210, 60%, 50%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorALSH" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(38, 92%, 50%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(38, 92%, 50%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(210, 20%, 90%)" />
            <XAxis
              dataKey="mois"
              tick={{ fill: "hsl(215, 15%, 45%)", fontSize: 12 }}
            />
            <YAxis
              tick={{ fill: "hsl(215, 15%, 45%)", fontSize: 12 }}
              tickFormatter={(value) => `${value}€`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(0, 0%, 100%)",
                border: "1px solid hsl(210, 20%, 90%)",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
              formatter={(value: number) => [`${value.toFixed(2)} €`, ""]}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="Frais Cantine"
              stroke="hsl(210, 60%, 50%)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorCantine)"
            />
            <Area
              type="monotone"
              dataKey="Frais ALSH"
              stroke="hsl(38, 92%, 50%)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorALSH)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StaffCostsChart;
