import { useMemo } from 'react';
import { ScoreBreakdown, EbookResults, PaperbackResults, GlobalData } from '@/types/kdp';

interface ScoringInput {
  activeResults: EbookResults | PaperbackResults | null;
  pvp: number | null;
  precioMinRecomendado: number | null;
}

/**
 * Calculate the global viability score (0-100) based on 2 weighted components
 * 
 * SCORING v5:
 * - Clics máx./Venta: 50 pts (CRITICAL - dominant criterion)
 * - BACOS: 40 pts 
 * - PVP vs Precio mínimo: 10 pts (bonus)
 * 
 * CLICK SCORING:
 * <10 clicks = 0 pts (En riesgo)
 * 11 clicks = 15 pts (Aceptable)
 * 12 clicks = 25 pts (Aceptable)
 * 13 clicks = 35 pts (Bueno)
 * ≥14 clicks = 50 pts (Excelente)
 * 
 * BACOS SCORING:
 * <30% = 0 pts (no viable para ads)
 * ≥30% = 15 pts (Viable pero justo)
 * ≥35% = 25 pts (Viable)
 * ≥40% = 40 pts (Excelente)
 * 
 * STATUS RANGES:
 * 80-100 = Excelente
 * 50-79 = Aceptable
 * <50 = En riesgo
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
  // 10 clics = umbral mínimo operativo; por debajo, la campaña deja de ser viable.
  let clicsScore = 0;
  if (clicsMaxPorVenta >= 14) {
    clicsScore = 50;
  } else if (clicsMaxPorVenta === 13) {
    clicsScore = 35;
  } else if (clicsMaxPorVenta === 12) {
    clicsScore = 25;
  } else if (clicsMaxPorVenta === 11) {
    clicsScore = 15;
  } else if (clicsMaxPorVenta === 10) {
    clicsScore = 8; // umbral mínimo: aún puntúa, pero al límite
  } else {
    clicsScore = 0; // < 10 clics: no viable para Ads
  }

  // B) BACOS (ACoS de equilibrio) — 40 points
  let bacosScore = 0;
  if (bacos >= 40) {
    bacosScore = 40;
  } else if (bacos >= 35) {
    bacosScore = 25;
  } else if (bacos >= 30) {
    bacosScore = 15;
  } else {
    bacosScore = 0; // <30% no viable para ads
  }

  // C) PVP actual vs Precio mínimo recomendado — 10 points (bonus)
  let pvpVsMinScore = 0;
  if (pvp !== null && precioMinRecomendado !== null) {
    if (pvp > precioMinRecomendado) {
      pvpVsMinScore = 10;
    } else if (pvp === precioMinRecomendado || Math.abs(pvp - precioMinRecomendado) < 0.01) {
      pvpVsMinScore = 5;
    } else {
      pvpVsMinScore = 0;
    }
  } else if (pvp !== null && precioMinRecomendado === null) {
    // No min price calculated, assume OK
    pvpVsMinScore = 10;
  }

  const totalScore = clicsScore + bacosScore + pvpVsMinScore;

  // Interpretation - NEW THRESHOLDS
  let status: ScoreBreakdown['status'];
  let statusLabel: string;
  let statusEmoji: string;
  let statusColor: string;

  if (totalScore >= 80) {
    status = 'excellent';
    statusLabel = 'Excelente';
    statusEmoji = '🟢';
    statusColor = '#22C55E';
  } else if (totalScore >= 50) {
    status = 'viable';
    statusLabel = 'Aceptable';
    statusEmoji = '🟡';
    statusColor = '#EAB308';
  } else {
    status = 'not-recommended';
    statusLabel = 'En riesgo';
    statusEmoji = '🔴';
    statusColor = '#EF4444';
  }

  return {
    clicsScore,
    bacosScore,
    pvpVsMinScore,
    totalScore,
    clicsCapped: false, // No longer used in v5
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
