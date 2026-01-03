import { PaperbackData, PaperbackResults, GlobalData, InteriorType, BookSize, IvaType, MARKETPLACE_CONFIGS } from '@/types/kdp';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
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
import { Book, Palette, Ruler, FileText, Euro, HelpCircle, AlertCircle, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { calculatePrintingCost, getMinPages } from '@/data/printingCosts';

interface PaperbackSectionProps {
  data: PaperbackData;
  results: PaperbackResults | null;
  globalData: GlobalData;
  onChange: (data: PaperbackData) => void;
}

const interiorLabels: Record<InteriorType, string> = {
  BN: 'B/N',
  COLOR_PREMIUM: 'Color Premium',
  COLOR_STANDARD: 'Color Estándar',
};

const sizeLabels: Record<BookSize, string> = {
  SMALL: '≤6x9"',
  LARGE: '>6x9"',
};

const getClicksColor = (clicks: number) => {
  if (clicks >= 13) return 'text-success';
  if (clicks >= 10) return 'text-warning';
  return 'text-destructive';
};

const getClicksBg = (clicks: number) => {
  if (clicks >= 13) return 'bg-success/20';
  if (clicks >= 10) return 'bg-warning/20';
  return 'bg-destructive/20';
};

export const PaperbackSection = ({ data, results, globalData, onChange }: PaperbackSectionProps) => {
  const config = globalData.marketplace ? MARKETPLACE_CONFIGS[globalData.marketplace] : null;
  const currencySymbol = config?.currencySymbol || '€';
  const showIvaSelector = globalData.marketplace === 'ES';
  
  const printingResult = calculatePrintingCost(data.interior, data.size, data.pages);
  const minPages = getMinPages(data.interior);

  const handleInteriorChange = (value: string) => {
    const newInterior = value as InteriorType;
    const newMinPages = getMinPages(newInterior);
    onChange({
      ...data,
      interior: newInterior,
      pages: data.pages && data.pages < newMinPages ? newMinPages : data.pages,
    });
  };

  const handleSizeChange = (value: string) => {
    onChange({ ...data, size: value as BookSize });
  };

  const handleNumberChange = (field: 'pvp' | 'pages', value: string) => {
    const numValue = value === '' ? null : parseFloat(value);
    onChange({ ...data, [field]: numValue });
  };

  const handleIvaChange = (value: string) => {
    onChange({ ...data, ivaType: parseInt(value) as IvaType });
  };

  const getViabilityIcon = () => {
    if (!results) return null;
    switch (results.viabilityStatus) {
      case 'viable': return <CheckCircle className="h-4 w-4 text-success" />;
      case 'adjustable': return <AlertTriangle className="h-4 w-4 text-warning" />;
      case 'not-viable': return <XCircle className="h-4 w-4 text-destructive" />;
    }
  };

  const getViabilityBg = () => {
    if (!results) return 'bg-muted';
    switch (results.viabilityStatus) {
      case 'viable': return 'bg-success/10 border-success/30';
      case 'adjustable': return 'bg-warning/10 border-warning/30';
      case 'not-viable': return 'bg-destructive/10 border-destructive/30';
    }
  };

  return (
    <Card className="animate-fade-in">
      <CardContent className="pt-4 pb-4">
        <div className="flex items-center gap-2 mb-3">
          <Book className="h-4 w-4 text-primary" />
          <span className="font-semibold text-sm">Formato impreso</span>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Inputs */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                  <Palette className="h-3 w-3" /> Impresión
                </Label>
                <Select value={data.interior || ''} onValueChange={handleInteriorChange}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Tipo..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BN">{interiorLabels.BN}</SelectItem>
                    <SelectItem value="COLOR_PREMIUM">{interiorLabels.COLOR_PREMIUM}</SelectItem>
                    <SelectItem value="COLOR_STANDARD">{interiorLabels.COLOR_STANDARD}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                  <Ruler className="h-3 w-3" /> Tamaño
                </Label>
                <Select value={data.size || ''} onValueChange={handleSizeChange}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Tamaño..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SMALL">{sizeLabels.SMALL}</SelectItem>
                    <SelectItem value="LARGE">{sizeLabels.LARGE}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {data.interior && data.size && (
              <div className="grid grid-cols-2 gap-3 animate-fade-in">
                <div>
                  <Label className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                    <FileText className="h-3 w-3" /> Páginas
                  </Label>
                  <Input
                    type="number"
                    step="1"
                    min={minPages}
                    placeholder={`Mín: ${minPages}`}
                    value={data.pages ?? ''}
                    onChange={(e) => handleNumberChange('pages', e.target.value)}
                    className="h-9 text-sm"
                  />
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                    <Euro className="h-3 w-3" /> PVP
                  </Label>
                  <div className="relative">
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="12.99"
                      value={data.pvp ?? ''}
                      onChange={(e) => handleNumberChange('pvp', e.target.value)}
                      className="h-9 text-sm pr-6"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">{currencySymbol}</span>
                  </div>
                </div>
              </div>
            )}

            {data.interior && data.size && showIvaSelector && (
              <div className="w-1/2 animate-fade-in">
                <Label className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                  IVA
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger><HelpCircle className="h-3 w-3" /></TooltipTrigger>
                      <TooltipContent className="max-w-xs p-2">
                        <p className="text-xs">21% para bajo contenido o multimedia.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Label>
                <Select value={data.ivaType.toString()} onValueChange={handleIvaChange}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="4">4%</SelectItem>
                    <SelectItem value="21">21%</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Printing Cost - Compact */}
            {data.interior && data.size && data.pages && printingResult.isValid && (
              <div className="p-2 bg-muted/50 rounded-lg text-xs animate-fade-in">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Coste impresión:</span>
                  <span className="font-semibold text-primary">{printingResult.totalCost.toFixed(2)}{currencySymbol}</span>
                </div>
              </div>
            )}

            {printingResult.errorMessage && (
              <div className="p-2 bg-destructive/10 border border-destructive/30 rounded-lg flex items-center gap-2 animate-fade-in">
                <AlertCircle className="h-3 w-3 text-destructive shrink-0" />
                <p className="text-xs text-destructive">{printingResult.errorMessage}</p>
              </div>
            )}
          </div>

          {/* Results - Compact */}
          {results ? (
            <div className="space-y-2">
              <div className={`flex items-center gap-2 p-2 rounded-lg border text-sm ${getViabilityBg()}`}>
                {getViabilityIcon()}
                <span className="text-xs">Riesgo: {results.riskLevel === 'low' ? 'Bajo' : results.riskLevel === 'medium' ? 'Medio' : 'Alto'}</span>
                <span className="text-xs text-muted-foreground ml-auto">Regalía: {data.pvp && data.pvp >= 9.99 ? '60%' : '50%'}</span>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div className="bg-muted/30 rounded-lg p-2 text-center">
                  <span className="text-[10px] text-muted-foreground block">Regalía</span>
                  <span className={`text-sm font-bold ${results.regalias > 0 ? 'text-primary' : 'text-destructive'}`}>
                    {results.regalias.toFixed(2)}{currencySymbol}
                  </span>
                </div>
                <div className="bg-muted/30 rounded-lg p-2 text-center">
                  <span className="text-[10px] text-muted-foreground block">BACOS</span>
                  <span className={`text-sm font-bold ${results.margenPct >= 30 ? 'text-success' : results.margenPct >= 20 ? 'text-warning' : 'text-destructive'}`}>
                    {results.margenPct.toFixed(1)}%
                  </span>
                </div>
                <div className={`rounded-lg p-2 text-center ${getClicksBg(results.clicsMaxPorVenta)}`}>
                  <span className="text-[10px] text-muted-foreground block">Clics máx.</span>
                  <span className={`text-sm font-bold ${getClicksColor(results.clicsMaxPorVenta)}`}>
                    {results.clicsMaxPorVenta}
                  </span>
                </div>
                <div className="bg-muted/30 rounded-lg p-2 text-center">
                  <span className="text-[10px] text-muted-foreground block">CPC máx.</span>
                  <span className="text-sm font-bold text-primary">
                    {results.cpcMaxRentable.toFixed(2)}{currencySymbol}
                  </span>
                </div>
              </div>

              {globalData.margenObjetivoPct && results.precioMinObjetivo && (
                <div className="p-2 bg-primary/10 border border-primary/30 rounded-lg flex items-center justify-between">
                  <span className="text-xs text-primary">PVP mín. recomendado</span>
                  <span className="font-bold text-primary">{results.precioMinObjetivo.toFixed(2)}{currencySymbol}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-20 bg-muted/30 rounded-lg">
              <p className="text-xs text-muted-foreground">Completa los datos para ver resultados</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
