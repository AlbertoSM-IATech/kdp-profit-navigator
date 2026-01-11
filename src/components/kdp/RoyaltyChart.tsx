import { useMemo, useState, forwardRef } from 'react';
import { GlobalData, PaperbackData, MARKETPLACE_CONFIGS, BookFormat } from '@/types/kdp';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { TrendingUp, Euro } from 'lucide-react';
import { calculatePrintingCost } from '@/data/printingCosts';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  ComposedChart,
} from 'recharts';

interface RoyaltyChartProps {
  globalData: GlobalData;
  paperbackData: PaperbackData;
  embedded?: boolean;
}

interface SimulationPoint {
  pvp: number;
  regalias: number;
  margen: number;
  royaltyRate: number;
  isAboveThreshold: boolean;
}

export const RoyaltyChart = forwardRef<HTMLDivElement, RoyaltyChartProps>(
  ({ globalData, paperbackData, embedded = false }, ref) => {
  const config = globalData.marketplace ? MARKETPLACE_CONFIGS[globalData.marketplace] : null;
  const currencySymbol = config?.currencySymbol || '€';
  const royaltyThreshold = config?.royaltyThreshold || 9.99;
  
  const [pvpMin, setPvpMin] = useState(5);
  const [pvpMax, setPvpMax] = useState(30);

  const canSimulate = paperbackData.interior && paperbackData.size && paperbackData.pages && paperbackData.pages >= 24 && globalData.marketplace;

  const simulationData = useMemo((): SimulationPoint[] => {
    if (!canSimulate) return [];

    const { interior, size, pages, ivaType, bookFormat } = paperbackData;
    const marketplace = globalData.marketplace;
    
    const printingResult = calculatePrintingCost(interior, size, pages, marketplace, bookFormat);
    if (!printingResult.isValid) return [];

    const gastosImpresion = printingResult.totalCost;
    const applyIva = marketplace === 'ES';
    const ivaPct = applyIva ? ivaType : 0;

    const points: SimulationPoint[] = [];
    const step = 0.50;
    
    for (let pvp = pvpMin; pvp <= pvpMax; pvp += step) {
      const precioSinIva = pvp / (1 + ivaPct / 100);
      const royaltyRate = pvp < royaltyThreshold ? 0.50 : 0.60;
      const regalias = (precioSinIva * royaltyRate) - gastosImpresion;
      const margen = pvp > 0 ? (regalias / pvp) * 100 : 0;

      points.push({
        pvp: Math.round(pvp * 100) / 100,
        regalias: Math.round(regalias * 100) / 100,
        margen: Math.round(margen * 10) / 10,
        royaltyRate: royaltyRate * 100,
        isAboveThreshold: pvp >= royaltyThreshold,
      });
    }

    return points;
  }, [canSimulate, paperbackData, globalData.marketplace, pvpMin, pvpMax]);

  // Find breakeven point
  const breakevenPvp = useMemo(() => {
    const point = simulationData.find(p => p.regalias >= 0);
    return point?.pvp || null;
  }, [simulationData]);

  // Current PVP marker
  const currentPvp = paperbackData.pvp;

  if (!canSimulate) {
    if (embedded) {
      return (
        <p className="text-sm text-muted-foreground text-center py-8">
          Configura el tipo de impresión, tamaño y número de páginas (mínimo 24) para ver la simulación.
        </p>
      );
    }
    return (
      <Card className="animate-fade-in">
        <CardHeader className="pb-4">
          <CardTitle className="section-header">
            <TrendingUp className="h-5 w-5 text-primary" />
            📊 Simulador de Regalías
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            Configura el tipo de impresión, tamaño y número de páginas (mínimo 24) para ver la simulación.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Chart content (reusable for both embedded and standalone modes)
  const chartContent = (
    <div className="space-y-6">
        {/* Range Selector */}
        <div className="space-y-4">
          <Label className="text-sm font-medium">
            Rango de PVP: {pvpMin}{currencySymbol} - {pvpMax}{currencySymbol}
          </Label>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <span className="text-xs text-muted-foreground">Mínimo: {pvpMin}{currencySymbol}</span>
              <Slider
                value={[pvpMin]}
                onValueChange={(v) => setPvpMin(Math.min(v[0], pvpMax - 1))}
                min={1}
                max={49}
                step={1}
              />
            </div>
            <div className="space-y-2">
              <span className="text-xs text-muted-foreground">Máximo: {pvpMax}{currencySymbol}</span>
              <Slider
                value={[pvpMax]}
                onValueChange={(v) => setPvpMax(Math.max(v[0], pvpMin + 1))}
                min={2}
                max={50}
                step={1}
              />
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={simulationData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="pvp" 
                tickFormatter={(v) => `${v}${currencySymbol}`}
                className="text-xs"
                stroke="hsl(var(--muted-foreground))"
              />
              <YAxis 
                yAxisId="left"
                tickFormatter={(v) => `${v}${currencySymbol}`}
                className="text-xs"
                stroke="hsl(var(--muted-foreground))"
                label={{ value: 'Regalía', angle: -90, position: 'insideLeft', fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                tickFormatter={(v) => `${v}%`}
                className="text-xs"
                stroke="hsl(var(--muted-foreground))"
                label={{ value: 'Margen', angle: 90, position: 'insideRight', fill: 'hsl(var(--muted-foreground))' }}
              />
              <Tooltip 
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const data = payload[0].payload as SimulationPoint;
                  return (
                    <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
                      <p className="font-semibold text-foreground">PVP: {data.pvp}{currencySymbol}</p>
                      <p className={`text-sm ${data.regalias >= 0 ? 'text-foreground' : 'text-destructive'}`}>
                        Regalía: {data.regalias.toFixed(2)}{currencySymbol}
                      </p>
                      <p className="text-sm text-muted-foreground">Margen: {data.margen.toFixed(1)}%</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Tasa: {data.royaltyRate}% {data.isAboveThreshold ? '(≥9.99)' : '(<9.99)'}
                      </p>
                    </div>
                  );
                }}
              />
              
              {/* Area for positive royalties */}
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="regalias"
                fill="hsl(var(--primary) / 0.2)"
                stroke="none"
              />
              
              {/* Royalty line */}
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="regalias"
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                dot={false}
                name="Regalía"
              />
              
              {/* Margin line */}
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="margen"
                stroke="hsl(var(--muted-foreground))"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                name="Margen %"
              />

              {/* Breakeven line */}
              <ReferenceLine 
                yAxisId="left"
                y={0} 
                stroke="hsl(var(--destructive))" 
                strokeDasharray="3 3"
                label={{ value: 'Breakeven', fill: 'hsl(var(--destructive))', fontSize: 10 }}
              />

              {/* Royalty threshold line */}
              <ReferenceLine 
                yAxisId="left"
                x={royaltyThreshold} 
                stroke="hsl(var(--primary))" 
                strokeDasharray="5 5"
                label={{ value: `${royaltyThreshold}${currencySymbol} (60%)`, fill: 'hsl(var(--primary))', fontSize: 10, position: 'top' }}
              />

              {/* Current PVP marker */}
              {currentPvp && currentPvp >= pvpMin && currentPvp <= pvpMax && (
                <ReferenceLine 
                  yAxisId="left"
                  x={currentPvp} 
                  stroke="hsl(var(--foreground))" 
                  strokeWidth={2}
                  label={{ value: `Tu PVP`, fill: 'hsl(var(--foreground))', fontSize: 10, position: 'top' }}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Legend and insights */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 bg-primary rounded" />
            <span className="text-muted-foreground">Regalía neta</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 bg-muted-foreground rounded opacity-50" />
            <span className="text-muted-foreground">Margen %</span>
          </div>
          {breakevenPvp && (
            <div className="flex items-center gap-2">
              <Euro className="h-4 w-4 text-destructive" />
              <span className="text-muted-foreground">Breakeven: {breakevenPvp}{currencySymbol}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 bg-primary opacity-50 rounded" />
            <span className="text-muted-foreground">Umbral 60%: {royaltyThreshold}{currencySymbol}</span>
          </div>
        </div>

        {/* Key insights */}
        {simulationData.length > 0 && (
          <div className="p-4 bg-muted/30 rounded-lg space-y-2">
            <h5 className="text-sm font-semibold">📈 Análisis rápido</h5>
            <ul className="text-xs text-muted-foreground space-y-1">
              {breakevenPvp && (
                <li>• Precio mínimo para no perder: <strong className="text-foreground">{breakevenPvp}{currencySymbol}</strong></li>
              )}
              <li>• A partir de <strong className="text-foreground">{royaltyThreshold}{currencySymbol}</strong> la tasa de regalía sube al 60%</li>
              {currentPvp && (
                <li>
                  • Con tu PVP actual ({currentPvp}{currencySymbol}), obtienes{' '}
                  <strong className="text-foreground">
                    {simulationData.find(p => Math.abs(p.pvp - currentPvp) < 0.5)?.regalias.toFixed(2) || '—'}{currencySymbol}
                  </strong>{' '}
                  de regalía
                </li>
              )}
              {paperbackData.bookFormat === 'HARDCOVER' && (
                <li>• <strong className="text-primary">Tapa dura</strong>: incluye coste adicional de encuadernación</li>
              )}
            </ul>
          </div>
        )}
      </div>
  );

  // If embedded, just return the content
  if (embedded) {
    return <div ref={ref}>{chartContent}</div>;
  }

  // Otherwise, wrap in Card
  return (
    <Card className="animate-fade-in" ref={ref}>
      <CardHeader className="pb-4">
        <CardTitle className="section-header">
          <TrendingUp className="h-5 w-5 text-primary" />
          📊 Simulador de Regalías por PVP
        </CardTitle>
        <p className="text-sm text-muted-foreground">Visualiza cómo cambian las regalías según el precio de venta.</p>
      </CardHeader>
      <CardContent>{chartContent}</CardContent>
    </Card>
  );
});

RoyaltyChart.displayName = 'RoyaltyChart';
