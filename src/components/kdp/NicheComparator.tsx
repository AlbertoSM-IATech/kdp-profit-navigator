import { useState, useEffect } from 'react';
import { SavedNiche, NicheVersion, GlobalData, EbookData, PaperbackData, MARKETPLACE_CONFIGS } from '@/types/kdp';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
  X,
  Upload,
  History,
  RotateCcw,
  ChevronDown,
  ChevronRight,
  Save,
  Eye
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';

interface NicheComparatorProps {
  niches: SavedNiche[];
  onSaveNiche: (name: string) => void;
  onDeleteNiche: (id: string) => void;
  onClearAll: () => void;
  onLoadNiche: (niche: SavedNiche) => void;
  onUpdateNicheVersion: (
    nicheId: string,
    note?: string
  ) => void;
  onRestoreVersion: (nicheId: string, versionId: string) => void;
  bestNiche: SavedNiche | null;
  hasCurrentData: boolean;
  loadedNicheId: string | null;
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
  onUpdateNicheVersion,
  onRestoreVersion,
  bestNiche,
  hasCurrentData,
  loadedNicheId,
}: NicheComparatorProps) => {
  const [newNicheName, setNewNicheName] = useState('');
  const [versionNote, setVersionNote] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isVersionDialogOpen, setIsVersionDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [selectedNicheForHistory, setSelectedNicheForHistory] = useState<SavedNiche | null>(null);
  const [sortField, setSortField] = useState<SortField>('score');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [filter, setFilter] = useState<FilterType>('all');
  const [expandedNiches, setExpandedNiches] = useState<Set<string>>(new Set());

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

  const handleSaveVersion = () => {
    if (loadedNicheId) {
      onUpdateNicheVersion(loadedNicheId, versionNote.trim() || undefined);
      setVersionNote('');
      setIsVersionDialogOpen(false);
      toast.success('Nueva versión guardada');
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedNiches(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const openHistoryDialog = (niche: SavedNiche) => {
    setSelectedNicheForHistory(niche);
    setIsHistoryDialogOpen(true);
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
    return sortDirection === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
  });

  const handleExportCSV = () => {
    if (niches.length === 0) {
      toast.error('No hay nichos para exportar');
      return;
    }

    const headers = ['Nombre', 'Marketplace', 'Formato', 'PVP', 'CPC', 'Ventas/día', 'Clics máx.', 'BACOS', 'Inversión', 'Score', 'Estado'];
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
    link.download = `nichos-kdp-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exportado correctamente');
  };

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

  return (
    <Card className="animate-fade-in">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <CardTitle className="section-header">
            <LayoutGrid className="h-5 w-5 text-primary" />
            Comparador de Nichos
          </CardTitle>
          <div className="flex gap-2 flex-wrap">
            {/* Save as New Niche */}
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

            {/* Save Version (if a niche is loaded) */}
            {loadedNicheId && (
              <Dialog open={isVersionDialogOpen} onOpenChange={setIsVersionDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="secondary" disabled={!hasCurrentData}>
                    <Save className="h-4 w-4 mr-2" />
                    Guardar versión
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Guardar nueva versión</DialogTitle>
                    <DialogDescription>
                      Guarda los cambios actuales como nueva versión del nicho cargado.
                    </DialogDescription>
                  </DialogHeader>
                  <Textarea
                    placeholder="Nota opcional (ej: 'Probado con PVP más alto')"
                    value={versionNote}
                    onChange={(e) => setVersionNote(e.target.value)}
                    rows={3}
                  />
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsVersionDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleSaveVersion}>Guardar versión</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
            
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
        {loadedNicheId && (
          <div className="mt-2 p-2 bg-primary/10 border border-primary/30 rounded-lg text-sm">
            <span className="text-primary font-medium">
              📝 Editando: {niches.find(n => n.id === loadedNicheId)?.name}
            </span>
          </div>
        )}
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
                      <TableHead className="w-8"></TableHead>
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
                        onClick={() => handleSort('bacos')}
                      >
                        <span className="flex items-center justify-end gap-1">
                          BACOS
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
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedNiches.map((niche) => {
                      const config = niche.globalData.marketplace ? MARKETPLACE_CONFIGS[niche.globalData.marketplace] : null;
                      const isBest = bestNiche?.id === niche.id && niches.length > 1;
                      const isLoaded = loadedNicheId === niche.id;
                      const hasVersions = (niche.versions?.length || 0) > 1;
                      
                      return (
                        <TableRow 
                          key={niche.id} 
                          className={`${isBest ? 'bg-success/5' : ''} ${isLoaded ? 'bg-primary/5 border-l-2 border-l-primary' : ''}`}
                        >
                          <TableCell className="w-8">
                            {hasVersions && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => toggleExpand(niche.id)}
                                className="h-6 w-6 p-0"
                              >
                                {expandedNiches.has(niche.id) ? 
                                  <ChevronDown className="h-4 w-4" /> : 
                                  <ChevronRight className="h-4 w-4" />
                                }
                              </Button>
                            )}
                          </TableCell>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              {isBest && <Star className="h-4 w-4 text-success" />}
                              {isLoaded && <span className="text-primary">✏️</span>}
                              {niche.name}
                              {hasVersions && (
                                <span className="text-xs bg-muted px-1.5 py-0.5 rounded">
                                  v{niche.versions?.length || 1}
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {config?.name || 'N/A'}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {niche.globalData.selectedFormat === 'EBOOK' ? 'eBook' : 'Formato impreso'}
                          </TableCell>
                          <TableCell className="text-right">
                            {niche.pvp.toFixed(2)}{config?.currencySymbol || '€'}
                          </TableCell>
                          <TableCell className={`text-right font-semibold ${getClicksColor(niche.clicsMaxPorVenta)}`}>
                            {niche.clicsMaxPorVenta}
                          </TableCell>
                          <TableCell className="text-right">
                            {niche.bacos.toFixed(1)}%
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
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => onLoadNiche(niche)}
                                className="h-8 w-8 p-0 text-muted-foreground hover:text-primary"
                                title="Cargar para editar"
                              >
                                <Upload className="h-4 w-4" />
                              </Button>
                              {hasVersions && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => openHistoryDialog(niche)}
                                  className="h-8 w-8 p-0 text-muted-foreground hover:text-secondary"
                                  title="Ver historial"
                                >
                                  <History className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => onDeleteNiche(niche.id)}
                                className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                                title="Eliminar"
                              >
                                <Trash2 className="h-4 w-4" />
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
                No hay nichos que coincidan con el filtro seleccionado.
              </div>
            )}

            {/* History explanation */}
            <div className="bg-muted/30 rounded-lg p-4 text-sm text-muted-foreground">
              <p className="flex items-center gap-2">
                <History className="h-4 w-4" />
                Este historial te permite ver cómo evoluciona la viabilidad de un nicho a medida que ajustas precio, costes o mercado.
              </p>
            </div>
          </div>
        )}
      </CardContent>

      {/* Version History Dialog */}
      <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Historial de versiones: {selectedNicheForHistory?.name}
            </DialogTitle>
            <DialogDescription>
              Compara y restaura versiones anteriores de este nicho.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-96">
            <div className="space-y-3">
              {selectedNicheForHistory?.versions?.map((version, index) => (
                <div 
                  key={version.id} 
                  className={`p-4 rounded-lg border ${
                    index === (selectedNicheForHistory.versions?.length || 0) - 1 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border bg-muted/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium">
                          Versión {index + 1}
                        </span>
                        {index === (selectedNicheForHistory.versions?.length || 0) - 1 && (
                          <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">
                            Actual
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {version.createdAt.toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      {version.note && (
                        <p className="text-sm text-muted-foreground mb-2 italic">
                          "{version.note}"
                        </p>
                      )}
                      <div className="grid grid-cols-4 gap-3 text-sm">
                        <div>
                          <span className="text-muted-foreground block text-xs">Score</span>
                          <span className={`font-bold ${getScoreColor(version.scoreBreakdown.totalScore)}`}>
                            {version.scoreBreakdown.totalScore}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block text-xs">Clics</span>
                          <span className={`font-semibold ${getClicksColor(version.clicsMaxPorVenta)}`}>
                            {version.clicsMaxPorVenta}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block text-xs">BACOS</span>
                          <span className="font-semibold">{version.bacos.toFixed(1)}%</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block text-xs">PVP</span>
                          <span className="font-semibold">{version.pvp.toFixed(2)}€</span>
                        </div>
                      </div>
                    </div>
                    {index !== (selectedNicheForHistory.versions?.length || 0) - 1 && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          onRestoreVersion(selectedNicheForHistory.id, version.id);
                          setIsHistoryDialogOpen(false);
                          toast.success('Versión restaurada');
                        }}
                      >
                        <RotateCcw className="h-4 w-4 mr-1" />
                        Restaurar
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsHistoryDialogOpen(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
