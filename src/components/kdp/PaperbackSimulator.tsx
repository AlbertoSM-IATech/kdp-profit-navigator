import { useState, useEffect } from 'react';
import { PaperbackData, GlobalData, InteriorType, BookSize } from '@/types/kdp';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { SlidersHorizontal, Euro, FileText, Percent, HelpCircle, Palette, Ruler } from 'lucide-react';
import { calculatePrintingCost, getMinPages } from '@/data/printingCosts';

interface PaperbackSimulatorProps {
  data: PaperbackData;
  globalData: GlobalData;
}

// Internal simulator state - completely isolated from base config
interface SimulatorState {
  interior: InteriorType;
  size: BookSize;
  pvp: number;
  pages: number;
  cpc: number;
  margenObjetivo: number;
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

// Simplified color scheme - more subtle
const getClicksColor = (clicks: number) => {
  if (clicks >= 13) return 'text-foreground';
  if (clicks >= 10) return 'text-muted-foreground';
  return 'text-destructive';
};

const getClicksBg = (clicks: number) => {
  if (clicks >= 13) return 'bg-muted/40';
  if (clicks >= 10) return 'bg-muted/30';
  return 'bg-destructive/10';
};

export const PaperbackSimulator = ({ data, globalData }: PaperbackSimulatorProps) => {
  const currencySymbol = globalData.marketplace === 'COM' ? '$' : '€';

  // Internal state - COMPLETELY ISOLATED from base config
  const [simState, setSimState] = useState<SimulatorState>({
    interior: data.interior || 'BN',
    size: data.size || 'SMALL',
    pvp: data.pvp || 9.99,
    pages: data.pages || 100,
    cpc: globalData.cpc || 0.35,
    margenObjetivo: globalData.margenObjetivoPct || 30,
  });

  // Sync initial values from base config when they change
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
    return (
      <Card className="border-border/50">
        <CardHeader className="pb-4">
          <CardTitle className="section-header">
            <SlidersHorizontal className="h-5 w-5 text-secondary" />
            Simulador
          </CardTitle>
          <p className="text-sm text-muted-foreground">Juega con ajustes; no altera tus datos.</p>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Selecciona tipo de interior y tamaño para activar el simulador
          </p>
        </CardContent>
      </Card>
    );
  }

  const minPages = getMinPages(simState.interior);

  // Calculate results using ONLY simulator state
  const printingResult = calculatePrintingCost(simState.interior, simState.size, simState.pages);
  const gastosImpresion = printingResult.totalCost;
  const royaltyRate = simState.pvp < 9.99 ? 0.50 : 0.60;
  const ivaPct = globalData.marketplace === 'ES' ? 4 : 0;
  const precioSinIva = simState.pvp / (1 + ivaPct / 100);
  const regalias = (precioSinIva * royaltyRate) - gastosImpresion;
  
  // BACOS = Regalía neta / PVP
  const margenBacos = simState.pvp > 0 ? (regalias / simState.pvp) * 100 : 0;
  const cpcMaxRentable = regalias > 0 ? regalias / 10 : 0;
  
  // Clics máx. = FLOOR(Regalía neta / CPC)
  const clicsMaxPorVenta = simState.cpc > 0 && regalias > 0 ? Math.floor(regalias / simState.cpc) : 0;

  // Precio mínimo recomendado (SIMULADO)
  const margenObj = simState.margenObjetivo / 100;
  const denominator = royaltyRate - margenObj;
  let precioMinSimulado: number | null = null;
  
  if (denominator > 0) {
    const basePrice = gastosImpresion / denominator;
    const priceWithIva = basePrice * (1 + ivaPct / 100);
    precioMinSimulado = Math.ceil(priceWithIva * 100) / 100;
  }

  // Risk level with thresholds: ≥13 green, 10-12 yellow, <10 red
  const getRiskLevel = () => {
    if (regalias <= 0) return { level: 'high', text: 'Alto', color: 'destructive' };
    if (clicsMaxPorVenta < 10 || margenBacos < 30) return { level: 'high', text: 'Alto', color: 'destructive' };
    if (clicsMaxPorVenta < 13 || margenBacos <= 40) return { level: 'medium', text: 'Medio', color: 'warning' };
    return { level: 'low', text: 'Bajo', color: 'success' };
  };

  const risk = getRiskLevel();

  // Diagnostic message
  const getDiagnosticMessage = () => {
    if (regalias < 0) return { text: '🔴 Con este PVP pierdes dinero incluso antes de invertir en Ads.', color: 'text-destructive' };
    if (margenBacos < 30) return { text: '🔴 En riesgo — Este precio te deja poco margen para Ads. Ajusta precio o costes.', color: 'text-destructive' };
    if (clicsMaxPorVenta < 10) return { text: '🔴 En riesgo — Margen muy ajustado para campañas de Ads. Sube PVP o reduce CPC.', color: 'text-destructive' };
    if (clicsMaxPorVenta < 13) return { text: '🟡 Aceptable — Funciona, pero hay riesgo si el CPC sube. Optimiza si es posible.', color: 'text-warning' };
    return { text: '🟢 Excelente — Campaña sana, buen margen de maniobra para escalar.', color: 'text-success' };
  };

  const diagnostic = getDiagnosticMessage();

  const getMarginColor = () => {
    if (margenBacos < 30) return 'text-destructive';
    return 'text-foreground';
  };

  return (
    <Card className="animate-fade-in border-secondary/30">
      <CardHeader className="pb-4">
        <CardTitle className="section-header">
          <SlidersHorizontal className="h-5 w-5 text-secondary" />
          Simulador de optimización
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Usa este simulador para probar ajustes de precio, CPC o margen sin modificar tus datos reales.
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Controls */}
          <div className="space-y-6">
            {/* Selectors for Color and Size */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <Palette className="h-4 w-4 text-muted-foreground" />
                  Tipo impresión
                </Label>
                <Select 
                  value={simState.interior} 
                  onValueChange={(v) => setSimState(prev => ({ 
                    ...prev, 
                    interior: v as InteriorType,
                    pages: Math.max(prev.pages, getMinPages(v as InteriorType))
                  }))}
                >
                  <SelectTrigger className="input-focus">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border border-border">
                    <SelectItem value="BN">{interiorLabels.BN}</SelectItem>
                    <SelectItem value="COLOR_STANDARD">{interiorLabels.COLOR_STANDARD}</SelectItem>
                    <SelectItem value="COLOR_PREMIUM">{interiorLabels.COLOR_PREMIUM}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <Ruler className="h-4 w-4 text-muted-foreground" />
                  Tamaño
                </Label>
                <Select 
                  value={simState.size} 
                  onValueChange={(v) => setSimState(prev => ({ ...prev, size: v as BookSize }))}
                >
                  <SelectTrigger className="input-focus">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border border-border">
                    <SelectItem value="SMALL">{sizeLabels.SMALL}</SelectItem>
                    <SelectItem value="LARGE">{sizeLabels.LARGE}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* PVP Slider */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <Euro className="h-4 w-4 text-muted-foreground" />
                  PVP
                </Label>
                <span className="font-mono font-semibold text-lg">{simState.pvp.toFixed(2)}{currencySymbol}</span>
              </div>
              <Slider
                value={[simState.pvp]}
                min={4.99}
                max={29.99}
                step={0.50}
                onValueChange={([v]) => setSimState(prev => ({ ...prev, pvp: v }))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>4.99{currencySymbol}</span>
                <span className="text-primary font-medium">Regalía: {(royaltyRate * 100).toFixed(0)}%</span>
                <span>29.99{currencySymbol}</span>
              </div>
            </div>

            {/* Pages Slider */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  Nº Páginas
                </Label>
                <span className="font-mono font-semibold text-lg">{simState.pages}</span>
              </div>
              <Slider
                value={[simState.pages]}
                min={minPages}
                max={400}
                step={1}
                onValueChange={([v]) => setSimState(prev => ({ ...prev, pages: v }))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{minPages}</span>
                <span className="text-primary font-medium">Impresión: {gastosImpresion.toFixed(2)}{currencySymbol}</span>
                <span>400</span>
              </div>
            </div>

            {/* CPC Slider */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <Euro className="h-4 w-4 text-muted-foreground" />
                  CPC
                </Label>
                <span className="font-mono font-semibold text-lg">{simState.cpc.toFixed(2)}{currencySymbol}</span>
              </div>
              <Slider
                value={[simState.cpc]}
                min={0.05}
                max={1.50}
                step={0.01}
                onValueChange={([v]) => setSimState(prev => ({ ...prev, cpc: v }))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0.05{currencySymbol}</span>
                <span className="text-primary font-medium">CPC máx. rentable: {cpcMaxRentable.toFixed(2)}{currencySymbol}</span>
                <span>1.50{currencySymbol}</span>
              </div>
            </div>

            {/* Margen Objetivo Slider */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <Percent className="h-4 w-4 text-muted-foreground" />
                  Margen Objetivo
                </Label>
                <span className="font-mono font-semibold text-lg">{simState.margenObjetivo}%</span>
              </div>
              <Slider
                value={[simState.margenObjetivo]}
                min={10}
                max={60}
                step={5}
                onValueChange={([v]) => setSimState(prev => ({ ...prev, margenObjetivo: v }))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>10%</span>
                <span>60%</span>
              </div>
            </div>
          </div>

          {/* Live Results - Below controls */}
          <div className="space-y-4 pt-4 border-t border-border/50">
            <div className="bg-muted/30 rounded-xl p-5 space-y-4">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Resultados simulados</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-background rounded-lg">
                  <span className="text-xs text-muted-foreground block mb-1">Regalías (sim.)</span>
                  <span className={`text-xl font-bold ${regalias > 0 ? 'text-foreground' : 'text-destructive'}`}>
                    {regalias.toFixed(2)}{currencySymbol}
                  </span>
                </div>
                <div className="text-center p-3 bg-background rounded-lg">
                  <span className="text-xs text-muted-foreground block mb-1 flex items-center justify-center gap-1">
                    BACOS (sim.)
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="h-3 w-3" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs p-3">
                          <p className="text-sm">
                            BACOS = (Regalía neta) / (PVP)
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </span>
                  <span className={`text-xl font-bold ${getMarginColor()}`}>
                    {margenBacos.toFixed(1)}%
                  </span>
                </div>
                <div className={`text-center p-3 rounded-lg ${getClicksBg(clicsMaxPorVenta)}`}>
                  <span className="text-xs text-muted-foreground block mb-1 flex items-center justify-center gap-1">
                    Clics máx. (sim.)
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="h-3 w-3" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs p-3">
                          <p className="text-sm">
                            🟢 ≥13: Excelente<br />
                            🟠 10-12: Aceptable<br />
                            🔴 &lt;10: En riesgo
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </span>
                  <span className={`text-xl font-bold ${getClicksColor(clicsMaxPorVenta)}`}>
                    {clicsMaxPorVenta > 0 ? clicsMaxPorVenta : '∞'}
                  </span>
                </div>
                <div className="text-center p-3 bg-background rounded-lg">
                  <span className="text-xs text-muted-foreground block mb-1">PVP Mín. (sim.)</span>
                  <span className="text-xl font-bold text-foreground">
                    {precioMinSimulado ? `${precioMinSimulado.toFixed(2)}${currencySymbol}` : '-'}
                  </span>
                </div>
              </div>

              {/* CPC Max Rentable */}
              <div className="text-center p-3 bg-background rounded-lg">
                <span className="text-xs text-muted-foreground block mb-1">CPC Máximo Rentable</span>
                <span className={`text-xl font-bold ${simState.cpc <= cpcMaxRentable ? 'text-foreground' : 'text-destructive'}`}>
                  {cpcMaxRentable.toFixed(2)}{currencySymbol}
                </span>
              </div>
            </div>

            {/* Risk Level - Simplified */}
            <div className={`p-4 rounded-lg border ${
              risk.color === 'success' ? 'bg-muted/40 border-border' :
              risk.color === 'warning' ? 'bg-muted/30 border-border' :
              'bg-destructive/5 border-destructive/20'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">Riesgo:</span>
                <span className={`text-base font-semibold ${risk.color === 'destructive' ? 'text-destructive' : 'text-foreground'}`}>{risk.text}</span>
              </div>
              <p className={`text-sm ${risk.color === 'destructive' ? 'text-destructive' : 'text-muted-foreground'}`}>
                {diagnostic.text.replace(/🟢|🟡|🔴/g, '').trim()}
              </p>
            </div>

            {/* Disclaimer */}
            <p className="text-xs text-muted-foreground text-center italic">
              Estos valores proceden del simulador y no modifican los datos base.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
