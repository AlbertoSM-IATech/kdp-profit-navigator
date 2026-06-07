import { useState } from 'react';
import { GlobalData, EbookResults, PaperbackResults, PositioningResults, ScoreBreakdown, TableRow, PaperbackData, SimulatorData, EbookData } from '@/types/kdp';
import { ScoreDisplay } from '@/components/kdp/ScoreDisplay';
import { ResultsTable } from '@/components/kdp/ResultsTable';
import { PositioningSection } from '@/components/kdp/PositioningSection';
import { PaperbackSimulator } from '@/components/kdp/PaperbackSimulator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Save, Plus, SlidersHorizontal, Link2 } from 'lucide-react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { toast } from 'sonner';
import { buildShareUrl } from '@/lib/wizardShare';

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
  ebookData: EbookData;
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
    <div className="space-y-5">
      {/* Score + acciones primarias en una sola fila */}
      <section className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="grid lg:grid-cols-[1fr_auto] gap-0">
          <div className="p-5">
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
          </div>
          <div className="border-t lg:border-t-0 lg:border-l border-border bg-muted/20 p-5 flex flex-col gap-2 justify-center lg:min-w-[220px]">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Acciones
            </p>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="w-full gap-2">
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
                      size="sm"
                      variant="secondary"
                      className="w-full gap-2"
                      onClick={() => {
                        onQuickSave();
                        toast.success('Nueva versión guardada');
                      }}
                    >
                      <Save className="h-4 w-4" />
                      Nueva versión
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent><p className="text-xs">Añade el estado actual como nueva versión del análisis cargado.</p></TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>
      </section>

      {/* SIMULATOR — pieza central */}
      {canShowSimulator && (
        <section className="rounded-xl border-2 border-secondary/30 bg-card shadow-sm overflow-hidden">
          <header className="px-5 py-3 border-b border-border bg-muted/20 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-secondary/10">
              <SlidersHorizontal className="h-4 w-4 text-secondary" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-foreground">Simulador de optimización</h3>
              <p className="text-xs text-muted-foreground truncate">
                Prueba variaciones de precio, páginas, coste por clic y margen objetivo.
              </p>
            </div>
          </header>
          <div className="p-5">
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

      {/* Información complementaria (colapsada) */}
      <Accordion type="single" collapsible className="border border-border rounded-xl bg-card">
        <AccordionItem value="complementary" className="border-none">
          <AccordionTrigger className="px-5 py-3 hover:no-underline">
            <span className="text-sm font-semibold text-foreground">
              Información complementaria
            </span>
          </AccordionTrigger>
          <AccordionContent className="px-5 pb-5">
            <div className="space-y-6 pt-2">
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
