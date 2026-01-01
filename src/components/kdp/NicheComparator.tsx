import { useState } from 'react';
import { SavedNiche, MARKETPLACE_CONFIGS } from '@/types/kdp';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  LayoutGrid, 
  Plus, 
  Trash2, 
  Download, 
  ArrowUpDown, 
  Star,
  Filter,
  X
} from 'lucide-react';
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface NicheComparatorProps {
  niches: SavedNiche[];
  onSaveNiche: (name: string) => void;
  onDeleteNiche: (id: string) => void;
  onClearAll: () => void;
  bestNiche: SavedNiche | null;
  hasCurrentData: boolean;
}

type SortField = 'name' | 'score' | 'clics' | 'margen' | 'inversion';
type SortDirection = 'asc' | 'desc';
type FilterType = 'all' | 'viable' | 'score70';

export const NicheComparator = ({
  niches,
  onSaveNiche,
  onDeleteNiche,
  onClearAll,
  bestNiche,
  hasCurrentData,
}: NicheComparatorProps) => {
  const [newNicheName, setNewNicheName] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [sortField, setSortField] = useState<SortField>('score');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [filter, setFilter] = useState<FilterType>('all');

  const handleSave = () => {
    if (!newNicheName.trim()) {
      toast.error('Introduce un nombre para el nicho');
      return;
    }
    onSaveNiche(newNicheName.trim());
    setNewNicheName('');
    setIsDialogOpen(false);
    toast.success('Nicho guardado correctamente');
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const filteredNiches = niches.filter(n => {
    if (filter === 'viable') return n.scoreBreakdown.status !== 'not-recommended';
    if (filter === 'score70') return n.scoreBreakdown.totalScore >= 70;
    return true;
  });

  const sortedNiches = [...filteredNiches].sort((a, b) => {
    let aVal: number | string = 0;
    let bVal: number | string = 0;

    switch (sortField) {
      case 'name':
        aVal = a.name.toLowerCase();
        bVal = b.name.toLowerCase();
        break;
      case 'score':
        aVal = a.scoreBreakdown.totalScore;
        bVal = b.scoreBreakdown.totalScore;
        break;
      case 'clics':
        aVal = a.clicsMaxPorVenta;
        bVal = b.clicsMaxPorVenta;
        break;
      case 'margen':
        aVal = a.margenPct;
        bVal = b.margenPct;
        break;
      case 'inversion':
        aVal = a.inversionDiaria;
        bVal = b.inversionDiaria;
        break;
    }

    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    return sortDirection === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
  });

  const handleExportCSV = () => {
    if (niches.length === 0) {
      toast.error('No hay nichos para exportar');
      return;
    }

    const headers = ['Nombre', 'Marketplace', 'Formato', 'PVP', 'CPC', 'Ventas/día', 'Clics máx.', 'Margen', 'BACOS', 'Inversión', 'Score', 'Estado'];
    const rows = niches.map(n => {
      const config = n.globalData.marketplace ? MARKETPLACE_CONFIGS[n.globalData.marketplace] : null;
      return [
        n.name,
        config?.name || 'N/A',
        n.globalData.selectedFormat || 'N/A',
        n.pvp.toFixed(2),
        n.globalData.cpc?.toFixed(2) || '0',
        n.globalData.ventasDiariasCompetencia || '0',
        n.clicsMaxPorVenta,
        n.margenPct.toFixed(1) + '%',
        n.bacos.toFixed(1) + '%',
        n.inversionDiaria.toFixed(2),
        n.scoreBreakdown.totalScore,
        n.scoreBreakdown.statusLabel,
      ];
    });

    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nichos-kdp-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exportado correctamente');
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    if (score >= 40) return 'text-orange-500';
    return 'text-destructive';
  };

  const getClicksColor = (clicks: number) => {
    if (clicks >= 13) return 'text-success';
    if (clicks >= 10) return 'text-warning';
    return 'text-destructive';
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <CardTitle className="section-header">
            <LayoutGrid className="h-5 w-5 text-primary" />
            Comparador de Nichos
          </CardTitle>
          <div className="flex gap-2 flex-wrap">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" disabled={!hasCurrentData}>
                  <Plus className="h-4 w-4 mr-2" />
                  Guardar análisis actual
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Guardar como nicho</DialogTitle>
                  <DialogDescription>
                    Guarda el análisis actual para compararlo con otros escenarios.
                  </DialogDescription>
                </DialogHeader>
                <Input
                  placeholder="Nombre del nicho (ej: 'Cuadernos yoga ES')"
                  value={newNicheName}
                  onChange={(e) => setNewNicheName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                />
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSave}>Guardar</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            {niches.length > 0 && (
              <>
                <Button size="sm" variant="outline" onClick={handleExportCSV}>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
                <Button size="sm" variant="ghost" onClick={onClearAll} className="text-destructive hover:text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Limpiar todo
                </Button>
              </>
            )}
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Guarda y compara diferentes escenarios para decidir en qué nicho empezar.
        </p>
      </CardHeader>
      <CardContent>
        {niches.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 bg-muted/30 rounded-lg text-center p-4">
            <LayoutGrid className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              Aún no has guardado ningún nicho.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Completa un análisis y pulsa "Guardar análisis actual" para empezar a comparar.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Best niche recommendation */}
            {bestNiche && niches.length > 1 && (
              <div className="flex items-center gap-3 p-4 bg-success/10 border border-success/30 rounded-lg">
                <Star className="h-5 w-5 text-success shrink-0" />
                <p className="text-sm text-foreground">
                  Según los datos actuales, el nicho <span className="font-bold text-success">"{bestNiche.name}"</span> presenta 
                  el mejor equilibrio entre margen, Ads y riesgo (Score: {bestNiche.scoreBreakdown.totalScore}/100).
                </p>
              </div>
            )}

            {/* Filters */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={filter} onValueChange={(v) => setFilter(v as FilterType)}>
                  <SelectTrigger className="w-[180px] h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos ({niches.length})</SelectItem>
                    <SelectItem value="viable">
                      Solo viables ({niches.filter(n => n.scoreBreakdown.status !== 'not-recommended').length})
                    </SelectItem>
                    <SelectItem value="score70">
                      Score &gt; 70 ({niches.filter(n => n.scoreBreakdown.totalScore >= 70).length})
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {filter !== 'all' && (
                <Button size="sm" variant="ghost" onClick={() => setFilter('all')} className="h-8">
                  <X className="h-3 w-3 mr-1" />
                  Quitar filtro
                </Button>
              )}
            </div>

            {/* Table */}
            <div className="rounded-lg border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead 
                        className="cursor-pointer hover:bg-muted/70"
                        onClick={() => handleSort('name')}
                      >
                        <span className="flex items-center gap-1">
                          Nicho
                          <ArrowUpDown className="h-3 w-3" />
                        </span>
                      </TableHead>
                      <TableHead>Marketplace</TableHead>
                      <TableHead>Formato</TableHead>
                      <TableHead className="text-right">PVP</TableHead>
                      <TableHead className="text-right">CPC</TableHead>
                      <TableHead 
                        className="text-right cursor-pointer hover:bg-muted/70"
                        onClick={() => handleSort('clics')}
                      >
                        <span className="flex items-center justify-end gap-1">
                          Clics máx.
                          <ArrowUpDown className="h-3 w-3" />
                        </span>
                      </TableHead>
                      <TableHead 
                        className="text-right cursor-pointer hover:bg-muted/70"
                        onClick={() => handleSort('margen')}
                      >
                        <span className="flex items-center justify-end gap-1">
                          Margen
                          <ArrowUpDown className="h-3 w-3" />
                        </span>
                      </TableHead>
                      <TableHead 
                        className="text-right cursor-pointer hover:bg-muted/70"
                        onClick={() => handleSort('inversion')}
                      >
                        <span className="flex items-center justify-end gap-1">
                          Inversión/día
                          <ArrowUpDown className="h-3 w-3" />
                        </span>
                      </TableHead>
                      <TableHead 
                        className="text-center cursor-pointer hover:bg-muted/70"
                        onClick={() => handleSort('score')}
                      >
                        <span className="flex items-center justify-center gap-1">
                          Score
                          <ArrowUpDown className="h-3 w-3" />
                        </span>
                      </TableHead>
                      <TableHead className="text-center">Estado</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedNiches.map((niche) => {
                      const config = niche.globalData.marketplace ? MARKETPLACE_CONFIGS[niche.globalData.marketplace] : null;
                      const isBest = bestNiche?.id === niche.id && niches.length > 1;
                      
                      return (
                        <TableRow 
                          key={niche.id} 
                          className={isBest ? 'bg-success/5' : ''}
                        >
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              {isBest && <Star className="h-4 w-4 text-success" />}
                              {niche.name}
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {config?.name || 'N/A'}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {niche.globalData.selectedFormat || 'N/A'}
                          </TableCell>
                          <TableCell className="text-right">
                            {niche.pvp.toFixed(2)}{config?.currencySymbol || '€'}
                          </TableCell>
                          <TableCell className="text-right text-muted-foreground">
                            {niche.globalData.cpc?.toFixed(2) || '0'}{config?.currencySymbol || '€'}
                          </TableCell>
                          <TableCell className={`text-right font-semibold ${getClicksColor(niche.clicsMaxPorVenta)}`}>
                            {niche.clicsMaxPorVenta}
                          </TableCell>
                          <TableCell className="text-right">
                            {niche.margenPct.toFixed(1)}%
                          </TableCell>
                          <TableCell className="text-right text-muted-foreground">
                            {niche.inversionDiaria.toFixed(2)}{config?.currencySymbol || '€'}
                          </TableCell>
                          <TableCell className="text-center">
                            <span className={`font-bold ${getScoreColor(niche.scoreBreakdown.totalScore)}`}>
                              {niche.scoreBreakdown.totalScore}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <span title={niche.scoreBreakdown.statusLabel}>
                              {niche.scoreBreakdown.statusEmoji}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => onDeleteNiche(niche.id)}
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>

            {filteredNiches.length === 0 && (
              <div className="text-center py-4 text-sm text-muted-foreground">
                No hay nichos que coincidan con el filtro seleccionado.
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
