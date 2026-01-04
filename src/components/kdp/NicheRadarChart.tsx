import { useState } from 'react';
import { SavedNiche, MARKETPLACE_CONFIGS } from '@/types/kdp';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, ResponsiveContainer, Tooltip } from 'recharts';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { BarChart3 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface NicheRadarChartProps {
  niches: SavedNiche[];
}

// Colores para cada nicho en el radar
const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--secondary))',
  'hsl(var(--success))',
  'hsl(var(--warning))',
  'hsl(var(--destructive))',
  '#8884d8',
  '#82ca9d',
  '#ffc658',
];

export const NicheRadarChart = ({ niches }: NicheRadarChartProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedNicheIds, setSelectedNicheIds] = useState<Set<string>>(new Set());

  // Cuando se abre el dialog, seleccionar todos los nichos por defecto
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open && selectedNicheIds.size === 0) {
      setSelectedNicheIds(new Set(niches.slice(0, 5).map(n => n.id)));
    }
  };

  const toggleNiche = (id: string) => {
    setSelectedNicheIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else if (next.size < 8) {
        next.add(id);
      }
      return next;
    });
  };

  const selectedNiches = niches.filter(n => selectedNicheIds.has(n.id));

  // Normalizar métricas a escala 0-100 para el radar
  const normalizeClics = (clics: number) => Math.min((clics / 30) * 100, 100);
  const normalizeBacos = (bacos: number) => Math.min(bacos, 100);
  const normalizeScore = (score: number) => score;
  const normalizeInversion = (inv: number) => Math.max(0, 100 - Math.min((inv / 100) * 100, 100)); // Invertido: menos es mejor

  // Datos para el radar
  const radarData = [
    {
      metric: 'Score Global',
      fullMark: 100,
      ...Object.fromEntries(selectedNiches.map(n => [n.id, normalizeScore(n.scoreBreakdown.totalScore)])),
    },
    {
      metric: 'Clics máx/Venta',
      fullMark: 100,
      ...Object.fromEntries(selectedNiches.map(n => [n.id, normalizeClics(n.clicsMaxPorVenta)])),
    },
    {
      metric: 'BACOS (%)',
      fullMark: 100,
      ...Object.fromEntries(selectedNiches.map(n => [n.id, normalizeBacos(n.bacos)])),
    },
    {
      metric: 'Efic. Inversión',
      fullMark: 100,
      ...Object.fromEntries(selectedNiches.map(n => [n.id, normalizeInversion(n.inversionDiaria)])),
    },
    {
      metric: 'Score Clics',
      fullMark: 100,
      ...Object.fromEntries(selectedNiches.map(n => [n.id, (n.scoreBreakdown.clicsScore / 50) * 100])),
    },
    {
      metric: 'Score PVP',
      fullMark: 100,
      ...Object.fromEntries(selectedNiches.map(n => [n.id, (n.scoreBreakdown.pvpVsMinScore / 20) * 100])),
    },
  ];

  if (niches.length < 2) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <BarChart3 className="h-4 w-4 mr-2" />
          Gráfico Radar
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Comparación Radar de Nichos
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Selector de nichos */}
          <div className="lg:col-span-1">
            <h4 className="text-sm font-semibold text-muted-foreground mb-3">
              Seleccionar nichos (máx. 8)
            </h4>
            <ScrollArea className="h-[350px] pr-4">
              <div className="space-y-2">
                {niches.map((niche, index) => {
                  const config = niche.globalData.marketplace ? MARKETPLACE_CONFIGS[niche.globalData.marketplace] : null;
                  const isSelected = selectedNicheIds.has(niche.id);
                  const colorIndex = Array.from(selectedNicheIds).indexOf(niche.id);
                  
                  return (
                    <div 
                      key={niche.id} 
                      className={`flex items-start gap-3 p-2 rounded-lg border transition-colors ${
                        isSelected ? 'border-primary/50 bg-primary/5' : 'border-border'
                      }`}
                    >
                      <Checkbox
                        id={niche.id}
                        checked={isSelected}
                        onCheckedChange={() => toggleNiche(niche.id)}
                        disabled={!isSelected && selectedNicheIds.size >= 8}
                      />
                      <div className="flex-1 min-w-0">
                        <Label 
                          htmlFor={niche.id} 
                          className="text-sm font-medium cursor-pointer flex items-center gap-2"
                        >
                          {isSelected && (
                            <span 
                              className="w-3 h-3 rounded-full shrink-0"
                              style={{ backgroundColor: COLORS[colorIndex % COLORS.length] }}
                            />
                          )}
                          <span className="truncate">{niche.name}</span>
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          {config?.name || 'N/A'} • Score: {niche.scoreBreakdown.totalScore}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </div>

          {/* Gráfico Radar */}
          <div className="lg:col-span-3">
            {selectedNiches.length >= 2 ? (
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis 
                    dataKey="metric" 
                    tick={{ fill: 'hsl(var(--foreground))', fontSize: 11 }}
                  />
                  <PolarRadiusAxis 
                    angle={30} 
                    domain={[0, 100]} 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                  />
                  {selectedNiches.map((niche, index) => (
                    <Radar
                      key={niche.id}
                      name={niche.name}
                      dataKey={niche.id}
                      stroke={COLORS[index % COLORS.length]}
                      fill={COLORS[index % COLORS.length]}
                      fillOpacity={0.15}
                      strokeWidth={2}
                    />
                  ))}
                  <Legend 
                    wrapperStyle={{ paddingTop: '20px' }}
                    formatter={(value) => (
                      <span className="text-foreground text-sm">{value}</span>
                    )}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[400px] bg-muted/30 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Selecciona al menos 2 nichos para ver el gráfico
                </p>
              </div>
            )}

            {/* Leyenda de métricas */}
            <div className="mt-4 p-4 bg-muted/30 rounded-lg">
              <h5 className="text-sm font-semibold text-foreground mb-2">Métricas del Radar</h5>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs text-muted-foreground">
                <span>• <strong>Score Global</strong>: Puntuación total (0-100)</span>
                <span>• <strong>Clics máx/Venta</strong>: Clics permitidos antes de perder</span>
                <span>• <strong>BACOS</strong>: Margen sobre PVP (%)</span>
                <span>• <strong>Efic. Inversión</strong>: Menor inversión = mejor</span>
                <span>• <strong>Score Clics</strong>: Puntuación del factor clics</span>
                <span>• <strong>Score PVP</strong>: Puntuación del factor precio</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
