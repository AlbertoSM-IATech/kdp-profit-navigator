import { PaperbackData, PaperbackResults, GlobalData, InteriorType, BookSize } from '@/types/kdp';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Book, Palette, Ruler, FileText, Euro, HelpCircle, AlertCircle } from 'lucide-react';
import { calculatePrintingCost, getMinPages } from '@/data/printingCosts';

interface PaperbackSectionProps {
  data: PaperbackData;
  results: PaperbackResults | null;
  globalData: GlobalData;
  onChange: (data: PaperbackData) => void;
}

const interiorLabels: Record<InteriorType, string> = {
  BN: 'Blanco y Negro',
  COLOR_PREMIUM: 'Color Premium',
  COLOR_STANDARD: 'Color Estándar',
};

const sizeLabels: Record<BookSize, string> = {
  SMALL: 'Pequeño (<6x9")',
  LARGE: 'Grande (≥6x9")',
};

export const PaperbackSection = ({ data, results, globalData, onChange }: PaperbackSectionProps) => {
  const currencySymbol = globalData.marketplace === 'COM' ? '$' : '€';
  
  // Calculate printing cost for display
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
    onChange({
      ...data,
      size: value as BookSize,
    });
  };

  const handleNumberChange = (field: 'pvp' | 'pages', value: string) => {
    const numValue = value === '' ? null : parseFloat(value);
    onChange({ ...data, [field]: numValue });
  };

  const getDiagnosticBadge = (diagnostico: string, margen: number, clics: number) => {
    const margenLabel = `${margen.toFixed(1)}% margen`;
    const clicsLabel = `máx. ${clics} clics`;
    
    switch (diagnostico) {
      case 'good':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium diagnosis-good border">
            🟢 Rentable ({margenLabel}, {clicsLabel})
          </span>
        );
      case 'warning':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium diagnosis-warning border">
            🟠 Ajustable ({margenLabel}, {clicsLabel})
          </span>
        );
      case 'bad':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium diagnosis-bad border">
            🔴 Riesgo alto ({margenLabel}, {clicsLabel})
          </span>
        );
    }
  };

  const getDiagnosticMessage = (diagnostico: string, margen: number, clics: number) => {
    if (diagnostico === 'bad') {
      if (margen < 30) {
        return 'Con este PVP pierdes dinero incluso antes de invertir en Ads.';
      }
      return `Solo puedes permitir ${clics} clics máx. Reduce CPC o sube PVP.`;
    }
    if (diagnostico === 'warning') {
      return 'Este precio es válido, pero el margen es ajustado.';
    }
    return 'Buen equilibrio entre rentabilidad y escalabilidad.';
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader className="pb-4">
        <CardTitle className="section-header">
          <Book className="h-5 w-5 text-primary" />
          Paperback (Tapa Blanda)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Inputs */}
          <div className="space-y-6">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Configuración</h4>
            
            <div className="grid grid-cols-2 gap-4">
              {/* Interior Type */}
              <div className="space-y-2">
                <Label htmlFor="interior" className="flex items-center gap-2 text-sm font-medium">
                  <Palette className="h-4 w-4 text-muted-foreground" />
                  Interior
                </Label>
                <Select value={data.interior || ''} onValueChange={handleInteriorChange}>
                  <SelectTrigger id="interior" className="input-focus">
                    <SelectValue placeholder="Seleccionar..." />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border border-border">
                    <SelectItem value="BN">{interiorLabels.BN}</SelectItem>
                    <SelectItem value="COLOR_PREMIUM">{interiorLabels.COLOR_PREMIUM}</SelectItem>
                    <SelectItem value="COLOR_STANDARD">{interiorLabels.COLOR_STANDARD}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Size */}
              <div className="space-y-2">
                <Label htmlFor="size" className="flex items-center gap-2 text-sm font-medium">
                  <Ruler className="h-4 w-4 text-muted-foreground" />
                  Tamaño
                </Label>
                <Select value={data.size || ''} onValueChange={handleSizeChange}>
                  <SelectTrigger id="size" className="input-focus">
                    <SelectValue placeholder="Seleccionar..." />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border border-border">
                    <SelectItem value="SMALL">{sizeLabels.SMALL}</SelectItem>
                    <SelectItem value="LARGE">{sizeLabels.LARGE}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Pages and PVP - Visible when interior and size are selected */}
            {data.interior && data.size && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pages" className="flex items-center gap-2 text-sm font-medium">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    Nº Páginas
                  </Label>
                  <Input
                    id="pages"
                    type="number"
                    step="1"
                    min={minPages}
                    placeholder={`Mín: ${minPages}`}
                    value={data.pages ?? ''}
                    onChange={(e) => handleNumberChange('pages', e.target.value)}
                    className="input-focus"
                  />
                  {data.interior === 'COLOR_STANDARD' && (
                    <p className="text-xs text-muted-foreground">Color Estándar requiere &gt;72 páginas</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pvp-paper" className="flex items-center gap-2 text-sm font-medium">
                    <Euro className="h-4 w-4 text-muted-foreground" />
                    PVP ({currencySymbol})
                  </Label>
                  <Input
                    id="pvp-paper"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Ej: 12.99"
                    value={data.pvp ?? ''}
                    onChange={(e) => handleNumberChange('pvp', e.target.value)}
                    className="input-focus"
                  />
                  <p className="text-xs text-muted-foreground">
                    Regalía: {data.pvp && data.pvp >= 9.99 ? '60%' : '50%'}
                  </p>
                </div>
              </div>
            )}

            {/* Printing Cost Info - Read only */}
            {data.interior && data.size && data.pages && printingResult.isValid && (
              <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                <h5 className="text-sm font-semibold text-foreground">Costes de Impresión (solo lectura)</h5>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground block text-xs">Coste Fijo</span>
                    <span className="font-mono font-medium">{printingResult.fixedCost.toFixed(2)}{currencySymbol}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-xs">Precio/Página</span>
                    <span className="font-mono font-medium">{printingResult.perPageCost.toFixed(3)}{currencySymbol}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-xs">Total Impresión</span>
                    <span className="font-mono font-semibold text-primary">{printingResult.totalCost.toFixed(2)}{currencySymbol}</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Fórmula: ({data.pages} × {printingResult.perPageCost.toFixed(3)}) + {printingResult.fixedCost.toFixed(2)} = {printingResult.totalCost.toFixed(2)}{currencySymbol}
                </p>
              </div>
            )}

            {/* Error message for invalid configuration */}
            {printingResult.errorMessage && (
              <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                <p className="text-sm text-destructive">{printingResult.errorMessage}</p>
              </div>
            )}
          </div>

          {/* Results */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Resultados</h4>
            
            {results ? (
              <div className="space-y-3 bg-muted/30 rounded-lg p-4">
                <div className="data-row">
                  <span className="data-label">Tasa de Regalías</span>
                  <span className="data-value">{(results.royaltyRate * 100).toFixed(0)}%</span>
                </div>

                {globalData.marketplace === 'ES' && (
                  <div className="data-row">
                    <span className="data-label">Precio sin IVA (4%)</span>
                    <span className="data-value">{results.precioSinIva.toFixed(2)}{currencySymbol}</span>
                  </div>
                )}
                
                <div className="data-row">
                  <span className="data-label">Gastos de Impresión</span>
                  <span className="data-value">{results.gastosImpresion.toFixed(2)}{currencySymbol}</span>
                </div>
                
                <div className="data-row">
                  <span className="data-label font-semibold">Regalías</span>
                  <span className={`data-value text-lg font-bold ${results.regalias > 0 ? 'text-primary' : 'text-destructive'}`}>
                    {results.regalias.toFixed(2)}{currencySymbol}
                  </span>
                </div>
                
                <div className="data-row">
                  <span className="data-label">Margen BACOS</span>
                  <span className="data-value">{(results.margenBacos * 100).toFixed(1)}%</span>
                </div>
                
                <div className="data-row">
                  <span className="data-label">Tasa Conv. Breakeven</span>
                  <span className="data-value">{(results.tasaConvBreakeven * 100).toFixed(2)}%</span>
                </div>
                
                <div className="data-row">
                  <span className="data-label flex items-center gap-1">
                    Clics máx. por Venta
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs p-3">
                          <p className="text-sm">
                            Para que una campaña sea saludable, lo recomendado es conseguir al menos 1 venta cada 10 clics (10% de conversión).
                            Cuantos más clics máximos permitidos tenga tu libro, mayor margen de maniobra tendrás en Amazon Ads.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </span>
                  <span className="data-value font-semibold">{results.clicsPorVenta}</span>
                </div>

                {/* Precio Mínimo Objetivo - DESTACADO */}
                {globalData.margenObjetivoPct && (
                  <div className="mt-4 p-3 bg-primary/10 border border-primary/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-semibold text-primary">Precio Mínimo Objetivo</span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <HelpCircle className="h-3.5 w-3.5 text-primary/70" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs p-3">
                            <p className="text-sm">
                              PVP mínimo recomendado para alcanzar el {globalData.margenObjetivoPct}% de margen objetivo.
                              Fórmula: CEIL(Gastos impresión / (% regalía − margen objetivo)) − 0,01
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    {results.precioMinObjetivo !== null ? (
                      <span className="text-2xl font-bold text-primary">
                        {results.precioMinObjetivo.toFixed(2)}{currencySymbol}
                      </span>
                    ) : (
                      <p className="text-sm text-destructive">{results.precioMinObjetivoError}</p>
                    )}
                  </div>
                )}

                <div className="pt-3 border-t border-border space-y-2">
                  {getDiagnosticBadge(results.diagnostico, results.margenBacos * 100, results.clicsPorVenta)}
                  <p className="text-sm text-muted-foreground">
                    {getDiagnosticMessage(results.diagnostico, results.margenBacos * 100, results.clicsPorVenta)}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-48 bg-muted/30 rounded-lg">
                <p className="text-sm text-muted-foreground text-center px-4">
                  Selecciona tipo de interior, tamaño e introduce el número de páginas para ver los resultados
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
