import { FactCheck } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils"; // Import this to merge classes correctly
import { CheckCircle2, XCircle, AlertTriangle, ExternalLink } from "lucide-react";

const statusConfig = {
  True: { 
    color: "bg-green-50 text-green-700 border-green-200", 
    borderColor: "border-l-green-500",
    icon: CheckCircle2 
  },
  False: { 
    color: "bg-red-50 text-red-700 border-red-200", 
    borderColor: "border-l-red-500",
    icon: XCircle 
  },
  Misleading: { 
    color: "bg-yellow-50 text-yellow-700 border-yellow-200", 
    borderColor: "border-l-yellow-500",
    icon: AlertTriangle 
  },
};

export function FactCheckCard({ check }: { check: FactCheck }) {
  // Fallback for unexpected verdict strings
  const config = statusConfig[check.verdict] || { 
    color: "bg-slate-50 text-slate-600 border-slate-200", 
    borderColor: "border-l-slate-400",
    icon: AlertTriangle 
  };
  
  const Icon = config.icon;

  return (
    <Card className={cn("overflow-hidden border-l-4 shadow-sm", config.borderColor)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <Badge 
            variant="outline" 
            className={cn("font-bold", config.color)}
          >
            <Icon className="w-3 h-3 mr-1" /> {check.verdict}
          </Badge>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
            {new Date(check.created_at).toLocaleDateString()}
          </span>
        </div>
        <CardTitle className="text-base mt-2 line-clamp-2 leading-tight">
          {check.claim}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-slate-600 leading-relaxed italic border-l-2 pl-2 border-slate-100">
          "{check.explanation}"
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          {check.links.map((link, i) => (
            <a 
              key={i} 
              href={link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[10px] flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 transition-colors bg-blue-50 px-2 py-1 rounded"
            >
              Source {i + 1} <ExternalLink className="w-2 h-2" />
            </a>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}