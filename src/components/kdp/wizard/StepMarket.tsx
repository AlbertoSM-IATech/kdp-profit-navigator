import { GlobalData, Marketplace, MARKETPLACE_CONFIGS } from '@/types/kdp';
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
import { Globe, Target, MousePointer, TrendingUp, AlertTriangle, HelpCircle } from 'lucide-react';

interface StepMarketProps {
  globalData: GlobalData;
  onChange: (data: GlobalData) => void;
}

export const StepMarket = ({ globalData, onChange }: StepMarketProps) => {
  const config = globalData.marketplace ? MARKETPLACE_CONFIGS[globalData.marketplace] : null;
  const currencySymbol = config?.currencySymbol || '€';
  const showMarginWarning = globalData.margenObjetivoPct !== null && globalData.margenObjetivoPct < 30;

  const handleMarketplaceChange = (value: string) => {
    onChange({ ...globalData, marketplace: value as Marketplace });
  };

  const handleNumberChange = (field: keyof GlobalData, value: string) => {
    const numValue = value === '' ? null : parseFloat(value);
    onChange({ ...globalData, [field]: numValue });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Datos del mercado y competencia
        </h2>
        <p className="text-muted-foreground">
          Introduce los datos de tu investigación de nicho
        </p>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Marketplace */}
        <div className="space-y-2">
          <Label htmlFor="marketplace" className="flex items-center gap-2 text-sm font-medium">
            <Globe className="h-4 w-4 text-primary" />
            Marketplace
          </Label>
          <Select
            value={globalData.marketplace || ''}
            onValueChange={handleMarketplaceChange}
          >
            <SelectTrigger id="marketplace" className="input-focus h-12 text-base">
              <SelectValue placeholder="Selecciona el marketplace..." />
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* CPC */}
          <div className="space-y-2">
            <Label htmlFor="cpc" className="flex items-center gap-2 text-sm font-medium">
              <MousePointer className="h-4 w-4 text-primary" />
              CPC estimado
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs p-3">
                    <p className="text-sm">
                      CPC medio aproximado del nicho. Debes investigarlo usando herramientas de keywords 
                      o referencias del sector. No es el CPC de tus campañas actuales.
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
                placeholder="Ej: 0.25"
                value={globalData.cpc ?? ''}
                onChange={(e) => handleNumberChange('cpc', e.target.value)}
                className="input-focus pr-10 h-12 text-base"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">{currencySymbol}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Coste medio por clic en el nicho. Investígalo con herramientas de keywords.
            </p>
          </div>

          {/* Ventas Diarias Competencia */}
          <div className="space-y-2">
            <Label htmlFor="ventas" className="flex items-center gap-2 text-sm font-medium">
              <TrendingUp className="h-4 w-4 text-primary" />
              Ventas/día competencia
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs p-3">
                    <p className="text-sm">
                      Estimación de ventas diarias de los 2–3 líderes de tu nicho. Investígalo con 
                      herramientas externas y con tu criterio.
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
              placeholder="Ej: 5"
              value={globalData.ventasDiariasCompetencia ?? ''}
              onChange={(e) => handleNumberChange('ventasDiariasCompetencia', e.target.value)}
              className="input-focus h-12 text-base"
            />
            <p className="text-xs text-muted-foreground">
              Ventas diarias estimadas de los libros mejor posicionados en tu nicho.
            </p>
          </div>
        </div>

        {/* Margen Objetivo */}
        <div className="space-y-2">
          <Label htmlFor="margen" className="flex items-center gap-2 text-sm font-medium">
            <Target className="h-4 w-4 text-primary" />
            Margen Objetivo (%)
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
              value={globalData.margenObjetivoPct ?? ''}
              onChange={(e) => handleNumberChange('margenObjetivoPct', e.target.value)}
              className="input-focus pr-10 h-12 text-base"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Margen mínimo que quieres asegurar por venta para reinvertir en Ads. Recomendado: ≥ 30%.
          </p>
          {showMarginWarning && (
            <div className="flex items-center gap-1.5 text-warning text-sm mt-2 p-2 bg-warning/10 rounded-lg">
              <AlertTriangle className="h-4 w-4" />
              <span>Margen inferior al 30% recomendado. Tendrás menos margen para Ads.</span>
            </div>
          )}
        </div>

        {/* Info note */}
        <p className="text-xs text-muted-foreground text-center">
          Estos datos son obligatorios y no tienen valores predeterminados para evitar errores de estimación.
        </p>
      </div>
    </div>
  );
};
