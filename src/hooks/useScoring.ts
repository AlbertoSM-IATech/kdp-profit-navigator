import { useMemo } from 'react';
import { ScoreBreakdown, EbookResults, PaperbackResults, GlobalData } from '@/types/kdp';

interface ScoringInput {
  activeResults: EbookResults | PaperbackResults | null;
  inversionDiaria: number;
  pvp: number | null;
  precioMinRecomendado: number | null;
}

/**
 * Calculate the global viability score (0-100) based on 5 weighted components
 */
export const calculateScore = ({
  activeResults,
  inversionDiaria,
  pvp,
  precioMinRecomendado,
}: ScoringInput): ScoreBreakdown | null => {
  if (!activeResults) return null;

  const { clicsMaxPorVenta, margenPct } = activeResults;
  const bacos = margenPct; // BACOS = Margen real

  // A) Clics máx./Venta — 30 points
  let clicsScore = 0;
  if (clicsMaxPorVenta >= 13) {
    clicsScore = 30;
  } else if (clicsMaxPorVenta >= 10) {
    clicsScore = 20;
  } else if (clicsMaxPorVenta >= 7) {
    clicsScore = 10;
  } else {
    clicsScore = 0;
  }

  // B) Margen neto por venta — 25 points
  let margenScore = 0;
  if (margenPct >= 40) {
    margenScore = 25;
  } else if (margenPct >= 30) {
    margenScore = 18;
  } else if (margenPct >= 20) {
    margenScore = 10;
  } else {
    margenScore = 0;
  }

  // C) BACOS (ACoS de equilibrio) — 20 points
  let bacosScore = 0;
  if (bacos >= 40) {
    bacosScore = 20;
  } else if (bacos >= 30) {
    bacosScore = 14;
  } else if (bacos >= 20) {
    bacosScore = 8;
  } else {
    bacosScore = 0;
  }

  // D) Inversión diaria estimada — 15 points
  let inversionScore = 0;
  if (inversionDiaria <= 15) {
    inversionScore = 15;
  } else if (inversionDiaria <= 30) {
    inversionScore = 10;
  } else if (inversionDiaria <= 60) {
    inversionScore = 5;
  } else {
    inversionScore = 0;
  }

  // E) PVP actual vs Precio mínimo recomendado — 10 points
  let pvpVsMinScore = 0;
  if (pvp !== null && precioMinRecomendado !== null) {
    const diff = pvp - precioMinRecomendado;
    if (diff >= 0) {
      pvpVsMinScore = 10;
    } else if (diff >= -1) {
      pvpVsMinScore = 5;
    } else {
      pvpVsMinScore = 0;
    }
  } else if (pvp !== null && precioMinRecomendado === null) {
    // No min price calculated, assume OK
    pvpVsMinScore = 10;
  }

  const totalScore = clicsScore + margenScore + bacosScore + inversionScore + pvpVsMinScore;

  // Interpretation
  let status: ScoreBreakdown['status'];
  let statusLabel: string;
  let statusEmoji: string;
  let statusColor: string;

  if (totalScore >= 80) {
    status = 'excellent';
    statusLabel = 'Muy sano para Ads';
    statusEmoji = '🟢';
    statusColor = '#22C55E';
  } else if (totalScore >= 60) {
    status = 'viable';
    statusLabel = 'Viable con control';
    statusEmoji = '🟡';
    statusColor = '#EAB308';
  } else if (totalScore >= 40) {
    status = 'risky';
    statusLabel = 'Riesgo medio-alto';
    statusEmoji = '🟠';
    statusColor = '#F97316';
  } else {
    status = 'not-recommended';
    statusLabel = 'No recomendable para Ads';
    statusEmoji = '🔴';
    statusColor = '#EF4444';
  }

  return {
    clicsScore,
    margenScore,
    bacosScore,
    inversionScore,
    pvpVsMinScore,
    totalScore,
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
  paperbackPvp: number | null,
  positioningInversionDiaria: number
): ScoreBreakdown | null => {
  return useMemo(() => {
    const isEbook = globalData.selectedFormat === 'EBOOK';
    const activeResults = isEbook ? ebookResults : paperbackResults;
    const pvp = isEbook ? ebookPvp : paperbackPvp;
    const precioMinRecomendado = activeResults?.precioMinObjetivo || null;

    return calculateScore({
      activeResults,
      inversionDiaria: positioningInversionDiaria,
      pvp,
      precioMinRecomendado,
    });
  }, [globalData.selectedFormat, ebookResults, paperbackResults, ebookPvp, paperbackPvp, positioningInversionDiaria]);
};
