import { useMemo } from "react";
import { Users, Euro, Leaf, Trash2 } from "lucide-react";
import Header from "@/components/Header";
import StatCard from "@/components/StatCard";
import CostChart from "@/components/CostChart";
import CostBreakdownChart from "@/components/CostBreakdownChart";
import AttendanceChart from "@/components/AttendanceChart";
import WasteChart from "@/components/WasteChart";
import DataTable from "@/components/DataTable";
import { sampleData } from "@/data/sampleData";

const Index = () => {
  const stats = useMemo(() => {
    const validData = sampleData.filter(
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
    const totalCoutSigo = validData.reduce(
      (sum, d) => sum + (d.coutSigo || 0),
      0
    );
    const totalCout = totalCoutBio + totalCoutConv + totalCoutSigo;

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
  }, []);

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

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <CostChart data={sampleData} />
          </div>
          <div>
            <CostBreakdownChart data={sampleData} />
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <AttendanceChart data={sampleData} />
          <WasteChart data={sampleData} />
        </div>

        {/* Data Table */}
        <DataTable data={sampleData} />
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-8">
        <div className="container mx-auto px-4 py-6">
          <p className="text-center text-sm text-muted-foreground">
            © 2026 Suivi Restauration Scolaire • Données de janvier 2026
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
