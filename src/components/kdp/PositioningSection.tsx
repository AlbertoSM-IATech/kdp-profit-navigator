import { PositioningResults, GlobalData, EbookResults, PaperbackResults } from '@/types/kdp';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, MousePointer, TrendingUp, AlertTriangle, CheckCircle, Euro, BarChart3, Info } from 'lucide-react';

const DISCLAIMER_TEXT = `Aviso importante: Los valores mostrados son estimaciones orientativas basadas en los datos introducidos y en tasas de referencia del sector. No constituyen predicciones exactas de resultados. El rendimiento real de tus campañas dependerá de múltiples factores como la calidad creativa, la competencia del momento, las tendencias del mercado y la ejecución de la estrategia.`;

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
      <div className="space-y-5">
        {/* Metrics row — 3 cards horizontally with explanation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="rounded-xl p-4 border border-border bg-card space-y-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Conversión de referencia
              </span>
            </div>
            <p className="text-2xl font-bold text-foreground">10%</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Tasa media del sector: aproximadamente 1 venta por cada 10 clics de usuarios interesados.
            </p>
          </div>

          <div className="rounded-xl p-4 border border-border bg-card space-y-2">
            <div className="flex items-center gap-2">
              <MousePointer className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Clics diarios necesarios
              </span>
            </div>
            <p className="text-2xl font-bold text-foreground">{Math.ceil(results.clicsDiarios)}</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Tráfico diario que necesitas hacia tu ficha para conseguir {ventasDiarias} ventas al día y competir en el nicho.
            </p>
          </div>

          <div className="rounded-xl p-4 border border-border bg-card space-y-2">
            <div className="flex items-center gap-2">
              <Euro className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Inversión diaria estimada
              </span>
            </div>
            <p className="text-2xl font-bold text-foreground">{results.inversionDiaria.toFixed(2)}{currencySymbol}</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Presupuesto diario aproximado en Amazon Ads asumiendo un coste por clic de {cpc.toFixed(2)}{currencySymbol}.
            </p>
          </div>
        </div>

        {/* Strategic advice card */}
        <div className="rounded-xl p-5 border border-border bg-card">
          <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2 text-base">
            <Target className="h-5 w-5 text-secondary shrink-0" />
            Consejo estratégico
          </h4>

          <div className="space-y-4 text-sm leading-relaxed">
            <p className="text-muted-foreground">
              Para competir con los libros mejor posicionados de tu nicho, necesitarás conseguir aproximadamente <span className="text-foreground font-semibold">{ventasDiarias} copias vendidas al día</span>. Este es el umbral mínimo para entrar en el radar del algoritmo de Amazon y empezar a ganar visibilidad orgánica.
            </p>

            <p className="text-muted-foreground">
              Asumiendo una tasa de conversión del 10% (1 venta por cada 10 clics de usuarios interesados), necesitarás generar <span className="text-foreground font-semibold">{clicsDiarios} clics diarios</span> hacia tu página de producto. Esto se traduce en una inversión publicitaria estimada de <span className="text-foreground font-semibold">{inversionDiaria.toFixed(2)}{currencySymbol} al día</span> si utilizas Amazon Ads como canal principal.
            </p>

            <p className="font-medium text-foreground pt-3 border-t border-border/50">
              Este dato te permite decidir si el nicho es viable para tu presupuesto antes de producir el libro. Si la inversión diaria supera tu capacidad, considera nichos menos competidos o estrategias de posicionamiento orgánico a largo plazo.
            </p>
          </div>

          {activeResults && clicsMaxBase > 0 && (
            <div className="mt-4 pt-4 border-t border-border/50">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-semibold text-foreground">Punto de equilibrio publicitario</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Con tu configuración actual de márgenes y coste por clic, necesitas conseguir al menos <span className="font-semibold text-foreground">1 pedido por cada {clicsMaxBase} clics</span> para que la campaña no genere pérdidas.
              </p>
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-border/50">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground/80 leading-relaxed italic">
                {DISCLAIMER_TEXT}
              </p>
            </div>
          </div>
        </div>

        {/* Conditional warnings */}
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