import { EbookData, EbookResults, GlobalData, RoyaltyRate, IvaType, MARKETPLACE_CONFIGS } from '@/types/kdp';
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
import { BookOpen, Euro, Percent, HardDrive, HelpCircle, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

interface EbookSectionProps {
  data: EbookData;
  results: EbookResults | null;
  globalData: GlobalData;
  onChange: (data: EbookData) => void;
}

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
          <BookOpen className="h-4 w-4 text-secondary" />
          <span className="font-semibold text-sm">eBook</span>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Inputs */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                <Euro className="h-3 w-3" /> PVP
              </Label>
              <div className="relative">
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="4.99"
                  value={data.pvp ?? ''}
                  onChange={(e) => handleNumberChange('pvp', e.target.value)}
                  className="h-9 text-sm pr-6"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">{currencySymbol}</span>
              </div>
            </div>

            <div>
              <Label className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                <Percent className="h-3 w-3" /> Regalía
              </Label>
              <Select value={data.royaltyRate.toString()} onValueChange={handleRoyaltyChange}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="70">70%</SelectItem>
                  <SelectItem value="35">35%</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {showTamano && (
              <div>
                <Label className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                  <HardDrive className="h-3 w-3" /> Tamaño MB
                </Label>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder="2.5"
                  value={data.tamanoMb ?? ''}
                  onChange={(e) => handleNumberChange('tamanoMb', e.target.value)}
                  className="h-9 text-sm"
                />
              </div>
            )}

            {showIvaSelector && (
              <div>
                <Label className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                  IVA
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger><HelpCircle className="h-3 w-3" /></TooltipTrigger>
                      <TooltipContent className="max-w-xs p-2">
                        <p className="text-xs">21% para bajo contenido, cuadernos o multimedia.</p>
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
          </div>

          {/* Results - Compact */}
          {results ? (
            <div className="space-y-2">
              <div className={`flex items-center gap-2 p-2 rounded-lg border text-sm ${getViabilityBg()}`}>
                {getViabilityIcon()}
                <span className="text-xs">Riesgo: {results.riskLevel === 'low' ? 'Bajo' : results.riskLevel === 'medium' ? 'Medio' : 'Alto'}</span>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div className="bg-muted/30 rounded-lg p-2 text-center">
                  <span className="text-[10px] text-muted-foreground block">Regalía</span>
                  <span className={`text-sm font-bold ${results.regalias > 0 ? 'text-secondary' : 'text-destructive'}`}>
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
              <p className="text-xs text-muted-foreground">Introduce PVP para ver resultados</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
