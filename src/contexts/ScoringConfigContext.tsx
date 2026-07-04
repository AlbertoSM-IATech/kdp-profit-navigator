import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import {
  DEFAULT_SCORING_THRESHOLDS,
  ScoringThresholds,
  loadStoredThresholds,
  saveStoredThresholds,
} from "@/lib/scoringConfig";

interface Ctx {
  thresholds: ScoringThresholds;
  setThresholds: (t: ScoringThresholds) => void;
  reset: () => void;
}

const ScoringConfigContext = createContext<Ctx | null>(null);

export const ScoringConfigProvider = ({ children }: { children: ReactNode }) => {
  const [thresholds, setThresholdsState] = useState<ScoringThresholds>(DEFAULT_SCORING_THRESHOLDS);

  useEffect(() => {
    setThresholdsState(loadStoredThresholds());
  }, []);

  const setThresholds = useCallback((t: ScoringThresholds) => {
    setThresholdsState(t);
    saveStoredThresholds(t);
  }, []);

  const reset = useCallback(() => {
    setThresholdsState(DEFAULT_SCORING_THRESHOLDS);
    saveStoredThresholds(DEFAULT_SCORING_THRESHOLDS);
  }, []);

  const value = useMemo(() => ({ thresholds, setThresholds, reset }), [thresholds, setThresholds, reset]);
  return <ScoringConfigContext.Provider value={value}>{children}</ScoringConfigContext.Provider>;
};

export const useScoringConfig = (): Ctx => {
  const ctx = useContext(ScoringConfigContext);
  if (!ctx) {
    // Fallback: safe defaults so components used outside the provider (e.g. tests) still work.
    return {
      thresholds: DEFAULT_SCORING_THRESHOLDS,
      setThresholds: () => {},
      reset: () => {},
    };
  }
  return ctx;
};
