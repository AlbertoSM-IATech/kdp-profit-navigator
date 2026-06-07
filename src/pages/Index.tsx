import { useState, useCallback, useEffect } from 'react';
import { useKdpCalculator } from '@/hooks/useKdpCalculator';
import { useScoring } from '@/hooks/useScoring';
import { useNicheComparator } from '@/hooks/useNicheComparator';
import { WizardContainer } from '@/components/kdp/WizardContainer';
import { NicheComparator } from '@/components/kdp/NicheComparator';
import { PrintingCostsTable } from '@/components/kdp/PrintingCostsTable';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Save, Table2 } from 'lucide-react';
import { SavedNiche, SimulatorData } from '@/types/kdp';
import { toast } from 'sonner';

// Import Publify logos
import publifyLogo from '@/assets/publify-logo.png';
import publifyIcon from '@/assets/publify-icon.png';

import { readSharedStateFromHash, clearSharedStateHash } from '@/lib/wizardShare';

const WIZARD_STATE_KEY = 'publify-wizard-state-v1';
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
  const [simulatorState, setSimulatorState] = useState<SimulatorData | undefined>(undefined);
  const [hydrated, setHydrated] = useState(false);
  const activeResults = globalData.selectedFormat === 'EBOOK' ? ebookResults : paperbackResults;
  const inversionDiaria = positioningResults?.inversionDiaria || 0;

  // Restore wizard state: shared link (hash) takes precedence over localStorage
  useEffect(() => {
    try {
      const shared = readSharedStateFromHash();
      if (shared) {
        if (shared.g) setGlobalData(shared.g);
        if (shared.e) setEbookData(shared.e);
        if (shared.p) setPaperbackData(shared.p);
        if (shared.s) setSimulatorState(shared.s);
        setLoadedNicheId(null);
        clearSharedStateHash();
        toast.success('Configuración cargada desde el enlace compartido');
      } else {
        const raw = window.localStorage.getItem(WIZARD_STATE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed.globalData) setGlobalData(parsed.globalData);
          if (parsed.ebookData) setEbookData(parsed.ebookData);
          if (parsed.paperbackData) setPaperbackData(parsed.paperbackData);
          if (parsed.loadedNicheId) setLoadedNicheId(parsed.loadedNicheId);
          if (parsed.simulatorState) setSimulatorState(parsed.simulatorState);
        }
      }
    } catch {
      /* ignore corrupted state */
    }
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist wizard state whenever it changes (after initial hydration)
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(
        WIZARD_STATE_KEY,
        JSON.stringify({ globalData, ebookData, paperbackData, loadedNicheId, simulatorState }),
      );
    } catch {
      /* ignore quota errors */
    }
  }, [hydrated, globalData, ebookData, paperbackData, loadedNicheId, simulatorState]);

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
  const handleSaveNiche = useCallback((name: string, simData?: SimulatorData) => {
    const saved = saveCurrentAsNiche(name, globalData, globalData.selectedFormat === 'EBOOK' ? ebookData : null, globalData.selectedFormat === 'PAPERBACK' ? paperbackData : null, ebookResults, paperbackResults, inversionDiaria, simData || simulatorState);
    setLoadedNicheId(saved.id);
  }, [globalData, ebookData, paperbackData, ebookResults, paperbackResults, inversionDiaria, saveCurrentAsNiche, simulatorState]);
  const handleLoadNiche = useCallback((niche: SavedNiche) => {
    setGlobalData(niche.globalData);
    if (niche.ebookData) {
      setEbookData(niche.ebookData);
    }
    if (niche.paperbackData) {
      setPaperbackData(niche.paperbackData);
    }
    setLoadedNicheId(niche.id);
    // Load simulator state if available
    if (niche.simulatorData) {
      setSimulatorState(niche.simulatorData);
    } else {
      setSimulatorState(undefined);
    }
    toast.success(`Nicho "${niche.name}" cargado para editar`);
  }, [setGlobalData, setEbookData, setPaperbackData]);
  const handleUpdateNicheVersion = useCallback((nicheId: string, note?: string) => {
    updateNicheWithNewVersion(nicheId, globalData, globalData.selectedFormat === 'EBOOK' ? ebookData : null, globalData.selectedFormat === 'PAPERBACK' ? paperbackData : null, ebookResults, paperbackResults, inversionDiaria, note, simulatorState);
  }, [globalData, ebookData, paperbackData, ebookResults, paperbackResults, inversionDiaria, updateNicheWithNewVersion, simulatorState]);
  const handleRestoreVersion = useCallback((nicheId: string, versionId: string) => {
    const restored = restoreVersion(nicheId, versionId);
    if (restored) {
      handleLoadNiche(restored);
    }
  }, [restoreVersion, handleLoadNiche]);
  const handleApplySimulatorAsVersion = useCallback(() => {
    if (loadedNicheId && simulatorState) {
      handleUpdateNicheVersion(loadedNicheId, 'Aplicado desde simulador');
      toast.success('Nueva versión creada con datos del simulador');
    }
  }, [loadedNicheId, simulatorState, handleUpdateNicheVersion]);

  const handleApplySimulatorToBase = useCallback((simData: SimulatorData) => {
    // Update globalData with simulator CPC and margin
    setGlobalData({
      ...globalData,
      cpc: simData.cpc,
      margenObjetivoPct: simData.margenObjetivo,
    });
    // Update paperbackData with simulator format values
    setPaperbackData({
      ...paperbackData,
      interior: simData.interior,
      size: simData.size,
      pvp: simData.pvp,
      pages: simData.pages,
    });
    // Reset simulator state so it syncs from updated base
    setSimulatorState(undefined);
    toast.success('Datos base actualizados con los valores del simulador');
  }, [globalData, paperbackData, setGlobalData, setPaperbackData]);
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
    setSimulatorState(undefined);
    toast.success('Formulario limpio para nuevo análisis');
  }, [setGlobalData, setEbookData, setPaperbackData]);
  const hasCurrentData = !!(activeResults && globalData.marketplace);
  return <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="w-[90%] max-w-[1400px] mx-auto py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Publify Logo */}
              <img src={publifyLogo} alt="Publify" className="h-8 hidden md:block" />
              <img src={publifyIcon} alt="Publify" className="h-8 w-8 md:hidden" />
              <div className="hidden sm:block">
                <h1 className="text-lg font-heading font-bold text-foreground">
                  Calculadora de Viabilidad y Optimización de libro
                </h1>
                <p className="text-xs text-muted-foreground">
                  Análisis profesional para publishers
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Loaded Niche Indicator */}
              {loadedNicheId && <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-lg border border-primary/20">
                  <span className="text-sm text-primary font-medium truncate max-w-[150px]">
                    {niches.find(n => n.id === loadedNicheId)?.name}
                  </span>
                  <Button size="sm" variant="ghost" onClick={handleStartNew} className="h-6 w-6 p-0 hover:bg-primary/20">
                    <span className="sr-only">Cerrar nicho</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </Button>
                </div>}

              {/* Saved Analyses Button - always visible */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Save className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Análisis guardados</span>
                    <span className="sm:hidden">Guardados</span>
                    {niches.length > 0 && (
                      <span className="ml-2 inline-flex items-center justify-center h-5 min-w-5 px-1.5 text-xs font-semibold rounded-full bg-primary/10 text-primary">
                        {niches.length}
                      </span>
                    )}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-6xl max-h-[85vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Save className="h-5 w-5 text-primary" />
                      Análisis guardados
                    </DialogTitle>
                    <p className="text-sm text-muted-foreground">
                      Carga, compara o gestiona tus análisis guardados.
                    </p>
                  </DialogHeader>
                  <NicheComparator niches={niches} onSaveNiche={handleSaveNiche} onDeleteNiche={deleteNiche} onClearAll={clearAllNiches} onLoadNiche={handleLoadNiche} onUpdateNicheVersion={handleUpdateNicheVersion} onRestoreVersion={handleRestoreVersion} onStartNew={handleStartNew} bestNiche={getBestNiche()} hasCurrentData={hasCurrentData} loadedNicheId={loadedNicheId} embedded />
                </DialogContent>
              </Dialog>

              
              {/* Printing Costs Table Button */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Table2 className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Costes KDP</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Table2 className="h-5 w-5 text-primary" />
                      Costes de Impresión KDP
                    </DialogTitle>
                    <p className="text-sm text-muted-foreground">
                      Referencia oficial de costes según tipo de interior, tamaño y rango de páginas.
                    </p>
                  </DialogHeader>
                  <PrintingCostsTable embedded />
                </DialogContent>
              </Dialog>

              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Wizard */}
      <main className="w-full max-w-[1400px] mx-auto px-4 md:px-8 py-8">
        <WizardContainer globalData={globalData} ebookData={ebookData} paperbackData={paperbackData} ebookResults={ebookResults} paperbackResults={paperbackResults} positioningResults={positioningResults} scoreBreakdown={scoreBreakdown} tableData={tableData} setGlobalData={setGlobalData} setEbookData={setEbookData} setPaperbackData={setPaperbackData} loadedNicheId={loadedNicheId} onQuickSave={loadedNicheId ? () => handleUpdateNicheVersion(loadedNicheId) : undefined} onSaveNiche={handleSaveNiche} onStartNew={handleStartNew} simulatorState={simulatorState} onSimulatorStateChange={setSimulatorState} onApplySimulatorAsVersion={handleApplySimulatorAsVersion} onApplySimulatorToBase={handleApplySimulatorToBase} />

        {/* Niches now accessible only from header — duplicated render removed */}

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