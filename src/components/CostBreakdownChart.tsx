import { DailyData } from "@/types/cantine";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

interface CostBreakdownChartProps {
  data: DailyData[];
}

const CostBreakdownChart = ({ data }: CostBreakdownChartProps) => {
  const totals = data.reduce(
    (acc, d) => ({
      bio: acc.bio + (d.coutBio || 0),
      conventionnel: acc.conventionnel + (d.coutConventionnel || 0),
      siqo: acc.siqo + (d.coutSiqo || 0),
    }),
    { bio: 0, conventionnel: 0, siqo: 0 }
  );

  const chartData = [
    { name: "Bio", value: totals.bio, color: "hsl(142, 70%, 45%)" },
    { name: "Conventionnel", value: totals.conventionnel, color: "hsl(210, 60%, 50%)" },
    { name: "SIQO", value: totals.siqo, color: "hsl(280, 60%, 50%)" },
  ].filter((d) => d.value > 0);

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="stat-card animate-slide-up">
      <h3 className="text-lg font-semibold font-display mb-4">
        Répartition des coûts alimentaires
      </h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={3}
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              labelLine={false}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
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
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 text-center">
        <p className="text-sm text-muted-foreground">Total</p>
        <p className="text-2xl font-bold font-display text-primary">
          {total.toFixed(2)} €
        </p>
      </div>
    </div>
  );
};

export default CostBreakdownChart;
