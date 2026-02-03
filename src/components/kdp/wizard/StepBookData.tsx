import { GlobalData, EbookData, PaperbackData, RoyaltyRate, IvaType, InteriorType, BookSize, BookFormat, MARKETPLACE_CONFIGS } from '@/types/kdp';
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
import { Euro, Percent, HardDrive, HelpCircle, Palette, Ruler, FileText, AlertCircle, Layers } from 'lucide-react';
import { calculatePrintingCost, getMinPages } from '@/data/printingCosts';

interface StepBookDataProps {
  globalData: GlobalData;
  ebookData: EbookData;
  paperbackData: PaperbackData;
  onEbookChange: (data: EbookData) => void;
  onPaperbackChange: (data: PaperbackData) => void;
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

const formatLabels: Record<BookFormat, string> = {
  PAPERBACK: 'Tapa blanda',
  HARDCOVER: 'Tapa dura',
};

export const StepBookData = ({
  globalData,
  ebookData,
  paperbackData,
  onEbookChange,
  onPaperbackChange,
}: StepBookDataProps) => {
  const config = globalData.marketplace ? MARKETPLACE_CONFIGS[globalData.marketplace] : null;
  const currencySymbol = config?.currencySymbol || '€';
  const isEbook = globalData.selectedFormat === 'EBOOK';
  const showIvaSelector = globalData.marketplace === 'ES';

  // Ebook handlers
  const handleEbookNumberChange = (field: keyof EbookData, value: string) => {
    const numValue = value === '' ? null : parseFloat(value);
    onEbookChange({ ...ebookData, [field]: numValue });
  };

  const handleRoyaltyChange = (value: string) => {
    onEbookChange({ ...ebookData, royaltyRate: parseInt(value) as RoyaltyRate });
  };

  const handleEbookIvaChange = (value: string) => {
    onEbookChange({ ...ebookData, ivaType: parseInt(value) as IvaType });
  };

  // Paperback handlers
  const printingResult = calculatePrintingCost(
    paperbackData.interior, 
    paperbackData.size, 
    paperbackData.pages, 
    globalData.marketplace, 
    paperbackData.bookFormat
  );
  const minPages = getMinPages(paperbackData.interior);

  const handleInteriorChange = (value: string) => {
    const newInterior = value as InteriorType;
    const newMinPages = getMinPages(newInterior);
    const newBookFormat = newInterior === 'COLOR_STANDARD' && paperbackData.bookFormat === 'HARDCOVER' 
      ? 'PAPERBACK' 
      : paperbackData.bookFormat;
    onPaperbackChange({
      ...paperbackData,
      interior: newInterior,
      pages: paperbackData.pages && paperbackData.pages < newMinPages ? newMinPages : paperbackData.pages,
      bookFormat: newBookFormat,
    });
  };

  const handleSizeChange = (value: string) => {
    onPaperbackChange({ ...paperbackData, size: value as BookSize });
  };

  const handleFormatChange = (value: string) => {
    onPaperbackChange({ ...paperbackData, bookFormat: value as BookFormat });
  };

  const handlePaperbackNumberChange = (field: 'pvp' | 'pages', value: string) => {
    const numValue = value === '' ? null : parseFloat(value);
    onPaperbackChange({ ...paperbackData, [field]: numValue });
  };

  const handlePaperbackIvaChange = (value: string) => {
    onPaperbackChange({ ...paperbackData, ivaType: parseInt(value) as IvaType });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Datos del {isEbook ? 'eBook' : 'libro impreso'}
        </h2>
        <p className="text-muted-foreground">
          {isEbook 
            ? 'Configura el precio y la regalía de tu libro digital' 
            : 'Configura las características de impresión y precio'}
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        {isEbook ? (
          // EBOOK FORM
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* PVP */}
              <div className="space-y-2">
                <Label htmlFor="pvp-ebook" className="flex items-center gap-2 text-sm font-medium">
                  <Euro className="h-4 w-4 text-primary" />
                  Precio de venta (PVP)
                </Label>
                <div className="relative">
                  <Input
                    id="pvp-ebook"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Ej: 4.99"
                    value={ebookData.pvp ?? ''}
                    onChange={(e) => handleEbookNumberChange('pvp', e.target.value)}
                    className="input-focus pr-10 h-12 text-base"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">{currencySymbol}</span>
                </div>
              </div>

              {/* Royalty Rate */}
              <div className="space-y-2">
                <Label htmlFor="royalty" className="flex items-center gap-2 text-sm font-medium">
                  <Percent className="h-4 w-4 text-primary" />
                  Regalía
                </Label>
                <Select value={ebookData.royaltyRate.toString()} onValueChange={handleRoyaltyChange}>
                  <SelectTrigger id="royalty" className="input-focus h-12 text-base">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border border-border">
                    <SelectItem value="70">70% (requiere rango de precios)</SelectItem>
                    <SelectItem value="35">35% (sin restricciones)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Tamaño MB - Only visible for 70% */}
            {ebookData.royaltyRate === 70 && (
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
                  value={ebookData.tamanoMb ?? ''}
                  onChange={(e) => handleEbookNumberChange('tamanoMb', e.target.value)}
                  className="input-focus h-12 text-base"
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
                <Select value={ebookData.ivaType.toString()} onValueChange={handleEbookIvaChange}>
                  <SelectTrigger id="iva-ebook" className="input-focus h-12 text-base">
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
        ) : (
          // PAPERBACK FORM
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Book Format */}
              <div className="space-y-2">
                <Label htmlFor="bookFormat" className="flex items-center gap-2 text-sm font-medium">
                  <Layers className="h-4 w-4 text-muted-foreground" />
                  Encuadernación
                </Label>
                <Select value={paperbackData.bookFormat} onValueChange={handleFormatChange}>
                  <SelectTrigger id="bookFormat" className="input-focus h-12 text-base">
                    <SelectValue placeholder="Seleccionar..." />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border border-border">
                    <SelectItem value="PAPERBACK">{formatLabels.PAPERBACK}</SelectItem>
                    <SelectItem 
                      value="HARDCOVER" 
                      disabled={paperbackData.interior === 'COLOR_STANDARD'}
                    >
                      {formatLabels.HARDCOVER}
                      {paperbackData.interior === 'COLOR_STANDARD' && ' (no disponible)'}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Interior Type */}
              <div className="space-y-2">
                <Label htmlFor="interior" className="flex items-center gap-2 text-sm font-medium">
                  <Palette className="h-4 w-4 text-muted-foreground" />
                  Tipo impresión
                </Label>
                <Select value={paperbackData.interior || ''} onValueChange={handleInteriorChange}>
                  <SelectTrigger id="interior" className="input-focus h-12 text-base">
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
                <Select value={paperbackData.size || ''} onValueChange={handleSizeChange}>
                  <SelectTrigger id="size" className="input-focus h-12 text-base">
                    <SelectValue placeholder="Seleccionar..." />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border border-border">
                    <SelectItem value="SMALL">{sizeLabels.SMALL}</SelectItem>
                    <SelectItem value="LARGE">{sizeLabels.LARGE}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Pages and PVP */}
            {paperbackData.interior && paperbackData.size && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
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
                    value={paperbackData.pages ?? ''}
                    onChange={(e) => handlePaperbackNumberChange('pages', e.target.value)}
                    className={`input-focus h-12 text-base ${
                      paperbackData.pages !== null && paperbackData.pages < minPages 
                        ? 'border-destructive focus:ring-destructive' 
                        : ''
                    }`}
                  />
                  {paperbackData.pages !== null && paperbackData.pages < minPages && (
                    <div className="flex items-center gap-1.5 text-destructive text-xs animate-fade-in">
                      <AlertCircle className="h-3 w-3" />
                      <span>Mínimo {minPages} páginas para este tipo de impresión</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pvp-paper" className="flex items-center gap-2 text-sm font-medium">
                    <Euro className="h-4 w-4 text-primary" />
                    Precio de venta (PVP)
                  </Label>
                  <div className="relative">
                    <Input
                      id="pvp-paper"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Ej: 12.99"
                      value={paperbackData.pvp ?? ''}
                      onChange={(e) => handlePaperbackNumberChange('pvp', e.target.value)}
                      className="input-focus pr-10 h-12 text-base"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">{currencySymbol}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Regalía automática: {paperbackData.pvp && paperbackData.pvp >= 9.99 ? '60%' : '50%'}
                  </p>
                </div>
              </div>
            )}

            {/* IVA Selector - Only for ES */}
            {paperbackData.interior && paperbackData.size && showIvaSelector && (
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
                <Select value={paperbackData.ivaType.toString()} onValueChange={handlePaperbackIvaChange}>
                  <SelectTrigger id="iva-paper" className="input-focus h-12 text-base">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border border-border">
                    <SelectItem value="4">4% (Libro estándar)</SelectItem>
                    <SelectItem value="21">21% (Audiovisual/Bajo contenido)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Printing Cost Info - Real-time */}
            {paperbackData.interior && paperbackData.size && paperbackData.pages && printingResult.isValid && (
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl space-y-2 animate-fade-in">
                <h5 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  💰 Coste de Impresión Calculado
                  {paperbackData.bookFormat === 'HARDCOVER' && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                      Tapa dura
                    </span>
                  )}
                </h5>
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
                    <span className="text-muted-foreground block text-xs">Total</span>
                    <span className="font-mono font-bold text-primary text-lg">{printingResult.totalCost.toFixed(2)}{currencySymbol}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Error message */}
            {printingResult.errorMessage && (
              <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg flex items-start gap-2 animate-fade-in">
                <AlertCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                <p className="text-sm text-destructive">{printingResult.errorMessage}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
