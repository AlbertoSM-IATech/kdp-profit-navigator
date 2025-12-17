import { PaperbackData, PaperbackResults, GlobalData, InteriorType, BookSize, IvaType, MARKETPLACE_CONFIGS } from '@/types/kdp';
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
import { Book, Palette, Ruler, FileText, Euro, HelpCircle, AlertCircle, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
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
  SMALL: 'Pequeño (≤6x9")',
  LARGE: 'Grande (>6x9")',
};

// Helper to get clicks color with thresholds: ≥13 green, 10-12 yellow, <10 red
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
  const isHardcover = globalData.selectedFormat === 'HARDCOVER';
  const showIvaSelector = globalData.marketplace === 'ES';
  
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

  const handleIvaChange = (value: string) => {
    onChange({ ...data, ivaType: parseInt(value) as IvaType });
  };

  const getViabilityIcon = () => {
    if (!results) return null;
    switch (results.viabilityStatus) {
      case 'viable': return <CheckCircle className="h-5 w-5 text-success" />;
      case 'adjustable': return <AlertTriangle className="h-5 w-5 text-warning" />;
      case 'not-viable': return <XCircle className="h-5 w-5 text-destructive" />;
    }
  };

  const getViabilityText = () => {
    if (!results) return '';
    switch (results.viabilityStatus) {
      case 'viable': return 'Este precio permite invertir en Ads con margen';
      case 'adjustable': return 'Ajustable, pero con riesgo medio';
      case 'not-viable': return 'No viable para Ads, alto riesgo de pérdida';
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
      <CardHeader className="pb-4">
        <CardTitle className="section-header">
          <Book className="h-5 w-5 text-primary" />
          {isHardcover ? '📗 Hardcover' : '📕 Paperback'} — Configuración
        </CardTitle>
        <p className="text-sm text-muted-foreground">Datos del libro físico.</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Inputs Column */}
          <div className="space-y-6">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Datos del libro
            </h4>
            
            <div className="grid grid-cols-2 gap-4">
              {/* Interior Type */}
              <div className="space-y-2">
                <Label htmlFor="interior" className="flex items-center gap-2 text-sm font-medium">
                  <Palette className="h-4 w-4 text-muted-foreground" />
                  Tipo impresión
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
              <div className="grid grid-cols-2 gap-4 animate-fade-in">
                <div className="space-y-2">
                  <Label htmlFor="pages" className="flex items-center gap-2 text-sm font-medium">
                    <FileText className="h-4 w-4 text-primary" />
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
                    className="input-focus border-primary/30"
                  />
                  {data.interior === 'COLOR_STANDARD' && (
                    <p className="text-xs text-muted-foreground">Color Estándar requiere &gt;72 páginas</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pvp-paper" className="flex items-center gap-2 text-sm font-medium">
                    <Euro className="h-4 w-4 text-primary" />
                    PVP
                  </Label>
                  <div className="relative">
                    <Input
                      id="pvp-paper"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Ej: 12.99"
                      value={data.pvp ?? ''}
                      onChange={(e) => handleNumberChange('pvp', e.target.value)}
                      className="input-focus pr-8 border-primary/30"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">{currencySymbol}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Regalía automática: {data.pvp && data.pvp >= 9.99 ? '60%' : '50%'}
                  </p>
                </div>
              </div>
            )}

            {/* IVA Selector - Only for ES */}
            {data.interior && data.size && showIvaSelector && (
              <div className="space-y-2 animate-fade-in">
                <Label htmlFor="iva-paper" className="flex items-center gap-2 text-sm font-medium">
                  IVA aplicable
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs p-3">
                        <p className="text-sm">
                          Amazon puede aplicar IVA general (21%) a libros de bajo contenido, cuadernos, 
                          libros de actividades o productos con contenido mixto/multimedia.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Label>
                <Select
                  value={data.ivaType.toString()}
                  onValueChange={handleIvaChange}
                >
                  <SelectTrigger id="iva-paper" className="input-focus">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border border-border">
                    <SelectItem value="4">4% (Libro estándar)</SelectItem>
                    <SelectItem value="21">21% (Audiovisual/Bajo contenido)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Printing Cost Info - Read only */}
            {data.interior && data.size && data.pages && printingResult.isValid && (
              <div className="p-4 bg-muted/50 rounded-lg space-y-2 animate-fade-in">
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
              <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg flex items-start gap-2 animate-fade-in">
                <AlertCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                <p className="text-sm text-destructive">{printingResult.errorMessage}</p>
              </div>
            )}
          </div>

          {/* Results Column */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Resultados
            </h4>
            <p className="text-xs text-muted-foreground -mt-2">Cálculo automático con tus datos.</p>
            
            {results ? (
              <div className="space-y-4">
                {/* Viability Status - Big and prominent */}
                <div className={`p-4 rounded-xl border ${getViabilityBg()}`}>
                  <div className="flex items-center gap-3">
                    {getViabilityIcon()}
                    <div>
                      <p className="font-semibold text-foreground">{getViabilityText()}</p>
                      <p className="text-xs text-muted-foreground">
                        Riesgo: {results.riskLevel === 'low' ? 'Bajo' : results.riskLevel === 'medium' ? 'Medio' : 'Alto'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-muted/30 rounded-lg p-3 text-center">
                    <span className="text-xs text-muted-foreground block mb-1 flex items-center justify-center gap-1">
                      Regalía neta
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <HelpCircle className="h-3 w-3" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs p-3">
                            <p className="text-sm">
                              Importe que te queda por venta tras aplicar el % de regalía y descontar el coste de impresión.
                              <br /><br />
                              <strong>Papel:</strong> (Precio sin IVA × % regalía) − Coste de impresión
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </span>
                    <span className={`text-xl font-bold ${results.regalias > 0 ? 'text-primary' : 'text-destructive'}`}>
                      {results.regalias.toFixed(2)}{currencySymbol}
                    </span>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-3 text-center">
                    <span className="text-xs text-muted-foreground block mb-1 flex items-center justify-center gap-1">
                      Margen real (BACOS)
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <HelpCircle className="h-3 w-3" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs p-3">
                            <p className="text-sm">
                              <strong>BACOS</strong> = Margen real después del coste de ventas.
                              <br /><br />
                              Fórmula: (Regalía neta) / (Precio sin IVA)
                              <br /><br />
                              Es el porcentaje de cada venta que realmente te queda para margen operativo (antes de estructura).
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </span>
                    <span className={`text-xl font-bold ${results.margenPct >= 30 ? 'text-success' : results.margenPct >= 20 ? 'text-warning' : 'text-destructive'}`}>
                      {results.margenPct.toFixed(1)}%
                    </span>
                  </div>
                  <div className={`rounded-lg p-3 text-center ${getClicksBg(results.clicsMaxPorVenta)}`}>
                    <span className="text-xs text-muted-foreground block mb-1 flex items-center justify-center gap-1">
                      Clics máx./Venta
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <HelpCircle className="h-3 w-3" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs p-3">
                            <p className="text-sm">
                              Define el <strong>margen operativo</strong> como el número máximo de clics que te 
                              puedes permitir para vender una unidad sin perder dinero.
                              <br /><br />
                              <strong>Cuantos más clics puedas permitirte, más sano es tu margen.</strong>
                              <br /><br />
                              <span className="text-success">🟢 ≥13: Excelente — Campaña sana</span><br />
                              <span className="text-warning">🟠 10-12: Aceptable — Funciona, pero ajustable</span><br />
                              <span className="text-destructive">🔴 &lt;10: En riesgo — Ajusta antes de invertir</span>
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </span>
                    <span className={`text-xl font-bold ${getClicksColor(results.clicsMaxPorVenta)}`}>
                      {results.clicsMaxPorVenta}
                    </span>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-3 text-center">
                    <span className="text-xs text-muted-foreground block mb-1">CPC máx. rentable</span>
                    <span className="text-xl font-bold text-secondary">
                      {results.cpcMaxRentable.toFixed(2)}{currencySymbol}
                    </span>
                  </div>
                </div>

                {/* Detailed breakdown */}
                <div className="bg-muted/20 rounded-lg p-4 space-y-2 text-sm">
                  <div className="data-row">
                    <span className="data-label">Tasa de Regalías</span>
                    <span className="data-value">{(results.royaltyRate * 100).toFixed(0)}%</span>
                  </div>
                  {globalData.marketplace === 'ES' && (
                    <div className="data-row">
                      <span className="data-label">Precio sin IVA ({data.ivaType}%)</span>
                      <span className="data-value">{results.precioSinIva.toFixed(2)}{currencySymbol}</span>
                    </div>
                  )}
                  <div className="data-row">
                    <span className="data-label">Gastos de Impresión</span>
                    <span className="data-value">-{results.gastosImpresion.toFixed(2)}{currencySymbol}</span>
                  </div>
                  <div className="data-row">
                    <span className="data-label">Tasa conv. breakeven</span>
                    <span className="data-value">{(results.tasaConvBreakeven * 100).toFixed(2)}%</span>
                  </div>
                </div>

                {/* Minimum Recommended Price - PROMINENT */}
                {globalData.margenObjetivoPct && (
                  <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-semibold text-primary">Precio mínimo recomendado</span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <HelpCircle className="h-3.5 w-3.5 text-primary/70" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs p-3">
                            <p className="text-sm">
                              PVP mínimo recomendado para alcanzar tu margen objetivo (BACOS) 
                              y poder invertir en Ads sin perder dinero.
                              <br /><br />
                              Fórmula base (papel): PsinIVA ≥ C / (r − m) con validación de umbral de regalías e IVA.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    {results.precioMinObjetivo !== null ? (
                      <div>
                        <span className="text-2xl font-bold text-primary">
                          {results.precioMinObjetivo.toFixed(2)}{currencySymbol}
                        </span>
                        {data.pvp && data.pvp < results.precioMinObjetivo && (
                          <p className="text-xs text-destructive mt-1">
                            ⚠️ Tu PVP actual está por debajo del mínimo recomendado
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-destructive">{results.precioMinObjetivoError}</p>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-48 bg-muted/30 rounded-lg">
                <p className="text-sm text-muted-foreground text-center px-4">
                  Selecciona tipo de impresión, tamaño e introduce los datos para ver resultados
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
