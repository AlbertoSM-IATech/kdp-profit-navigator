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
import { getPresetById } from '@/data/paperbackPresets';

export const useKdpCalculator = () => {
  // Global Data State
  const [globalData, setGlobalData] = useState<GlobalData>({
    marketplace: null,
    margenObjetivoPct: null,
    cpc: null,
    ventasDiariasCompetencia: null,
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
    presetId: null,
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
    const { presetId, pvp, pages } = paperbackData;

    if (!presetId || !pvp || !pages || cpc === null) return null;

    const preset = getPresetById(presetId);
    if (!preset) return null;

    // Royalty rate based on PVP
    const royaltyRate = pvp < 9.99 ? 0.50 : 0.60;

    // Printing costs: pages * perPageCost + fixedCost
    const gastosImpresion = (pages * preset.perPageCost) + preset.fixedCost;

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

    // Minimum target price
    const margenObj = margenObjetivoPct ? margenObjetivoPct / 100 : 0.30;
    const precioMinObjetivo = royaltyRate > margenObj
      ? Math.ceil(gastosImpresion / (royaltyRate - margenObj)) - 0.01
      : 0;

    // Diagnosis based on margin - more clicks allowed is BETTER
    let diagnostico: 'good' | 'warning' | 'bad' = 'good';
    const margenPct = margenBacos * 100;
    if (margenPct < 30 || clicsMaxPorVenta < 10) {
      diagnostico = 'bad';
    } else if (margenPct <= 40 || clicsMaxPorVenta === 10) {
      diagnostico = 'warning';
    }

    return {
      royaltyRate,
      gastosImpresion,
      regalias,
      margenBacos,
      tasaConvBreakeven,
      clicsPorVenta: clicsMaxPorVenta,
      precioMinObjetivo,
      diagnostico,
    };
  }, [globalData, paperbackData]);

  // Positioning Calculations
  const positioningResults = useMemo((): PositioningResults | null => {
    const { cpc, ventasDiariasCompetencia, margenObjetivoPct } = globalData;

    if (cpc === null || ventasDiariasCompetencia === null) return null;

    const tasaConversionReferencia = 0.10; // 10%
    const clicsDiarios = ventasDiariasCompetencia / tasaConversionReferencia;
    const inversionDiaria = clicsDiarios * cpc;

    const advertencias: string[] = [];

    // Check if conversion needed is too high
    if (ebookResults) {
      const conversionNeeded = ebookResults.tasaConvBreakeven;
      if (conversionNeeded > 0.10) {
        advertencias.push(`La conversión necesaria para eBook (${(conversionNeeded * 100).toFixed(1)}%) supera la referencia del 10%.`);
      }
    }

    if (paperbackResults) {
      const conversionNeeded = paperbackResults.tasaConvBreakeven;
      if (conversionNeeded > 0.10) {
        advertencias.push(`La conversión necesaria para Paperback (${(conversionNeeded * 100).toFixed(1)}%) supera la referencia del 10%.`);
      }
    }

    // Check if daily investment is disproportionate
    const margenObj = margenObjetivoPct || 30;
    const ebookRegalias = ebookResults?.regalias || 0;
    const paperbackRegalias = paperbackResults?.regalias || 0;
    const avgRegalias = (ebookRegalias + paperbackRegalias) / 2;
    
    if (avgRegalias > 0 && inversionDiaria > avgRegalias * ventasDiariasCompetencia * 0.5) {
      advertencias.push(`La inversión diaria (${inversionDiaria.toFixed(2)}€) puede ser desproporcionada respecto a las regalías esperadas.`);
    }

    return {
      tasaConversionReferencia,
      clicsDiarios,
      inversionDiaria,
      advertencias,
    };
  }, [globalData, ebookResults, paperbackResults]);

  // Table Data
  const tableData = useMemo((): TableRow[] => {
    const rows: TableRow[] = [];

    if (ebookResults && ebookData.pvp) {
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

    if (paperbackResults && paperbackData.pvp) {
      const margenPct = paperbackResults.margenBacos * 100;
      let recomendacion = '';
      
      if (paperbackResults.diagnostico === 'bad') {
        if (margenPct < 30) {
          recomendacion = `Subir PVP mínimo a ${paperbackResults.precioMinObjetivo.toFixed(2)}€ para alcanzar margen objetivo.`;
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
  }, [ebookData.pvp, ebookResults, paperbackData.pvp, paperbackResults]);

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
