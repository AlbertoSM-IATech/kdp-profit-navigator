import { useMemo } from 'react';
import { ScoreBreakdown, EbookResults, PaperbackResults, GlobalData } from '@/types/kdp';
import {
  DEFAULT_SCORING_THRESHOLDS,
  MAX_BACOS_POINTS,
  MAX_CLICKS_POINTS,
  MAX_OPTIMIZATION_POINTS,
  ScoringThresholds,
  scoreBacos,
  scoreClicks,
} from '@/lib/scoringConfig';
import { useScoringConfig } from '@/contexts/ScoringConfigContext';

interface ScoringInput {
  activeResults: EbookResults | PaperbackResults | null;
  pvp: number | null;
  precioMinRecomendado: number | null;
  thresholds?: ScoringThresholds;
}

/**
 * Calculate the global viability score (0-100).
 *
 * SCORING v6:
 *  - Clics máx./Venta: 50 pts (configurable via thresholds.clicks)
 *  - BACOS: 40 pts (configurable via thresholds.bacos)
 *  - Optimization bonus: 10 pts — reflects HOW MUCH the current price is
 *    already unlocking of the click/BACOS potential. It's a weighted average
 *    of (clicsScore/50) and (bacosScore/40), NOT a flat "above minimum" reward.
 *
 * The PVP only acts as a **viability gate** for the bonus:
 *  - pvp < precioMin  → bonus = 0 (unviable)
 *  - pvp ≈ precioMin  → bonus = 1 (bare minimum)
 *  - pvp > precioMin OR no minimum known → bonus proportional to clicks+bacos
 *
 * This guarantees the bonus is NEVER a fixed 10/10 just for exceeding the
 * minimum — it always reflects real optimization of the global criteria.
 */
export const calculateScore = ({
  activeResults,
  pvp,
  precioMinRecomendado,
  thresholds = DEFAULT_SCORING_THRESHOLDS,
}: ScoringInput): ScoreBreakdown | null => {
  if (!activeResults) return null;

  const { clicsMaxPorVenta, margenPct } = activeResults;
  const bacos = margenPct;

  const clicsScore = scoreClicks(clicsMaxPorVenta, thresholds);
  const bacosScore = scoreBacos(bacos, thresholds);

  // Optimization bonus — always proportional to real clicks/BACOS attainment
  const clicsRatio = clicsScore / MAX_CLICKS_POINTS;
  const bacosRatio = bacosScore / MAX_BACOS_POINTS;
  const attainment = clicsRatio * 0.5 + bacosRatio * 0.5; // 0..1
  const proportionalBonus = Math.round(attainment * MAX_OPTIMIZATION_POINTS);

  let pvpVsMinScore: number;
  const noMinKnown = precioMinRecomendado === null;
  const belowMin =
    pvp !== null && precioMinRecomendado !== null && pvp < precioMinRecomendado - 0.005;
  const atMin =
    pvp !== null &&
    precioMinRecomendado !== null &&
    Math.abs(pvp - precioMinRecomendado) < 0.01;

  if (belowMin) {
    pvpVsMinScore = 0;
  } else if (atMin) {
    pvpVsMinScore = 1;
  } else if (noMinKnown && pvp === null) {
    pvpVsMinScore = 0;
  } else {
    // pvp > min, or no min known → proportional to real attainment
    pvpVsMinScore = proportionalBonus;
    // Floor: si supera el mínimo, al menos 2 pts
    if (!noMinKnown && pvpVsMinScore < 2) pvpVsMinScore = 2;
  }

  const totalScore = clicsScore + bacosScore + pvpVsMinScore;

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
    clicsCapped: false,
    status,
    statusLabel,
    statusEmoji,
    statusColor,
  };
};

export const useScoring = (
  globalData: GlobalData,
  ebookResults: EbookResults | null,
  paperbackResults: PaperbackResults | null,
  ebookPvp: number | null,
  paperbackPvp: number | null
): ScoreBreakdown | null => {
  const { thresholds } = useScoringConfig();
  return useMemo(() => {
    const isEbook = globalData.selectedFormat === 'EBOOK';
    const activeResults = isEbook ? ebookResults : paperbackResults;
    const pvp = isEbook ? ebookPvp : paperbackPvp;
    const precioMinRecomendado = activeResults?.precioMinObjetivo || null;

    return calculateScore({
      activeResults,
      pvp,
      precioMinRecomendado,
      thresholds,
    });
  }, [globalData.selectedFormat, ebookResults, paperbackResults, ebookPvp, paperbackPvp, thresholds]);
};
