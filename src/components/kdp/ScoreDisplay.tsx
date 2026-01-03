import { ScoreBreakdown } from '@/types/kdp';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    <div className="flex items-center gap-3">
      <div className="p-2 bg-muted rounded-lg shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-xs text-muted-foreground flex items-center gap-1 cursor-help">
                  {label}
                  <HelpCircle className="h-3 w-3" />
                </span>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                <p className="text-xs">{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <span className="text-sm font-semibold text-foreground">{value}/{max}</span>
        </div>
        <Progress value={percentage} className="h-1.5" />
      </div>
    </div>
  );
};

export const ScoreDisplay = ({ score, currencySymbol = '€', compact = false }: ScoreDisplayProps) => {
  if (!score) {
    return (
      <Card className="animate-fade-in">
        <CardHeader className="pb-4">
          <CardTitle className="section-header">
            <Gauge className="h-5 w-5 text-primary" />
            Score Global
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32 bg-muted/30 rounded-lg">
            <p className="text-sm text-muted-foreground">
              Completa los datos para ver el score global
            </p>
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

  // Compact view for quick mode
  if (compact) {
    return (
      <div className={`flex items-center justify-between p-4 rounded-xl border-2 ${scoreBg}`}>
        <div className="flex items-center gap-4">
          <span className="text-4xl font-extrabold" style={{ color: score.statusColor }}>
            {score.totalScore}
          </span>
          <span className="text-lg text-muted-foreground">/100</span>
        </div>
        <div className="text-right">
          <span className="text-2xl block mb-1">{score.statusEmoji}</span>
          <span className={`text-sm font-bold ${scoreColor}`}>{score.statusLabel}</span>
        </div>
      </div>
    );
  }

  return (
    <Card className="animate-fade-in">
      <CardHeader className="pb-4">
        <CardTitle className="section-header">
          <Gauge className="h-5 w-5 text-primary" />
          Score Global de Viabilidad
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Indicador sintético (0-100). Los clics por venta determinan la viabilidad en Ads.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Score Display */}
        <div className={`flex items-center justify-between p-6 rounded-xl border-2 ${scoreBg}`}>
          <div className="text-center">
            <span className="text-6xl font-extrabold" style={{ color: score.statusColor }}>
              {score.totalScore}
            </span>
            <span className="text-2xl text-muted-foreground">/100</span>
          </div>
          <div className="text-right">
            <span className="text-3xl block mb-1">{score.statusEmoji}</span>
            <span className={`text-lg font-bold ${scoreColor}`}>{score.statusLabel}</span>
          </div>
        </div>

        {/* Clics Cap Warning */}
        {score.clicsCapped && (
          <div className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-destructive">Score limitado a 40</p>
              <p className="text-xs text-muted-foreground mt-1">
                Con menos de 10 clics máx./venta, el nicho no es viable para Ads independientemente de otros factores.
              </p>
            </div>
          </div>
        )}

        {/* Score Legend - NEW THRESHOLDS */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="flex items-center gap-2 p-2 rounded-lg bg-success/10">
            <span className="w-2 h-2 rounded-full bg-success"></span>
            <span className="text-muted-foreground">80-100: Sano</span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-warning/10">
            <span className="w-2 h-2 rounded-full bg-warning"></span>
            <span className="text-muted-foreground">50-79: Ajustable</span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-destructive/10">
            <span className="w-2 h-2 rounded-full bg-destructive"></span>
            <span className="text-muted-foreground">&lt;50: No viable</span>
          </div>
        </div>

        {/* Score Breakdown - NEW COMPONENTS */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Desglose del Score
          </h4>
          
          <div className="space-y-3">
            <ScoreItem
              label="Clics máx./Venta (CRÍTICO)"
              value={score.clicsScore}
              max={50}
              icon={<MousePointer className="h-4 w-4 text-primary" />}
              tooltip="≥13 clics = 50pts (Excelente), 10-12 = 30pts (Riesgo mínimo aceptable), <10 = 0pts (No viable)"
            />
            
            <ScoreItem
              label="BACOS"
              value={score.bacosScore}
              max={30}
              icon={<TrendingUp className="h-4 w-4 text-success" />}
              tooltip="El BACOS refleja el margen publicitario real. ≥40% = 30pts, ≥30% = 15pts, <30% = 0pts"
            />
            
            <ScoreItem
              label="PVP vs Mínimo"
              value={score.pvpVsMinScore}
              max={20}
              icon={<Tag className="h-4 w-4 text-secondary" />}
              tooltip="PVP > recomendado = 20pts, PVP = recomendado = 10pts, PVP < recomendado = 0pts"
            />
          </div>
        </div>

        {/* Interpretation */}
        <div className={`p-4 rounded-lg border ${scoreBg}`}>
          <p className="text-sm text-foreground">
            {score.status === 'excellent' && 
              'Excelente configuración para escalar campañas de Ads. Margen de maniobra amplio.'}
            {score.status === 'viable' && 
              'Configuración viable pero requiere ajustes. Optimiza precio, CPC o busca keywords menos competidas.'}
            {score.status === 'not-recommended' && 
              'No recomendable para Ads en las condiciones actuales. Reformula antes de invertir.'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
