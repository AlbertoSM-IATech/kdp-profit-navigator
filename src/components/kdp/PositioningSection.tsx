import { PositioningResults, GlobalData } from '@/types/kdp';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, MousePointer, TrendingUp, AlertTriangle, CheckCircle, Euro } from 'lucide-react';

interface PositioningSectionProps {
  results: PositioningResults | null;
  globalData: GlobalData;
}

export const PositioningSection = ({ results, globalData }: PositioningSectionProps) => {
  const currencySymbol = globalData.marketplace === 'COM' ? '$' : '€';
  const ventasDiarias = globalData.ventasDiariasCompetencia || 0;
  const cpc = globalData.cpc || 0;

  // Cálculos de posicionamiento
  const conversionRef = 0.10; // 10% conversión de referencia
  const clicsDiarios = ventasDiarias > 0 ? Math.ceil(ventasDiarias / conversionRef) : 0;
  const inversionDiaria = clicsDiarios * cpc;

  return (
    <Card className="animate-fade-in">
      <CardHeader className="pb-4">
        <CardTitle className="section-header">
          <Target className="h-5 w-5 text-secondary" />
          Análisis de Posicionamiento
        </CardTitle>
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
                  <span className="text-sm font-medium text-muted-foreground">Conversión Ref.</span>
                </div>
                <p className="text-3xl font-bold text-secondary">10%</p>
                <p className="text-xs text-muted-foreground mt-1">1 venta cada 10 clics</p>
              </div>

              {/* Clics Diarios Necesarios */}
              <div className="bg-primary/10 rounded-xl p-5 border border-primary/20">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-primary/20 rounded-lg">
                    <MousePointer className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">Clics Diarios</span>
                </div>
                <p className="text-3xl font-bold text-primary">{Math.ceil(results.clicsDiarios)}</p>
                <p className="text-xs text-muted-foreground mt-1">Para {ventasDiarias} ventas/día</p>
              </div>

              {/* Inversión Diaria */}
              <div className="bg-muted rounded-xl p-5 border border-border">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-foreground/10 rounded-lg">
                    <Euro className="h-5 w-5 text-foreground" />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">Inversión Diaria</span>
                </div>
                <p className="text-3xl font-bold text-foreground">{results.inversionDiaria.toFixed(2)}{currencySymbol}</p>
                <p className="text-xs text-muted-foreground mt-1">A {cpc.toFixed(2)}{currencySymbol}/clic</p>
              </div>
            </div>

            {/* Bloque de recomendación estratégica */}
            <div className="bg-gradient-to-br from-secondary/10 to-primary/10 rounded-xl p-6 border border-secondary/20">
              <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                <Target className="h-4 w-4 text-secondary" />
                Consejo estratégico de posicionamiento
              </h4>
              
              <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                <p>
                  Si quieres competir con los mejores autores de tu nicho y tener un hueco en las primeras posiciones de Amazon, tendrás que vender una media de <span className="font-semibold text-foreground">{ventasDiarias} copias al día</span>.
                </p>
                
                <p>
                  Si estás empezando y no tienes lista propia, asumirás el 100% del posicionamiento mediante Ads.
                </p>
                
                <p>
                  Con una conversión mínima del 10%, necesitarás generar <span className="font-semibold text-foreground">{clicsDiarios} clics diarios</span>, lo que implica una inversión aproximada de <span className="font-semibold text-primary">{inversionDiaria.toFixed(2)}{currencySymbol} diarios</span>.
                </p>
                
                <p className="font-medium text-foreground">
                  Este dato te permite decidir si el nicho es viable antes de producir el libro.
                </p>
              </div>
            </div>

            {/* Advertencias */}
            {results.advertencias.length > 0 ? (
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-warning" />
                  Advertencias
                </h4>
                <div className="space-y-2">
                  {results.advertencias.map((adv, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 p-3 bg-warning/10 border border-warning/30 rounded-lg"
                    >
                      <AlertTriangle className="h-4 w-4 text-warning mt-0.5 shrink-0" />
                      <p className="text-sm text-foreground">{adv}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
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