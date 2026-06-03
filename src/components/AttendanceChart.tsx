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

interface AttendanceChartProps {
  monthlyData: MonthlyData[];
}

const AttendanceChart = ({ monthlyData }: AttendanceChartProps) => {
  const chartData = monthlyData.map((d) => ({
    mois: d.month,
    Primaires: d.totalPrimaires,
    Maternelles: d.totalMaternelles,
    ALSH: d.totalRepasMercredi + d.totalEnfantsALSH,
  }));

  return (
    <div className="stat-card animate-slide-up">
      <h3 className="text-lg font-semibold font-display mb-4">
        Fréquentation mensuelle
      </h3>
      <div className="h-[300px]">
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
              formatter={(value: number) => [`${value} enfants`, ""]}
            />
            <Legend />
            <Bar
              dataKey="Primaires"
              fill="hsl(210, 60%, 50%)"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="Maternelles"
              fill="hsl(142, 70%, 45%)"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="ALSH"
              fill="hsl(38, 92%, 50%)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AttendanceChart;
