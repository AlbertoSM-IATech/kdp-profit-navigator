/**
 * Configurable thresholds for the viability score.
 *
 * The score is composed of:
 *  - Clics máx./Venta (max 50 pts)
 *  - BACOS (max 40 pts)
 *  - Optimization bonus (max 10 pts) — derived from Clics + BACOS
 *
 * Users can tweak these thresholds to adapt the scoring to different
 * ad strategies (e.g. aggressive scaling vs conservative launch).
 */
export interface ClickTier {
  /** Minimum "clics máx. por venta" required to obtain `points`. */
  value: number;
  points: number;
}

export interface BacosTier {
  /** Minimum BACOS % required to obtain `points`. */
  minPct: number;
  points: number;
}

export interface ScoringThresholds {
  clicks: {
    /** Below this value the click component is 0 pts (not viable for Ads). */
    min: number;
    /** Tiers sorted DESC by `value`. First matching tier wins. */
    tiers: ClickTier[];
  };
  bacos: {
    /** Tiers sorted DESC by `minPct`. First matching tier wins. */
    tiers: BacosTier[];
  };
}

export const DEFAULT_SCORING_THRESHOLDS: ScoringThresholds = {
  clicks: {
    min: 10,
    tiers: [
      { value: 14, points: 50 },
      { value: 13, points: 35 },
      { value: 12, points: 25 },
      { value: 11, points: 15 },
      { value: 10, points: 8 },
    ],
  },
  bacos: {
    tiers: [
      { minPct: 40, points: 40 },
      { minPct: 35, points: 25 },
      { minPct: 30, points: 15 },
    ],
  },
};

export const MAX_CLICKS_POINTS = 50;
export const MAX_BACOS_POINTS = 40;
export const MAX_OPTIMIZATION_POINTS = 10;

export const scoreClicks = (clicsMaxPorVenta: number, thresholds: ScoringThresholds): number => {
  if (clicsMaxPorVenta < thresholds.clicks.min) return 0;
  const sorted = [...thresholds.clicks.tiers].sort((a, b) => b.value - a.value);
  for (const t of sorted) {
    if (clicsMaxPorVenta >= t.value) return t.points;
  }
  return 0;
};

export const scoreBacos = (bacosPct: number, thresholds: ScoringThresholds): number => {
  const sorted = [...thresholds.bacos.tiers].sort((a, b) => b.minPct - a.minPct);
  for (const t of sorted) {
    if (bacosPct >= t.minPct) return t.points;
  }
  return 0;
};

export const STORAGE_KEY = "kdp.scoring.thresholds.v1";

export const loadStoredThresholds = (): ScoringThresholds => {
  if (typeof window === "undefined") return DEFAULT_SCORING_THRESHOLDS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SCORING_THRESHOLDS;
    const parsed = JSON.parse(raw);
    // Minimal shape validation
    if (
      parsed?.clicks?.tiers?.length &&
      parsed?.bacos?.tiers?.length &&
      typeof parsed.clicks.min === "number"
    ) {
      return parsed as ScoringThresholds;
    }
  } catch {
    // fall through
  }
  return DEFAULT_SCORING_THRESHOLDS;
};

export const saveStoredThresholds = (t: ScoringThresholds) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(t));
  } catch {
    // ignore quota errors
  }
};
