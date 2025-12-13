import { useState, useMemo } from 'react';
import {
  GlobalData,
  EbookData,
  EbookResults,
  PaperbackData,
  PaperbackResults,
  PositioningResults,
  TableRow,
} from '@/types/kdp';
import { calculatePrintingCost } from '@/data/printingCosts';

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
    audiovisual: false,
  });

  // Paperback State
  const [paperbackData, setPaperbackData] = useState<PaperbackData>({
    interior: null,
    size: null,
    pvp: null,
    pages: null,
  });

  // eBook Calculations
  const ebookResults = useMemo((): EbookResults | null => {
    const { marketplace, cpc } = globalData;
    const { pvp, royaltyRate, tamanoMb, audiovisual } = ebookData;

    if (!marketplace || !pvp || cpc === null) return null;

    // IVA calculation
    let ivaPct = 0;
    if (marketplace === 'ES') {
      ivaPct = audiovisual ? 21 : 4;
    }
    const iva = (pvp * ivaPct) / 100;

    // Delivery cost (only for 70% royalty)
    const deliveryCost = royaltyRate === 70 && tamanoMb 
      ? Math.ceil(tamanoMb) * 0.12 
      : 0;

    // Net price
    const neto = marketplace === 'ES' ? pvp - iva : pvp;

    // Royalties
    const regalias = marketplace === 'ES'
      ? (royaltyRate / 100) * (neto - deliveryCost)
      : (royaltyRate / 100) * (pvp - deliveryCost);

    // Margin ACOS
    const margenAcos = regalias / pvp;

    // Breakeven conversion rate
    const tasaConvBreakeven = regalias > 0 ? cpc / regalias : 0;

    // Maximum clicks per sale (breakeven point) - more clicks allowed = healthier margin
    const clicsMaxPorVenta = tasaConvBreakeven > 0 ? Math.floor(1 / tasaConvBreakeven) : 0;

    // Diagnosis - less than 10 max clicks is bad, exactly 10 is the limit
    let diagnostico: 'good' | 'warning' | 'bad' = 'good';
    if (clicsMaxPorVenta < 10) {
      diagnostico = 'bad';
    } else if (clicsMaxPorVenta === 10) {
      diagnostico = 'warning';
    }

    return {
      iva,
      ivaPct,
      deliveryCost,
      neto,
      regalias,
      margenAcos,
      tasaConvBreakeven,
      clicsPorVenta: clicsMaxPorVenta,
      diagnostico,
    };
  }, [globalData, ebookData]);

  // Paperback Calculations
  const paperbackResults = useMemo((): PaperbackResults | null => {
    const { marketplace, cpc, margenObjetivoPct } = globalData;
    const { interior, size, pvp, pages } = paperbackData;

    if (!interior || !size || !pvp || !pages || cpc === null || !marketplace) return null;

    // Calculate printing costs using the new model
    const printingResult = calculatePrintingCost(interior, size, pages);
    
    if (!printingResult.isValid) {
      return null;
    }

    const gastosImpresion = printingResult.totalCost;

    // Royalty rate based on PVP
    const royaltyRate = pvp < 9.99 ? 0.50 : 0.60;

    // Calculate price without VAT for ES marketplace (4% for books)
    const ivaPct = marketplace === 'ES' ? 4 : 0;
    const precioSinIva = marketplace === 'ES' ? pvp / (1 + ivaPct / 100) : pvp;

    // Royalties: (price without VAT × royalty rate) - printing cost
    const regalias = (precioSinIva * royaltyRate) - gastosImpresion;

    // Margin BACOS
    const margenBacos = pvp > 0 ? regalias / pvp : 0;

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
        precioMinObjetivo = Math.ceil(gastosImpresion / denominator) - 0.01;
      }
    }

    // Diagnosis based on margin and clicks
    let diagnostico: 'good' | 'warning' | 'bad' = 'good';
    const margenPct = margenBacos * 100;
    if (margenPct < 30 || clicsMaxPorVenta < 10) {
      diagnostico = 'bad';
    } else if (margenPct <= 40 || clicsMaxPorVenta === 10) {
      diagnostico = 'warning';
    }

    return {
      royaltyRate,
      fixedCost: printingResult.fixedCost,
      perPageCost: printingResult.perPageCost,
      gastosImpresion,
      precioSinIva,
      regalias,
      margenBacos,
      tasaConvBreakeven,
      clicsPorVenta: clicsMaxPorVenta,
      precioMinObjetivo,
      precioMinObjetivoError,
      diagnostico,
    };
  }, [globalData, paperbackData]);

  // Positioning Calculations
  const positioningResults = useMemo((): PositioningResults | null => {
    const { cpc, ventasDiariasCompetencia, selectedFormat } = globalData;

    if (cpc === null || ventasDiariasCompetencia === null) return null;

    const tasaConversionReferencia = 0.10; // 10%
    const clicsDiarios = ventasDiariasCompetencia / tasaConversionReferencia;
    const inversionDiaria = clicsDiarios * cpc;

    const advertencias: string[] = [];

    // Check based on selected format
    if (selectedFormat === 'EBOOK' && ebookResults) {
      const conversionNeeded = ebookResults.tasaConvBreakeven;
      if (conversionNeeded > 0.10) {
        advertencias.push(`La conversión necesaria (${(conversionNeeded * 100).toFixed(1)}%) supera la referencia del 10%.`);
      }
    }

    if (selectedFormat === 'PAPERBACK' && paperbackResults) {
      const conversionNeeded = paperbackResults.tasaConvBreakeven;
      if (conversionNeeded > 0.10) {
        advertencias.push(`La conversión necesaria (${(conversionNeeded * 100).toFixed(1)}%) supera la referencia del 10%.`);
      }
    }

    // Check if daily investment is disproportionate
    const activeResults = selectedFormat === 'EBOOK' ? ebookResults : paperbackResults;
    const activeRegalias = activeResults?.regalias || 0;
    
    if (activeRegalias > 0 && inversionDiaria > activeRegalias * ventasDiariasCompetencia * 0.5) {
      advertencias.push(`La inversión diaria (${inversionDiaria.toFixed(2)}€) puede ser desproporcionada respecto a las regalías esperadas.`);
    }

    return {
      tasaConversionReferencia,
      clicsDiarios,
      inversionDiaria,
      advertencias,
    };
  }, [globalData, ebookResults, paperbackResults]);

  // Table Data - Only shows the selected format
  const tableData = useMemo((): TableRow[] => {
    const rows: TableRow[] = [];
    const { selectedFormat } = globalData;

    if (selectedFormat === 'EBOOK' && ebookResults && ebookData.pvp) {
      const margenPct = ebookResults.margenAcos * 100;
      let recomendacion = '';
      
      if (ebookResults.diagnostico === 'bad') {
        recomendacion = `Necesitas mín. 1 venta cada 10 clics, pero solo puedes permitir ${ebookResults.clicsPorVenta}. Aumenta PVP o reduce CPC.`;
      } else if (ebookResults.diagnostico === 'warning') {
        recomendacion = 'En el límite de breakeven (10 clics). Margen ajustado.';
      } else {
        recomendacion = `Puedes permitir hasta ${ebookResults.clicsPorVenta} clics por venta. Buen margen.`;
      }

      rows.push({
        tipo: 'eBook',
        pvp: ebookData.pvp,
        regalias: ebookResults.regalias,
        margen: margenPct,
        clicsPorVenta: ebookResults.clicsPorVenta,
        diagnostico: ebookResults.diagnostico,
        recomendacion,
      });
    }

    if (selectedFormat === 'PAPERBACK' && paperbackResults && paperbackData.pvp) {
      const margenPct = paperbackResults.margenBacos * 100;
      let recomendacion = '';
      
      if (paperbackResults.diagnostico === 'bad') {
        if (margenPct < 30) {
          recomendacion = paperbackResults.precioMinObjetivo 
            ? `Subir PVP mínimo a ${paperbackResults.precioMinObjetivo.toFixed(2)}€ para alcanzar margen objetivo.`
            : 'Aumenta el PVP para mejorar el margen.';
        } else {
          recomendacion = `Solo puedes permitir ${paperbackResults.clicsPorVenta} clics máx. Reduce CPC o sube PVP.`;
        }
      } else if (paperbackResults.diagnostico === 'warning') {
        recomendacion = 'En el límite de breakeven (10 clics). Considera aumentar PVP.';
      } else {
        recomendacion = `Puedes permitir hasta ${paperbackResults.clicsPorVenta} clics por venta. Configuración rentable.`;
      }

      rows.push({
        tipo: 'Paperback',
        pvp: paperbackData.pvp,
        regalias: paperbackResults.regalias,
        margen: margenPct,
        clicsPorVenta: paperbackResults.clicsPorVenta,
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
  };
};
