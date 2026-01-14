import { useState } from 'react';
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
import { Calculator, Globe, Palette, Ruler, FileText, BookOpen } from 'lucide-react';
import { InteriorType, BookSize, Marketplace, MARKETPLACE_CONFIGS } from '@/types/kdp';
import { calculatePrintingCost, getMinPages, BookFormat } from '@/data/printingCosts';



const interiorLabels: Record<InteriorType, string> = {
  BN: 'Blanco y Negro',
  COLOR_PREMIUM: 'Color Premium',
  COLOR_STANDARD: 'Color Estándar',
};

const sizeLabels: Record<BookSize, string> = {
  SMALL: 'Pequeño (≤6×9")',
  LARGE: 'Grande (>6×9")',
};

const formatLabels: Record<BookFormat, string> = {
  PAPERBACK: 'Tapa blanda',
  HARDCOVER: 'Tapa dura',
};

interface PrintingCalculatorProps {
  embedded?: boolean;
}

export const PrintingCalculator = ({ embedded = false }: PrintingCalculatorProps) => {
  const [marketplace, setMarketplace] = useState<Marketplace>('ES');
  const [format, setFormat] = useState<BookFormat>('PAPERBACK');
  const [interior, setInterior] = useState<InteriorType>('BN');
  const [size, setSize] = useState<BookSize>('LARGE');
  const [pages, setPages] = useState<number>(150);

  const config = MARKETPLACE_CONFIGS[marketplace];
  const currencySymbol = config.currencySymbol;
  const minPages = getMinPages(interior);

  // Calculate printing cost
  const printingResult = calculatePrintingCost(interior, size, pages, marketplace, format);

  // For hardcover, show additional info
  const isHardcover = format === 'HARDCOVER';

  if (embedded) {
    return renderContent();
  }

  return (
    <Card className="animate-fade-in">
      <CardHeader className="pb-4">
        <CardTitle className="section-header">
          <Calculator className="h-5 w-5 text-primary" />
          🧮 Calculador de Costes de Impresión
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Calcula el coste de impresión para cualquier configuración.
        </p>
      </CardHeader>
      <CardContent>
        {renderContent()}
      </CardContent>
    </Card>
  );

  function renderContent() {
    return (
      <div className="space-y-6">
        {/* Selection Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {/* Marketplace */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <Globe className="h-4 w-4 text-muted-foreground" />
                Marketplace
              </Label>
              <Select value={marketplace} onValueChange={(v) => setMarketplace(v as Marketplace)}>
                <SelectTrigger className="input-focus">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border border-border">
                  {Object.entries(MARKETPLACE_CONFIGS).map(([code, cfg]) => (
                    <SelectItem key={code} value={code}>
                      {cfg.name} ({cfg.currencySymbol})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Format */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
                Formato
              </Label>
              <Select value={format} onValueChange={(v) => setFormat(v as BookFormat)}>
                <SelectTrigger className="input-focus">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border border-border">
                  <SelectItem value="PAPERBACK">{formatLabels.PAPERBACK}</SelectItem>
                  <SelectItem value="HARDCOVER">{formatLabels.HARDCOVER}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Interior */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <Palette className="h-4 w-4 text-muted-foreground" />
                Interior
              </Label>
              <Select value={interior} onValueChange={(v) => setInterior(v as InteriorType)}>
                <SelectTrigger className="input-focus">
                  <SelectValue />
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
              <Label className="flex items-center gap-2 text-sm font-medium">
                <Ruler className="h-4 w-4 text-muted-foreground" />
                Tamaño
              </Label>
              <Select value={size} onValueChange={(v) => setSize(v as BookSize)}>
                <SelectTrigger className="input-focus">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border border-border">
                  <SelectItem value="SMALL">{sizeLabels.SMALL}</SelectItem>
                  <SelectItem value="LARGE">{sizeLabels.LARGE}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Pages */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <FileText className="h-4 w-4 text-muted-foreground" />
                Nº Páginas
              </Label>
              <Input
                type="number"
                min={minPages}
                value={pages}
                onChange={(e) => setPages(Math.max(minPages, parseInt(e.target.value) || minPages))}
                className="input-focus"
              />
            </div>
          </div>

          {/* Results */}
          {printingResult.isValid ? (
            <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
              <h5 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                📊 Resultado del cálculo
                {isHardcover && <span className="text-xs bg-primary/20 px-2 py-0.5 rounded">Tapa Dura</span>}
              </h5>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-background/50 rounded-lg p-3">
                  <span className="text-xs text-muted-foreground block mb-1">Coste Fijo</span>
                  <span className="font-mono font-semibold text-lg">
                    {printingResult.fixedCost.toFixed(2)}{currencySymbol}
                  </span>
                </div>
                <div className="bg-background/50 rounded-lg p-3">
                  <span className="text-xs text-muted-foreground block mb-1">Precio/Página</span>
                  <span className="font-mono font-semibold text-lg">
                    {printingResult.perPageCost.toFixed(4)}{currencySymbol}
                  </span>
                </div>
                <div className="bg-background/50 rounded-lg p-3">
                  <span className="text-xs text-muted-foreground block mb-1">Total Impresión</span>
                  <span className="font-mono font-bold text-xl text-primary">
                    {printingResult.totalCost.toFixed(2)}{currencySymbol}
                  </span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3 text-center">
                Fórmula: ({pages} × {printingResult.perPageCost.toFixed(4)}) + {printingResult.fixedCost.toFixed(2)} = {printingResult.totalCost.toFixed(2)}{currencySymbol}
              </p>
            </div>
          ) : (
            <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/20">
              <p className="text-sm text-destructive">
                {printingResult.errorMessage || 'Configuración no válida'}
              </p>
            </div>
          )}

          {/* Info note about hardcover */}
          {isHardcover && (
            <p className="text-xs text-muted-foreground italic">
              Nota: Los libros de tapa dura tienen un coste fijo adicional respecto a tapa blanda. 
              Revisa los precios oficiales de KDP para tu marketplace.
            </p>
          )}
        </div>
      );
  }
};
