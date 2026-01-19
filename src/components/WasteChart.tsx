import { DailyData } from "@/types/cantine";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface WasteChartProps {
  data: DailyData[];
}

const WasteChart = ({ data }: WasteChartProps) => {
  const chartData = data
    .filter(
      (d) =>
        d.dechetPrimairePoids !== null ||
        d.dechetMaternellePoids !== null
    )
    .map((d) => ({
      jour: d.date,
      Primaires: d.dechetPrimairePoids || 0,
      Maternelles: d.dechetMaternellePoids || 0,
    }));

  return (
    <div className="stat-card animate-slide-up">
      <h3 className="text-lg font-semibold font-display mb-4">
        Déchets alimentaires (kg)
      </h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(210, 20%, 90%)" />
            <XAxis
              dataKey="jour"
              tick={{ fill: "hsl(215, 15%, 45%)", fontSize: 12 }}
              tickFormatter={(value) => `J${value}`}
            />
            <YAxis
              tick={{ fill: "hsl(215, 15%, 45%)", fontSize: 12 }}
              tickFormatter={(value) => `${value} kg`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(0, 0%, 100%)",
                border: "1px solid hsl(210, 20%, 90%)",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
              formatter={(value: number) => [`${value.toFixed(2)} kg`, ""]}
              labelFormatter={(label) => `Jour ${label}`}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="Primaires"
              stroke="hsl(210, 60%, 50%)"
              strokeWidth={2}
              dot={{ fill: "hsl(210, 60%, 50%)", strokeWidth: 2 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="Maternelles"
              stroke="hsl(142, 70%, 45%)"
              strokeWidth={2}
              dot={{ fill: "hsl(142, 70%, 45%)", strokeWidth: 2 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default WasteChart;
