import { useMemo } from 'react';
import { GlobalData, PaperbackData, MARKETPLACE_CONFIGS } from '@/types/kdp';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { calculatePrintingCost } from '@/data/printingCosts';
import { ArrowRight, BookOpen, Layers, TrendingUp, TrendingDown, Equal } from 'lucide-react';

interface FormatComparisonProps {
  globalData: GlobalData;
  paperbackData: PaperbackData;
}

interface ComparisonData {
  printingCost: number;
  royalty: number;
  breakeven: number;
  margin: number;
  isValid: boolean;
}

export const FormatComparison = ({ globalData, paperbackData }: FormatComparisonProps) => {
  const config = globalData.marketplace ? MARKETPLACE_CONFIGS[globalData.marketplace] : null;
  const currencySymbol = config?.currencySymbol || '€';
  const royaltyThreshold = config?.royaltyThreshold || 9.99;

  const canCompare = paperbackData.interior && 
    paperbackData.interior !== 'COLOR_STANDARD' && 
    paperbackData.size && 
    paperbackData.pages && 
    paperbackData.pages >= 24 &&
    paperbackData.pvp &&
    globalData.marketplace;

  const comparisonData = useMemo(() => {
    if (!canCompare) return null;

    const { interior, size, pages, pvp, ivaType } = paperbackData;
    const marketplace = globalData.marketplace;
    
    const calculateForFormat = (format: 'PAPERBACK' | 'HARDCOVER'): ComparisonData => {
      const printingResult = calculatePrintingCost(interior, size, pages, marketplace, format);
      
      if (!printingResult.isValid) {
        return { printingCost: 0, royalty: 0, breakeven: 0, margin: 0, isValid: false };
      }

      const applyIva = marketplace === 'ES';
      const ivaPct = applyIva ? ivaType : 0;
      const precioSinIva = pvp! / (1 + ivaPct / 100);
      const royaltyRate = pvp! < royaltyThreshold ? 0.50 : 0.60;
      const royalty = (precioSinIva * royaltyRate) - printingResult.totalCost;
      const margin = pvp! > 0 ? (royalty / pvp!) * 100 : 0;
      
      // Calculate breakeven PVP
      let breakevenPvp = 0;
      for (let testPvp = 1; testPvp <= 100; testPvp += 0.5) {
        const testPrecioSinIva = testPvp / (1 + ivaPct / 100);
        const testRoyaltyRate = testPvp < royaltyThreshold ? 0.50 : 0.60;
        const testRoyalty = (testPrecioSinIva * testRoyaltyRate) - printingResult.totalCost;
        if (testRoyalty >= 0) {
          breakevenPvp = testPvp;
          break;
        }
      }

      return {
        printingCost: printingResult.totalCost,
        royalty,
        breakeven: breakevenPvp,
        margin,
        isValid: true,
      };
    };

    return {
      paperback: calculateForFormat('PAPERBACK'),
      hardcover: calculateForFormat('HARDCOVER'),
    };
  }, [canCompare, paperbackData, globalData.marketplace, royaltyThreshold]);

  const getDiffIcon = (diff: number) => {
    if (diff > 0.01) return <TrendingUp className="h-3 w-3 text-foreground" />;
    if (diff < -0.01) return <TrendingDown className="h-3 w-3 text-destructive" />;
    return <Equal className="h-3 w-3 text-muted-foreground" />;
  };

  if (!canCompare || !comparisonData || !comparisonData.paperback.isValid || !comparisonData.hardcover.isValid) {
    return (
      <Card className="animate-fade-in">
        <CardHeader className="pb-4">
          <CardTitle className="section-header">
            <Layers className="h-5 w-5 text-primary" />
            ⚖️ Comparativa Tapa Blanda vs Tapa Dura
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            Configura tipo de impresión (B/N o Color Premium), tamaño, páginas y PVP para ver la comparativa.
            <br />
            <span className="text-xs">Nota: Color Estándar no soporta tapa dura.</span>
          </p>
        </CardContent>
      </Card>
    );
  }

  const { paperback, hardcover } = comparisonData;
  const costDiff = hardcover.printingCost - paperback.printingCost;
  const royaltyDiff = hardcover.royalty - paperback.royalty;
  const marginDiff = hardcover.margin - paperback.margin;
  const breakevenDiff = hardcover.breakeven - paperback.breakeven;

  return (
    <Card className="animate-fade-in">
      <CardHeader className="pb-4">
        <CardTitle className="section-header">
          <Layers className="h-5 w-5 text-primary" />
          ⚖️ Comparativa Tapa Blanda vs Tapa Dura
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Mismo libro ({paperbackData.pages} páginas, PVP {paperbackData.pvp}{currencySymbol}) en ambos formatos.
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          {/* Header Row */}
          <div className="text-center font-semibold text-muted-foreground text-sm">Métrica</div>
          <div className="text-center font-semibold text-sm flex items-center justify-center gap-2">
            <BookOpen className="h-4 w-4" />
            Tapa Blanda
          </div>
          <div className="text-center font-semibold text-sm flex items-center justify-center gap-2">
            <Layers className="h-4 w-4 text-primary" />
            Tapa Dura
          </div>

          {/* Printing Cost */}
          <div className="text-sm text-muted-foreground">Coste impresión</div>
          <div className="text-center font-mono font-medium">
            {paperback.printingCost.toFixed(2)}{currencySymbol}
          </div>
          <div className="text-center font-mono font-medium flex items-center justify-center gap-1">
            {hardcover.printingCost.toFixed(2)}{currencySymbol}
            <span className="text-xs text-destructive">(+{costDiff.toFixed(2)})</span>
          </div>

          {/* Royalty */}
          <div className="text-sm text-muted-foreground">Regalía neta</div>
          <div className={`text-center font-mono font-semibold ${paperback.royalty >= 0 ? 'text-foreground' : 'text-destructive'}`}>
            {paperback.royalty.toFixed(2)}{currencySymbol}
          </div>
          <div className={`text-center font-mono font-semibold flex items-center justify-center gap-1 ${hardcover.royalty >= 0 ? 'text-foreground' : 'text-destructive'}`}>
            {hardcover.royalty.toFixed(2)}{currencySymbol}
            <span className={`text-xs ${royaltyDiff >= 0 ? 'text-foreground' : 'text-destructive'}`}>
              ({royaltyDiff >= 0 ? '+' : ''}{royaltyDiff.toFixed(2)})
            </span>
          </div>

          {/* Margin */}
          <div className="text-sm text-muted-foreground">Margen (BACOS)</div>
          <div className="text-center font-mono font-medium">
            {paperback.margin.toFixed(1)}%
          </div>
          <div className="text-center font-mono font-medium flex items-center justify-center gap-1">
            {hardcover.margin.toFixed(1)}%
            {getDiffIcon(marginDiff)}
          </div>

          {/* Breakeven */}
          <div className="text-sm text-muted-foreground">PVP Breakeven</div>
          <div className="text-center font-mono font-medium">
            {paperback.breakeven.toFixed(2)}{currencySymbol}
          </div>
          <div className="text-center font-mono font-medium flex items-center justify-center gap-1">
            {hardcover.breakeven.toFixed(2)}{currencySymbol}
            <span className="text-xs text-muted-foreground">(+{breakevenDiff.toFixed(2)})</span>
          </div>
        </div>

        {/* Summary */}
        <div className="mt-6 p-4 bg-muted/30 rounded-lg">
          <h5 className="text-sm font-semibold mb-2">📊 Resumen</h5>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• La <strong className="text-foreground">tapa dura</strong> cuesta <strong className="text-destructive">+{costDiff.toFixed(2)}{currencySymbol}</strong> más en impresión.</li>
            <li>
              • Con el mismo PVP, la regalía es{' '}
              <strong className={royaltyDiff >= 0 ? 'text-foreground' : 'text-destructive'}>
                {royaltyDiff >= 0 ? '+' : ''}{royaltyDiff.toFixed(2)}{currencySymbol}
              </strong>
              {royaltyDiff < 0 && ' (menor)'}
            </li>
            {hardcover.royalty < 0 && paperback.royalty >= 0 && (
              <li className="text-destructive">
                ⚠️ Con el PVP actual, la tapa dura genera <strong>pérdidas</strong>. Sube el PVP a mínimo {hardcover.breakeven.toFixed(2)}{currencySymbol}.
              </li>
            )}
            {hardcover.royalty >= 0 && paperback.royalty >= 0 && royaltyDiff < 0 && (
              <li>
                💡 Para igualar la regalía de tapa blanda, sube el PVP de tapa dura aproximadamente{' '}
                <strong className="text-primary">+{(costDiff / 0.6).toFixed(2)}{currencySymbol}</strong>
              </li>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};