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
import { Book, Palette, Ruler, FileText, Euro } from 'lucide-react';
import { getPresetsForInteriorAndSize, getPresetById } from '@/data/paperbackPresets';
import { useEffect } from 'react';

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
  SMALL: 'Pequeño (hasta 15x21 cm)',
  LARGE: 'Grande (hasta 21x28 cm)',
};

export const PaperbackSection = ({ data, results, globalData, onChange }: PaperbackSectionProps) => {
  const currencySymbol = globalData.marketplace === 'COM' ? '$' : '€';
  const availablePresets = getPresetsForInteriorAndSize(data.interior, data.size);
  const selectedPreset = data.presetId ? getPresetById(data.presetId) : null;

  // Auto-set PVP when preset changes
  useEffect(() => {
    if (selectedPreset && data.pvp === null) {
      onChange({
        ...data,
        pvp: selectedPreset.suggestedPvp,
        pages: Math.floor((selectedPreset.minPages + selectedPreset.maxPages) / 2),
      });
    }
  }, [selectedPreset]);

  const handleInteriorChange = (value: string) => {
    onChange({
      ...data,
      interior: value as InteriorType,
      presetId: null,
      pvp: null,
      pages: null,
    });
  };

  const handleSizeChange = (value: string) => {
    onChange({
      ...data,
      size: value as BookSize,
      presetId: null,
      pvp: null,
      pages: null,
    });
  };

  const handlePresetChange = (value: string) => {
    const preset = getPresetById(value);
    if (preset) {
      onChange({
        ...data,
        presetId: value,
        pvp: preset.suggestedPvp,
        pages: Math.floor((preset.minPages + preset.maxPages) / 2),
      });
    }
  };

  const handleNumberChange = (field: 'pvp' | 'pages', value: string) => {
    const numValue = value === '' ? null : parseFloat(value);
    onChange({ ...data, [field]: numValue });
  };

  const getDiagnosticBadge = (diagnostico: string, margen: number, clics: number) => {
    const margenLabel = `${margen.toFixed(1)}% margen`;
    const clicsLabel = `${clics} clics`;
    
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

            {/* Page Range Preset */}
            {data.interior && data.size && (
              <div className="space-y-2">
                <Label htmlFor="preset" className="flex items-center gap-2 text-sm font-medium">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  Rango de Páginas
                </Label>
                <Select value={data.presetId || ''} onValueChange={handlePresetChange}>
                  <SelectTrigger id="preset" className="input-focus">
                    <SelectValue placeholder="Seleccionar rango..." />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border border-border">
                    {availablePresets.map((preset) => (
                      <SelectItem key={preset.id} value={preset.id}>
                        {preset.pageRange} (sugerido: {preset.suggestedPvp}{currencySymbol})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* PVP and Pages */}
            {selectedPreset && (
              <div className="grid grid-cols-2 gap-4">
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
                    placeholder={`Sugerido: ${selectedPreset.suggestedPvp}`}
                    value={data.pvp ?? ''}
                    onChange={(e) => handleNumberChange('pvp', e.target.value)}
                    className="input-focus"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pages" className="flex items-center gap-2 text-sm font-medium">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    Nº Páginas
                  </Label>
                  <Input
                    id="pages"
                    type="number"
                    step="1"
                    min={selectedPreset.minPages}
                    max={selectedPreset.maxPages}
                    placeholder={`${selectedPreset.minPages}-${selectedPreset.maxPages}`}
                    value={data.pages ?? ''}
                    onChange={(e) => handleNumberChange('pages', e.target.value)}
                    className="input-focus"
                  />
                </div>
              </div>
            )}

            {/* Preset info */}
            {selectedPreset && (
              <div className="p-3 bg-muted/50 rounded-lg text-xs text-muted-foreground space-y-1">
                <p>• Coste fijo: {selectedPreset.fixedCost.toFixed(2)}{currencySymbol}</p>
                <p>• Coste por página: {selectedPreset.perPageCost.toFixed(3)}{currencySymbol}</p>
                <p>• Regalías: {data.pvp && data.pvp >= 9.99 ? '60%' : '50%'} (según PVP)</p>
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
                  <span className="data-label">Clics por Venta</span>
                  <span className="data-value font-semibold">{results.clicsPorVenta}</span>
                </div>

                {results.precioMinObjetivo > 0 && globalData.margenObjetivoPct && (
                  <div className="data-row bg-warning/10 -mx-4 px-4 py-2">
                    <span className="data-label">PVP Mín. para {globalData.margenObjetivoPct}% margen</span>
                    <span className="data-value font-semibold text-warning">
                      {results.precioMinObjetivo.toFixed(2)}{currencySymbol}
                    </span>
                  </div>
                )}

                <div className="pt-3 border-t border-border">
                  {getDiagnosticBadge(results.diagnostico, results.margenBacos * 100, results.clicsPorVenta)}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-48 bg-muted/30 rounded-lg">
                <p className="text-sm text-muted-foreground text-center px-4">
                  Selecciona tipo de interior, tamaño y rango de páginas para ver los resultados
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
