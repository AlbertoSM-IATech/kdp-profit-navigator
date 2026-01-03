import { ScoreBreakdown } from '@/types/kdp';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Gauge, MousePointer, TrendingUp, Tag, HelpCircle, AlertTriangle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ScoreDisplayProps {
  score: ScoreBreakdown | null;
  currencySymbol?: string;
  compact?: boolean;
}

interface ScoreItemProps {
  label: string;
  value: number;
  max: number;
  icon: React.ReactNode;
  tooltip: string;
}

const ScoreItem = ({ label, value, max, icon, tooltip }: ScoreItemProps) => {
  const percentage = (value / max) * 100;
  
  return (
    <div className="flex items-center gap-2">
      <div className="p-1.5 bg-muted rounded shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-[10px] text-muted-foreground flex items-center gap-0.5 cursor-help">
                  {label}
                  <HelpCircle className="h-2.5 w-2.5" />
                </span>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                <p className="text-xs">{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <span className="text-xs font-semibold">{value}/{max}</span>
        </div>
        <Progress value={percentage} className="h-1" />
      </div>
    </div>
  );
};

export const ScoreDisplay = ({ score, currencySymbol = '€', compact = false }: ScoreDisplayProps) => {
  if (!score) {
    return (
      <Card className="animate-fade-in">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center gap-2 mb-2">
            <Gauge className="h-4 w-4 text-primary" />
            <span className="font-semibold text-sm">Score Global</span>
          </div>
          <div className="flex items-center justify-center h-16 bg-muted/30 rounded-lg">
            <p className="text-xs text-muted-foreground">Completa los datos para ver el score</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const scoreColor = score.status === 'excellent' ? 'text-success' :
                     score.status === 'viable' ? 'text-warning' :
                     'text-destructive';

  const scoreBg = score.status === 'excellent' ? 'bg-success/10 border-success/30' :
                  score.status === 'viable' ? 'bg-warning/10 border-warning/30' :
                  'bg-destructive/10 border-destructive/30';

  if (compact) {
    return (
      <div className={`flex items-center justify-between p-3 rounded-lg border ${scoreBg}`}>
        <div className="flex items-center gap-2">
          <span className="text-3xl font-extrabold" style={{ color: score.statusColor }}>
            {score.totalScore}
          </span>
          <span className="text-sm text-muted-foreground">/100</span>
        </div>
        <div className="text-right">
          <span className="text-xl block">{score.statusEmoji}</span>
          <span className={`text-xs font-bold ${scoreColor}`}>{score.statusLabel}</span>
        </div>
      </div>
    );
  }

  return (
    <Card className="animate-fade-in">
      <CardContent className="pt-4 pb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left: Score Display */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Gauge className="h-4 w-4 text-primary" />
              <span className="font-semibold text-sm">Score Global</span>
            </div>
            
            <div className={`flex items-center justify-between p-4 rounded-lg border ${scoreBg}`}>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold" style={{ color: score.statusColor }}>
                  {score.totalScore}
                </span>
                <span className="text-lg text-muted-foreground">/100</span>
              </div>
              <div className="text-right">
                <span className="text-2xl block">{score.statusEmoji}</span>
                <span className={`text-sm font-bold ${scoreColor}`}>{score.statusLabel}</span>
              </div>
            </div>

            {score.clicsCapped && (
              <div className="flex items-center gap-2 mt-2 p-2 bg-destructive/10 border border-destructive/30 rounded text-xs">
                <AlertTriangle className="h-3 w-3 text-destructive shrink-0" />
                <span className="text-destructive">Score limitado (clics &lt;10)</span>
              </div>
            )}

            {/* Legend */}
            <div className="grid grid-cols-3 gap-1 mt-2 text-[10px]">
              <div className="flex items-center gap-1 p-1 rounded bg-success/10">
                <span className="w-1.5 h-1.5 rounded-full bg-success"></span>
                <span>80-100</span>
              </div>
              <div className="flex items-center gap-1 p-1 rounded bg-warning/10">
                <span className="w-1.5 h-1.5 rounded-full bg-warning"></span>
                <span>50-79</span>
              </div>
              <div className="flex items-center gap-1 p-1 rounded bg-destructive/10">
                <span className="w-1.5 h-1.5 rounded-full bg-destructive"></span>
                <span>&lt;50</span>
              </div>
            </div>
          </div>

          {/* Right: Breakdown */}
          <div className="space-y-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Desglose</span>
            
            <div className="space-y-2">
              <ScoreItem
                label="Clics (CRÍTICO)"
                value={score.clicsScore}
                max={50}
                icon={<MousePointer className="h-3 w-3 text-primary" />}
                tooltip="≥13 = 50pts, 10-12 = 30pts, <10 = 0pts"
              />
              
              <ScoreItem
                label="BACOS"
                value={score.bacosScore}
                max={30}
                icon={<TrendingUp className="h-3 w-3 text-success" />}
                tooltip="≥40% = 30pts, ≥30% = 15pts, <30% = 0pts"
              />
              
              <ScoreItem
                label="PVP vs Mín."
                value={score.pvpVsMinScore}
                max={20}
                icon={<Tag className="h-3 w-3 text-secondary" />}
                tooltip="PVP > mín. = 20pts, = mín. = 10pts, < mín. = 0pts"
              />
            </div>

            <div className={`p-2 rounded text-xs ${scoreBg}`}>
              {score.status === 'excellent' && 'Excelente para escalar Ads.'}
              {score.status === 'viable' && 'Viable con ajustes. Optimiza precio o CPC.'}
              {score.status === 'not-recommended' && 'No recomendable. Reformula antes de invertir.'}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
