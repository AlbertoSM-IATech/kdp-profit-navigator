import { GlobalData, Marketplace } from '@/types/kdp';
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
import { Globe, Target, MousePointer, TrendingUp, AlertTriangle } from 'lucide-react';

interface GlobalDataSectionProps {
  data: GlobalData;
  onChange: (data: GlobalData) => void;
}

export const GlobalDataSection = ({ data, onChange }: GlobalDataSectionProps) => {
  const handleMarketplaceChange = (value: string) => {
    onChange({ ...data, marketplace: value as Marketplace });
  };

  const handleNumberChange = (field: keyof GlobalData, value: string) => {
    const numValue = value === '' ? null : parseFloat(value);
    onChange({ ...data, [field]: numValue });
  };

  const showMarginWarning = data.margenObjetivoPct !== null && data.margenObjetivoPct < 30;
  const currencySymbol = data.marketplace === 'COM' ? '$' : '€';

  return (
    <Card className="animate-fade-in">
      <CardHeader className="pb-4">
        <CardTitle className="section-header">
          <Globe className="h-5 w-5 text-primary" />
          Datos Globales
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                <SelectItem value="ES">Amazon ES (España)</SelectItem>
                <SelectItem value="COM">Amazon COM (USA)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Margen Objetivo */}
          <div className="space-y-2">
            <Label htmlFor="margen" className="flex items-center gap-2 text-sm font-medium">
              <Target className="h-4 w-4 text-muted-foreground" />
              Margen Objetivo (%)
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
              CPC ({currencySymbol})
            </Label>
            <div className="relative">
              <Input
                id="cpc"
                type="number"
                step="0.01"
                min="0"
                placeholder="Ej: 0.35"
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
              Ventas Diarias Competencia
            </Label>
            <Input
              id="ventas"
              type="number"
              step="1"
              min="0"
              placeholder="Ej: 15"
              value={data.ventasDiariasCompetencia ?? ''}
              onChange={(e) => handleNumberChange('ventasDiariasCompetencia', e.target.value)}
              className="input-focus"
            />
          </div>
        </div>

        {/* Info note */}
        <p className="text-xs text-muted-foreground mt-4 italic">
          * El margen objetivo es una recomendación, no una restricción. Se usará para calcular precios mínimos sugeridos.
        </p>
      </CardContent>
    </Card>
  );
};
