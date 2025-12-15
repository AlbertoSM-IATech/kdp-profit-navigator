import { PaperbackData, GlobalData } from '@/types/kdp';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { SlidersHorizontal, Euro, FileText, Target, MousePointer, DollarSign, Percent } from 'lucide-react';
import { calculatePrintingCost } from '@/data/printingCosts';

interface PaperbackSimulatorProps {
  data: PaperbackData;
  globalData: GlobalData;
  onChange: (data: PaperbackData) => void;
  onGlobalChange: (data: GlobalData) => void;
}

export const PaperbackSimulator = ({ data, globalData, onChange, onGlobalChange }: PaperbackSimulatorProps) => {
  const currencySymbol = globalData.marketplace === 'COM' ? '$' : '€';

  if (!data.interior || !data.size) {
    return (
      <Card className="border-border/50">
        <CardHeader className="pb-4">
          <CardTitle className="section-header">
            <SlidersHorizontal className="h-5 w-5 text-secondary" />
            Simulador Interactivo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Selecciona tipo de interior y tamaño para activar el simulador
          </p>
        </CardContent>
      </Card>
    );
  }

  const pages = data.pages || 100;
  const pvp = data.pvp || 9.99;
  const cpc = globalData.cpc || 0.35;
  const margenObjetivo = globalData.margenObjetivoPct || 30;

  // Calculate results
  const printingResult = calculatePrintingCost(data.interior, data.size, pages);
  const gastosImpresion = printingResult.totalCost;
  const royaltyRate = pvp < 9.99 ? 0.50 : 0.60;
  const ivaPct = globalData.marketplace === 'ES' ? 4 : 0;
  const precioSinIva = pvp / (1 + ivaPct / 100);
  const regalias = (precioSinIva * royaltyRate) - gastosImpresion;
  const margenBacos = pvp > 0 ? (regalias / pvp) * 100 : 0;
  const cpcMaxRentable = regalias > 0 ? regalias / 10 : 0; // Para 10 clics por venta
  const tasaConvBreakeven = regalias > 0 && cpc > 0 ? cpc / regalias : 0;
  const clicsMaxPorVenta = tasaConvBreakeven > 0 ? Math.floor(1 / tasaConvBreakeven) : 0;

  // Precio mínimo objetivo
  const margenObj = margenObjetivo / 100;
  const denominator = royaltyRate - margenObj;
  const precioMinObjetivo = denominator > 0 ? Math.ceil(gastosImpresion / denominator) - 0.01 : null;

  // Risk level
  const getRiskLevel = () => {
    if (regalias <= 0) return { level: 'high', text: 'Alto', color: 'destructive' };
    if (clicsMaxPorVenta < 10 || margenBacos < 30) return { level: 'high', text: 'Alto', color: 'destructive' };
    if (clicsMaxPorVenta === 10 || margenBacos <= 40) return { level: 'medium', text: 'Medio', color: 'warning' };
    return { level: 'low', text: 'Bajo', color: 'success' };
  };

  const risk = getRiskLevel();

  // Diagnostic message
  const getDiagnosticMessage = () => {
    if (regalias < 0) return { text: 'Con este PVP pierdes dinero incluso antes de invertir en Ads.', color: 'text-destructive' };
    if (margenBacos < 30) return { text: 'Este precio te deja poco margen para Ads.', color: 'text-destructive' };
    if (clicsMaxPorVenta < 10) return { text: 'Margen muy ajustado para campañas de Ads.', color: 'text-destructive' };
    if (clicsMaxPorVenta === 10) return { text: 'En el límite del breakeven. Margen ajustado.', color: 'text-warning' };
    return { text: 'Configuración saludable para escalar.', color: 'text-success' };
  };

  const diagnostic = getDiagnosticMessage();

  const getMarginColor = () => {
    if (margenBacos < 30) return 'text-destructive';
    if (margenBacos <= 40) return 'text-warning';
    return 'text-success';
  };

  const getClicksColor = () => {
    if (clicsMaxPorVenta > 10) return 'text-destructive';
    if (clicsMaxPorVenta === 10) return 'text-warning';
    return 'text-success';
  };

  return (
    <Card className="animate-fade-in border-secondary/30">
      <CardHeader className="pb-4">
        <CardTitle className="section-header">
          <SlidersHorizontal className="h-5 w-5 text-secondary" />
          Simulador Interactivo
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Sliders */}
          <div className="space-y-6">
            {/* PVP Slider */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <Euro className="h-4 w-4 text-muted-foreground" />
                  PVP
                </Label>
                <span className="font-mono font-semibold text-lg">{pvp.toFixed(2)}{currencySymbol}</span>
              </div>
              <Slider
                value={[pvp]}
                min={4.99}
                max={29.99}
                step={0.50}
                onValueChange={([v]) => onChange({ ...data, pvp: v })}
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
                <span className="font-mono font-semibold text-lg">{pages}</span>
              </div>
              <Slider
                value={[pages]}
                min={data.interior === 'COLOR_STANDARD' ? 73 : 24}
                max={400}
                step={1}
                onValueChange={([v]) => onChange({ ...data, pages: v })}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{data.interior === 'COLOR_STANDARD' ? 73 : 24}</span>
                <span className="text-primary font-medium">Impresión: {gastosImpresion.toFixed(2)}{currencySymbol}</span>
                <span>400</span>
              </div>
            </div>

            {/* CPC Slider */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  CPC
                </Label>
                <span className="font-mono font-semibold text-lg">{cpc.toFixed(2)}{currencySymbol}</span>
              </div>
              <Slider
                value={[cpc]}
                min={0.05}
                max={1.50}
                step={0.01}
                onValueChange={([v]) => onGlobalChange({ ...globalData, cpc: v })}
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
                <span className="font-mono font-semibold text-lg">{margenObjetivo}%</span>
              </div>
              <Slider
                value={[margenObjetivo]}
                min={10}
                max={60}
                step={5}
                onValueChange={([v]) => onGlobalChange({ ...globalData, margenObjetivoPct: v })}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>10%</span>
                <span>60%</span>
              </div>
            </div>
          </div>

          {/* Live Results */}
          <div className="space-y-4">
            <div className="bg-muted/30 rounded-xl p-5 space-y-4">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Resultados en tiempo real</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-background rounded-lg">
                  <span className="text-xs text-muted-foreground block mb-1">Regalías</span>
                  <span className={`text-xl font-bold ${regalias > 0 ? 'text-primary' : 'text-destructive'}`}>
                    {regalias.toFixed(2)}{currencySymbol}
                  </span>
                </div>
                <div className="text-center p-3 bg-background rounded-lg">
                  <span className="text-xs text-muted-foreground block mb-1">Margen BACOS</span>
                  <span className={`text-xl font-bold ${getMarginColor()}`}>
                    {margenBacos.toFixed(1)}%
                  </span>
                </div>
                <div className="text-center p-3 bg-background rounded-lg">
                  <span className="text-xs text-muted-foreground block mb-1">Clics máx./Venta</span>
                  <span className={`text-xl font-bold ${getClicksColor()}`}>
                    {clicsMaxPorVenta > 0 ? clicsMaxPorVenta : '∞'}
                  </span>
                </div>
                <div className="text-center p-3 bg-background rounded-lg">
                  <span className="text-xs text-muted-foreground block mb-1">PVP Mín. Objetivo</span>
                  <span className="text-xl font-bold text-secondary">
                    {precioMinObjetivo ? `${precioMinObjetivo.toFixed(2)}${currencySymbol}` : '-'}
                  </span>
                </div>
              </div>

              {/* CPC Max Rentable */}
              <div className="text-center p-3 bg-background rounded-lg">
                <span className="text-xs text-muted-foreground block mb-1">CPC Máximo Rentable</span>
                <span className={`text-xl font-bold ${cpc <= cpcMaxRentable ? 'text-success' : 'text-destructive'}`}>
                  {cpcMaxRentable.toFixed(2)}{currencySymbol}
                </span>
              </div>
            </div>

            {/* Risk Level */}
            <div className={`p-4 rounded-lg border ${
              risk.color === 'success' ? 'bg-success/10 border-success/30' :
              risk.color === 'warning' ? 'bg-warning/10 border-warning/30' :
              'bg-destructive/10 border-destructive/30'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Riesgo:</span>
                <span className={`text-lg font-bold text-${risk.color}`}>{risk.text}</span>
              </div>
              <p className={`text-sm font-medium text-${risk.color}`}>
                {diagnostic.text}
              </p>
            </div>

            {/* Viability Status */}
            <div className={`p-4 rounded-xl text-center ${
              risk.level === 'low' ? 'bg-success/20 border-2 border-success' :
              risk.level === 'medium' ? 'bg-warning/20 border-2 border-warning' :
              'bg-destructive/20 border-2 border-destructive'
            }`}>
              <span className="text-2xl mb-2 block">
                {risk.level === 'low' ? '🟢' : risk.level === 'medium' ? '🟡' : '🔴'}
              </span>
              <span className={`font-bold text-lg ${
                risk.level === 'low' ? 'text-success' :
                risk.level === 'medium' ? 'text-warning' :
                'text-destructive'
              }`}>
                {risk.level === 'low' ? 'Viable' : risk.level === 'medium' ? 'Ajustable' : 'No Viable'}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
