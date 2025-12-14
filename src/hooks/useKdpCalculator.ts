import { useState, useMemo } from 'react';
import {
  GlobalData,
  EbookData,
  EbookResults,
  PaperbackData,
  PaperbackResults,
  PositioningResults,
  TableRow,
  RiskLevel,
  ViabilityStatus,
  MARKETPLACE_CONFIGS,
} from '@/types/kdp';
import { calculatePrintingCost } from '@/data/printingCosts';

// Helper functions
const calculateRiskLevel = (margenPct: number, clicsMax: number): RiskLevel => {
  if (margenPct < 30 || clicsMax < 10) return 'high';
  if (margenPct <= 40 || clicsMax === 10) return 'medium';
  return 'low';
};

const calculateViability = (regalias: number, margenPct: number, clicsMax: number): ViabilityStatus => {
  if (regalias <= 0 || margenPct < 20 || clicsMax < 5) return 'not-viable';
  if (margenPct < 30 || clicsMax < 10) return 'adjustable';
  return 'viable';
};

export const useKdpCalculator = () => {
  // Global Data State
  const [globalData, setGlobalData] = useState<GlobalData>({
    marketplace: null,
    margenObjetivoPct: null,
    cpc: null,
    ventasDiariasCompetencia: null,
    selectedFormat: null,
  });

  // eBook State
  const [ebookData, setEbookData] = useState<EbookData>({
    pvp: null,
    royaltyRate: 70,
    tamanoMb: null,
    ivaType: 4,
  });

  // Paperback State
  const [paperbackData, setPaperbackData] = useState<PaperbackData>({
    interior: null,
    size: null,
    pvp: null,
    pages: null,
    ivaType: 4,
  });

  // Get marketplace config
  const marketplaceConfig = globalData.marketplace 
    ? MARKETPLACE_CONFIGS[globalData.marketplace] 
    : null;

  // eBook Calculations
  const ebookResults = useMemo((): EbookResults | null => {
    const { marketplace, cpc, margenObjetivoPct } = globalData;
    const { pvp, royaltyRate, tamanoMb, ivaType } = ebookData;

    if (!marketplace || !pvp || cpc === null) return null;

    const config = MARKETPLACE_CONFIGS[marketplace];
    
    // IVA calculation - only for ES marketplace, others don't have book VAT
    const applyIva = marketplace === 'ES';
    const ivaPct = applyIva ? ivaType : 0;
    const iva = (pvp * ivaPct) / 100;

    // Price without IVA
    const precioSinIva = pvp / (1 + ivaPct / 100);

    // Delivery cost (only for 70% royalty)
    const deliveryCost = royaltyRate === 70 && tamanoMb 
      ? Math.ceil(tamanoMb) * 0.12 
      : 0;

    // Royalties: (price without IVA × royalty rate) - delivery cost
    const regalias = (precioSinIva * (royaltyRate / 100)) - deliveryCost;

    // Margin calculations
    const margenAbsoluto = regalias;
    const margenPct = pvp > 0 ? (regalias / pvp) * 100 : 0;
    
    // Benefit per sale (same as royalties for ebook)
    const beneficioNeto = regalias;
    
    // Maximum profitable CPC
    const cpcMaxRentable = regalias > 0 ? regalias / 10 : 0; // At 10% conversion
    
    // ROI per sale
    const roiPorVenta = cpc > 0 ? (regalias / cpc) : 0;

    // Breakeven conversion rate
    const tasaConvBreakeven = regalias > 0 ? cpc / regalias : 0;

    // Maximum clicks per sale (breakeven point)
    const clicsMaxPorVenta = tasaConvBreakeven > 0 ? Math.floor(1 / tasaConvBreakeven) : 0;

    // Minimum target price calculation
    let precioMinObjetivo: number | null = null;
    let precioMinObjetivoError: string | null = null;
    
    if (margenObjetivoPct !== null) {
      const margenObj = margenObjetivoPct / 100;
      const effectiveRoyaltyRate = royaltyRate / 100;
      const denominator = effectiveRoyaltyRate - margenObj;
      
      if (denominator <= 0) {
        precioMinObjetivoError = `Con este margen objetivo (${margenObjetivoPct}%) no es posible ser rentable con el ${royaltyRate}% de regalía.`;
      } else {
        // For eBook: minimum price to cover delivery cost and achieve margin
        const minPrice = deliveryCost / denominator;
        precioMinObjetivo = Math.ceil(minPrice * 100) / 100;
      }
    }

    // Diagnosis
    let diagnostico: 'good' | 'warning' | 'bad' = 'good';
    if (clicsMaxPorVenta < 10) {
      diagnostico = 'bad';
    } else if (clicsMaxPorVenta === 10) {
      diagnostico = 'warning';
    }

    const riskLevel = calculateRiskLevel(margenPct, clicsMaxPorVenta);
    const viabilityStatus = calculateViability(regalias, margenPct, clicsMaxPorVenta);

    return {
      iva,
      ivaPct,
      deliveryCost,
      precioSinIva,
      regalias,
      margenPct,
      margenAbsoluto,
      beneficioNeto,
      cpcMaxRentable,
      roiPorVenta,
      tasaConvBreakeven,
      clicsMaxPorVenta,
      precioMinObjetivo,
      precioMinObjetivoError,
      diagnostico,
      riskLevel,
      viabilityStatus,
    };
  }, [globalData, ebookData]);

  // Paperback/Hardcover Calculations
  const paperbackResults = useMemo((): PaperbackResults | null => {
    const { marketplace, cpc, margenObjetivoPct, selectedFormat } = globalData;
    const { interior, size, pvp, pages, ivaType } = paperbackData;

    if (!interior || !size || !pvp || !pages || cpc === null || !marketplace) return null;

    // Calculate printing costs
    const printingResult = calculatePrintingCost(interior, size, pages);
    
    if (!printingResult.isValid) {
      return null;
    }

    const gastosImpresion = printingResult.totalCost;

    // Royalty rate based on PVP (automatic)
    const royaltyRate = pvp < 9.99 ? 0.50 : 0.60;

    // IVA - only apply for ES marketplace
    const applyIva = marketplace === 'ES';
    const ivaPct = applyIva ? ivaType : 0;
    
    // Price without IVA
    const precioSinIva = pvp / (1 + ivaPct / 100);

    // Royalties: (price without IVA × royalty rate) - printing cost
    const regalias = (precioSinIva * royaltyRate) - gastosImpresion;

    // Margin calculations
    const margenAbsoluto = regalias;
    const margenPct = pvp > 0 ? (regalias / pvp) * 100 : 0;
    
    // Benefit per sale
    const beneficioNeto = regalias;
    
    // Maximum profitable CPC (at 10% conversion)
    const cpcMaxRentable = regalias > 0 ? regalias / 10 : 0;
    
    // ROI per sale
    const roiPorVenta = cpc > 0 ? (regalias / cpc) : 0;

    // Breakeven conversion rate
    const tasaConvBreakeven = regalias > 0 ? cpc / regalias : 0;

    // Maximum clicks per sale (breakeven point)
    const clicsMaxPorVenta = tasaConvBreakeven > 0 ? Math.floor(1 / tasaConvBreakeven) : 0;

    // Minimum target price calculation
    let precioMinObjetivo: number | null = null;
    let precioMinObjetivoError: string | null = null;
    
    if (margenObjetivoPct !== null) {
      const margenObj = margenObjetivoPct / 100;
      const denominator = royaltyRate - margenObj;
      
      if (denominator <= 0) {
        precioMinObjetivoError = `Con este margen objetivo (${margenObjetivoPct}%) no es posible ser rentable con el ${(royaltyRate * 100).toFixed(0)}% de regalía.`;
      } else {
        // Formula: CEIL(gastosImpresion / (royaltyRate - margenObj)) - 0.01
        // But we need to account for IVA in the final price
        const baseMinPrice = gastosImpresion / denominator;
        // Add IVA back to get the final PVP
        const minPriceWithIva = baseMinPrice * (1 + ivaPct / 100);
        precioMinObjetivo = Math.ceil(minPriceWithIva) - 0.01;
      }
    }

    // Diagnosis based on margin and clicks
    let diagnostico: 'good' | 'warning' | 'bad' = 'good';
    if (margenPct < 30 || clicsMaxPorVenta < 10) {
      diagnostico = 'bad';
    } else if (margenPct <= 40 || clicsMaxPorVenta === 10) {
      diagnostico = 'warning';
    }

    const riskLevel = calculateRiskLevel(margenPct, clicsMaxPorVenta);
    const viabilityStatus = calculateViability(regalias, margenPct, clicsMaxPorVenta);

    return {
      royaltyRate,
      fixedCost: printingResult.fixedCost,
      perPageCost: printingResult.perPageCost,
      gastosImpresion,
      precioSinIva,
      regalias,
      margenPct,
      margenAbsoluto,
      beneficioNeto,
      cpcMaxRentable,
      roiPorVenta,
      tasaConvBreakeven,
      clicsMaxPorVenta,
      precioMinObjetivo,
      precioMinObjetivoError,
      diagnostico,
      riskLevel,
      viabilityStatus,
    };
  }, [globalData, paperbackData]);

  // Positioning Calculations
  const positioningResults = useMemo((): PositioningResults | null => {
    const { cpc, ventasDiariasCompetencia, selectedFormat } = globalData;

    if (cpc === null || ventasDiariasCompetencia === null) return null;

    const tasaConversionReferencia = 0.10; // 10%
    const clicsDiarios = ventasDiariasCompetencia / tasaConversionReferencia;
    const inversionDiaria = clicsDiarios * cpc;
    const ventasDiariasNecesarias = ventasDiariasCompetencia;

    const advertencias: string[] = [];
    let riskLevel: RiskLevel = 'low';

    // Get active results
    const activeResults = selectedFormat === 'EBOOK' ? ebookResults : paperbackResults;
    
    if (activeResults) {
      const conversionNeeded = activeResults.tasaConvBreakeven;
      if (conversionNeeded > 0.10) {
        advertencias.push(`La conversión necesaria (${(conversionNeeded * 100).toFixed(1)}%) supera la referencia del 10%.`);
        riskLevel = 'high';
      }

      // Check if daily investment is disproportionate
      if (activeResults.regalias > 0 && inversionDiaria > activeResults.regalias * ventasDiariasCompetencia * 0.5) {
        advertencias.push(`La inversión diaria estimada puede ser desproporcionada respecto a las regalías esperadas.`);
        if (riskLevel !== 'high') riskLevel = 'medium';
      }
    }

    // Calculate days to breakeven (rough estimate)
    let diasParaBreakeven: number | null = null;
    if (activeResults && activeResults.regalias > 0 && inversionDiaria > 0) {
      const dailyProfit = (activeResults.regalias * ventasDiariasCompetencia) - inversionDiaria;
      if (dailyProfit > 0) {
        diasParaBreakeven = Math.ceil(inversionDiaria * 30 / dailyProfit); // Rough monthly estimate
      }
    }

    return {
      tasaConversionReferencia,
      clicsDiarios,
      inversionDiaria,
      ventasDiariasNecesarias,
      diasParaBreakeven,
      advertencias,
      riskLevel,
    };
  }, [globalData, ebookResults, paperbackResults]);

  // Table Data
  const tableData = useMemo((): TableRow[] => {
    const rows: TableRow[] = [];
    const { selectedFormat } = globalData;

    if (selectedFormat === 'EBOOK' && ebookResults && ebookData.pvp) {
      let recomendacion = '';
      
      if (ebookResults.diagnostico === 'bad') {
        recomendacion = `Necesitas mín. 1 venta cada 10 clics, pero solo puedes permitir ${ebookResults.clicsMaxPorVenta}. Aumenta PVP o reduce CPC.`;
      } else if (ebookResults.diagnostico === 'warning') {
        recomendacion = 'En el límite de breakeven (10 clics). Margen ajustado.';
      } else {
        recomendacion = `Puedes permitir hasta ${ebookResults.clicsMaxPorVenta} clics por venta. Buen margen.`;
      }

      rows.push({
        tipo: 'eBook',
        pvp: ebookData.pvp,
        regalias: ebookResults.regalias,
        margen: ebookResults.margenPct,
        clicsMaxPorVenta: ebookResults.clicsMaxPorVenta,
        cpcMaxRentable: ebookResults.cpcMaxRentable,
        diagnostico: ebookResults.diagnostico,
        recomendacion,
      });
    }

    if ((selectedFormat === 'PAPERBACK' || selectedFormat === 'HARDCOVER') && paperbackResults && paperbackData.pvp) {
      let recomendacion = '';
      
      if (paperbackResults.diagnostico === 'bad') {
        if (paperbackResults.margenPct < 30) {
          recomendacion = paperbackResults.precioMinObjetivo 
            ? `Subir PVP mínimo a ${paperbackResults.precioMinObjetivo.toFixed(2)}€ para alcanzar margen objetivo.`
            : 'Aumenta el PVP para mejorar el margen.';
        } else {
          recomendacion = `Solo puedes permitir ${paperbackResults.clicsMaxPorVenta} clics máx. Reduce CPC o sube PVP.`;
        }
      } else if (paperbackResults.diagnostico === 'warning') {
        recomendacion = 'En el límite de breakeven (10 clics). Considera aumentar PVP.';
      } else {
        recomendacion = `Puedes permitir hasta ${paperbackResults.clicsMaxPorVenta} clics por venta. Configuración rentable.`;
      }

      rows.push({
        tipo: selectedFormat === 'HARDCOVER' ? 'Hardcover' : 'Paperback',
        pvp: paperbackData.pvp,
        regalias: paperbackResults.regalias,
        margen: paperbackResults.margenPct,
        clicsMaxPorVenta: paperbackResults.clicsMaxPorVenta,
        cpcMaxRentable: paperbackResults.cpcMaxRentable,
        diagnostico: paperbackResults.diagnostico,
        recomendacion,
      });
    }

    return rows;
  }, [globalData.selectedFormat, ebookData.pvp, ebookResults, paperbackData.pvp, paperbackResults]);

  return {
    globalData,
    setGlobalData,
    ebookData,
    setEbookData,
    ebookResults,
    paperbackData,
    setPaperbackData,
    paperbackResults,
    positioningResults,
    tableData,
    marketplaceConfig,
  };
};
