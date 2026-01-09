import { useMemo } from 'react';
import { GlobalData, PaperbackData, MARKETPLACE_CONFIGS } from '@/types/kdp';
import { calculatePrintingCost } from '@/data/printingCosts';
import { AlertTriangle, TrendingDown, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface BreakevenAlertProps {
  globalData: GlobalData;
  paperbackData: PaperbackData;
}

export const BreakevenAlert = ({ globalData, paperbackData }: BreakevenAlertProps) => {
  const config = globalData.marketplace ? MARKETPLACE_CONFIGS[globalData.marketplace] : null;
  const currencySymbol = config?.currencySymbol || '€';
  const royaltyThreshold = config?.royaltyThreshold || 9.99;

  const alertData = useMemo(() => {
    const { interior, size, pages, pvp, ivaType, bookFormat } = paperbackData;
    const marketplace = globalData.marketplace;

    if (!interior || !size || !pages || pages < 24 || !pvp || !marketplace) {
      return null;
    }

    const printingResult = calculatePrintingCost(interior, size, pages, marketplace, bookFormat);
    if (!printingResult.isValid) return null;

    const applyIva = marketplace === 'ES';
    const ivaPct = applyIva ? ivaType : 0;
    const precioSinIva = pvp / (1 + ivaPct / 100);
    const royaltyRate = pvp < royaltyThreshold ? 0.50 : 0.60;
    const royalty = (precioSinIva * royaltyRate) - printingResult.totalCost;

    // Calculate breakeven PVP
    let breakevenPvp = 0;
    for (let testPvp = 1; testPvp <= 100; testPvp += 0.1) {
      const testPrecioSinIva = testPvp / (1 + ivaPct / 100);
      const testRoyaltyRate = testPvp < royaltyThreshold ? 0.50 : 0.60;
      const testRoyalty = (testPrecioSinIva * testRoyaltyRate) - printingResult.totalCost;
      if (testRoyalty >= 0) {
        breakevenPvp = Math.ceil(testPvp * 100) / 100; // Round up
        break;
      }
    }

    const isBelowBreakeven = royalty < 0;
    const isNearBreakeven = royalty >= 0 && royalty < 0.50;
    const loss = isBelowBreakeven ? Math.abs(royalty) : 0;

    return {
      pvp,
      breakevenPvp,
      royalty,
      isBelowBreakeven,
      isNearBreakeven,
      loss,
      suggestedPvp: Math.max(breakevenPvp + 1, royaltyThreshold), // At least breakeven + 1€
    };
  }, [paperbackData, globalData.marketplace, royaltyThreshold]);

  if (!alertData) return null;

  if (alertData.isBelowBreakeven) {
    return (
      <Alert variant="destructive" className="animate-fade-in">
        <TrendingDown className="h-4 w-4" />
        <AlertTitle className="font-semibold">⚠️ PVP por debajo del Breakeven</AlertTitle>
        <AlertDescription className="text-sm">
          <p>
            Con <strong>{alertData.pvp}{currencySymbol}</strong> pierdes{' '}
            <strong className="text-destructive">{alertData.loss.toFixed(2)}{currencySymbol}</strong> por venta.
          </p>
          <p className="mt-1">
            PVP mínimo (breakeven): <strong>{alertData.breakevenPvp.toFixed(2)}{currencySymbol}</strong>
          </p>
          <p className="mt-1 text-xs">
            💡 Recomendación: sube el PVP a mínimo <strong>{alertData.suggestedPvp.toFixed(2)}{currencySymbol}</strong> para obtener margen.
          </p>
        </AlertDescription>
      </Alert>
    );
  }

  if (alertData.isNearBreakeven) {
    return (
      <Alert className="animate-fade-in border-yellow-500/50 bg-yellow-500/10">
        <AlertTriangle className="h-4 w-4 text-yellow-600" />
        <AlertTitle className="font-semibold text-yellow-700 dark:text-yellow-400">
          ⚡ Margen muy ajustado
        </AlertTitle>
        <AlertDescription className="text-sm text-yellow-700 dark:text-yellow-300">
          <p>
            Con <strong>{alertData.pvp}{currencySymbol}</strong> obtienes solo{' '}
            <strong>{alertData.royalty.toFixed(2)}{currencySymbol}</strong> de regalía.
          </p>
          <p className="mt-1 text-xs">
            Estás muy cerca del breakeven ({alertData.breakevenPvp.toFixed(2)}{currencySymbol}). 
            Considera subir el PVP para mayor seguridad.
          </p>
        </AlertDescription>
      </Alert>
    );
  }

  return null;
};