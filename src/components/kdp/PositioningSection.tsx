import { PositioningResults, GlobalData } from '@/types/kdp';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, MousePointer, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

interface PositioningSectionProps {
  results: PositioningResults | null;
  globalData: GlobalData;
}

export const PositioningSection = ({ results, globalData }: PositioningSectionProps) => {
  const currencySymbol = globalData.marketplace === 'COM' ? '$' : '€';

  return (
    <Card className="animate-fade-in">
      <CardHeader className="pb-4">
        <CardTitle className="section-header">
          <Target className="h-5 w-5 text-secondary" />
          Posicionamiento y Ads
        </CardTitle>
      </CardHeader>
      <CardContent>
        {results ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Tasa de Conversión Referencia */}
            <div className="bg-secondary/10 rounded-xl p-5 border border-secondary/20">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-secondary/20 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-secondary" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">Conversión Referencia</span>
              </div>
              <p className="text-3xl font-bold text-secondary">
                {(results.tasaConversionReferencia * 100).toFixed(0)}%
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Estándar del sector para campañas bien optimizadas
              </p>
            </div>

            {/* Clics Diarios Necesarios */}
            <div className="bg-primary/10 rounded-xl p-5 border border-primary/20">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-primary/20 rounded-lg">
                  <MousePointer className="h-5 w-5 text-primary" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">Clics Diarios</span>
              </div>
              <p className="text-3xl font-bold text-primary">
                {Math.ceil(results.clicsDiarios)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Necesarios para igualar ventas de competencia
              </p>
            </div>

            {/* Inversión Diaria */}
            <div className="bg-muted rounded-xl p-5 border border-border">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-foreground/10 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-foreground" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">Inversión Diaria</span>
              </div>
              <p className="text-3xl font-bold text-foreground">
                {results.inversionDiaria.toFixed(2)}{currencySymbol}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Presupuesto estimado en campañas
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-32 bg-muted/30 rounded-lg">
            <p className="text-sm text-muted-foreground">
              Completa los datos globales para ver análisis de posicionamiento
            </p>
          </div>
        )}

        {/* Advertencias */}
        {results && results.advertencias.length > 0 && (
          <div className="mt-6 space-y-3">
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
        )}

        {results && results.advertencias.length === 0 && (
          <div className="mt-6 flex items-start gap-3 p-3 bg-success/10 border border-success/30 rounded-lg">
            <CheckCircle className="h-4 w-4 text-success mt-0.5 shrink-0" />
            <p className="text-sm text-foreground">
              Los ratios de conversión y la inversión estimada están dentro de parámetros aceptables.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
