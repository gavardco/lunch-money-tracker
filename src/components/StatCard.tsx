import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  trend?: number;
  variant?: "default" | "primary" | "accent" | "warning";
  className?: string;
}

const StatCard = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  variant = "default",
  className,
}: StatCardProps) => {
  const variantStyles = {
    default: "bg-card",
    primary: "gradient-primary text-primary-foreground",
    accent: "gradient-accent text-accent-foreground",
    warning: "gradient-warning text-warning-foreground",
  };

  const iconBgStyles = {
    default: "bg-primary/10 text-primary",
    primary: "bg-primary-foreground/20 text-primary-foreground",
    accent: "bg-accent-foreground/20 text-accent-foreground",
    warning: "bg-warning-foreground/20 text-warning-foreground",
  };

  const subtitleStyles = {
    default: "text-muted-foreground",
    primary: "text-primary-foreground/70",
    accent: "text-accent-foreground/70",
    warning: "text-warning-foreground/70",
  };

  return (
    <div
      className={cn(
        "stat-card animate-slide-up",
        variantStyles[variant],
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className={cn("text-sm font-medium", subtitleStyles[variant])}>
            {title}
          </p>
          <p className="text-3xl font-bold font-display animate-count-up">
            {value}
          </p>
          {subtitle && (
            <p className={cn("text-sm", subtitleStyles[variant])}>{subtitle}</p>
          )}
          {trend !== undefined && (
            <div className="flex items-center gap-1 text-sm">
              {trend > 0 ? (
                <>
                  <TrendingUp className="h-4 w-4 text-bio" />
                  <span className="text-bio">+{trend.toFixed(1)}%</span>
                </>
              ) : trend < 0 ? (
                <>
                  <TrendingDown className="h-4 w-4 text-destructive" />
                  <span className="text-destructive">{trend.toFixed(1)}%</span>
                </>
              ) : (
                <>
                  <Minus className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">0%</span>
                </>
              )}
              <span className={cn("ml-1", subtitleStyles[variant])}>vs mois précédent</span>
            </div>
          )}
        </div>
        <div className={cn("p-3 rounded-xl", iconBgStyles[variant])}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
