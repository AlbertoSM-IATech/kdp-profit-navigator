import { EbookData, EbookResults, GlobalData, RoyaltyRate, IvaType, MARKETPLACE_CONFIGS } from '@/types/kdp';
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
import { BookOpen, Euro, Percent, HardDrive, HelpCircle, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

interface EbookSectionProps {
  data: EbookData;
  results: EbookResults | null;
  globalData: GlobalData;
  onChange: (data: EbookData) => void;
}

export const EbookSection = ({ data, results, globalData, onChange }: EbookSectionProps) => {
  const config = globalData.marketplace ? MARKETPLACE_CONFIGS[globalData.marketplace] : null;
  const currencySymbol = config?.currencySymbol || '€';
  const showTamano = data.royaltyRate === 70;
  const showIvaSelector = globalData.marketplace === 'ES';

  const handleNumberChange = (field: keyof EbookData, value: string) => {
    const numValue = value === '' ? null : parseFloat(value);
    onChange({ ...data, [field]: numValue });
  };

  const handleRoyaltyChange = (value: string) => {
    onChange({ ...data, royaltyRate: parseInt(value) as RoyaltyRate });
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
          <BookOpen className="h-5 w-5 text-secondary" />
          📘 eBook — Configuración
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Inputs Column */}
          <div className="space-y-6">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Datos del libro
            </h4>
            
            <div className="grid grid-cols-2 gap-4">
              {/* PVP */}
              <div className="space-y-2">
                <Label htmlFor="pvp-ebook" className="flex items-center gap-2 text-sm font-medium">
                  <Euro className="h-4 w-4 text-primary" />
                  PVP
                </Label>
                <div className="relative">
                  <Input
                    id="pvp-ebook"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Ej: 4.99"
                    value={data.pvp ?? ''}
                    onChange={(e) => handleNumberChange('pvp', e.target.value)}
                    className="input-focus pr-8 border-primary/30"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">{currencySymbol}</span>
                </div>
              </div>

              {/* Royalty Rate */}
              <div className="space-y-2">
                <Label htmlFor="royalty" className="flex items-center gap-2 text-sm font-medium">
                  <Percent className="h-4 w-4 text-muted-foreground" />
                  Regalía
                </Label>
                <Select
                  value={data.royaltyRate.toString()}
                  onValueChange={handleRoyaltyChange}
                >
                  <SelectTrigger id="royalty" className="input-focus">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border border-border">
                    <SelectItem value="70">70%</SelectItem>
                    <SelectItem value="35">35%</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Tamaño MB - Only visible for 70% */}
            {showTamano && (
              <div className="space-y-2">
                <Label htmlFor="tamano" className="flex items-center gap-2 text-sm font-medium">
                  <HardDrive className="h-4 w-4 text-muted-foreground" />
                  Tamaño del archivo (MB)
                </Label>
                <Input
                  id="tamano"
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder="Ej: 2.5"
                  value={data.tamanoMb ?? ''}
                  onChange={(e) => handleNumberChange('tamanoMb', e.target.value)}
                  className="input-focus border-primary/30"
                />
                <p className="text-xs text-muted-foreground">
                  Tarifa de entrega: 0,12{currencySymbol} por MB (redondeado hacia arriba)
                </p>
              </div>
            )}

            {/* IVA Selector - Only for ES */}
            {showIvaSelector && (
              <div className="space-y-2">
                <Label htmlFor="iva-ebook" className="flex items-center gap-2 text-sm font-medium">
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
                  <SelectTrigger id="iva-ebook" className="input-focus">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border border-border">
                    <SelectItem value="4">4% (Libro estándar)</SelectItem>
                    <SelectItem value="21">21% (Audiovisual/Bajo contenido)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Results Column */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Resultados calculados
            </h4>
            
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
                    <span className="text-xs text-muted-foreground block mb-1">Regalía neta</span>
                    <span className={`text-xl font-bold ${results.regalias > 0 ? 'text-secondary' : 'text-destructive'}`}>
                      {results.regalias.toFixed(2)}{currencySymbol}
                    </span>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-3 text-center">
                    <span className="text-xs text-muted-foreground block mb-1">Margen real</span>
                    <span className={`text-xl font-bold ${results.margenPct >= 30 ? 'text-success' : results.margenPct >= 20 ? 'text-warning' : 'text-destructive'}`}>
                      {results.margenPct.toFixed(1)}%
                    </span>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-3 text-center">
                    <span className="text-xs text-muted-foreground block mb-1 flex items-center justify-center gap-1">
                      Clics máx./Venta
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <HelpCircle className="h-3 w-3" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs p-3">
                            <p className="text-sm">
                              El mínimo recomendado es 1 venta cada 10 clics (10%).
                              Permitir más clics por venta reduce el margen y aumenta el riesgo.
                              Menos clics por venta indica una campaña saludable.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </span>
                    <span className={`text-xl font-bold ${results.clicsMaxPorVenta >= 10 ? 'text-success' : 'text-destructive'}`}>
                      {results.clicsMaxPorVenta}
                    </span>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-3 text-center">
                    <span className="text-xs text-muted-foreground block mb-1">CPC máx. rentable</span>
                    <span className="text-xl font-bold text-primary">
                      {results.cpcMaxRentable.toFixed(2)}{currencySymbol}
                    </span>
                  </div>
                </div>

                {/* Detailed breakdown */}
                <div className="bg-muted/20 rounded-lg p-4 space-y-2 text-sm">
                  {globalData.marketplace === 'ES' && (
                    <>
                      <div className="data-row">
                        <span className="data-label">Precio sin IVA ({results.ivaPct}%)</span>
                        <span className="data-value">{results.precioSinIva.toFixed(2)}{currencySymbol}</span>
                      </div>
                    </>
                  )}
                  {showTamano && data.tamanoMb && results.deliveryCost > 0 && (
                    <div className="data-row">
                      <span className="data-label">Tarifa de entrega</span>
                      <span className="data-value">-{results.deliveryCost.toFixed(2)}{currencySymbol}</span>
                    </div>
                  )}
                  <div className="data-row">
                    <span className="data-label">ROI por venta</span>
                    <span className="data-value">{results.roiPorVenta.toFixed(1)}x</span>
                  </div>
                  <div className="data-row">
                    <span className="data-label">Tasa conv. breakeven</span>
                    <span className="data-value">{(results.tasaConvBreakeven * 100).toFixed(2)}%</span>
                  </div>
                </div>

                {/* Minimum Target Price */}
                {globalData.margenObjetivoPct && (
                  <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-semibold text-primary">Precio mínimo objetivo</span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <HelpCircle className="h-3.5 w-3.5 text-primary/70" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs p-3">
                            <p className="text-sm">
                              PVP mínimo recomendado para alcanzar el {globalData.margenObjetivoPct}% de margen objetivo
                              y poder invertir en Ads sin perder dinero.
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
              </div>
            ) : (
              <div className="flex items-center justify-center h-48 bg-muted/30 rounded-lg">
                <p className="text-sm text-muted-foreground text-center px-4">
                  Introduce el PVP y los datos del marketplace para ver los resultados
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
