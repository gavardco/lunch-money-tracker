import { UtensilsCrossed, Calendar, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";

const Header = () => {
  const currentMonth = new Date().toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  });

  return (
    <header className="gradient-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary-foreground/20 rounded-xl">
              <UtensilsCrossed className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold font-display">
                Restauration Scolaire
              </h1>
              <p className="text-primary-foreground/80 text-sm md:text-base">
                Suivi des coûts et de la fréquentation
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              className="bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground border-0"
            >
              <Calendar className="h-4 w-4 mr-2" />
              <span className="capitalize">{currentMonth}</span>
            </Button>
            <Button
              variant="secondary"
              className="bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground border-0"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Rapports
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
