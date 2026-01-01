import { ScoreBreakdown } from '@/types/kdp';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Gauge, MousePointer, Percent, TrendingUp, Euro, Tag, HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ScoreDisplayProps {
  score: ScoreBreakdown | null;
  currencySymbol?: string;
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

export const ScoreDisplay = ({ score, currencySymbol = '€' }: ScoreDisplayProps) => {
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
                     score.status === 'risky' ? 'text-orange-500' :
                     'text-destructive';

  const scoreBg = score.status === 'excellent' ? 'bg-success/10 border-success/30' :
                  score.status === 'viable' ? 'bg-warning/10 border-warning/30' :
                  score.status === 'risky' ? 'bg-orange-500/10 border-orange-500/30' :
                  'bg-destructive/10 border-destructive/30';

  return (
    <Card className="animate-fade-in">
      <CardHeader className="pb-4">
        <CardTitle className="section-header">
          <Gauge className="h-5 w-5 text-primary" />
          Score Global de Viabilidad
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Indicador sintético (0-100) que resume todas las métricas clave.
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

        {/* Score Legend */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          <div className="flex items-center gap-2 p-2 rounded-lg bg-success/10">
            <span className="w-2 h-2 rounded-full bg-success"></span>
            <span className="text-muted-foreground">80-100: Muy sano</span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-warning/10">
            <span className="w-2 h-2 rounded-full bg-warning"></span>
            <span className="text-muted-foreground">60-79: Viable</span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-orange-500/10">
            <span className="w-2 h-2 rounded-full bg-orange-500"></span>
            <span className="text-muted-foreground">40-59: Riesgo</span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-destructive/10">
            <span className="w-2 h-2 rounded-full bg-destructive"></span>
            <span className="text-muted-foreground">&lt;40: No viable</span>
          </div>
        </div>

        {/* Score Breakdown */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Desglose del Score
          </h4>
          
          <div className="space-y-3">
            <ScoreItem
              label="Clics máx./Venta"
              value={score.clicsScore}
              max={30}
              icon={<MousePointer className="h-4 w-4 text-primary" />}
              tooltip="≥13 clics = 30pts, 10-12 = 20pts, 7-9 = 10pts, <7 = 0pts"
            />
            
            <ScoreItem
              label="Margen neto"
              value={score.margenScore}
              max={25}
              icon={<Percent className="h-4 w-4 text-secondary" />}
              tooltip="≥40% = 25pts, 30-39% = 18pts, 20-29% = 10pts, <20% = 0pts"
            />
            
            <ScoreItem
              label="BACOS"
              value={score.bacosScore}
              max={20}
              icon={<TrendingUp className="h-4 w-4 text-success" />}
              tooltip="≥40% = 20pts, 30-39% = 14pts, 20-29% = 8pts, <20% = 0pts"
            />
            
            <ScoreItem
              label="Inversión diaria"
              value={score.inversionScore}
              max={15}
              icon={<Euro className="h-4 w-4 text-warning" />}
              tooltip={`≤15${currencySymbol} = 15pts, 15-30${currencySymbol} = 10pts, 30-60${currencySymbol} = 5pts, >60${currencySymbol} = 0pts`}
            />
            
            <ScoreItem
              label="PVP vs Mínimo"
              value={score.pvpVsMinScore}
              max={10}
              icon={<Tag className="h-4 w-4 text-destructive" />}
              tooltip="PVP ≥ recomendado = 10pts, ligeramente inferior = 5pts, muy por debajo = 0pts"
            />
          </div>
        </div>

        {/* Interpretation */}
        <div className={`p-4 rounded-lg border ${scoreBg}`}>
          <p className="text-sm text-foreground">
            {score.status === 'excellent' && 
              'Excelente configuración para escalar campañas de Ads. Margen de maniobra amplio.'}
            {score.status === 'viable' && 
              'Configuración viable pero requiere control. Monitoriza el CPC y optimiza keywords.'}
            {score.status === 'risky' && 
              'Riesgo medio-alto. Considera ajustar precio, reducir costes o buscar nichos menos competidos.'}
            {score.status === 'not-recommended' && 
              'No recomendable para Ads en las condiciones actuales. Reformula antes de invertir.'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
