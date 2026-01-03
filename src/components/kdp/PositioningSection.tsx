import { PositioningResults, GlobalData, EbookResults, PaperbackResults } from '@/types/kdp';
import { Card, CardContent } from '@/components/ui/card';
import { Target, MousePointer, TrendingUp, AlertTriangle, CheckCircle, Euro, BarChart3 } from 'lucide-react';

interface PositioningSectionProps {
  results: PositioningResults | null;
  globalData: GlobalData;
  activeResults: EbookResults | PaperbackResults | null;
}

export const PositioningSection = ({
  results,
  globalData,
  activeResults
}: PositioningSectionProps) => {
  const currencySymbol = globalData.marketplace === 'COM' ? '$' : '€';
  const ventasDiarias = globalData.ventasDiariasCompetencia || 0;
  const cpc = globalData.cpc || 0;
  const conversionRef = 0.10;
  const clicsDiarios = ventasDiarias > 0 ? Math.ceil(ventasDiarias / conversionRef) : 0;
  const inversionDiaria = clicsDiarios * cpc;
  const clicsMaxBase = activeResults?.clicsMaxPorVenta || 0;

  if (!results) {
    return (
      <Card className="animate-fade-in">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-4 w-4 text-secondary" />
            <span className="font-semibold text-sm">Consejo estratégico</span>
          </div>
          <div className="flex items-center justify-center h-16 bg-muted/30 rounded-lg">
            <p className="text-xs text-muted-foreground">Completa los datos para ver análisis</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="animate-fade-in">
      <CardContent className="pt-4 pb-4">
        <div className="flex items-center gap-2 mb-3">
          <Target className="h-4 w-4 text-secondary" />
          <span className="font-semibold text-sm">Consejo estratégico</span>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-3 gap-3 mb-3">
          <div className="bg-secondary/10 rounded-lg p-3 text-center border border-secondary/20">
            <div className="flex items-center justify-center gap-1 mb-1">
              <TrendingUp className="h-3 w-3 text-secondary" />
              <span className="text-[10px] text-muted-foreground">Conv. Ref.</span>
            </div>
            <p className="text-xl font-bold text-secondary">10%</p>
          </div>
          <div className="bg-primary/10 rounded-lg p-3 text-center border border-primary/20">
            <div className="flex items-center justify-center gap-1 mb-1">
              <MousePointer className="h-3 w-3 text-primary" />
              <span className="text-[10px] text-muted-foreground">Clics/día</span>
            </div>
            <p className="text-xl font-bold text-primary">{Math.ceil(results.clicsDiarios)}</p>
          </div>
          <div className="bg-muted rounded-lg p-3 text-center border border-border">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Euro className="h-3 w-3 text-foreground" />
              <span className="text-[10px] text-muted-foreground">Inversión/día</span>
            </div>
            <p className="text-xl font-bold text-foreground">{results.inversionDiaria.toFixed(2)}{currencySymbol}</p>
          </div>
        </div>

        {/* Strategy Text - Condensed */}
        <div className="bg-gradient-to-r from-secondary/5 to-primary/5 rounded-lg p-3 border border-secondary/10 text-xs text-muted-foreground space-y-1.5">
          <p>
            Para <span className="text-primary font-semibold">{ventasDiarias} ventas/día</span> necesitas 
            <span className="text-primary font-semibold"> {clicsDiarios} clics</span> (inversión: 
            <span className="text-primary font-semibold"> {inversionDiaria.toFixed(2)}{currencySymbol}</span>).
          </p>
          {clicsMaxBase > 0 && (
            <p className="flex items-center gap-1">
              <BarChart3 className="h-3 w-3 text-primary" />
              Breakeven: 1 venta cada <span className="font-semibold text-primary">{clicsMaxBase} clics</span>.
            </p>
          )}
        </div>

        {/* Warnings/Success - Compact */}
        {results.advertencias.length > 0 ? (
          <div className="mt-2 space-y-1">
            {results.advertencias.map((adv, idx) => (
              <div key={idx} className="flex items-center gap-2 p-2 bg-warning/10 border border-warning/30 rounded text-xs">
                <AlertTriangle className="h-3 w-3 text-warning shrink-0" />
                <span>{adv}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-2 flex items-center gap-2 p-2 bg-success/10 border border-success/30 rounded text-xs">
            <CheckCircle className="h-3 w-3 text-success" />
            <span>Ratios de conversión e inversión dentro de parámetros aceptables.</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
