import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatsCardProps {
  title: string;
  value: string;
  description?: string;
  icon: LucideIcon;
  iconBgClass?: string;
  iconColorClass?: string;
}

export default function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  iconBgClass = "bg-flag-blue/10",
  iconColorClass = "text-flag-blue",
}: StatsCardProps) {
  return (
    <Card className="border border-border shadow-sm">
      <CardContent className="p-5 flex items-start gap-4">
        <div
          className={`size-10 rounded-lg flex items-center justify-center shrink-0 ${iconBgClass}`}
        >
          <Icon className={`size-5 ${iconColorClass}`} />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {title}
          </p>
          <p className="text-2xl font-bold tracking-tight text-foreground mt-0.5">
            {value}
          </p>
          {description && (
            <p className="text-xs text-muted-foreground/70 mt-0.5">{description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
