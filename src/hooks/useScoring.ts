import { useMemo } from 'react';
import { ScoreBreakdown, EbookResults, PaperbackResults, GlobalData } from '@/types/kdp';

interface ScoringInput {
  activeResults: EbookResults | PaperbackResults | null;
  pvp: number | null;
  precioMinRecomendado: number | null;
}

/**
 * Calculate the global viability score (0-100) based on 3 weighted components
 * 
 * NEW SCORING v4:
 * - Clics máx./Venta: 50 pts (CRITICAL - dominant criterion)
 * - BACOS: 30 pts 
 * - PVP vs Precio mínimo recomendado: 20 pts
 * 
 * IMPORTANT: If clics < 10, score is capped at 40 max (not viable for Ads)
 */
export const calculateScore = ({
  activeResults,
  pvp,
  precioMinRecomendado,
}: ScoringInput): ScoreBreakdown | null => {
  if (!activeResults) return null;

  const { clicsMaxPorVenta, margenPct } = activeResults;
  const bacos = margenPct; // BACOS = Margen real

  // A) Clics máx./Venta — 50 points (CRITICAL)
  let clicsScore = 0;
  if (clicsMaxPorVenta >= 13) {
    clicsScore = 50;
  } else if (clicsMaxPorVenta >= 10) {
    clicsScore = 30;
  } else {
    clicsScore = 0;
  }

  // B) BACOS (ACoS de equilibrio) — 30 points
  let bacosScore = 0;
  if (bacos >= 40) {
    bacosScore = 30;
  } else if (bacos >= 30) {
    bacosScore = 15;
  } else {
    bacosScore = 0;
  }

  // C) PVP actual vs Precio mínimo recomendado — 20 points
  let pvpVsMinScore = 0;
  if (pvp !== null && precioMinRecomendado !== null) {
    if (pvp > precioMinRecomendado) {
      pvpVsMinScore = 20;
    } else if (pvp === precioMinRecomendado || Math.abs(pvp - precioMinRecomendado) < 0.01) {
      pvpVsMinScore = 10;
    } else {
      pvpVsMinScore = 0;
    }
  } else if (pvp !== null && precioMinRecomendado === null) {
    // No min price calculated, assume OK
    pvpVsMinScore = 20;
  }

  let totalScore = clicsScore + bacosScore + pvpVsMinScore;
  
  // CRITICAL CAP: If clics < 10, the score cannot exceed 40
  const clicsCapped = clicsMaxPorVenta < 10;
  if (clicsCapped && totalScore > 40) {
    totalScore = 40;
  }

  // Interpretation - NEW THRESHOLDS
  let status: ScoreBreakdown['status'];
  let statusLabel: string;
  let statusEmoji: string;
  let statusColor: string;

  if (totalScore >= 80) {
    status = 'excellent';
    statusLabel = 'Nicho sano para Ads';
    statusEmoji = '🟢';
    statusColor = '#22C55E';
  } else if (totalScore >= 50) {
    status = 'viable';
    statusLabel = 'Viable, pero con ajustes';
    statusEmoji = '🟡';
    statusColor = '#EAB308';
  } else {
    status = 'not-recommended';
    statusLabel = 'Riesgo alto / no recomendable';
    statusEmoji = '🔴';
    statusColor = '#EF4444';
  }

  return {
    clicsScore,
    bacosScore,
    pvpVsMinScore,
    totalScore,
    clicsCapped,
    status,
    statusLabel,
    statusEmoji,
    statusColor,
  };
};

/**
 * Hook to calculate the scoring based on current state
 */
export const useScoring = (
  globalData: GlobalData,
  ebookResults: EbookResults | null,
  paperbackResults: PaperbackResults | null,
  ebookPvp: number | null,
  paperbackPvp: number | null
): ScoreBreakdown | null => {
  return useMemo(() => {
    const isEbook = globalData.selectedFormat === 'EBOOK';
    const activeResults = isEbook ? ebookResults : paperbackResults;
    const pvp = isEbook ? ebookPvp : paperbackPvp;
    const precioMinRecomendado = activeResults?.precioMinObjetivo || null;

    return calculateScore({
      activeResults,
      pvp,
      precioMinRecomendado,
    });
  }, [globalData.selectedFormat, ebookResults, paperbackResults, ebookPvp, paperbackPvp]);
};
