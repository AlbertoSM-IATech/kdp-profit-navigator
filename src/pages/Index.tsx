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
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container py-4">
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
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setQuickViewMode(!quickViewMode)}
                className="hidden md:flex"
              >
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
      <main className="container py-8 space-y-6">
        {/* Quick View Mode */}
        {quickViewMode && hasCurrentData && scoreBreakdown && (
          <div className="space-y-4">
            <ScoreDisplay score={scoreBreakdown} compact={true} />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-card rounded-lg border">
              <div className="text-center">
                <span className="text-xs text-muted-foreground block">Clics máx./Venta</span>
                <span className={`text-2xl font-bold ${activeResults?.clicsMaxPorVenta >= 13 ? 'text-success' : activeResults?.clicsMaxPorVenta >= 10 ? 'text-warning' : 'text-destructive'}`}>
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
          </div>
        )}

        {/* Full View */}
        {!quickViewMode && (
          <>
            <GlobalDataSection data={globalData} onChange={setGlobalData} />

            {globalData.selectedFormat === 'EBOOK' && globalData.marketplace && (
              <EbookSection data={ebookData} results={ebookResults} globalData={globalData} onChange={setEbookData} />
            )}

            {showPhysicalFormat && globalData.marketplace && (
              <>
                <PaperbackSection data={paperbackData} results={paperbackResults} globalData={globalData} onChange={setPaperbackData} />
                {paperbackResults && <PaperbackSimulator data={paperbackData} globalData={globalData} />}
              </>
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
            />
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-12">
        <div className="container py-6">
          <p className="text-center text-sm text-muted-foreground">
            Publify — Análisis orientado a toma de decisiones editoriales © {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
