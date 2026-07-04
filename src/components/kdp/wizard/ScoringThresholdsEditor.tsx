import { useScoringConfig } from '@/contexts/ScoringConfigContext';
import { DEFAULT_SCORING_THRESHOLDS, ScoringThresholds } from '@/lib/scoringConfig';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RotateCcw, Sliders } from 'lucide-react';

export const ScoringThresholdsEditor = () => {
  const { thresholds, setThresholds, reset } = useScoringConfig();

  const updateClickTier = (i: number, field: 'value' | 'points', v: number) => {
    const next: ScoringThresholds = {
      ...thresholds,
      clicks: {
        ...thresholds.clicks,
        tiers: thresholds.clicks.tiers.map((t, idx) => (idx === i ? { ...t, [field]: v } : t)),
      },
    };
    setThresholds(next);
  };

  const updateBacosTier = (i: number, field: 'minPct' | 'points', v: number) => {
    const next: ScoringThresholds = {
      ...thresholds,
      bacos: {
        tiers: thresholds.bacos.tiers.map((t, idx) => (idx === i ? { ...t, [field]: v } : t)),
      },
    };
    setThresholds(next);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-primary/10">
            <Sliders className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground">Umbrales del score</h4>
            <p className="text-xs text-muted-foreground">
              Ajusta los rangos de Clics y BACOS para adaptar la puntuación a tu estrategia.
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={reset} className="gap-2">
          <RotateCcw className="h-3.5 w-3.5" />
          Restaurar
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h5 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Clics máx./Venta
            </h5>
            <span className="text-[10px] text-muted-foreground">máx. 50 pts</span>
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-xs w-28 text-muted-foreground">Mínimo viable</Label>
            <Input
              type="number"
              className="h-8 tabular-nums"
              value={thresholds.clicks.min}
              onChange={e => setThresholds({ ...thresholds, clicks: { ...thresholds.clicks, min: Number(e.target.value) } })}
            />
          </div>
          {thresholds.clicks.tiers.map((t, i) => (
            <div key={i} className="flex items-center gap-2">
              <Label className="text-xs w-28 text-muted-foreground">≥ {t.value} clics</Label>
              <Input type="number" className="h-8 tabular-nums" value={t.value} onChange={e => updateClickTier(i, 'value', Number(e.target.value))} />
              <Input type="number" className="h-8 tabular-nums w-20" value={t.points} onChange={e => updateClickTier(i, 'points', Number(e.target.value))} />
              <span className="text-xs text-muted-foreground">pts</span>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-border bg-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h5 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              BACOS
            </h5>
            <span className="text-[10px] text-muted-foreground">máx. 40 pts</span>
          </div>
          {thresholds.bacos.tiers.map((t, i) => (
            <div key={i} className="flex items-center gap-2">
              <Label className="text-xs w-28 text-muted-foreground">≥ {t.minPct}%</Label>
              <Input type="number" step="0.5" className="h-8 tabular-nums" value={t.minPct} onChange={e => updateBacosTier(i, 'minPct', Number(e.target.value))} />
              <Input type="number" className="h-8 tabular-nums w-20" value={t.points} onChange={e => updateBacosTier(i, 'points', Number(e.target.value))} />
              <span className="text-xs text-muted-foreground">pts</span>
            </div>
          ))}
        </div>
      </div>

      <p className="text-[11px] text-muted-foreground italic">
        Los valores por defecto ({DEFAULT_SCORING_THRESHOLDS.clicks.tiers.map(t => `${t.value}→${t.points}`).join(', ')}) se aplican al pulsar “Restaurar”.
      </p>
    </div>
  );
};
