import { useMemo } from "react";
import { Users, Euro, Leaf, Trash2 } from "lucide-react";
import Header from "@/components/Header";
import StatCard from "@/components/StatCard";
import CostChart from "@/components/CostChart";
import CostBreakdownChart from "@/components/CostBreakdownChart";
import AttendanceChart from "@/components/AttendanceChart";
import WasteChart from "@/components/WasteChart";
import MealsChart from "@/components/MealsChart";
import AgentHoursChart from "@/components/AgentHoursChart";
import StaffCostsChart from "@/components/StaffCostsChart";
import DataTable from "@/components/DataTable";
import { useCanteenData } from "@/hooks/useCanteenData";
import { aggregateByMonth } from "@/utils/dataAggregation";

const Index = () => {
  const { data, selectedMonth, addEntry, updateEntry, deleteEntry } = useCanteenData();

  const monthlyData = useMemo(() => {
    return aggregateByMonth(data, selectedMonth);
  }, [data, selectedMonth]);

  const stats = useMemo(() => {
    const validData = data.filter(
      (d) => d.nbEnfantsCantine !== null || d.nbEnfantsALSH !== null
    );

    const totalEnfants = validData.reduce(
      (sum, d) => sum + (d.nbEnfantsCantine || 0) + (d.nbEnfantsALSH || 0),
      0
    );

    const totalCoutBio = validData.reduce((sum, d) => sum + (d.coutBio || 0), 0);
    const totalCoutConv = validData.reduce(
      (sum, d) => sum + (d.coutConventionnel || 0),
      0
    );
    const totalCoutSiqo = validData.reduce(
      (sum, d) => sum + (d.coutSiqo || 0),
      0
    );
    const totalCout = totalCoutBio + totalCoutConv + totalCoutSiqo;

    const avgCoutParEnfant = totalEnfants > 0 ? totalCout / totalEnfants : 0;

    const percentBio = totalCout > 0 ? (totalCoutBio / totalCout) * 100 : 0;

    const totalDechets = validData.reduce(
      (sum, d) =>
        sum + (d.dechetPrimairePoids || 0) + (d.dechetMaternellePoids || 0),
      0
    );

    const avgDechetsParEnfant = totalEnfants > 0 ? totalDechets / totalEnfants : 0;

    return {
      totalEnfants,
      totalCout,
      avgCoutParEnfant,
      percentBio,
      totalDechets,
      avgDechetsParEnfant,
      nbJours: validData.length,
    };
  }, [data]);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Total Enfants"
            value={stats.totalEnfants.toLocaleString("fr-FR")}
            subtitle={`Sur ${stats.nbJours} jours`}
            icon={<Users className="h-6 w-6" />}
            variant="primary"
          />
          <StatCard
            title="Coût Total"
            value={`${stats.totalCout.toFixed(0)} €`}
            subtitle={`${stats.avgCoutParEnfant.toFixed(2)} €/enfant`}
            icon={<Euro className="h-6 w-6" />}
            trend={-2.5}
          />
          <StatCard
            title="Part Bio"
            value={`${stats.percentBio.toFixed(0)}%`}
            subtitle="Des achats alimentaires"
            icon={<Leaf className="h-6 w-6" />}
            variant="accent"
          />
          <StatCard
            title="Déchets"
            value={`${stats.totalDechets.toFixed(1)} kg`}
            subtitle={`${(stats.avgDechetsParEnfant * 1000).toFixed(0)} g/enfant`}
            icon={<Trash2 className="h-6 w-6" />}
            trend={-5.2}
          />
        </div>

        {/* Charts Row 1 - Coûts alimentaires */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <CostChart monthlyData={monthlyData} />
          </div>
          <div>
            <CostBreakdownChart data={data} />
          </div>
        </div>

        {/* Charts Row 2 - Fréquentation et Déchets */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <AttendanceChart monthlyData={monthlyData} />
          <WasteChart monthlyData={monthlyData} />
        </div>

        {/* Charts Row 3 - Repas annuels */}
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 mb-6">
          <MealsChart monthlyData={monthlyData} />
        </div>

        {/* Charts Row 4 - Heures agent et Frais personnel */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <AgentHoursChart monthlyData={monthlyData} />
          <StaffCostsChart monthlyData={monthlyData} />
        </div>

        {/* Data Table */}
        <DataTable 
          data={data} 
          onAdd={addEntry}
          onUpdate={updateEntry}
          onDelete={deleteEntry}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-8">
        <div className="container mx-auto px-4 py-6">
          <p className="text-center text-sm text-muted-foreground">
            © 2026 Suivi Restauration Scolaire • Les données sont sauvegardées localement
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
