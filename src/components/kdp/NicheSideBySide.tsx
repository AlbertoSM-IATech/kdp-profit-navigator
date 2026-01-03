import { useState } from 'react';
import { SavedNiche, MARKETPLACE_CONFIGS } from '@/types/kdp';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Columns, ArrowRight, ArrowLeft, X } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface NicheSideBySideProps {
  niches: SavedNiche[];
}

export const NicheSideBySide = ({ niches }: NicheSideBySideProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [leftNicheId, setLeftNicheId] = useState<string | null>(null);
  const [rightNicheId, setRightNicheId] = useState<string | null>(null);

  const leftNiche = niches.find(n => n.id === leftNicheId) || null;
  const rightNiche = niches.find(n => n.id === rightNicheId) || null;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 50) return 'text-warning';
    return 'text-destructive';
  };

  const getClicksColor = (clicks: number) => {
    if (clicks >= 13) return 'text-success';
    if (clicks >= 10) return 'text-warning';
    return 'text-destructive';
  };

  const getBetterClass = (valA: number | null, valB: number | null, higherIsBetter = true) => {
    if (valA === null || valB === null) return { left: '', right: '' };
    if (valA === valB) return { left: '', right: '' };
    const aIsBetter = higherIsBetter ? valA > valB : valA < valB;
    return {
      left: aIsBetter ? 'bg-success/20 font-semibold' : 'bg-destructive/10',
      right: aIsBetter ? 'bg-destructive/10' : 'bg-success/20 font-semibold'
    };
  };

  const renderNicheColumn = (niche: SavedNiche | null, side: 'left' | 'right') => {
    if (!niche) {
      return (
        <div className="flex-1 p-4 flex items-center justify-center bg-muted/30 rounded-lg min-h-[400px]">
          <p className="text-muted-foreground text-sm text-center">
            Selecciona un nicho para comparar
          </p>
        </div>
      );
    }

    const config = niche.globalData.marketplace ? MARKETPLACE_CONFIGS[niche.globalData.marketplace] : null;
    const symbol = config?.currencySymbol || '€';
    const otherNiche = side === 'left' ? rightNiche : leftNiche;

    const Row = ({ 
      label, 
      value, 
      otherValue, 
      format = 'text', 
      higherIsBetter = true,
      colorFn
    }: { 
      label: string; 
      value: number | string | null; 
      otherValue?: number | null;
      format?: 'text' | 'currency' | 'percent' | 'number';
      higherIsBetter?: boolean;
      colorFn?: (v: number) => string;
    }) => {
      const numValue = typeof value === 'number' ? value : null;
      const better = numValue !== null && otherValue !== undefined 
        ? getBetterClass(numValue, otherValue, higherIsBetter) 
        : { left: '', right: '' };
      const betterClass = side === 'left' ? better.left : better.right;
      
      let displayValue = value?.toString() || '-';
      if (format === 'currency' && typeof value === 'number') {
        displayValue = `${symbol}${value.toFixed(2)}`;
      } else if (format === 'percent' && typeof value === 'number') {
        displayValue = `${value.toFixed(1)}%`;
      } else if (format === 'number' && typeof value === 'number') {
        displayValue = value.toFixed(2);
      }

      const colorClass = colorFn && typeof value === 'number' ? colorFn(value) : '';

      return (
        <div className={`flex justify-between py-2 px-3 rounded ${betterClass}`}>
          <span className="text-muted-foreground text-sm">{label}</span>
          <span className={`font-medium ${colorClass}`}>{displayValue}</span>
        </div>
      );
    };

    return (
      <div className="flex-1 space-y-4">
        {/* Header */}
        <div className="text-center p-4 bg-muted/50 rounded-lg">
          <h3 className="font-semibold text-lg">{niche.name}</h3>
          <div className={`text-3xl font-bold ${getScoreColor(niche.scoreBreakdown.totalScore)}`}>
            {niche.scoreBreakdown.totalScore}/100
          </div>
          <div className="text-sm mt-1">
            {niche.scoreBreakdown.statusEmoji} {niche.scoreBreakdown.statusLabel}
          </div>
        </div>

        {/* Details */}
        <div className="space-y-1 text-sm">
          <div className="font-medium text-muted-foreground uppercase text-xs tracking-wide mb-2">
            Datos generales
          </div>
          <Row label="Marketplace" value={config?.name || '-'} />
          <Row 
            label="Formato" 
            value={niche.globalData.selectedFormat === 'EBOOK' ? 'eBook' : 'Formato impreso'} 
          />
          <Row 
            label="PVP" 
            value={niche.pvp} 
            otherValue={otherNiche?.pvp}
            format="currency"
            higherIsBetter={true}
          />
          <Row 
            label="CPC" 
            value={niche.globalData.cpc} 
            otherValue={otherNiche?.globalData.cpc}
            format="currency"
            higherIsBetter={false}
          />
          <Row 
            label="Ventas/día competencia" 
            value={niche.globalData.ventasDiariasCompetencia} 
            otherValue={otherNiche?.globalData.ventasDiariasCompetencia}
            higherIsBetter={true}
          />
        </div>

        <div className="space-y-1 text-sm">
          <div className="font-medium text-muted-foreground uppercase text-xs tracking-wide mb-2">
            Métricas clave
          </div>
          <Row 
            label="Clics máx./Venta" 
            value={niche.clicsMaxPorVenta} 
            otherValue={otherNiche?.clicsMaxPorVenta}
            higherIsBetter={true}
            colorFn={getClicksColor}
          />
          <Row 
            label="BACOS" 
            value={niche.bacos} 
            otherValue={otherNiche?.bacos}
            format="percent"
            higherIsBetter={true}
          />
          <Row 
            label="Regalía neta" 
            value={niche.regalias} 
            otherValue={otherNiche?.regalias}
            format="currency"
            higherIsBetter={true}
          />
          <Row 
            label="Inversión diaria" 
            value={niche.inversionDiaria} 
            otherValue={otherNiche?.inversionDiaria}
            format="currency"
            higherIsBetter={false}
          />
          <Row 
            label="Precio mín. recomendado" 
            value={niche.precioMinRecomendado} 
            format="currency"
          />
        </div>

        <div className="space-y-1 text-sm">
          <div className="font-medium text-muted-foreground uppercase text-xs tracking-wide mb-2">
            Desglose del Score
          </div>
          <Row 
            label="Clics (máx. 50)" 
            value={niche.scoreBreakdown.clicsScore} 
            otherValue={otherNiche?.scoreBreakdown.clicsScore}
            higherIsBetter={true}
          />
          <Row 
            label="BACOS (máx. 30)" 
            value={niche.scoreBreakdown.bacosScore} 
            otherValue={otherNiche?.scoreBreakdown.bacosScore}
            higherIsBetter={true}
          />
          <Row 
            label="PVP vs Mín. (máx. 20)" 
            value={niche.scoreBreakdown.pvpVsMinScore} 
            otherValue={otherNiche?.scoreBreakdown.pvpVsMinScore}
            higherIsBetter={true}
          />
        </div>

        {niche.scoreBreakdown.clicsCapped && (
          <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-sm text-destructive">
            ⚠️ Score limitado: menos de 10 clics por venta
          </div>
        )}
      </div>
    );
  };

  const swapNiches = () => {
    const temp = leftNicheId;
    setLeftNicheId(rightNicheId);
    setRightNicheId(temp);
  };

  if (niches.length < 2) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Columns className="h-4 w-4 mr-2" />
          Comparar lado a lado
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Columns className="h-5 w-5 text-primary" />
            Comparación lado a lado
          </DialogTitle>
        </DialogHeader>

        {/* Niche Selectors */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1">
            <label className="text-sm text-muted-foreground mb-1 block">Nicho A</label>
            <Select value={leftNicheId || ''} onValueChange={setLeftNicheId}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar nicho..." />
              </SelectTrigger>
              <SelectContent>
                {niches.filter(n => n.id !== rightNicheId).map(n => (
                  <SelectItem key={n.id} value={n.id}>
                    {n.name} ({n.scoreBreakdown.totalScore}/100)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button 
            size="icon" 
            variant="ghost" 
            onClick={swapNiches}
            disabled={!leftNicheId || !rightNicheId}
            className="mt-5"
          >
            <ArrowLeft className="h-4 w-4" />
            <ArrowRight className="h-4 w-4" />
          </Button>

          <div className="flex-1">
            <label className="text-sm text-muted-foreground mb-1 block">Nicho B</label>
            <Select value={rightNicheId || ''} onValueChange={setRightNicheId}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar nicho..." />
              </SelectTrigger>
              <SelectContent>
                {niches.filter(n => n.id !== leftNicheId).map(n => (
                  <SelectItem key={n.id} value={n.id}>
                    {n.name} ({n.scoreBreakdown.totalScore}/100)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Comparison View */}
        <ScrollArea className="h-[60vh]">
          <div className="flex gap-6">
            {renderNicheColumn(leftNiche, 'left')}
            <div className="w-px bg-border shrink-0" />
            {renderNicheColumn(rightNiche, 'right')}
          </div>
        </ScrollArea>

        {/* Legend */}
        {leftNiche && rightNiche && (
          <div className="flex items-center justify-center gap-6 pt-4 border-t text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-success/20" />
              <span>Mejor valor</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-destructive/10" />
              <span>Peor valor</span>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
