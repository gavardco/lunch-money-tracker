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

interface AgentHoursChartProps {
  monthlyData: MonthlyData[];
}

const AgentHoursChart = ({ monthlyData }: AgentHoursChartProps) => {
  const chartData = monthlyData.map((d) => ({
    mois: d.month,
    "Heures Cantine": d.heuresAgentCantine,
    "Heures ALSH": d.heuresAgentALSH,
    "Heures Mercredi": d.heuresAgentMercredi,
  }));

  // Calculer les totaux annuels
  const totalHeuresCantine = monthlyData.reduce((sum, d) => sum + d.heuresAgentCantine, 0);
  const totalHeuresALSH = monthlyData.reduce((sum, d) => sum + d.heuresAgentALSH, 0);
  const totalHeuresMercredi = monthlyData.reduce((sum, d) => sum + d.heuresAgentMercredi, 0);

  return (
    <div className="stat-card animate-slide-up">
      <h3 className="text-lg font-semibold font-display mb-2">
        Heures agent annuelles
      </h3>
      <div className="flex gap-4 mb-4 text-sm flex-wrap">
        <span className="text-muted-foreground">
          Cantine: <strong className="text-primary">{totalHeuresCantine.toFixed(0)}h</strong>
        </span>
        <span className="text-muted-foreground">
          ALSH: <strong className="text-warning">{totalHeuresALSH.toFixed(0)}h</strong>
        </span>
        <span className="text-muted-foreground">
          Mercredi: <strong className="text-green-600">{totalHeuresMercredi.toFixed(0)}h</strong>
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
            <YAxis
              tick={{ fill: "hsl(215, 15%, 45%)", fontSize: 12 }}
              tickFormatter={(value) => `${value}h`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(0, 0%, 100%)",
                border: "1px solid hsl(210, 20%, 90%)",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
              formatter={(value: number) => [`${value.toFixed(1)} heures`, ""]}
            />
            <Legend />
            <Bar
              dataKey="Heures Cantine"
              fill="hsl(210, 60%, 50%)"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="Heures ALSH"
              fill="hsl(38, 92%, 50%)"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="Heures Mercredi"
              fill="hsl(142, 71%, 45%)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AgentHoursChart;
