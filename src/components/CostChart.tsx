import { DailyData } from "@/types/cantine";
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

interface CostChartProps {
  data: DailyData[];
}

const CostChart = ({ data }: CostChartProps) => {
  const chartData = data
    .filter((d) => d.nbEnfantsCantine !== null)
    .map((d) => ({
      jour: d.date,
      Bio: d.coutBio || 0,
      Conventionnel: d.coutConventionnel || 0,
      SIGO: d.coutSigo || 0,
    }));

  return (
    <div className="stat-card animate-slide-up">
      <h3 className="text-lg font-semibold font-display mb-4">
        Évolution des coûts alimentaires
      </h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorBio" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(142, 70%, 45%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(142, 70%, 45%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorConv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(210, 60%, 50%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(210, 60%, 50%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorSigo" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(280, 60%, 50%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(280, 60%, 50%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(210, 20%, 90%)" />
            <XAxis
              dataKey="jour"
              tick={{ fill: "hsl(215, 15%, 45%)", fontSize: 12 }}
              tickFormatter={(value) => `J${value}`}
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
              labelFormatter={(label) => `Jour ${label}`}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="Bio"
              stroke="hsl(142, 70%, 45%)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorBio)"
            />
            <Area
              type="monotone"
              dataKey="Conventionnel"
              stroke="hsl(210, 60%, 50%)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorConv)"
            />
            <Area
              type="monotone"
              dataKey="SIGO"
              stroke="hsl(280, 60%, 50%)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorSigo)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CostChart;
