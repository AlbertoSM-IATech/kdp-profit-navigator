import { useState, useCallback } from 'react';
import { useKdpCalculator } from '@/hooks/useKdpCalculator';
import { useScoring } from '@/hooks/useScoring';
import { useNicheComparator } from '@/hooks/useNicheComparator';
import { useCollapsibleSections } from '@/hooks/useCollapsibleSections';
import { GlobalDataSection } from '@/components/kdp/GlobalDataSection';
import { EbookSection } from '@/components/kdp/EbookSection';
import { PaperbackSection } from '@/components/kdp/PaperbackSection';
import { PositioningSection } from '@/components/kdp/PositioningSection';
import { ResultsTable } from '@/components/kdp/ResultsTable';
import { PaperbackSimulator } from '@/components/kdp/PaperbackSimulator';
import { ScoreDisplay } from '@/components/kdp/ScoreDisplay';
import { NicheComparator } from '@/components/kdp/NicheComparator';
import { PrintingCostsTable } from '@/components/kdp/PrintingCostsTable';
import { BreakevenAlert } from '@/components/kdp/BreakevenAlert';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calculator, Eye, EyeOff, ChevronDown, ChevronUp, Save, FileText, Download, BarChart3, Table2, Plus } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { SavedNiche } from '@/types/kdp';
import { toast } from 'sonner';
const Index = () => {
  const {
    globalData,
    setGlobalData,
    ebookData,
    setEbookData,
    ebookResults,
    paperbackData,
    setPaperbackData,
    paperbackResults,
    positioningResults,
    tableData
  } = useKdpCalculator();
  const [loadedNicheId, setLoadedNicheId] = useState<string | null>(null);
  const [quickViewMode, setQuickViewMode] = useState(false);
  const showPhysicalFormat = globalData.selectedFormat === 'PAPERBACK';
  const activeResults = globalData.selectedFormat === 'EBOOK' ? ebookResults : paperbackResults;
  const inversionDiaria = positioningResults?.inversionDiaria || 0;

  // Calculate global score (v4)
  const scoreBreakdown = useScoring(globalData, ebookResults, paperbackResults, ebookData.pvp, paperbackData.pvp);

  // Niche comparator
  const {
    niches,
    saveCurrentAsNiche,
    deleteNiche,
    updateNicheWithNewVersion,
    loadNicheData,
    restoreVersion,
    clearAllNiches,
    getBestNiche
  } = useNicheComparator();

  // Collapsible sections
  const {
    isCollapsed,
    toggleSection,
    expandAll,
    collapseAll
  } = useCollapsibleSections();
  const handleSaveNiche = (name: string) => {
    const saved = saveCurrentAsNiche(name, globalData, globalData.selectedFormat === 'EBOOK' ? ebookData : null, showPhysicalFormat ? paperbackData : null, ebookResults, paperbackResults, inversionDiaria);
    setLoadedNicheId(saved.id);
  };
  const handleLoadNiche = useCallback((niche: SavedNiche) => {
    // Load all data from the niche
    setGlobalData(niche.globalData);
    if (niche.ebookData) {
      setEbookData(niche.ebookData);
    }
    if (niche.paperbackData) {
      setPaperbackData(niche.paperbackData);
    }
    setLoadedNicheId(niche.id);
    toast.success(`Nicho "${niche.name}" cargado para editar`);
  }, [setGlobalData, setEbookData, setPaperbackData]);
  const handleUpdateNicheVersion = useCallback((nicheId: string, note?: string) => {
    updateNicheWithNewVersion(nicheId, globalData, globalData.selectedFormat === 'EBOOK' ? ebookData : null, showPhysicalFormat ? paperbackData : null, ebookResults, paperbackResults, inversionDiaria, note);
  }, [globalData, ebookData, paperbackData, ebookResults, paperbackResults, inversionDiaria, showPhysicalFormat, updateNicheWithNewVersion]);
  const handleRestoreVersion = useCallback((nicheId: string, versionId: string) => {
    const restored = restoreVersion(nicheId, versionId);
    if (restored) {
      handleLoadNiche(restored);
    }
  }, [restoreVersion, handleLoadNiche]);
  const handleStartNew = useCallback(() => {
    setGlobalData({
      marketplace: null,
      margenObjetivoPct: null,
      cpc: null,
      ventasDiariasCompetencia: null,
      selectedFormat: null
    });
    setEbookData({
      pvp: null,
      royaltyRate: 70,
      tamanoMb: null,
      ivaType: 4
    });
    setPaperbackData({
      interior: null,
      size: null,
      pages: null,
      pvp: null,
      ivaType: 4,
      bookFormat: 'PAPERBACK'
    });
    setLoadedNicheId(null);
    toast.success('Formulario limpio para nuevo análisis');
  }, [setGlobalData, setEbookData, setPaperbackData]);
  const hasCurrentData = !!(activeResults && globalData.marketplace);
  return <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="w-[90%] max-w-[1800px] mx-auto py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Calculator className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-heading font-bold text-foreground">Calculadora de Viabilidad | Optimización</h1>
                <p className="text-sm text-muted-foreground">
                  Análisis profesional de rentabilidad para publishers
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Micro-badges for quick score visualization with tooltips */}
              {hasCurrentData && scoreBreakdown && activeResults && <TooltipProvider>
                  <div className="hidden lg:flex items-center gap-2 mr-4 px-3 py-1.5 bg-muted/50 rounded-lg border">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-1.5 cursor-help">
                          <span className="text-xs text-muted-foreground">Clics</span>
                          <span className={`text-sm font-bold ${activeResults.clicsMaxPorVenta >= 14 ? 'text-success' : activeResults.clicsMaxPorVenta >= 11 ? 'text-warning' : 'text-destructive'}`}>
                            {activeResults.clicsMaxPorVenta >= 14 ? '🟢' : activeResults.clicsMaxPorVenta >= 11 ? '🟡' : '🔴'}
                          </span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="text-xs">
                        <p><strong>Clics máx./Venta:</strong> {activeResults.clicsMaxPorVenta}</p>
                        <p className="text-muted-foreground">≥14 óptimo | 11-13 viable | &lt;11 riesgo</p>
                      </TooltipContent>
                    </Tooltip>
                    <div className="w-px h-4 bg-border" />
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-1.5 cursor-help">
                          <span className="text-xs text-muted-foreground">BACOS</span>
                          <span className={`text-sm font-bold ${activeResults.margenPct >= 40 ? 'text-success' : activeResults.margenPct >= 30 ? 'text-warning' : 'text-destructive'}`}>
                            {activeResults.margenPct >= 40 ? '🟢' : activeResults.margenPct >= 30 ? '🟡' : '🔴'}
                          </span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="text-xs">
                        <p><strong>Margen BACOS:</strong> {activeResults.margenPct.toFixed(1)}%</p>
                        <p className="text-muted-foreground">≥40% óptimo | 30-39% viable | &lt;30% riesgo</p>
                      </TooltipContent>
                    </Tooltip>
                    <div className="w-px h-4 bg-border" />
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-1.5 cursor-help">
                          <span className="text-sm font-bold" style={{
                        color: scoreBreakdown.statusColor
                      }}>
                            {scoreBreakdown.totalScore}
                          </span>
                          <span>{scoreBreakdown.statusEmoji}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="text-xs">
                        <p><strong>Score Global:</strong> {scoreBreakdown.totalScore}/100</p>
                        <p className="text-muted-foreground">{scoreBreakdown.statusLabel}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </TooltipProvider>}
              <Button variant="outline" size="sm" onClick={() => setQuickViewMode(!quickViewMode)} className="hidden md:flex">
                {quickViewMode ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                {quickViewMode ? 'Vista completa' : 'Vista rápida'}
              </Button>
              <Button variant="ghost" size="sm" onClick={collapseAll} className="hidden md:flex">
                <ChevronUp className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={expandAll} className="hidden md:flex">
                <ChevronDown className="h-4 w-4" />
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-[90%] max-w-[1800px] mx-auto py-8 space-y-6">
        {/* Action Buttons - Top of page */}
        <div className="flex justify-end gap-2">
          {/* Saved Analyses Button */}
          {niches.length > 0 && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Save className="h-4 w-4 mr-2" />
                  Análisis guardados
                  <span className="ml-2 inline-flex items-center justify-center h-5 min-w-5 px-1.5 text-xs font-semibold rounded-full bg-primary/10 text-primary">
                    {niches.length}
                  </span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-6xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Save className="h-5 w-5 text-primary" />
                    Análisis guardados
                  </DialogTitle>
                  <p className="text-sm text-muted-foreground">
                    Carga, compara o gestiona tus análisis guardados anteriormente.
                  </p>
                </DialogHeader>
                <NicheComparator 
                  niches={niches} 
                  onSaveNiche={handleSaveNiche} 
                  onDeleteNiche={deleteNiche} 
                  onClearAll={clearAllNiches} 
                  onLoadNiche={handleLoadNiche} 
                  onUpdateNicheVersion={handleUpdateNicheVersion} 
                  onRestoreVersion={handleRestoreVersion} 
                  onStartNew={handleStartNew} 
                  bestNiche={getBestNiche()} 
                  hasCurrentData={hasCurrentData} 
                  loadedNicheId={loadedNicheId} 
                  embedded 
                />
              </DialogContent>
            </Dialog>
          )}
          
          {/* Printing Costs Table Button */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Table2 className="h-4 w-4 mr-2" />
                Ver Tabla de Costes KDP
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Table2 className="h-5 w-5 text-primary" />
                  Costes de Impresión KDP - Todos los Marketplaces
                </DialogTitle>
                <p className="text-sm text-muted-foreground">
                  Referencia oficial de costes según tipo de interior, tamaño y rango de páginas.
                </p>
              </DialogHeader>
              <PrintingCostsTable embedded />
            </DialogContent>
          </Dialog>
        </div>
        {/* Quick View Mode */}
        {quickViewMode && hasCurrentData && scoreBreakdown && <div className="space-y-4">
            <ScoreDisplay score={scoreBreakdown} compact={true} />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-card rounded-lg border">
              <div className="text-center">
                <span className="text-xs text-muted-foreground block">Clics máx./Venta</span>
                <span className={`text-2xl font-bold ${activeResults?.clicsMaxPorVenta >= 13 ? 'text-success' : activeResults?.clicsMaxPorVenta >= 11 ? 'text-warning' : 'text-destructive'}`}>
                  {activeResults?.clicsMaxPorVenta || 0}
                </span>
              </div>
              <div className="text-center">
                <span className="text-xs text-muted-foreground block">BACOS</span>
                <span className="text-2xl font-bold text-primary">{activeResults?.margenPct.toFixed(1)}%</span>
              </div>
              <div className="text-center">
                <span className="text-xs text-muted-foreground block">Regalía</span>
                <span className="text-2xl font-bold">{activeResults?.regalias.toFixed(2)}€</span>
              </div>
              <div className="text-center">
                <span className="text-xs text-muted-foreground block">Recomendación</span>
                <span className="text-lg font-semibold">{scoreBreakdown.statusEmoji} {scoreBreakdown.status === 'excellent' ? 'Publicar' : scoreBreakdown.status === 'viable' ? 'Ajustar' : 'Descartar'}</span>
              </div>
            </div>
            <Button variant="outline" className="w-full" onClick={() => setQuickViewMode(false)}>
              Ver análisis completo
            </Button>
          </div>}

        {/* Full View */}
        {!quickViewMode && <>
            <GlobalDataSection data={globalData} onChange={setGlobalData} />

            {/* Loaded Niche Indicator - After GlobalDataSection */}
            {loadedNicheId && (
              <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg text-sm flex items-center justify-between">
                <span className="text-muted-foreground">
                  Editando: <span className="font-medium text-foreground">{niches.find(n => n.id === loadedNicheId)?.name}</span>
                </span>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={handleStartNew}
                  className="h-7 text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Nuevo análisis
                </Button>
              </div>
            )}

            {globalData.selectedFormat === 'EBOOK' && globalData.marketplace && <EbookSection data={ebookData} results={ebookResults} globalData={globalData} onChange={setEbookData} />}

            {showPhysicalFormat && globalData.marketplace && <>
                {/* Breakeven Alert */}
                <BreakevenAlert globalData={globalData} paperbackData={paperbackData} />
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <PaperbackSection data={paperbackData} results={paperbackResults} globalData={globalData} onChange={setPaperbackData} />
                  {paperbackResults && <PaperbackSimulator data={paperbackData} globalData={globalData} />}
                </div>
              </>}

            {/* Score Global de Viabilidad - Full Width */}
            {globalData.selectedFormat && globalData.marketplace && activeResults && <Collapsible open={!isCollapsed('score')} onOpenChange={() => toggleSection('score')}>
                <Card className="animate-fade-in">
                  <CollapsibleTrigger asChild>
                    <CardHeader className="pb-4 cursor-pointer select-none hover:bg-muted/30 transition-colors rounded-t-lg">
                      <div className="flex items-center justify-between">
                        <CardTitle className="section-header">
                          <BarChart3 className="h-5 w-5 text-primary" />
                          Score Global de Viabilidad
                        </CardTitle>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          {!isCollapsed('score') ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
                        </Button>
                      </div>
                      {!isCollapsed('score') && <p className="text-sm text-muted-foreground">Indicador sintético de viabilidad para Ads</p>}
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up overflow-hidden">
                    <CardContent className="space-y-6">
                      {/* Results Table - Full width on top */}
                      {tableData.length > 0 && <div>
                          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Tabla de Resultados
                          </h4>
                          <ResultsTable data={tableData} globalData={globalData} embedded />
                        </div>}
                      
                      {/* Score Display + Positioning in 2 columns */}
                      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
                        {/* Left Column: ScoreDisplay */}
                        <ScoreDisplay score={scoreBreakdown} currencySymbol={globalData.marketplace === 'COM' ? '$' : '€'} embedded globalData={globalData} activeResults={activeResults} positioningResults={positioningResults} />
                        
                        {/* Right Column: Positioning Section */}
                        <PositioningSection results={positioningResults} globalData={globalData} activeResults={activeResults} embedded />
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>}

            {/* Save Niche Button when no niches exist */}
            {niches.length === 0 && hasCurrentData && <NicheComparator niches={niches} onSaveNiche={handleSaveNiche} onDeleteNiche={deleteNiche} onClearAll={clearAllNiches} onLoadNiche={handleLoadNiche} onUpdateNicheVersion={handleUpdateNicheVersion} onRestoreVersion={handleRestoreVersion} onStartNew={handleStartNew} bestNiche={getBestNiche()} hasCurrentData={hasCurrentData} loadedNicheId={loadedNicheId} />}
            
          </>}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-12">
        <div className="container py-6">
          <p className="text-center text-sm text-muted-foreground">
            Publify — Análisis orientado a toma de decisiones editoriales © {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>;
};
export default Index;