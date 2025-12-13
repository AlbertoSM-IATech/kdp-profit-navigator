import { EbookData, EbookResults, GlobalData, RoyaltyRate } from '@/types/kdp';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
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
import { BookOpen, Euro, Percent, HardDrive, Tv, HelpCircle } from 'lucide-react';

interface EbookSectionProps {
  data: EbookData;
  results: EbookResults | null;
  globalData: GlobalData;
  onChange: (data: EbookData) => void;
}

export const EbookSection = ({ data, results, globalData, onChange }: EbookSectionProps) => {
  const currencySymbol = globalData.marketplace === 'COM' ? '$' : '€';
  const showTamano = data.royaltyRate === 70;

  const handleNumberChange = (field: keyof EbookData, value: string) => {
    const numValue = value === '' ? null : parseFloat(value);
    onChange({ ...data, [field]: numValue });
  };

  const handleRoyaltyChange = (value: string) => {
    onChange({ ...data, royaltyRate: parseInt(value) as RoyaltyRate });
  };

  const getDiagnosticColor = (diagnostico: string) => {
    switch (diagnostico) {
      case 'good': return 'text-success';
      case 'warning': return 'text-warning';
      case 'bad': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const getDiagnosticBadge = (diagnostico: string, clics: number) => {
    switch (diagnostico) {
      case 'good':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium diagnosis-good border">
            🟢 Campaña buena (máx. {clics} clics)
          </span>
        );
      case 'warning':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium diagnosis-warning border">
            🟠 Límite aceptable (máx. {clics} clics)
          </span>
        );
      case 'bad':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium diagnosis-bad border">
            🔴 Mala campaña (máx. {clics} clics)
          </span>
        );
    }
  };

  const getDiagnosticMessage = (diagnostico: string, clics: number) => {
    switch (diagnostico) {
      case 'good':
        return `Puedes permitir hasta ${clics} clics por venta. Buen margen para escalar.`;
      case 'warning':
        return 'En el límite de breakeven (10 clics). Margen ajustado.';
      case 'bad':
        return `Con este PVP pierdes dinero incluso antes de invertir en Ads.`;
    }
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader className="pb-4">
        <CardTitle className="section-header">
          <BookOpen className="h-5 w-5 text-secondary" />
          eBook
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Inputs */}
          <div className="space-y-6">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Configuración</h4>
            
            <div className="grid grid-cols-2 gap-4">
              {/* PVP */}
              <div className="space-y-2">
                <Label htmlFor="pvp-ebook" className="flex items-center gap-2 text-sm font-medium">
                  <Euro className="h-4 w-4 text-muted-foreground" />
                  PVP ({currencySymbol})
                </Label>
                <Input
                  id="pvp-ebook"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Ej: 4.99"
                  value={data.pvp ?? ''}
                  onChange={(e) => handleNumberChange('pvp', e.target.value)}
                  className="input-focus"
                />
              </div>

              {/* Royalty Rate */}
              <div className="space-y-2">
                <Label htmlFor="royalty" className="flex items-center gap-2 text-sm font-medium">
                  <Percent className="h-4 w-4 text-muted-foreground" />
                  Tasa Regalías
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
                  className="input-focus"
                />
                <p className="text-xs text-muted-foreground">
                  Coste de entrega: 0,12€ por MB (redondeado hacia arriba)
                </p>
              </div>
            )}

            {/* Audiovisual Toggle - Only for ES */}
            {globalData.marketplace === 'ES' && (
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Tv className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <Label htmlFor="audiovisual" className="text-sm font-medium cursor-pointer">
                      Contenido audiovisual
                    </Label>
                    <p className="text-xs text-muted-foreground">IVA al 21% en lugar del 4%</p>
                  </div>
                </div>
                <Switch
                  id="audiovisual"
                  checked={data.audiovisual}
                  onCheckedChange={(checked) => onChange({ ...data, audiovisual: checked })}
                />
              </div>
            )}
          </div>

          {/* Results */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Resultados</h4>
            
            {results ? (
              <div className="space-y-3 bg-muted/30 rounded-lg p-4">
                {globalData.marketplace === 'ES' && (
                  <>
                    <div className="data-row">
                      <span className="data-label">IVA ({results.ivaPct}%)</span>
                      <span className="data-value">{results.iva.toFixed(2)}{currencySymbol}</span>
                    </div>
                    <div className="data-row">
                      <span className="data-label">Precio Neto</span>
                      <span className="data-value">{results.neto.toFixed(2)}{currencySymbol}</span>
                    </div>
                  </>
                )}
                
                {showTamano && data.tamanoMb && (
                  <div className="data-row">
                    <span className="data-label">Coste de Entrega</span>
                    <span className="data-value">{results.deliveryCost.toFixed(2)}{currencySymbol}</span>
                  </div>
                )}
                
                <div className="data-row">
                  <span className="data-label font-semibold">Regalías</span>
                  <span className="data-value text-lg font-bold text-secondary">
                    {results.regalias.toFixed(2)}{currencySymbol}
                  </span>
                </div>
                
                <div className="data-row">
                  <span className="data-label">Margen ACOS</span>
                  <span className="data-value">{(results.margenAcos * 100).toFixed(1)}%</span>
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
                  <span className={`data-value font-semibold ${getDiagnosticColor(results.diagnostico)}`}>
                    {results.clicsPorVenta}
                  </span>
                </div>

                <div className="pt-3 border-t border-border space-y-2">
                  {getDiagnosticBadge(results.diagnostico, results.clicsPorVenta)}
                  <p className="text-sm text-muted-foreground">
                    {getDiagnosticMessage(results.diagnostico, results.clicsPorVenta)}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-48 bg-muted/30 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Completa los datos para ver los resultados
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
