import { useMemo } from 'react';
import { GlobalData, PaperbackData, MARKETPLACE_CONFIGS } from '@/types/kdp';
import { calculatePrintingCost } from '@/data/printingCosts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  ComposedChart
} from 'recharts';
import { FileText, TrendingDown } from 'lucide-react';

interface PageSensitivityChartProps {
  globalData: GlobalData;
  paperbackData: PaperbackData;
}

interface SensitivityPoint {
  pages: number;
  printingCost: number;
  royalty: number;
  margin: number;
  isCurrentPages: boolean;
}

export const PageSensitivityChart = ({ globalData, paperbackData }: PageSensitivityChartProps) => {
  const config = globalData.marketplace ? MARKETPLACE_CONFIGS[globalData.marketplace] : null;
  const currencySymbol = config?.currencySymbol || '€';
  const royaltyThreshold = config?.royaltyThreshold || 9.99;

  const canSimulate = paperbackData.interior && 
    paperbackData.size && 
    paperbackData.pages && 
    paperbackData.pages >= 24 &&
    paperbackData.pvp &&
    globalData.marketplace;

  const sensitivityData = useMemo(() => {
    if (!canSimulate) return [];

    const { interior, size, pvp, ivaType, bookFormat } = paperbackData;
    const marketplace = globalData.marketplace;
    const currentPages = paperbackData.pages!;
    
    // Generate page range: from 24 to max(currentPages + 200, 400)
    const minPages = 24;
    const maxPages = Math.max(currentPages + 200, 400, 828);
    const step = 10;
    
    const data: SensitivityPoint[] = [];
    
    for (let pages = minPages; pages <= maxPages; pages += step) {
      const printingResult = calculatePrintingCost(interior, size, pages, marketplace, bookFormat);
      
      if (!printingResult.isValid) continue;
      
      const applyIva = marketplace === 'ES';
      const ivaPct = applyIva ? ivaType : 0;
      const precioSinIva = pvp! / (1 + ivaPct / 100);
      const royaltyRate = pvp! < royaltyThreshold ? 0.50 : 0.60;
      const royalty = (precioSinIva * royaltyRate) - printingResult.totalCost;
      const margin = pvp! > 0 ? (royalty / pvp!) * 100 : 0;
      
      data.push({
        pages,
        printingCost: printingResult.totalCost,
        royalty: Math.round(royalty * 100) / 100,
        margin: Math.round(margin * 10) / 10,
        isCurrentPages: pages === currentPages || (pages >= currentPages - step/2 && pages <= currentPages + step/2),
      });
    }
    
    // Ensure current pages is included
    if (!data.some(d => d.isCurrentPages)) {
      const printingResult = calculatePrintingCost(interior, size, currentPages, marketplace, bookFormat);
      if (printingResult.isValid) {
        const applyIva = marketplace === 'ES';
        const ivaPct = applyIva ? ivaType : 0;
        const precioSinIva = pvp! / (1 + ivaPct / 100);
        const royaltyRate = pvp! < royaltyThreshold ? 0.50 : 0.60;
        const royalty = (precioSinIva * royaltyRate) - printingResult.totalCost;
        const margin = pvp! > 0 ? (royalty / pvp!) * 100 : 0;
        
        data.push({
          pages: currentPages,
          printingCost: printingResult.totalCost,
          royalty: Math.round(royalty * 100) / 100,
          margin: Math.round(margin * 10) / 10,
          isCurrentPages: true,
        });
        data.sort((a, b) => a.pages - b.pages);
      }
    }
    
    return data;
  }, [canSimulate, paperbackData, globalData.marketplace, royaltyThreshold]);

  // Find breakeven pages (where royalty becomes negative)
  const breakevenPages = useMemo(() => {
    const breakeven = sensitivityData.find(d => d.royalty < 0);
    return breakeven?.pages || null;
  }, [sensitivityData]);

  // Current point data
  const currentPoint = sensitivityData.find(d => d.isCurrentPages);

  if (!canSimulate || sensitivityData.length === 0) {
    return (
      <Card className="animate-fade-in">
        <CardHeader className="pb-4">
          <CardTitle className="section-header">
            <FileText className="h-5 w-5 text-primary" />
            📊 Sensibilidad por Páginas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            Configura tipo de impresión, tamaño, páginas (mín. 24) y PVP para ver cómo varían las regalías.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="animate-fade-in">
      <CardHeader className="pb-4">
        <CardTitle className="section-header">
          <FileText className="h-5 w-5 text-primary" />
          📊 Sensibilidad por Páginas
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Impacto del número de páginas en regalías y costes (PVP fijo: {paperbackData.pvp}{currencySymbol})
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={sensitivityData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <defs>
              <linearGradient id="royaltyGradientPages" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="lossGradientPages" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis 
              dataKey="pages" 
              label={{ value: 'Páginas', position: 'insideBottom', offset: -10 }}
              tick={{ fontSize: 11 }}
            />
            <YAxis 
              yAxisId="left"
              label={{ value: `Regalía (${currencySymbol})`, angle: -90, position: 'insideLeft' }}
              tick={{ fontSize: 11 }}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              label={{ value: 'Coste Impresión', angle: 90, position: 'insideRight' }}
              tick={{ fontSize: 11 }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))', 
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
              formatter={(value: number, name: string) => {
                if (name === 'royalty') return [`${value.toFixed(2)}${currencySymbol}`, 'Regalía'];
                if (name === 'printingCost') return [`${value.toFixed(2)}${currencySymbol}`, 'Coste impresión'];
                if (name === 'margin') return [`${value.toFixed(1)}%`, 'Margen'];
                return [value, name];
              }}
              labelFormatter={(pages) => `${pages} páginas`}
            />
            
            {/* Zero reference line */}
            <ReferenceLine y={0} yAxisId="left" stroke="hsl(var(--destructive))" strokeDasharray="5 5" />
            
            {/* Current pages marker */}
            {currentPoint && (
              <ReferenceLine 
                x={currentPoint.pages} 
                yAxisId="left"
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                label={{ 
                  value: `Actual: ${currentPoint.pages}p`, 
                  position: 'top',
                  fill: 'hsl(var(--primary))',
                  fontSize: 11
                }}
              />
            )}
            
            {/* Area under royalty line */}
            <Area 
              yAxisId="left"
              type="monotone" 
              dataKey="royalty" 
              fill="url(#royaltyGradientPages)" 
              stroke="none"
            />
            
            {/* Royalty line */}
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="royalty" 
              stroke="hsl(var(--primary))" 
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6, fill: 'hsl(var(--primary))' }}
            />
            
            {/* Printing cost line */}
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="printingCost" 
              stroke="hsl(var(--muted-foreground))" 
              strokeWidth={1.5}
              strokeDasharray="4 4"
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>

        {/* Key Insights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="p-3 bg-muted/30 rounded-lg text-center">
            <span className="text-xs text-muted-foreground block">Páginas actuales</span>
            <span className="text-xl font-bold text-primary">{paperbackData.pages}</span>
            {currentPoint && (
              <span className={`text-xs block ${currentPoint.royalty >= 0 ? 'text-foreground' : 'text-destructive'}`}>
                Regalía: {currentPoint.royalty.toFixed(2)}{currencySymbol}
              </span>
            )}
          </div>
          
          <div className="p-3 bg-muted/30 rounded-lg text-center">
            <span className="text-xs text-muted-foreground block">Coste impresión actual</span>
            <span className="text-xl font-bold">{currentPoint?.printingCost.toFixed(2)}{currencySymbol}</span>
            <span className="text-xs text-muted-foreground block">
              ~{currentPoint ? (currentPoint.printingCost / paperbackData.pages! * 100).toFixed(2) : 0} cts/pág
            </span>
          </div>
          
          <div className="p-3 bg-muted/30 rounded-lg text-center">
            <span className="text-xs text-muted-foreground block">
              {breakevenPages ? 'Máx. páginas rentables' : 'Estado'}
            </span>
            {breakevenPages ? (
              <>
                <span className="text-xl font-bold text-warning flex items-center justify-center gap-1">
                  <TrendingDown className="h-4 w-4" />
                  {breakevenPages - 10}
                </span>
                <span className="text-xs text-muted-foreground block">
                  Pérdidas a partir de ~{breakevenPages} pág
                </span>
              </>
            ) : (
              <>
                <span className="text-xl font-bold text-foreground">✓ Rentable</span>
                <span className="text-xs text-muted-foreground block">
                  Hasta {sensitivityData[sensitivityData.length - 1]?.pages || 0} páginas
                </span>
              </>
            )}
          </div>
        </div>

        {/* Impact Summary */}
        <div className="p-4 bg-muted/20 rounded-lg">
          <h5 className="text-sm font-semibold mb-2">💡 Análisis de sensibilidad</h5>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Cada 100 páginas adicionales aumentan el coste de impresión ~{
              sensitivityData.length > 10 
                ? ((sensitivityData[10].printingCost - sensitivityData[0].printingCost)).toFixed(2)
                : '1.00'
            }{currencySymbol}</li>
            <li>• Con el PVP actual ({paperbackData.pvp}{currencySymbol}), {
              currentPoint && currentPoint.royalty >= 0 
                ? `obtienes ${currentPoint.royalty.toFixed(2)}${currencySymbol} de regalía (${currentPoint.margin.toFixed(1)}% margen)`
                : 'estás en pérdidas'
            }</li>
            {breakevenPages && paperbackData.pages && paperbackData.pages < breakevenPages - 50 && (
              <li className="text-foreground">• Tienes margen para añadir hasta ~{breakevenPages - paperbackData.pages - 10} páginas sin entrar en pérdidas</li>
            )}
            {breakevenPages && paperbackData.pages && paperbackData.pages >= breakevenPages - 50 && (
              <li className="text-warning">• ⚠️ Estás cerca del límite de páginas rentables. Considera reducir contenido o subir el PVP.</li>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
