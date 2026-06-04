import { useState } from 'react';
import { GlobalData, EbookResults, PaperbackResults, PositioningResults, ScoreBreakdown, TableRow, PaperbackData, SimulatorData } from '@/types/kdp';
import { ScoreDisplay } from '@/components/kdp/ScoreDisplay';
import { ResultsTable } from '@/components/kdp/ResultsTable';
import { PositioningSection } from '@/components/kdp/PositioningSection';
import { PaperbackSimulator } from '@/components/kdp/PaperbackSimulator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Save, Plus, SlidersHorizontal } from 'lucide-react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { toast } from 'sonner';

interface StepResultsProps {
  globalData: GlobalData;
  activeResults: EbookResults | PaperbackResults | null;
  positioningResults: PositioningResults | null;
  scoreBreakdown: ScoreBreakdown | null;
  tableData: TableRow[];
  loadedNicheId: string | null;
  onQuickSave: (() => void) | undefined;
  onSaveNiche: (name: string, simulatorData?: SimulatorData) => void;
  paperbackData: PaperbackData;
  initialSimulatorState?: SimulatorData;
  onSimulatorStateChange?: (state: SimulatorData) => void;
  onApplySimulatorAsVersion?: () => void;
  onApplySimulatorToBase?: (simData: SimulatorData) => void;
}

export const StepResults = ({
  globalData,
  activeResults,
  positioningResults,
  scoreBreakdown,
  tableData,
  loadedNicheId,
  onQuickSave,
  onSaveNiche,
  paperbackData,
  initialSimulatorState,
  onSimulatorStateChange,
  onApplySimulatorAsVersion,
  onApplySimulatorToBase,
}: StepResultsProps) => {
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [newNicheName, setNewNicheName] = useState('');
  const [localSimState, setLocalSimState] = useState<SimulatorData | undefined>(initialSimulatorState);

  const isPaperback = globalData.selectedFormat === 'PAPERBACK';
  const canShowSimulator = isPaperback && paperbackData.interior && paperbackData.size;

  const handleSimStateChange = (state: SimulatorData) => {
    setLocalSimState(state);
    onSimulatorStateChange?.(state);
  };

  const handleSaveNiche = () => {
    if (!newNicheName.trim()) {
      toast.error('Introduce un nombre para el análisis');
      return;
    }
    onSaveNiche(newNicheName.trim(), localSimState);
    setNewNicheName('');
    setIsSaveDialogOpen(false);
    toast.success('Análisis guardado correctamente');
  };

  if (!activeResults || !scoreBreakdown) {
    return (
      <div className="flex items-center justify-center h-64 bg-muted/30 rounded-xl">
        <p className="text-muted-foreground">
          Completa los pasos anteriores para ver los resultados
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Resultados del análisis
        </h2>
        <p className="text-muted-foreground">
          Viabilidad de tu {globalData.selectedFormat === 'EBOOK' ? 'eBook' : 'libro impreso'} para Amazon Ads
        </p>
      </div>

      {/* Score Global */}
      <ScoreDisplay
        score={scoreBreakdown}
        currencySymbol={globalData.marketplace === 'COM' ? '$' : '€'}
        embedded
        globalData={globalData}
        activeResults={activeResults}
        positioningResults={positioningResults}
        loadedNicheId={loadedNicheId}
        onQuickSave={onQuickSave}
      />

      {/* Primary save actions — always visible directly under Score */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Guardar análisis
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Guardar análisis</DialogTitle>
                    <DialogDescription>
                      Crea una nueva entrada en tus análisis guardados para compararla con otros escenarios.
                    </DialogDescription>
                  </DialogHeader>
                  <Input
                    placeholder="Nombre del análisis (ej: 'Cuadernos yoga ES')"
                    value={newNicheName}
                    onChange={e => setNewNicheName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSaveNiche()}
                  />
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsSaveDialogOpen(false)}>Cancelar</Button>
                    <Button onClick={handleSaveNiche}>Guardar</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </TooltipTrigger>
            <TooltipContent><p className="text-xs">Crea una nueva entrada en tus análisis guardados.</p></TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {loadedNicheId && onQuickSave && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="lg"
                  variant="secondary"
                  className="gap-2"
                  onClick={() => {
                    onQuickSave();
                    toast.success('Nueva versión guardada');
                  }}
                >
                  <Save className="h-4 w-4" />
                  Guardar nueva versión
                </Button>
              </TooltipTrigger>
              <TooltipContent><p className="text-xs">Añade el estado actual como nueva versión del análisis cargado.</p></TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      {/* SIMULATOR — main attraction */}
      {canShowSimulator && (
        <section className="rounded-xl border-2 border-secondary/30 bg-card shadow-sm overflow-hidden">
          <header className="px-6 py-4 border-b border-border bg-muted/20">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-secondary/10">
                <SlidersHorizontal className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground">Simulador de optimización</h3>
                <p className="text-xs text-muted-foreground">
                  Optimiza tu libro probando variaciones de precio, páginas, coste por clic y margen objetivo.
                </p>
              </div>
            </div>
          </header>
          <div className="p-6">
            <PaperbackSimulator
              data={paperbackData}
              globalData={globalData}
              initialSimState={initialSimulatorState}
              onStateChange={handleSimStateChange}
              onApplyAsVersion={onApplySimulatorAsVersion}
              onApplyToBase={onApplySimulatorToBase}
              loadedNicheId={loadedNicheId}
              showStickyBar
              embedded
            />
          </div>
        </section>
      )}

      {/* Complementary info (collapsed by default) */}
      <Accordion type="single" collapsible className="border border-border rounded-xl bg-card">
        <AccordionItem value="complementary" className="border-none">
          <AccordionTrigger className="px-5 py-4 hover:no-underline">
            <span className="text-sm font-semibold text-foreground">
              Información complementaria
            </span>
          </AccordionTrigger>
          <AccordionContent className="px-5 pb-5">
            <div className="space-y-8 pt-2">
              {tableData.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Tabla de resultados
                  </h4>
                  <ResultsTable data={tableData} globalData={globalData} embedded />
                </div>
              )}

              <PositioningSection
                results={positioningResults}
                globalData={globalData}
                activeResults={activeResults}
                embedded
              />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};
