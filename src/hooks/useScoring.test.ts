import { describe, it, expect } from 'vitest';
import { calculateScore } from './useScoring';
import { DEFAULT_SCORING_THRESHOLDS, scoreClicks, scoreBacos } from '@/lib/scoringConfig';
import type { PaperbackResults } from '@/types/kdp';

const baseResults = (overrides: Partial<PaperbackResults> = {}): PaperbackResults => ({
  royaltyRate: 60,
  fixedCost: 1,
  perPageCost: 0.01,
  gastosImpresion: 2,
  precioSinIva: 10,
  regalias: 3,
  margenPct: 30,
  margenAbsoluto: 3,
  beneficioNeto: 3,
  cpcMaxRentable: 0.3,
  tasaConvBreakeven: 0.1,
  clicsMaxPorVenta: 10,
  precioMinObjetivo: 8,
  precioMinObjetivoError: null,
  diagnostico: 'warning',
  riskLevel: 'medium',
  viabilityStatus: 'adjustable',
  ...overrides,
});

describe('calculateScore', () => {
  it('grows monotonically as clics increase (with pvp above min)', () => {
    const scores = [10, 11, 12, 13, 14].map(c => {
      const s = calculateScore({
        activeResults: baseResults({ clicsMaxPorVenta: c, margenPct: 30 }),
        pvp: 12,
        precioMinRecomendado: 8,
      });
      return s!.totalScore;
    });
    for (let i = 1; i < scores.length; i++) {
      expect(scores[i]).toBeGreaterThan(scores[i - 1]);
    }
  });

  it('grows as BACOS increases (with pvp above min)', () => {
    const scores = [30, 35, 40, 45].map(m => {
      const s = calculateScore({
        activeResults: baseResults({ clicsMaxPorVenta: 12, margenPct: m }),
        pvp: 12,
        precioMinRecomendado: 8,
      });
      return s!.totalScore;
    });
    for (let i = 1; i < scores.length; i++) {
      expect(scores[i]).toBeGreaterThanOrEqual(scores[i - 1]);
    }
    expect(scores[scores.length - 1]).toBeGreaterThan(scores[0]);
  });

  it('optimization bonus is NEVER a fixed 10/10 just for exceeding the minimum', () => {
    const s = calculateScore({
      activeResults: baseResults({ clicsMaxPorVenta: 10, margenPct: 30 }),
      pvp: 20,
      precioMinRecomendado: 8,
    });
    expect(s!.pvpVsMinScore).toBeLessThan(10);
    expect(s!.pvpVsMinScore).toBeGreaterThan(0);
  });

  it('optimization bonus reaches 10/10 only with max clics AND max BACOS', () => {
    const s = calculateScore({
      activeResults: baseResults({ clicsMaxPorVenta: 14, margenPct: 45 }),
      pvp: 20,
      precioMinRecomendado: 8,
    });
    expect(s!.pvpVsMinScore).toBe(10);
  });

  it('viability gates: <10 clics or <30% bacos → zero those components', () => {
    const lowClics = calculateScore({
      activeResults: baseResults({ clicsMaxPorVenta: 9, margenPct: 40 }),
      pvp: 12,
      precioMinRecomendado: 8,
    });
    expect(lowClics!.clicsScore).toBe(0);

    const lowBacos = calculateScore({
      activeResults: baseResults({ clicsMaxPorVenta: 14, margenPct: 25 }),
      pvp: 12,
      precioMinRecomendado: 8,
    });
    expect(lowBacos!.bacosScore).toBe(0);
  });

  it('pvp below minimum forces optimization bonus to 0', () => {
    const s = calculateScore({
      activeResults: baseResults({ clicsMaxPorVenta: 14, margenPct: 45 }),
      pvp: 5,
      precioMinRecomendado: 8,
    });
    expect(s!.pvpVsMinScore).toBe(0);
  });

  it('status thresholds: excellent ≥80, viable 50–79, not-recommended <50', () => {
    const excellent = calculateScore({
      activeResults: baseResults({ clicsMaxPorVenta: 14, margenPct: 45 }),
      pvp: 20,
      precioMinRecomendado: 8,
    });
    expect(excellent!.totalScore).toBeGreaterThanOrEqual(80);
    expect(excellent!.status).toBe('excellent');

    const risk = calculateScore({
      activeResults: baseResults({ clicsMaxPorVenta: 8, margenPct: 20 }),
      pvp: 5,
      precioMinRecomendado: 8,
    });
    expect(risk!.totalScore).toBeLessThan(50);
    expect(risk!.status).toBe('not-recommended');
  });

  it('honors custom thresholds', () => {
    const stricter = {
      clicks: { min: 12, tiers: [{ value: 15, points: 50 }, { value: 12, points: 25 }] },
      bacos: { tiers: [{ minPct: 50, points: 40 }] },
    };
    expect(scoreClicks(11, stricter)).toBe(0);
    expect(scoreClicks(12, stricter)).toBe(25);
    expect(scoreBacos(45, stricter)).toBe(0);
    expect(scoreBacos(50, stricter)).toBe(40);
  });

  it('default thresholds match legacy tier values', () => {
    expect(scoreClicks(14, DEFAULT_SCORING_THRESHOLDS)).toBe(50);
    expect(scoreClicks(10, DEFAULT_SCORING_THRESHOLDS)).toBe(8);
    expect(scoreClicks(9, DEFAULT_SCORING_THRESHOLDS)).toBe(0);
    expect(scoreBacos(40, DEFAULT_SCORING_THRESHOLDS)).toBe(40);
    expect(scoreBacos(29, DEFAULT_SCORING_THRESHOLDS)).toBe(0);
  });
});
