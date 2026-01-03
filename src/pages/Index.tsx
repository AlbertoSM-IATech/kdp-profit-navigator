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
import { ReportSection } from '@/components/kdp/ReportSection';
import { PaperbackSimulator } from '@/components/kdp/PaperbackSimulator';
import { ScoreDisplay } from '@/components/kdp/ScoreDisplay';
import { NicheComparator } from '@/components/kdp/NicheComparator';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Calculator, Eye, EyeOff, ChevronDown, ChevronUp } from 'lucide-react';
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
  const { isCollapsed, toggleSection, expandAll, collapseAll } = useCollapsibleSections();

  const handleSaveNiche = (name: string) => {
    const saved = saveCurrentAsNiche(
      name, 
      globalData, 
      globalData.selectedFormat === 'EBOOK' ? ebookData : null, 
      showPhysicalFormat ? paperbackData : null, 
      ebookResults, 
      paperbackResults, 
      inversionDiaria
    );
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
    updateNicheWithNewVersion(
      nicheId,
      globalData,
      globalData.selectedFormat === 'EBOOK' ? ebookData : null,
      showPhysicalFormat ? paperbackData : null,
      ebookResults,
      paperbackResults,
      inversionDiaria,
      note
    );
  }, [globalData, ebookData, paperbackData, ebookResults, paperbackResults, inversionDiaria, showPhysicalFormat, updateNicheWithNewVersion]);

  const handleRestoreVersion = useCallback((nicheId: string, versionId: string) => {
    const restored = restoreVersion(nicheId, versionId);
    if (restored) {
      handleLoadNiche(restored);
    }
  }, [restoreVersion, handleLoadNiche]);

  const hasCurrentData = !!(activeResults && globalData.marketplace);

  return (
    <div className="min-h-screen bg-background">
      {/* Header - Compact */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-primary" />
              <h1 className="text-base font-heading font-bold text-foreground">KDP Viabilidad</h1>
            </div>
            <div className="flex items-center gap-1">
              <Button 
                variant={quickViewMode ? "default" : "ghost"}
                size="sm"
                onClick={() => setQuickViewMode(!quickViewMode)}
                className="h-7 text-xs px-2"
              >
                {quickViewMode ? <EyeOff className="h-3 w-3 mr-1" /> : <Eye className="h-3 w-3 mr-1" />}
                {quickViewMode ? 'Completa' : 'Rápida'}
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-4 space-y-3">
        {/* Quick View Mode */}
        {quickViewMode && hasCurrentData && scoreBreakdown && (
          <div className="space-y-3">
            <ScoreDisplay score={scoreBreakdown} compact={true} />
            <div className="grid grid-cols-4 gap-2 p-3 bg-card rounded-lg border">
              <div className="text-center">
                <span className="text-[10px] text-muted-foreground block">Clics máx.</span>
                <span className={`text-lg font-bold ${activeResults?.clicsMaxPorVenta >= 13 ? 'text-success' : activeResults?.clicsMaxPorVenta >= 10 ? 'text-warning' : 'text-destructive'}`}>
                  {activeResults?.clicsMaxPorVenta || 0}
                </span>
              </div>
              <div className="text-center">
                <span className="text-[10px] text-muted-foreground block">BACOS</span>
                <span className="text-lg font-bold text-primary">{activeResults?.margenPct.toFixed(0)}%</span>
              </div>
              <div className="text-center">
                <span className="text-[10px] text-muted-foreground block">Regalía</span>
                <span className="text-lg font-bold">{activeResults?.regalias.toFixed(2)}€</span>
              </div>
              <div className="text-center">
                <span className="text-[10px] text-muted-foreground block">Decisión</span>
                <span className="text-sm font-semibold">{scoreBreakdown.statusEmoji}</span>
              </div>
            </div>
            <Button variant="outline" size="sm" className="w-full h-8" onClick={() => setQuickViewMode(false)}>
              Ver análisis completo
            </Button>
          </div>
        )}

        {/* Full View */}
        {!quickViewMode && (
          <div className="space-y-3">
            <GlobalDataSection data={globalData} onChange={setGlobalData} />

            {globalData.selectedFormat === 'EBOOK' && globalData.marketplace && (
              <EbookSection data={ebookData} results={ebookResults} globalData={globalData} onChange={setEbookData} />
            )}

            {showPhysicalFormat && globalData.marketplace && (
              <PaperbackSection data={paperbackData} results={paperbackResults} globalData={globalData} onChange={setPaperbackData} />
            )}

            {showPhysicalFormat && globalData.marketplace && paperbackResults && (
              <PaperbackSimulator data={paperbackData} globalData={globalData} />
            )}

            {globalData.selectedFormat && globalData.marketplace && activeResults && (
              <ScoreDisplay score={scoreBreakdown} currencySymbol={globalData.marketplace === 'COM' ? '$' : '€'} />
            )}

            {globalData.selectedFormat && globalData.marketplace && (
              <PositioningSection results={positioningResults} globalData={globalData} activeResults={activeResults} />
            )}

            {globalData.selectedFormat && tableData.length > 0 && (
              <ResultsTable data={tableData} globalData={globalData} />
            )}

            <NicheComparator 
              niches={niches} 
              onSaveNiche={handleSaveNiche} 
              onDeleteNiche={deleteNiche} 
              onClearAll={clearAllNiches} 
              onLoadNiche={handleLoadNiche}
              onUpdateNicheVersion={handleUpdateNicheVersion}
              onRestoreVersion={handleRestoreVersion}
              bestNiche={getBestNiche()} 
              hasCurrentData={hasCurrentData}
              loadedNicheId={loadedNicheId}
            />

            <ReportSection 
              globalData={globalData} 
              ebookData={ebookData} 
              ebookResults={ebookResults} 
              paperbackData={paperbackData} 
              paperbackResults={paperbackResults} 
              positioningResults={positioningResults} 
              tableData={tableData} 
              scoreBreakdown={scoreBreakdown}
              savedNiches={niches.map(n => ({
                name: n.name,
                scoreBreakdown: n.scoreBreakdown,
                clicsMaxPorVenta: n.clicsMaxPorVenta,
                bacos: n.bacos,
                pvp: n.pvp,
                precioMinRecomendado: n.precioMinRecomendado,
              }))}
            />
          </div>
        )}
      </main>

      {/* Footer - Minimal */}
      <footer className="border-t border-border bg-card mt-6">
        <div className="container py-3">
          <p className="text-center text-xs text-muted-foreground">
            Publify © {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
