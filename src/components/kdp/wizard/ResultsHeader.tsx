import { useEffect, useRef, useState } from 'react';
import {
  GlobalData,
  EbookData,
  PaperbackData,
  ScoreBreakdown,
  EbookResults,
  PaperbackResults,
} from '@/types/kdp';
import { Store, BookOpen, MousePointer, TrendingUp, Tag, Target, Layers, Lightbulb } from 'lucide-react';
import { LevelChip, getLevel } from '@/components/kdp/ScoreDisplay';

interface ResultsHeaderProps {
  globalData: GlobalData;
  ebookData: EbookData;
  paperbackData: PaperbackData;
  score: ScoreBreakdown;
  activeResults: EbookResults | PaperbackResults | null;
  currencySymbol: string;
  /** Render without outer border/rounded/shadow (for embedding inside a unified container). */
  bare?: boolean;
}

const MARKETPLACE_LABEL: Record<string, string> = {
  ES: 'Amazon.es',
  COM: 'Amazon.com',
  DE: 'Amazon.de',
  FR: 'Amazon.fr',
  IT: 'Amazon.it',
  UK: 'Amazon.co.uk',
  CA: 'Amazon.ca',
  AU: 'Amazon.com.au',
  JP: 'Amazon.co.jp',
};

const INTERIOR_LABEL: Record<string, string> = {
  BN: 'B/N',
  COLOR_STANDARD: 'Color estándar',
  COLOR_PREMIUM: 'Color premium',
};

// Simple count-up hook
const useCountUp = (target: number, duration = 900) => {
  const [value, setValue] = useState(0);
  const prev = useRef(0);
  const frame = useRef<number>();

  useEffect(() => {
    const from = prev.current;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const next = Math.round(from + (target - from) * eased);
      setValue(next);
      if (t < 1) frame.current = requestAnimationFrame(tick);
      else prev.current = target;
    };
    frame.current = requestAnimationFrame(tick);
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, [target, duration]);

  return value;
};

interface ChipProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

const Chip = ({ icon, label, value }: ChipProps) => (
  <div className="flex items-center gap-2.5 rounded-lg border border-border/60 bg-background/60 backdrop-blur-sm px-3 py-2 min-w-0">
    <div className="text-muted-foreground shrink-0">{icon}</div>
    <div className="min-w-0 leading-tight">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground truncate">
        {label}
      </div>
      <div className="text-sm font-semibold text-foreground truncate tabular-nums">{value}</div>
    </div>
  </div>
);

export const ResultsHeader = ({
  globalData,
  ebookData,
  paperbackData,
  score,
  activeResults,
  currencySymbol,
  bare = false,
}: ResultsHeaderProps) => {
  const isEbook = globalData.selectedFormat === 'EBOOK';
  const animatedScore = useCountUp(score.totalScore);

  const trackColor =
    score.status === 'excellent'
      ? 'from-success/80 via-success to-success'
      : score.status === 'viable'
        ? 'from-warning/80 via-warning to-warning'
        : 'from-destructive/80 via-destructive to-destructive';

  const dotColor =
    score.status === 'excellent'
      ? 'bg-success'
      : score.status === 'viable'
        ? 'bg-warning'
        : 'bg-destructive';

  const interpretation =
    score.status === 'excellent'
      ? 'Configuración sólida para escalar campañas de Amazon Ads con margen amplio.'
      : score.status === 'viable'
        ? 'Configuración viable, pero requiere ajustes de precio, coste por clic o palabras clave.'
        : 'No recomendable en las condiciones actuales. Reformula antes de invertir en Ads.';

  // Chips (contexto + inputs clave + PVP)
  const chips: ChipProps[] = [
    {
      icon: <Store className="h-4 w-4" />,
      label: 'Marketplace',
      value: globalData.marketplace ? MARKETPLACE_LABEL[globalData.marketplace] : '—',
    },
    {
      icon: <BookOpen className="h-4 w-4" />,
      label: 'Formato',
      value: isEbook
        ? 'eBook'
        : paperbackData.bookFormat === 'HARDCOVER'
          ? 'Tapa dura'
          : 'Tapa blanda',
    },
    {
      icon: <MousePointer className="h-4 w-4" />,
      label: 'Coste por clic',
      value: globalData.cpc != null ? `${currencySymbol}${globalData.cpc.toFixed(2)}` : '—',
    },
    {
      icon: <TrendingUp className="h-4 w-4" />,
      label: 'Ventas/día',
      value:
        globalData.ventasDiariasCompetencia != null
          ? `${globalData.ventasDiariasCompetencia}`
          : '—',
    },
    {
      icon: <Target className="h-4 w-4" />,
      label: 'Margen objetivo',
      value: globalData.margenObjetivoPct != null ? `${globalData.margenObjetivoPct}%` : '—',
    },
    {
      icon: <Tag className="h-4 w-4" />,
      label: 'Precio actual',
      value: isEbook
        ? ebookData.pvp != null
          ? `${currencySymbol}${ebookData.pvp.toFixed(2)}`
          : '—'
        : paperbackData.pvp != null
          ? `${currencySymbol}${paperbackData.pvp.toFixed(2)}`
          : '—',
    },
  ];

  if (!isEbook && paperbackData.pages != null) {
    chips.push({
      icon: <Layers className="h-4 w-4" />,
      label: 'Páginas / Interior',
      value: `${paperbackData.pages} · ${
        paperbackData.interior ? INTERIOR_LABEL[paperbackData.interior] : '—'
      }`,
    });
  }

  const progressPct = Math.max(0, Math.min(100, score.totalScore));

  return (
    <section className={`relative overflow-hidden bg-gradient-to-br from-card via-card to-muted/40 ${bare ? '' : 'rounded-2xl border border-border shadow-sm'}`}>
      {/* Decorative accent */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -left-16 h-64 w-64 rounded-full bg-secondary/10 blur-3xl"
      />

      <div className="relative p-6 md:p-7 space-y-6">
        {/* Score row */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-6">
          {/* Number + status */}
          <div className="flex items-end gap-4 shrink-0">
            <div className="flex items-baseline gap-1">
              <span className="font-heading text-6xl md:text-7xl font-extrabold leading-none tabular-nums bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
                {animatedScore}
              </span>
              <span className="text-2xl font-medium text-muted-foreground">/100</span>
            </div>
            <div className="pb-2 flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${dotColor} animate-pulse`} />
              <span className="text-sm font-semibold text-foreground whitespace-nowrap">
                {score.statusLabel}
              </span>
            </div>
          </div>

          {/* Progress + interpretation */}
          <div className="flex-1 min-w-0 space-y-2.5">
            <div className="relative h-2.5 w-full rounded-full bg-muted overflow-hidden">
              <div
                className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${trackColor} transition-[width] duration-1000 ease-out shadow-[0_0_12px_rgba(0,0,0,0.15)]`}
                style={{ width: `${progressPct}%` }}
              />
              {/* Shimmer */}
              <div
                className="absolute inset-y-0 left-0 rounded-full opacity-40 mix-blend-overlay bg-[linear-gradient(90deg,transparent,rgba(255,255,255,.9),transparent)] bg-[length:200%_100%] animate-[shimmer_2.4s_linear_infinite]"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <div className="flex items-start justify-between gap-4">
              <p className="text-sm text-muted-foreground leading-relaxed">{interpretation}</p>
              {activeResults && (
                <div className="hidden md:block text-right shrink-0">
                  <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    Clics reales / venta
                  </div>
                  <div className="text-sm font-semibold text-foreground tabular-nums">
                    {activeResults.clicsMaxPorVenta}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

        {/* Desglose por componente + próximo paso */}
        <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2.5">
              Desglose del score
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-border/60 bg-background/60 px-2.5 py-1.5">
                <MousePointer className="h-3 w-3 text-muted-foreground" />
                <span className="font-semibold text-foreground tabular-nums">{score.clicsScore}/50</span>
                <span className="text-muted-foreground">Clics</span>
                <LevelChip level={getLevel(score.clicsScore, 50)} />
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-border/60 bg-background/60 px-2.5 py-1.5">
                <TrendingUp className="h-3 w-3 text-muted-foreground" />
                <span className="font-semibold text-foreground tabular-nums">{score.bacosScore}/40</span>
                <span className="text-muted-foreground">BACOS</span>
                <LevelChip level={getLevel(score.bacosScore, 40)} />
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-border/60 bg-background/60 px-2.5 py-1.5">
                <Tag className="h-3 w-3 text-muted-foreground" />
                <span className="font-semibold text-foreground tabular-nums">{score.pvpVsMinScore}/10</span>
                <span className="text-muted-foreground">Optimización</span>
                <LevelChip level={getLevel(score.pvpVsMinScore, 10)} />
              </span>
            </div>
          </div>

          {(() => {
            const clicsDeficit = 50 - score.clicsScore;
            const bacosDeficit = 40 - score.bacosScore;
            const pvpUnviable = score.pvpVsMinScore === 0;
            let title = '¡Configuración óptima!';
            let action = 'Todos los criterios están en zona alta. Puedes escalar Ads con confianza y probar Sponsored Brands o cupones de lanzamiento.';
            if (pvpUnviable) {
              title = 'Sube el precio al mínimo viable';
              action = `Estás por debajo del precio mínimo. Ajusta el PVP para desbloquear puntuación en optimización y proteger el margen.`;
            } else if (clicsDeficit >= bacosDeficit && clicsDeficit > 0) {
              title = 'Prioridad: subir clics máx./venta';
              action = `Faltan ${clicsDeficit} pts en Clics. Sube 1-2${currencySymbol} el PVP u optimiza CPC/público para bajar el coste por clic medio.`;
            } else if (bacosDeficit > 0) {
              title = 'Prioridad: mejorar BACOS';
              action = `Faltan ${bacosDeficit} pts en BACOS. Reduce costes (páginas, interior) o sube PVP para ampliar el % disponible para publicidad.`;
            }
            return (
              <div className="relative overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-br from-primary/[0.06] via-card to-card p-4">
                <div className="flex items-start gap-3">
                  <div className="p-1.5 rounded-md bg-primary/10 shrink-0">
                    <Lightbulb className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-primary mb-1">
                      Próximo paso recomendado
                    </div>
                    <div className="text-sm font-semibold text-foreground mb-1">{title}</div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{action}</p>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Summary chips */}
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2.5">
            Resumen del análisis
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-2.5">
            {chips.map((c) => (
              <Chip key={c.label} {...c} />
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </section>
  );
};
