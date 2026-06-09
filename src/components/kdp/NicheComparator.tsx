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
  TableRow,
} from '@/components/ui/table';
import {
  LayoutGrid,
  Plus,
  Trash2,
  Download,
  ArrowUpDown,
  Star,
  Filter,
  X,
} from 'lucide-react';
import { NicheSideBySide } from './NicheSideBySide';
import { NicheRadarChart } from './NicheRadarChart';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
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
  onLoadNiche: (niche: SavedNiche) => void;
  onStartNew: () => void;
  bestNiche: SavedNiche | null;
  hasCurrentData: boolean;
  loadedNicheId: string | null;
  embedded?: boolean;
}

type SortField = 'name' | 'score' | 'clics' | 'bacos' | 'inversion';
type SortDirection = 'asc' | 'desc';
type FilterType = 'all' | 'viable' | 'score70';

export const NicheComparator = ({
  niches,
  onSaveNiche,
  onDeleteNiche,
  onClearAll,
  onLoadNiche,
  onStartNew,
  bestNiche,
  hasCurrentData,
  loadedNicheId,
  embedded = false,
}: NicheComparatorProps) => {
  const [newNicheName, setNewNicheName] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [sortField, setSortField] = useState<SortField>('score');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [filter, setFilter] = useState<FilterType>('all');

  const handleSave = () => {
    if (!newNicheName.trim()) {
      toast.error('Introduce un nombre para el análisis');
      return;
    }
    onSaveNiche(newNicheName.trim());
    setNewNicheName('');
    setIsDialogOpen(false);
    toast.success('Análisis guardado correctamente');
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
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
      case 'bacos':
        aVal = a.bacos;
        bVal = b.bacos;
        break;
      case 'inversion':
        aVal = a.inversionDiaria;
        bVal = b.inversionDiaria;
        break;
    }
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    return sortDirection === 'asc'
      ? (aVal as number) - (bVal as number)
      : (bVal as number) - (aVal as number);
  });

  const handleExportCSV = () => {
    if (niches.length === 0) {
      toast.error('No hay análisis para exportar');
      return;
    }
    const headers = ['Nombre', 'Marketplace', 'Formato', 'Precio', 'Coste por clic', 'Ventas/día', 'Clics máximos', 'BACOS', 'Inversión', 'Score', 'Estado'];
    const rows = niches.map(n => {
      const config = n.globalData.marketplace ? MARKETPLACE_CONFIGS[n.globalData.marketplace] : null;
      return [
        n.name,
        config?.name || 'N/A',
        n.globalData.selectedFormat === 'EBOOK' ? 'eBook' : 'Formato impreso',
        n.pvp.toFixed(2),
        n.globalData.cpc?.toFixed(2) || '0',
        n.globalData.ventasDiariasCompetencia || '0',
        n.clicsMaxPorVenta,
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
    link.download = `analisis-kdp-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exportado correctamente');
  };

  const statusDot = (status: string) =>
    status === 'excellent' || status === 'viable'
      ? status === 'excellent'
        ? 'bg-success'
        : 'bg-warning'
      : 'bg-destructive';

  const mainContent = (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
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
                <DialogTitle>Guardar análisis</DialogTitle>
                <DialogDescription>
                  Crea una nueva entrada en tus análisis guardados.
                </DialogDescription>
              </DialogHeader>
              <Input
                placeholder="Nombre del análisis (ej: 'Cuadernos yoga ES')"
                value={newNicheName}
                onChange={e => setNewNicheName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSave()}
              />
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                <Button onClick={handleSave}>Guardar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {niches.length > 0 && (
            <>
              <NicheSideBySide niches={niches} />
              {niches.length >= 2 && <NicheRadarChart niches={niches} />}
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

      {loadedNicheId && (
        <div className="p-2 bg-muted/40 border border-border rounded-lg text-sm flex items-center justify-between">
          <span className="text-muted-foreground">
            Editando: <span className="font-medium text-foreground">{niches.find(n => n.id === loadedNicheId)?.name}</span>
          </span>
          <Button size="sm" variant="outline" onClick={onStartNew} className="h-7 text-xs">
            <Plus className="h-3 w-3 mr-1" />
            Nuevo análisis
          </Button>
        </div>
      )}

      {niches.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40 bg-muted/30 rounded-lg text-center p-6">
          <LayoutGrid className="h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">
            Aún no has guardado ningún análisis.
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Completa un análisis y pulsa "Guardar análisis actual" para empezar a comparar.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {bestNiche && niches.length > 1 && (
            <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/30">
              <Star className="h-4 w-4 text-success shrink-0" />
              <p className="text-sm text-foreground">
                Mejor análisis: <span className="font-semibold">"{bestNiche.name}"</span> (Score: {bestNiche.scoreBreakdown.totalScore}/100).
              </p>
            </div>
          )}

          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={filter} onValueChange={v => setFilter(v as FilterType)}>
                <SelectTrigger className="w-[200px] h-8">
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

          <div className="rounded-lg border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead className="cursor-pointer" onClick={() => handleSort('name')}>
                      <span className="flex items-center gap-1">Nombre <ArrowUpDown className="h-3 w-3" /></span>
                    </TableHead>
                    <TableHead>Marketplace</TableHead>
                    <TableHead>Formato</TableHead>
                    <TableHead className="text-right">Precio</TableHead>
                    <TableHead className="text-right cursor-pointer" onClick={() => handleSort('clics')}>
                      <span className="flex items-center justify-end gap-1">Clics máx. <ArrowUpDown className="h-3 w-3" /></span>
                    </TableHead>
                    <TableHead className="text-right cursor-pointer" onClick={() => handleSort('bacos')}>
                      <span className="flex items-center justify-end gap-1">BACOS <ArrowUpDown className="h-3 w-3" /></span>
                    </TableHead>
                    <TableHead className="text-center cursor-pointer" onClick={() => handleSort('score')}>
                      <span className="flex items-center justify-center gap-1">Score <ArrowUpDown className="h-3 w-3" /></span>
                    </TableHead>
                    <TableHead className="text-center">Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedNiches.map(niche => {
                    const config = niche.globalData.marketplace ? MARKETPLACE_CONFIGS[niche.globalData.marketplace] : null;
                    const isBest = bestNiche?.id === niche.id && niches.length > 1;
                    const isLoaded = loadedNicheId === niche.id;
                    return (
                      <TableRow key={niche.id} className={isLoaded ? 'bg-primary/5 border-l-2 border-l-primary' : ''}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {isBest && <Star className="h-4 w-4 text-success" />}
                            <span>{niche.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{config?.name || 'N/A'}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {niche.globalData.selectedFormat === 'EBOOK' ? 'eBook' : 'Formato impreso'}
                        </TableCell>
                        <TableCell className="text-right">
                          {niche.pvp.toFixed(2)}{config?.currencySymbol || '€'}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {niche.clicsMaxPorVenta}
                        </TableCell>
                        <TableCell className="text-right">{niche.bacos.toFixed(1)}%</TableCell>
                        <TableCell className="text-center font-bold">
                          {niche.scoreBreakdown.totalScore}
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="inline-flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${statusDot(niche.scoreBreakdown.status)}`} />
                            <span className="text-xs text-muted-foreground">{niche.scoreBreakdown.statusLabel}</span>
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-1">
                            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => onLoadNiche(niche)}>
                              Cargar
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => onDeleteNiche(niche.id)}
                              className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                              title="Eliminar"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
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
              No hay análisis que coincidan con el filtro seleccionado.
            </div>
          )}
        </div>
      )}
    </div>
  );

  if (embedded) return mainContent;

  return (
    <Card className="animate-fade-in">
      <CardHeader className="pb-4">
        <CardTitle className="section-header">
          <LayoutGrid className="h-5 w-5 text-primary" />
          Análisis guardados
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Guarda y compara diferentes escenarios para decidir en qué nicho empezar.
        </p>
      </CardHeader>
      <CardContent>{mainContent}</CardContent>
    </Card>
  );
};