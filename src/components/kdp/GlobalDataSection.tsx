import { GlobalData, Marketplace, FormatType, MARKETPLACE_CONFIGS } from '@/types/kdp';
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
import { Globe, Target, MousePointer, TrendingUp, AlertTriangle, BookOpen, Book, HelpCircle } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface GlobalDataSectionProps {
  data: GlobalData;
  onChange: (data: GlobalData) => void;
}

export const GlobalDataSection = ({ data, onChange }: GlobalDataSectionProps) => {
  const handleMarketplaceChange = (value: string) => {
    onChange({ ...data, marketplace: value as Marketplace });
  };

  const handleFormatChange = (value: string) => {
    onChange({ ...data, selectedFormat: value as FormatType });
  };

  const handleNumberChange = (field: keyof GlobalData, value: string) => {
    const numValue = value === '' ? null : parseFloat(value);
    onChange({ ...data, [field]: numValue });
  };

  const showMarginWarning = data.margenObjetivoPct !== null && data.margenObjetivoPct < 30;
  const config = data.marketplace ? MARKETPLACE_CONFIGS[data.marketplace] : null;
  const currencySymbol = config?.currencySymbol || '€';

  return (
    <Card className="animate-fade-in">
      <CardContent className="pt-5 pb-4">
        {/* Format + Marketplace inline */}
        <div className="flex flex-wrap items-end gap-4 mb-4">
          {/* Format Selector - Compact */}
          <div className="flex-1 min-w-[200px]">
            <Label className="text-xs font-medium text-muted-foreground mb-2 block">Formato</Label>
            <RadioGroup
              value={data.selectedFormat || ''}
              onValueChange={handleFormatChange}
              className="flex gap-3"
            >
              <div className="flex items-center space-x-1.5">
                <RadioGroupItem value="EBOOK" id="format-ebook" className="h-3.5 w-3.5" />
                <Label htmlFor="format-ebook" className="flex items-center gap-1 cursor-pointer text-sm">
                  <BookOpen className="h-3.5 w-3.5 text-secondary" />
                  eBook
                </Label>
              </div>
              <div className="flex items-center space-x-1.5">
                <RadioGroupItem value="PAPERBACK" id="format-paperback" className="h-3.5 w-3.5" />
                <Label htmlFor="format-paperback" className="flex items-center gap-1 cursor-pointer text-sm">
                  <Book className="h-3.5 w-3.5 text-primary" />
                  Impreso
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Marketplace */}
          {data.selectedFormat && (
            <div className="w-[180px]">
              <Label className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
                <Globe className="h-3 w-3" />
                Marketplace
              </Label>
              <Select value={data.marketplace || ''} onValueChange={handleMarketplaceChange}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(MARKETPLACE_CONFIGS).map((mp) => (
                    <SelectItem key={mp.code} value={mp.code}>
                      {mp.name} ({mp.currencySymbol})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Other inputs - Single row */}
        {data.selectedFormat && data.marketplace && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 animate-fade-in">
            {/* Margen Objetivo */}
            <div>
              <Label className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
                <Target className="h-3 w-3" />
                Margen Obj.
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger><HelpCircle className="h-3 w-3" /></TooltipTrigger>
                    <TooltipContent className="max-w-xs p-2">
                      <p className="text-xs">% mínimo de margen real (BACOS) para reinvertir en Ads. Recomendado: ≥30%.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Label>
              <div className="relative">
                <Input
                  type="number"
                  step="1"
                  min="0"
                  max="100"
                  placeholder="40"
                  value={data.margenObjetivoPct ?? ''}
                  onChange={(e) => handleNumberChange('margenObjetivoPct', e.target.value)}
                  className="h-9 text-sm pr-6"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">%</span>
              </div>
              {showMarginWarning && (
                <div className="flex items-center gap-1 text-warning text-xs mt-0.5">
                  <AlertTriangle className="h-3 w-3" />
                  <span>&lt;30%</span>
                </div>
              )}
            </div>

            {/* CPC */}
            <div>
              <Label className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
                <MousePointer className="h-3 w-3" />
                CPC
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger><HelpCircle className="h-3 w-3" /></TooltipTrigger>
                    <TooltipContent className="max-w-xs p-2">
                      <p className="text-xs">Coste por clic estimado. Investígalo por nicho/keyword.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Label>
              <div className="relative">
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.35"
                  value={data.cpc ?? ''}
                  onChange={(e) => handleNumberChange('cpc', e.target.value)}
                  className="h-9 text-sm pr-6"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">{currencySymbol}</span>
              </div>
            </div>

            {/* Ventas Diarias */}
            <div>
              <Label className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                Ventas/día
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger><HelpCircle className="h-3 w-3" /></TooltipTrigger>
                    <TooltipContent className="max-w-xs p-2">
                      <p className="text-xs">Ventas diarias de los líderes de tu nicho.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Label>
              <Input
                type="number"
                step="1"
                min="0"
                placeholder="5"
                value={data.ventasDiariasCompetencia ?? ''}
                onChange={(e) => handleNumberChange('ventasDiariasCompetencia', e.target.value)}
                className="h-9 text-sm"
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
