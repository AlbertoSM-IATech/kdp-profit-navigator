import { PositioningResults, GlobalData, EbookResults, PaperbackResults } from '@/types/kdp';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, MousePointer, TrendingUp, AlertTriangle, CheckCircle, Euro, BarChart3 } from 'lucide-react';

interface PositioningSectionProps {
  results: PositioningResults | null;
  globalData: GlobalData;
  activeResults: EbookResults | PaperbackResults | null;
  embedded?: boolean;
}

export const PositioningSection = ({
  results,
  globalData,
  activeResults,
  embedded = false
}: PositioningSectionProps) => {
  const currencySymbol = globalData.marketplace === 'COM' ? '$' : '€';
  const ventasDiarias = globalData.ventasDiariasCompetencia || 0;
  const cpc = globalData.cpc || 0;

  // Cálculos de posicionamiento
  const conversionRef = 0.10; // 10% conversión de referencia
  const clicsDiarios = ventasDiarias > 0 ? Math.ceil(ventasDiarias / conversionRef) : 0;
  const inversionDiaria = clicsDiarios * cpc;

  // Clics máx from base config
  const clicsMaxBase = activeResults?.clicsMaxPorVenta || 0;

  const renderContent = () => {
    if (!results) {
      return (
        <div className="flex items-center justify-center h-32 bg-muted/30 rounded-lg">
          <p className="text-sm text-muted-foreground">
            Completa los datos globales para ver análisis de posicionamiento
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {/* 2-column layout: Metrics stacked on left, Advice on right */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left Column: Conversion, Clicks, Investment - stacked vertically */}
          <div className="space-y-3">
            {/* Tasa de Conversión Referencia */}
            <div className="rounded-xl p-3 border border-secondary/20 bg-inherit">
              <div className="flex items-center gap-2 mb-1">
                <div className="p-1.5 bg-secondary/20 rounded-lg">
                  <TrendingUp className="h-4 w-4 text-secondary" />
                </div>
                <span className="text-sm font-bold text-foreground">Conversión Ref.</span>
              </div>
              <p className="text-secondary text-2xl font-extrabold">10%</p>
              <p className="text-xs text-muted-foreground">1 venta cada 10 clics</p>
            </div>

            {/* Clics Diarios Necesarios */}
            <div className="bg-primary/10 rounded-xl p-3 border border-primary/20">
              <div className="flex items-center gap-2 mb-1">
                <div className="p-1.5 bg-primary/20 rounded-lg">
                  <MousePointer className="h-4 w-4 text-primary" />
                </div>
                <span className="font-bold text-sm text-foreground">Clics Diarios</span>
              </div>
              <p className="text-primary text-2xl font-extrabold">{Math.ceil(results.clicsDiarios)}</p>
              <p className="text-xs text-muted-foreground">Para {ventasDiarias} ventas/día</p>
            </div>

            {/* Inversión Diaria */}
            <div className="bg-muted rounded-xl p-3 border border-border">
              <div className="flex items-center gap-2 mb-1">
                <div className="p-1.5 bg-foreground/10 rounded-lg">
                  <Euro className="h-4 w-4 text-foreground" />
                </div>
                <span className="text-sm font-bold text-foreground">Inversión Diaria</span>
              </div>
              <p className="text-foreground text-2xl font-extrabold">{results.inversionDiaria.toFixed(2)}{currencySymbol}</p>
              <p className="text-xs text-muted-foreground">A {cpc.toFixed(2)}{currencySymbol}/clic</p>
            </div>
          </div>

          {/* Right Column: Strategic advice + Breakeven reference */}
          <div className="space-y-3">
            {/* Bloque de recomendación estratégica */}
            <div className="bg-gradient-to-br from-secondary/10 to-primary/10 rounded-xl p-4 border border-secondary/20 h-full">
              <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2 text-sm">
                <Target className="h-4 w-4 text-secondary shrink-0" />
                Consejo estratégico
              </h4>
              
              <div className="space-y-2 text-xs leading-relaxed">
                <p className="text-muted-foreground">
                  Para competir con los mejores necesitarás <span className="text-primary font-extrabold">{ventasDiarias} copias/día</span>.
                </p>
                
                <p className="text-muted-foreground">
                  Con 10% conversión = <span className="text-primary font-extrabold">{clicsDiarios} clics/día</span> ≈ <span className="text-primary font-extrabold">{inversionDiaria.toFixed(2)}{currencySymbol}</span> inversión.
                </p>
                
                <p className="font-medium text-foreground pt-2 border-t border-border/50">
                  Este dato te permite decidir si el nicho es viable antes de producir el libro.
                </p>
              </div>

              {/* Referencia de breakeven publicitario - inline */}
              {activeResults && clicsMaxBase > 0 && (
                <div className="mt-3 pt-3 border-t border-border/50">
                  <div className="flex items-center gap-2 mb-1">
                    <BarChart3 className="h-3 w-3 text-primary" />
                    <span className="text-xs font-semibold text-foreground">Breakeven Ads</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Necesitas <span className="font-bold text-primary">1 pedido/{clicsMaxBase} clics</span> para no perder dinero.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Advertencias - Solo condicionales */}
        {results.advertencias.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
              <AlertTriangle className="h-3 w-3 text-warning" />
              Advertencias
            </h4>
            <div className="space-y-1">
              {results.advertencias.map((adv, idx) => (
                <div key={idx} className="flex items-start gap-2 p-2 bg-warning/10 border border-warning/30 rounded-lg">
                  <AlertTriangle className="h-3 w-3 text-warning mt-0.5 shrink-0" />
                  <p className="text-xs text-foreground">{adv}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Show success message only if no warnings */}
        {results.advertencias.length === 0 && (
          <div className="flex items-start gap-2 p-2 bg-success/10 border border-success/30 rounded-lg">
            <CheckCircle className="h-3 w-3 text-success mt-0.5 shrink-0" />
            <p className="text-xs text-foreground">
              Ratios de conversión e inversión dentro de parámetros aceptables.
            </p>
          </div>
        )}
      </div>
    );
  };

  if (embedded) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-secondary" />
          <h3 className="text-base font-semibold text-foreground">Consejo estratégico</h3>
        </div>
        {renderContent()}
      </div>
    );
  }

  return (
    <Card className="animate-fade-in h-full">
      <CardHeader className="pb-4">
        <CardTitle className="section-header">
          <Target className="h-5 w-5 text-secondary" />
          Consejo estratégico
        </CardTitle>
        <p className="text-sm text-muted-foreground">Reglas operativas con tus números.</p>
      </CardHeader>
      <CardContent>
        {renderContent()}
      </CardContent>
    </Card>
  );
};