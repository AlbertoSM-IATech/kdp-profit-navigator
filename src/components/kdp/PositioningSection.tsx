import { PositioningResults, GlobalData, EbookResults, PaperbackResults } from '@/types/kdp';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

  // Cálculos de posicionamiento
  const conversionRef = 0.10; // 10% conversión de referencia
  const clicsDiarios = ventasDiarias > 0 ? Math.ceil(ventasDiarias / conversionRef) : 0;
  const inversionDiaria = clicsDiarios * cpc;

  // Clics máx from base config
  const clicsMaxBase = activeResults?.clicsMaxPorVenta || 0;

  return (
    <Card className="animate-fade-in">
      <CardHeader className="pb-4">
        <CardTitle className="section-header">
          <Target className="h-5 w-5 text-secondary" />
          Consejo estratégico
        </CardTitle>
        <p className="text-sm text-muted-foreground">Reglas operativas con tus números.</p>
      </CardHeader>
      <CardContent>
        {results ? (
          <div className="space-y-6">
            {/* Métricas clave */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Tasa de Conversión Referencia */}
              <div className="bg-secondary/10 rounded-xl p-5 border border-secondary/20">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-secondary/20 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-secondary" />
                  </div>
                  <span className="text-2xl font-extrabold text-primary">Conversión Ref.</span>
                </div>
                <p className="text-secondary text-4xl font-extrabold">10%</p>
                <p className="text-xs text-muted-foreground mt-1">1 venta cada 10 clics</p>
              </div>

              {/* Clics Diarios Necesarios */}
              <div className="bg-primary/10 rounded-xl p-5 border border-primary/20">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-primary/20 rounded-lg">
                    <MousePointer className="h-5 w-5 text-primary" />
                  </div>
                  <span className="font-extrabold text-2xl text-primary">Clics Diarios</span>
                </div>
                <p className="text-primary text-4xl font-extrabold">{Math.ceil(results.clicsDiarios)}</p>
                <p className="text-xs text-muted-foreground mt-1">Para {ventasDiarias} ventas/día</p>
              </div>

              {/* Inversión Diaria */}
              <div className="bg-muted rounded-xl p-5 border border-border">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-foreground/10 rounded-lg">
                    <Euro className="h-5 w-5 text-foreground" />
                  </div>
                  <span className="text-2xl font-extrabold text-primary">Inversión Diaria</span>
                </div>
                <p className="text-foreground text-4xl font-extrabold">{results.inversionDiaria.toFixed(2)}{currencySymbol}</p>
                <p className="text-xs text-muted-foreground mt-1">A {cpc.toFixed(2)}{currencySymbol}/clic</p>
              </div>
            </div>

            {/* Bloque de recomendación estratégica - Texto mejorado con colores de acento */}
            <div className="bg-gradient-to-br from-secondary/10 to-primary/10 rounded-xl p-6 border border-secondary/20">
              <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2 text-xl">
                <Target className="h-4 w-4 text-secondary" />
                Consejo estratégico de posicionamiento
              </h4>
              
              <div className="space-y-4 text-sm leading-relaxed text-primary-foreground">
                <p className="text-zinc-500 dark:text-zinc-400">
                  Si quieres competir con los mejores autores de tu nicho y tener presencia en primeras posiciones, 
                  necesitarás vender una media de <span className="text-primary font-extrabold">{ventasDiarias} copias/día</span>.
                </p>
                
                <p className="text-zinc-500 dark:text-zinc-400">
                  Si estás empezando y no tienes canales propios de venta (p. ej., lista de email, comunidad en RRSS, acuerdos con influencers o tráfico orgánico), deberás asumir el 100% del posicionamiento vía Ads hasta rankear orgánicamente.
                </p>
                
                <p className="text-zinc-500 dark:text-zinc-400">
                  Con una conversión mínima del 10%, tendrás que generar <span className="text-primary font-extrabold">{clicsDiarios} clics/día</span>, 
                  lo que implica una inversión aproximada de <span className="text-primary font-extrabold">{inversionDiaria.toFixed(2)}{currencySymbol}</span>.
                </p>
                
                <p className="font-medium text-foreground pt-2 border-t border-border/50">
                  Este dato te permite decidir si el nicho es viable antes de producir el libro.
                </p>
              </div>
            </div>

            {/* Nuevo bloque: Referencia de breakeven publicitario */}
            {activeResults && clicsMaxBase > 0 && (
              <div className="bg-muted/50 rounded-xl p-6 border border-border">
                <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  📊 Referencia de breakeven publicitario
                </h4>
                
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Para mantenerte en breakeven con este libro, necesitarás conseguir 
                  <span className="font-bold text-primary"> 1 pedido por cada {clicsMaxBase} clics</span>.
                </p>
                
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                  Esto significa que, si superas ese número de clics por venta, empezarás a perder 
                  dinero en Ads; si vendes en menos clics, el margen mejora.
                </p>
              </div>
            )}

            {/* Advertencias - Solo condicionales */}
            {results.advertencias.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-warning" />
                  Advertencias
                </h4>
                <p className="text-xs text-muted-foreground">Avisos solo si aplican (sin ruido).</p>
                <div className="space-y-2">
                  {results.advertencias.map((adv, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-warning/10 border border-warning/30 rounded-lg">
                      <AlertTriangle className="h-4 w-4 text-warning mt-0.5 shrink-0" />
                      <p className="text-sm text-foreground">{adv}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Show success message only if no warnings */}
            {results.advertencias.length === 0 && (
              <div className="flex items-start gap-3 p-3 bg-success/10 border border-success/30 rounded-lg">
                <CheckCircle className="h-4 w-4 text-success mt-0.5 shrink-0" />
                <p className="text-sm text-foreground">
                  Los ratios de conversión y la inversión estimada están dentro de parámetros aceptables.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-32 bg-muted/30 rounded-lg">
            <p className="text-sm text-muted-foreground">
              Completa los datos globales para ver análisis de posicionamiento
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
