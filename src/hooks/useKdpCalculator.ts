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

// Helper functions - Updated click thresholds: ≥13 green, 10-12 yellow, <10 red
const calculateRiskLevel = (margenPct: number, clicsMax: number): RiskLevel => {
  if (margenPct < 30 || clicsMax < 10) return 'high';
  if (margenPct <= 40 || clicsMax < 13) return 'medium';
  return 'low';
};

const calculateViability = (regalias: number, margenPct: number, clicsMax: number): ViabilityStatus => {
  if (regalias <= 0 || margenPct < 20 || clicsMax < 5) return 'not-viable';
  if (margenPct < 30 || clicsMax < 10) return 'adjustable';
  return 'viable';
};

// Round up to nearest cent
const roundUpToCent = (value: number): number => {
  return Math.ceil(value * 100) / 100;
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

    // IVA calculation - only for ES marketplace
    const applyIva = marketplace === 'ES';
    const ivaPct = applyIva ? ivaType : 0;

    // Price without IVA
    const precioSinIva = pvp / (1 + ivaPct / 100);

    // Delivery cost (only for 70% royalty)
    const deliveryCost = royaltyRate === 70 && tamanoMb 
      ? Math.ceil(tamanoMb) * 0.12 
      : 0;

    // Royalties: (price without IVA × royalty rate) - delivery cost
    const regalias = (precioSinIva * (royaltyRate / 100)) - deliveryCost;

    // Margin calculations - BACOS = Regalía neta / Precio sin IVA
    const margenAbsoluto = regalias;
    const margenPct = precioSinIva > 0 ? (regalias / precioSinIva) * 100 : 0;
    
    // Benefit per sale
    const beneficioNeto = regalias;
    
    // Maximum profitable CPC (at 10% conversion = 10 clicks)
    const cpcMaxRentable = regalias > 0 ? regalias / 10 : 0;

    // Maximum clicks per sale (breakeven point) = FLOOR(Regalía neta / CPC)
    const clicsMaxPorVenta = cpc > 0 && regalias > 0 ? Math.floor(regalias / cpc) : 0;

    // Breakeven conversion rate
    const tasaConvBreakeven = regalias > 0 ? cpc / regalias : 0;

    // Minimum recommended price calculation for eBook
    let precioMinObjetivo: number | null = null;
    let precioMinObjetivoError: string | null = null;
    
    if (margenObjetivoPct !== null) {
      const margenObj = margenObjetivoPct / 100;
      const effectiveRoyaltyRate = royaltyRate / 100;
      const denominator = effectiveRoyaltyRate - margenObj;
      
      if (denominator <= 0) {
        precioMinObjetivoError = `Con el margen objetivo indicado (${margenObjetivoPct}%) no es factible con el ${royaltyRate}% de regalía; aumenta PVP o baja el margen.`;
      } else {
        // For eBook 70%: PsinIVA ≥ tarifa / (0.70 - m)
        // For eBook 35%: margin is fixed at 35%, so if m > 35% it's not feasible
        if (royaltyRate === 35 && margenObj > 0.35) {
          precioMinObjetivoError = `Con regalía del 35%, el margen máximo posible es 35%. Reduce el margen objetivo o cambia a 70%.`;
        } else {
          const minPriceSinIva = deliveryCost / denominator;
          const minPriceWithIva = minPriceSinIva * (1 + ivaPct / 100);
          precioMinObjetivo = roundUpToCent(minPriceWithIva);
        }
      }
    }

    // Diagnosis based on clicks - Updated thresholds: ≥13 green, 10-12 yellow, <10 red
    let diagnostico: 'good' | 'warning' | 'bad' = 'good';
    if (clicsMaxPorVenta < 10) {
      diagnostico = 'bad';
    } else if (clicsMaxPorVenta < 13) {
      diagnostico = 'warning';
    }

    const iva = (pvp * ivaPct) / 100;
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
    const { marketplace, cpc, margenObjetivoPct } = globalData;
    const { interior, size, pvp, pages, ivaType } = paperbackData;

    if (!interior || !size || !pvp || !pages || cpc === null || !marketplace) return null;

    // Calculate printing costs
    const printingResult = calculatePrintingCost(interior, size, pages);
    
    if (!printingResult.isValid) {
      return null;
    }

    const gastosImpresion = printingResult.totalCost;

    // IVA - only apply for ES marketplace
    const applyIva = marketplace === 'ES';
    const ivaPct = applyIva ? ivaType : 0;
    
    // Price without IVA
    const precioSinIva = pvp / (1 + ivaPct / 100);

    // Royalty rate threshold (9.99€ for ES marketplace)
    const royaltyThreshold = 9.99;
    const royaltyRate = pvp < royaltyThreshold ? 0.50 : 0.60;

    // Royalties: (price without IVA × royalty rate) - printing cost
    const regalias = (precioSinIva * royaltyRate) - gastosImpresion;

    // Margin calculations - BACOS = Regalía neta / Precio sin IVA
    const margenAbsoluto = regalias;
    const margenPct = precioSinIva > 0 ? (regalias / precioSinIva) * 100 : 0;
    
    // Benefit per sale
    const beneficioNeto = regalias;
    
    // Maximum profitable CPC (at 10% conversion)
    const cpcMaxRentable = regalias > 0 ? regalias / 10 : 0;

    // Maximum clicks per sale = FLOOR(Regalía neta / CPC)
    const clicsMaxPorVenta = cpc > 0 && regalias > 0 ? Math.floor(regalias / cpc) : 0;

    // Breakeven conversion rate
    const tasaConvBreakeven = regalias > 0 ? cpc / regalias : 0;

    // Minimum recommended price calculation with royalty threshold logic
    let precioMinObjetivo: number | null = null;
    let precioMinObjetivoError: string | null = null;
    
    if (margenObjetivoPct !== null) {
      const margenObj = margenObjetivoPct / 100;
      
      // Try with 60% royalty first
      const denominator60 = 0.60 - margenObj;
      
      if (denominator60 <= 0) {
        precioMinObjetivoError = `Con el margen objetivo indicado (${margenObjetivoPct}%) no es factible con esta regalía y costes; aumenta PVP o baja el margen.`;
      } else {
        // Calculate minimum price with 60% royalty
        const psinIva60 = gastosImpresion / denominator60;
        const pvp60 = roundUpToCent(psinIva60 * (1 + ivaPct / 100));
        
        if (pvp60 >= royaltyThreshold) {
          // Valid with 60% royalty
          precioMinObjetivo = pvp60;
        } else {
          // Need to check with 50% royalty
          const denominator50 = 0.50 - margenObj;
          
          if (denominator50 <= 0) {
            // Can't achieve margin with 50%, must use threshold price with 60%
            precioMinObjetivo = royaltyThreshold;
          } else {
            const psinIva50 = gastosImpresion / denominator50;
            const pvp50 = roundUpToCent(psinIva50 * (1 + ivaPct / 100));
            
            if (pvp50 >= royaltyThreshold) {
              // Use threshold price with 60% (better royalty)
              precioMinObjetivo = royaltyThreshold;
            } else {
              // Iterate from threshold upward until margin is achieved
              let testPvp = royaltyThreshold;
              let found = false;
              while (testPvp <= 100 && !found) {
                const testPsinIva = testPvp / (1 + ivaPct / 100);
                const testRegalias = (testPsinIva * 0.60) - gastosImpresion;
                const testMargen = testPsinIva > 0 ? testRegalias / testPsinIva : 0;
                
                if (testMargen >= margenObj) {
                  precioMinObjetivo = testPvp;
                  found = true;
                } else {
                  testPvp = roundUpToCent(testPvp + 0.10);
                }
              }
              
              if (!found) {
                precioMinObjetivoError = `No se puede alcanzar el margen objetivo con costes actuales.`;
              }
            }
          }
        }
      }
    }

    // Diagnosis based on margin and clicks - Updated thresholds: ≥13 green, 10-12 yellow, <10 red
    let diagnostico: 'good' | 'warning' | 'bad' = 'good';
    if (margenPct < 30 || clicsMaxPorVenta < 10) {
      diagnostico = 'bad';
    } else if (margenPct <= 40 || clicsMaxPorVenta < 13) {
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
      // Only add conditional warnings
      if (activeResults.margenPct < 25) {
        advertencias.push(`El margen real (BACOS) es < 25%.`);
        riskLevel = 'high';
      }
      
      if (activeResults.clicsMaxPorVenta < 10) {
        advertencias.push(`Clics máx./Venta < 10 (por debajo del mínimo recomendado).`);
        if (riskLevel !== 'high') riskLevel = 'medium';
      }
      
      // Check if PVP is below royalty threshold
      if (selectedFormat !== 'EBOOK' && paperbackData.pvp && paperbackData.pvp < 9.99) {
        advertencias.push(`El PVP queda por debajo del umbral de regalías superior (9,99€); revisa el precio.`);
        if (riskLevel !== 'high') riskLevel = 'medium';
      }
    }

    // Calculate days to breakeven (rough estimate)
    let diasParaBreakeven: number | null = null;
    if (activeResults && activeResults.regalias > 0 && inversionDiaria > 0) {
      const dailyProfit = (activeResults.regalias * ventasDiariasCompetencia) - inversionDiaria;
      if (dailyProfit > 0) {
        diasParaBreakeven = Math.ceil(inversionDiaria * 30 / dailyProfit);
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
  }, [globalData, ebookResults, paperbackResults, paperbackData.pvp]);

  // Table Data
  const tableData = useMemo((): TableRow[] => {
    const rows: TableRow[] = [];
    const { selectedFormat } = globalData;

    if (selectedFormat === 'EBOOK' && ebookResults && ebookData.pvp) {
      let recomendacion = '';
      
      if (ebookResults.diagnostico === 'bad') {
        recomendacion = `🔴 Solo ${ebookResults.clicsMaxPorVenta} clics máx. — Campaña en riesgo. Sube PVP, reduce CPC o busca keywords menos competidas.`;
      } else if (ebookResults.diagnostico === 'warning') {
        recomendacion = `🟡 ${ebookResults.clicsMaxPorVenta} clics máx. (aceptable) — Estás en el límite. Puedes mejorar ajustando precio o buscando CPC más bajo.`;
      } else {
        recomendacion = `🟢 ${ebookResults.clicsMaxPorVenta} clics máx. (excelente) — Campaña sana con buen margen de maniobra para escalar.`;
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
            ? `🔴 Margen < 30% — Sube PVP a mín. ${paperbackResults.precioMinObjetivo.toFixed(2)}€ o reduce páginas/costes.`
            : '🔴 Margen insuficiente — Aumenta PVP o reduce costes de impresión.';
        } else {
          recomendacion = `🔴 Solo ${paperbackResults.clicsMaxPorVenta} clics máx. — Campaña en riesgo. Ajusta precio, CPC o busca keywords menos competidas.`;
        }
      } else if (paperbackResults.diagnostico === 'warning') {
        recomendacion = `🟡 ${paperbackResults.clicsMaxPorVenta} clics máx. (aceptable) — Funciona, pero hay riesgo si el CPC sube. Optimiza si es posible.`;
      } else {
        recomendacion = `🟢 ${paperbackResults.clicsMaxPorVenta} clics máx. (excelente) — Configuración rentable para escalar campañas.`;
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
