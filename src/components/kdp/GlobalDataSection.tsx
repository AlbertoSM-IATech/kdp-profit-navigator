import { GlobalData, Marketplace, FormatType, MARKETPLACE_CONFIGS } from '@/types/kdp';
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
      <CardHeader className="pb-4">
        <CardTitle className="section-header">
          <Globe className="h-5 w-5 text-primary" />
          Entradas del análisis
        </CardTitle>
        <p className="text-sm text-muted-foreground">Datos reales que has introducido.</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Format Selector - PROMINENT - Step 1 */}
        <div className="p-5 bg-gradient-to-r from-primary/10 via-secondary/5 to-primary/10 rounded-xl border border-primary/20">
          <Label className="text-sm font-semibold text-foreground mb-4 block">
            1. ¿Qué formato quieres analizar?
          </Label>
          <RadioGroup
            value={data.selectedFormat || ''}
            onValueChange={handleFormatChange}
            className="flex flex-wrap gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="EBOOK" id="format-ebook" className="border-secondary data-[state=checked]:bg-secondary data-[state=checked]:border-secondary" />
              <Label 
                htmlFor="format-ebook" 
                className="flex items-center gap-2 cursor-pointer font-medium"
              >
                <BookOpen className="h-4 w-4 text-secondary" />
                📘 eBook
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="PAPERBACK" id="format-paperback" className="border-primary data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
              <Label 
                htmlFor="format-paperback" 
                className="flex items-center gap-2 cursor-pointer font-medium"
              >
                <Book className="h-4 w-4 text-primary" />
                📚 Formato impreso
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Global Inputs - Only show after format is selected */}
        {data.selectedFormat && (
          <div className="space-y-4 animate-fade-in">
            <Label className="text-sm font-semibold text-foreground block">
              2. Datos del mercado y competencia
            </Label>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Marketplace */}
              <div className="space-y-2">
                <Label htmlFor="marketplace" className="flex items-center gap-2 text-sm font-medium">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  Marketplace
                </Label>
                <Select
                  value={data.marketplace || ''}
                  onValueChange={handleMarketplaceChange}
                >
                  <SelectTrigger id="marketplace" className="input-focus">
                    <SelectValue placeholder="Seleccionar..." />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border border-border">
                    {Object.values(MARKETPLACE_CONFIGS).map((mp) => (
                      <SelectItem key={mp.code} value={mp.code}>
                        {mp.name} ({mp.currencySymbol})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Margen Objetivo */}
              <div className="space-y-2">
                <Label htmlFor="margen" className="flex items-center gap-2 text-sm font-medium">
                  <Target className="h-4 w-4 text-muted-foreground" />
                  Margen Objetivo
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs p-3">
                        <p className="text-sm">
                          Porcentaje mínimo de margen real (BACOS) que quieres asegurar por venta 
                          para poder reinvertir en Ads con bajo riesgo. Recomendado: ≥ 30%.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Label>
                <div className="relative">
                  <Input
                    id="margen"
                    type="number"
                    step="1"
                    min="0"
                    max="100"
                    placeholder="Ej: 40"
                    value={data.margenObjetivoPct ?? ''}
                    onChange={(e) => handleNumberChange('margenObjetivoPct', e.target.value)}
                    className="input-focus pr-8"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
                </div>
                {showMarginWarning && (
                  <div className="flex items-center gap-1 text-warning text-xs mt-1">
                    <AlertTriangle className="h-3 w-3" />
                    <span>Margen inferior al 30% recomendado</span>
                  </div>
                )}
              </div>

              {/* CPC */}
              <div className="space-y-2">
                <Label htmlFor="cpc" className="flex items-center gap-2 text-sm font-medium">
                  <MousePointer className="h-4 w-4 text-muted-foreground" />
                  CPC estimado
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs p-3">
                        <p className="text-sm">
                          Coste por clic estimado en tus campañas. Debes investigarlo por nicho/keyword. 
                          No uses valores por defecto.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Label>
                <div className="relative">
                  <Input
                    id="cpc"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Sin valor predeterminado"
                    value={data.cpc ?? ''}
                    onChange={(e) => handleNumberChange('cpc', e.target.value)}
                    className="input-focus pr-8"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">{currencySymbol}</span>
                </div>
              </div>

              {/* Ventas Diarias Competencia */}
              <div className="space-y-2">
                <Label htmlFor="ventas" className="flex items-center gap-2 text-sm font-medium">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  Ventas/día competencia
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs p-3">
                        <p className="text-sm">
                          Estimación de ventas diarias de los 2–3 líderes de tu nicho. Investígalo con 
                          herramientas externas y con tu criterio. Sirve para calcular inversión mínima para competir.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Label>
                <Input
                  id="ventas"
                  type="number"
                  step="1"
                  min="0"
                  placeholder="Sin valor predeterminado"
                  value={data.ventasDiariasCompetencia ?? ''}
                  onChange={(e) => handleNumberChange('ventasDiariasCompetencia', e.target.value)}
                  className="input-focus"
                />
              </div>
            </div>

            {/* Info note */}
            <p className="text-xs text-muted-foreground italic mt-2">
              * El margen objetivo es una recomendación (mín. 30% aconsejado). CPC y ventas competencia no tienen valores por defecto.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
