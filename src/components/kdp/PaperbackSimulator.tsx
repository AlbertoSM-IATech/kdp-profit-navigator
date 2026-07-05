import { useState, useEffect, useRef } from 'react';
import { PaperbackData, GlobalData, InteriorType, BookSize, SimulatorData } from '@/types/kdp';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { SlidersHorizontal, Euro, FileText, Percent, HelpCircle, Palette, Ruler, ArrowUpFromLine } from 'lucide-react';
import { calculatePrintingCost, getMinPages } from '@/data/printingCosts';

interface PaperbackSimulatorProps {
  data: PaperbackData;
  globalData: GlobalData;
  initialSimState?: SimulatorData;
  onStateChange?: (state: SimulatorData) => void;
  onApplyToBase?: (simData: SimulatorData) => void;
  showStickyBar?: boolean;
  embedded?: boolean;
}

const interiorLabels: Record<InteriorType, string> = {
  BN: 'Blanco y Negro',
  COLOR_PREMIUM: 'Color Premium',
  COLOR_STANDARD: 'Color Estándar',
};
const sizeLabels: Record<BookSize, string> = {
  SMALL: '≤ 6" x 9"',
  LARGE: '> 6" x 9"',
};

// Tooltip helper
const Help = ({ text }: { text: string }) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs">
        <p className="text-xs">{text}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

// Editable numeric field: defined OUTSIDE the parent to preserve focus across renders.
const NumField = ({
  value,
  min,
  max,
  decimals = 2,
  suffix,
  onCommit,
  ariaLabel,
  width = 'w-24',
}: {
  value: number;
  min: number;
  max: number;
  step?: number;
  decimals?: number;
  suffix?: string;
  onCommit: (v: number) => void;
  ariaLabel: string;
  width?: string;
}) => {
  const [text, setText] = useState<string>(value.toFixed(decimals));
  const focusedRef = useRef(false);
  const lastPropRef = useRef(value);
  useEffect(() => {
    if (value !== lastPropRef.current) {
      lastPropRef.current = value;
      if (!focusedRef.current) setText(value.toFixed(decimals));
    }
  }, [value, decimals]);

  const commit = () => {
    focusedRef.current = false;
    const normalized = text.replace(',', '.').trim();
    const parsed = parseFloat(normalized);
    if (isNaN(parsed)) {
      setText(value.toFixed(decimals));
      return;
    }
    const clamped = Math.min(max, Math.max(min, parsed));
    const rounded = Math.round(clamped * Math.pow(10, decimals)) / Math.pow(10, decimals);
    setText(rounded.toFixed(decimals));
    if (rounded !== value) onCommit(rounded);
  };

  return (
    <div className="flex items-center gap-1">
      <Input
        type="text"
        inputMode="decimal"
        aria-label={ariaLabel}
        value={text}
        onFocus={() => { focusedRef.current = true; }}
        onChange={e => setText(e.target.value)}
        onBlur={commit}
        onKeyDown={e => {
          if (e.key === 'Enter') { (e.target as HTMLInputElement).blur(); }
          if (e.key === 'Escape') { setText(value.toFixed(decimals)); (e.target as HTMLInputElement).blur(); }
        }}
        className={`h-8 ${width} text-right font-mono font-semibold tabular-nums px-2 py-1 text-sm`}
      />
      {suffix && <span className="text-xs text-muted-foreground w-3">{suffix}</span>}
    </div>
  );
};

export const PaperbackSimulator = ({
  data,
  globalData,
  initialSimState,
  onStateChange,
  onApplyToBase,
  showStickyBar = false,
  embedded = false,
}: PaperbackSimulatorProps) => {
  const currencySymbol = globalData.marketplace === 'COM' ? '$' : '€';
  const getBaseSimState = (): SimulatorData => ({
    interior: data.interior || 'BN',
    size: data.size || 'SMALL',
    pvp: data.pvp || 9.99,
    pages: data.pages || 100,
    cpc: globalData.cpc || 0.35,
    margenObjetivo: globalData.margenObjetivoPct || 30,
  });
  const [simState, setSimState] = useState<SimulatorData>(() => {
    if (initialSimState) return initialSimState;
    return getBaseSimState();
  });

  useEffect(() => {
    onStateChange?.(simState);
  }, [simState, onStateChange]);

  // Sync internal state when an external simulator state is provided or cleared.
  const lastInitialRef = useRef(initialSimState);
  useEffect(() => {
    if (initialSimState && initialSimState !== lastInitialRef.current) {
      lastInitialRef.current = initialSimState;
      setSimState(initialSimState);
    } else if (!initialSimState && lastInitialRef.current) {
      // Base data was updated (sim cleared) — resync from data/globalData
      lastInitialRef.current = undefined;
      setSimState(getBaseSimState());
    }
  }, [initialSimState, data.interior, data.size, data.pvp, data.pages, globalData.cpc, globalData.margenObjetivoPct]);

  useEffect(() => {
    if (data.interior && data.size) {
      setSimState(prev => ({
        ...prev,
        interior: data.interior!,
        size: data.size!,
        pvp: data.pvp || prev.pvp,
        pages: data.pages || prev.pages,
      }));
    }
  }, [data.interior, data.size, data.pvp, data.pages]);

  useEffect(() => {
    if (globalData.cpc !== null) {
      setSimState(prev => ({ ...prev, cpc: globalData.cpc! }));
    }
    if (globalData.margenObjetivoPct !== null) {
      setSimState(prev => ({ ...prev, margenObjetivo: globalData.margenObjetivoPct! }));
    }
  }, [globalData.cpc, globalData.margenObjetivoPct]);

  if (!data.interior || !data.size) {
    const empty = (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          Selecciona tipo de impresión y tamaño en el paso "Libro" para activar el simulador.
        </p>
      </div>
    );
    if (embedded) return empty;
    return (
      <Card className="border-border/50">
        <CardHeader className="pb-4">
          <CardTitle className="section-header">
            <SlidersHorizontal className="h-5 w-5 text-secondary" />
            Simulador de optimización
          </CardTitle>
        </CardHeader>
        <CardContent>{empty}</CardContent>
      </Card>
    );
  }

  const minPages = getMinPages(simState.interior);
  const printingResult = calculatePrintingCost(simState.interior, simState.size, simState.pages);
  const gastosImpresion = printingResult.totalCost;
  const royaltyRate = simState.pvp < 9.99 ? 0.5 : 0.6;
  const ivaPct = globalData.marketplace === 'ES' ? 4 : 0;
  const precioSinIva = simState.pvp / (1 + ivaPct / 100);
  const regalias = precioSinIva * royaltyRate - gastosImpresion;
  const margenBacos = simState.pvp > 0 ? (regalias / simState.pvp) * 100 : 0;
  const cpcMaxRentable = regalias > 0 ? regalias / 10 : 0;
  const clicsMaxPorVenta = simState.cpc > 0 && regalias > 0 ? Math.floor(regalias / simState.cpc) : 0;
  const margenObj = simState.margenObjetivo / 100;
  const denominator = royaltyRate - margenObj;
  let precioMinSimulado: number | null = null;
  if (denominator > 0) {
    const basePrice = gastosImpresion / denominator;
    precioMinSimulado = Math.ceil(basePrice * (1 + ivaPct / 100) * 100) / 100;
  }

  // Risk level by traffic light dot
  const riskDot =
    regalias <= 0 || clicsMaxPorVenta < 10 || margenBacos < 30
      ? 'bg-destructive'
      : clicsMaxPorVenta < 13 || margenBacos <= 40
      ? 'bg-warning'
      : 'bg-success';
  const riskLabel =
    riskDot === 'bg-destructive' ? 'Riesgo alto' : riskDot === 'bg-warning' ? 'Riesgo medio' : 'Riesgo bajo';
  const diagnosticText =
    regalias < 0
      ? 'Con este precio pierdes dinero incluso antes de invertir en publicidad.'
      : margenBacos < 30
      ? 'Este precio te deja poco margen para publicidad. Ajusta precio o costes.'
      : clicsMaxPorVenta < 10
      ? 'Margen muy ajustado para campañas. Sube el precio o reduce el coste por clic.'
      : clicsMaxPorVenta < 13
      ? 'Funciona, pero hay riesgo si sube el coste por clic. Optimiza si es posible.'
      : 'Campaña sana, buen margen de maniobra para escalar.';

  // Detect changes vs initial state for sticky bar
  const baseSimState = getBaseSimState();
  const hasChanges =
    baseSimState.interior !== simState.interior ||
    baseSimState.size !== simState.size ||
    baseSimState.pvp !== simState.pvp ||
    baseSimState.pages !== simState.pages ||
    baseSimState.cpc !== simState.cpc ||
    baseSimState.margenObjetivo !== simState.margenObjetivo;




  const Metric = ({
    label,
    tooltip,
    value,
    accent,
  }: {
    label: string;
    tooltip: string;
    value: string;
    accent?: 'success' | 'warning' | 'destructive';
  }) => (
    <div className="rounded-lg border border-border bg-card p-3">
      <div className="flex items-center gap-1.5 mb-1">
        <span className="text-xs text-muted-foreground">{label}</span>
        <Help text={tooltip} />
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-xl font-bold text-foreground tabular-nums">{value}</span>
        {accent && <span className={`w-2 h-2 rounded-full bg-${accent}`} />}
      </div>
    </div>
  );

  const content = (
    <div className="space-y-6">
      {/* CONTROLES — protagonistas, arriba a todo el ancho */}
      <div className="relative rounded-2xl border border-secondary/30 bg-gradient-to-br from-secondary/10 via-secondary/5 to-transparent p-6 space-y-6 shadow-[0_1px_0_hsl(var(--secondary)/0.15)_inset]">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <span className="h-8 w-1.5 rounded-full bg-secondary" aria-hidden />
            <div>
              <h4 className="font-heading text-lg sm:text-xl font-bold text-foreground tracking-tight leading-tight">
                Controles del simulador
              </h4>
              <p className="text-sm text-muted-foreground mt-0.5">
                Ajusta cualquier variable para ver el impacto en los resultados.
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-secondary/30 bg-secondary/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-secondary">
            <SlidersHorizontal className="h-3 w-3" />
            Interactivo
          </span>
        </div>


        {/* Selects: formato + tamaño */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5 text-sm font-medium">
              <Palette className="h-4 w-4 text-muted-foreground" />
              Tipo de impresión
            </Label>
            <Select
              value={simState.interior}
              onValueChange={v =>
                setSimState(prev => ({
                  ...prev,
                  interior: v as InteriorType,
                  pages: Math.max(prev.pages, getMinPages(v as InteriorType)),
                }))
              }
            >
              <SelectTrigger className="input-focus"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-popover border border-border">
                <SelectItem value="BN">{interiorLabels.BN}</SelectItem>
                <SelectItem value="COLOR_STANDARD">{interiorLabels.COLOR_STANDARD}</SelectItem>
                <SelectItem value="COLOR_PREMIUM">{interiorLabels.COLOR_PREMIUM}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5 text-sm font-medium">
              <Ruler className="h-4 w-4 text-muted-foreground" />
              Tamaño
            </Label>
            <Select
              value={simState.size}
              onValueChange={v => setSimState(prev => ({ ...prev, size: v as BookSize }))}
            >
              <SelectTrigger className="input-focus"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-popover border border-border">
                <SelectItem value="SMALL">{sizeLabels.SMALL}</SelectItem>
                <SelectItem value="LARGE">{sizeLabels.LARGE}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Sliders en 2 columnas en >=lg para mayor protagonismo */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-5 pt-1">
          {/* Precio de venta */}
          <div className="space-y-2">
            <div className="flex justify-between items-center gap-2">
              <Label className="flex items-center gap-1.5 text-sm font-medium">
                <Euro className="h-4 w-4 text-muted-foreground" />
                Precio de venta
                <Help text="Precio final con IVA al que se vende el libro en Amazon. Cambia la regalía y el margen." />
              </Label>
              <NumField
                value={simState.pvp}
                min={0.99}
                max={99.99}
                step={0.01}
                decimals={2}
                suffix={currencySymbol}
                ariaLabel="Precio de venta"
                onCommit={v => setSimState(prev => ({ ...prev, pvp: v }))}
              />
            </div>
            <Slider className="[&>span:first-child]:bg-muted" defaultValue={[simState.pvp]} key={`pvp-${simState.pvp}`} min={4.99} max={29.99} step={0.01}
              onValueCommit={([v]) => setSimState(prev => ({ ...prev, pvp: Math.round(v * 100) / 100 }))} />

            <div className="flex justify-between text-xs text-muted-foreground tabular-nums">
              <span>4.99{currencySymbol}</span>
              <span>Regalía: {(royaltyRate * 100).toFixed(0)}%</span>
              <span>29.99{currencySymbol}</span>
            </div>
          </div>

          {/* Páginas */}
          <div className="space-y-2">
            <div className="flex justify-between items-center gap-2">
              <Label className="flex items-center gap-1.5 text-sm font-medium">
                <FileText className="h-4 w-4 text-muted-foreground" />
                Número de páginas
                <Help text="Páginas interiores. Afecta directamente al coste de impresión por unidad." />
              </Label>
              <NumField
                value={simState.pages}
                min={minPages}
                max={828}
                step={1}
                decimals={0}
                ariaLabel="Número de páginas"
                width="w-20"
                onCommit={v => setSimState(prev => ({ ...prev, pages: Math.round(v) }))}
              />
            </div>
            <Slider className="[&>span:first-child]:bg-muted" defaultValue={[simState.pages]} key={`pages-${simState.pages}`} min={minPages} max={400} step={1}
              onValueCommit={([v]) => setSimState(prev => ({ ...prev, pages: v }))} />

            <div className="flex justify-between text-xs text-muted-foreground tabular-nums">
              <span>{minPages}</span>
              <span>Impresión: {gastosImpresion.toFixed(2)}{currencySymbol}</span>
              <span>400</span>
            </div>
          </div>

          {/* Coste por clic */}
          <div className="space-y-2">
            <div className="flex justify-between items-center gap-2">
              <Label className="flex items-center gap-1.5 text-sm font-medium">
                <Euro className="h-4 w-4 text-muted-foreground" />
                Coste por clic
                <Help text="Lo que pagas en Amazon Ads por cada clic. Determina cuántos clics puedes permitirte por venta." />
              </Label>
              <NumField
                value={simState.cpc}
                min={0.01}
                max={5}
                step={0.01}
                decimals={2}
                suffix={currencySymbol}
                ariaLabel="Coste por clic"
                onCommit={v => setSimState(prev => ({ ...prev, cpc: v }))}
              />
            </div>
            <Slider className="[&>span:first-child]:bg-muted" defaultValue={[simState.cpc]} key={`cpc-${simState.cpc}`} min={0.05} max={1.5} step={0.01}
              onValueCommit={([v]) => setSimState(prev => ({ ...prev, cpc: Math.round(v * 100) / 100 }))} />

            <div className="flex justify-between text-xs text-muted-foreground tabular-nums">
              <span>0.05{currencySymbol}</span>
              <span>Máximo rentable: {cpcMaxRentable.toFixed(2)}{currencySymbol}</span>
              <span>1.50{currencySymbol}</span>
            </div>
          </div>

          {/* Margen objetivo */}
          <div className="space-y-2">
            <div className="flex justify-between items-center gap-2">
              <Label className="flex items-center gap-1.5 text-sm font-medium">
                <Percent className="h-4 w-4 text-muted-foreground" />
                Margen objetivo
                <Help text="Margen neto mínimo que quieres asegurar por venta. Recomendado: 30% o superior." />
              </Label>
              <NumField
                value={simState.margenObjetivo}
                min={0}
                max={90}
                step={0.01}
                decimals={2}
                suffix="%"
                ariaLabel="Margen objetivo"
                onCommit={v => setSimState(prev => ({ ...prev, margenObjetivo: v }))}
              />
            </div>
            <Slider className="[&>span:first-child]:bg-muted" defaultValue={[simState.margenObjetivo]} key={`mo-${simState.margenObjetivo}`} min={10} max={60} step={0.5}
              onValueCommit={([v]) => setSimState(prev => ({ ...prev, margenObjetivo: Math.round(v * 100) / 100 }))} />

            <div className="flex justify-between text-xs text-muted-foreground tabular-nums">
              <span>10%</span>
              <span>60%</span>
            </div>
          </div>
        </div>
      </div>



      {/* RESULTADOS SIMULADOS — debajo de los controles */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <span className="h-8 w-1.5 rounded-full bg-secondary/60" aria-hidden />
            <div>
              <h4 className="font-heading text-lg sm:text-xl font-bold text-foreground tracking-tight leading-tight">
                Resultados simulados
              </h4>
              <p className="text-sm text-muted-foreground mt-0.5">
                Impacto en tiempo real de los cambios que estás probando.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5">
            <span className={`w-2 h-2 rounded-full ${riskDot}`} />
            <span className="text-xs font-semibold text-foreground">{riskLabel}</span>
          </div>
        </div>


        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <Metric
            label="Regalías"
            tooltip="Beneficio neto que recibes por cada venta tras descontar coste de impresión y comisión de Amazon."
            value={`${regalias.toFixed(2)}${currencySymbol}`}
            accent={regalias > 0 ? undefined : 'destructive'}
          />
          <Metric
            label="Margen publicitario (BACOS)"
            tooltip="Porcentaje del precio que puedes destinar a publicidad manteniendo rentabilidad."
            value={`${margenBacos.toFixed(1)}%`}
            accent={margenBacos < 30 ? 'destructive' : margenBacos <= 40 ? 'warning' : 'success'}
          />
          <Metric
            label="Clics máximos por venta"
            tooltip="Cuántos clics de Amazon Ads puedes permitirte pagar por cada venta sin perder dinero."
            value={clicsMaxPorVenta > 0 ? String(clicsMaxPorVenta) : '∞'}
            accent={clicsMaxPorVenta < 10 ? 'destructive' : clicsMaxPorVenta < 13 ? 'warning' : 'success'}
          />
          <Metric
            label="Precio mínimo viable"
            tooltip="Precio mínimo necesario para cubrir costes y alcanzar tu margen objetivo."
            value={precioMinSimulado ? `${precioMinSimulado.toFixed(2)}${currencySymbol}` : '—'}
          />
          <Metric
            label="CPC máximo rentable"
            tooltip="Puja máxima que puedes pagar en Amazon Ads sin romper la rentabilidad."
            value={`${cpcMaxRentable.toFixed(2)}${currencySymbol}`}
            accent={simState.cpc <= cpcMaxRentable ? undefined : 'destructive'}
          />
          <Metric
            label="Coste de impresión"
            tooltip="Coste por unidad que Amazon descuenta antes de calcular tus regalías."
            value={`${gastosImpresion.toFixed(2)}${currencySymbol}`}
          />
        </div>

        {/* Diagnóstico */}
        <div className="rounded-lg border border-border bg-muted/30 p-4">
          <p className="text-sm text-muted-foreground leading-relaxed">{diagnosticText}</p>
        </div>
      </div>

      {/* Sticky action bar — solo "Aplicar al análisis" (guardar versión vive arriba) */}
      {showStickyBar && hasChanges && onApplyToBase && (
        <div className="sticky bottom-0 -mx-6 -mb-6 px-6 py-3 bg-card/95 backdrop-blur border-t border-border flex flex-wrap items-center justify-between gap-3 z-10">
          <p className="text-xs text-muted-foreground">
            Tienes cambios sin aplicar en el simulador.
          </p>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={() => onApplyToBase(simState)} className="gap-2">
                  <ArrowUpFromLine className="h-4 w-4" />
                  Aplicar al análisis
                </Button>
              </TooltipTrigger>
              <TooltipContent><p className="text-xs">Sustituye los datos base del análisis (precio, páginas, CPC, margen) con los valores del simulador.</p></TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}
    </div>
  );

  if (embedded) return content;

  return (
    <Card className="animate-fade-in border-secondary/30">
      <CardHeader className="pb-4">
        <CardTitle className="section-header">
          <SlidersHorizontal className="h-5 w-5 text-secondary" />
          Simulador de optimización
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Optimiza tu libro probando variaciones de precio, páginas, coste por clic y margen objetivo.
        </p>
      </CardHeader>
      <CardContent>{content}</CardContent>
    </Card>
  );
};
