 import { useState } from 'react';
 import { GlobalData, EbookResults, PaperbackResults, PositioningResults, ScoreBreakdown, TableRow, PaperbackData, SimulatorData } from '@/types/kdp';
 import { ScoreDisplay } from '@/components/kdp/ScoreDisplay';
 import { ResultsTable } from '@/components/kdp/ResultsTable';
 import { PositioningSection } from '@/components/kdp/PositioningSection';
 import { PaperbackSimulator } from '@/components/kdp/PaperbackSimulator';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { SlidersHorizontal, Save, Plus, ChevronDown, ChevronUp } from 'lucide-react';
 import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
 import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
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
 }: StepResultsProps) => {
   const currencySymbol = globalData.marketplace === 'COM' ? '$' : '€';
   const [isSimulatorExpanded, setIsSimulatorExpanded] = useState(false);
   const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
   const [newNicheName, setNewNicheName] = useState('');
   const [localSimState, setLocalSimState] = useState<SimulatorData | undefined>(initialSimulatorState);
   
   const isPaperback = globalData.selectedFormat === 'PAPERBACK';
   const canShowSimulator = isPaperback && paperbackData.interior && paperbackData.size;
 
   const handleSimStateChange = (state: SimulatorData) => {
     setLocalSimState(state);
     if (onSimulatorStateChange) {
       onSimulatorStateChange(state);
     }
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
       <div className="text-center mb-4">
         <h2 className="text-2xl font-bold text-foreground mb-2">
           Resultados del Análisis
         </h2>
         <p className="text-muted-foreground">
           Viabilidad de tu {globalData.selectedFormat === 'EBOOK' ? 'eBook' : 'libro impreso'} para Amazon Ads
         </p>
       </div>
 
       {/* Score Display */}
       <ScoreDisplay 
         score={scoreBreakdown} 
         currencySymbol={currencySymbol} 
         embedded 
         globalData={globalData} 
         activeResults={activeResults} 
         positioningResults={positioningResults} 
         loadedNicheId={loadedNicheId} 
         onQuickSave={onQuickSave} 
       />
 
       {/* Results Table */}
       {tableData.length > 0 && (
         <div className="space-y-3">
           <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
             Tabla de Resultados
           </h4>
           <ResultsTable data={tableData} globalData={globalData} embedded />
         </div>
       )}
 
       {/* Positioning Section */}
       <PositioningSection 
         results={positioningResults} 
         globalData={globalData} 
         activeResults={activeResults} 
         embedded 
       />
 
       {/* Simulator Section (only for Paperback) - Collapsible */}
       {canShowSimulator && (
         <Collapsible
           open={isSimulatorExpanded}
           onOpenChange={setIsSimulatorExpanded}
           className="border border-border rounded-xl overflow-hidden"
         >
           <CollapsibleTrigger asChild>
             <div className="flex items-center justify-between p-6 bg-muted/20 cursor-pointer hover:bg-muted/30 transition-colors">
               <div className="flex items-center gap-3">
                 <div className="p-2 bg-secondary/10 rounded-lg">
                   <SlidersHorizontal className="h-5 w-5 text-secondary" />
                 </div>
                 <div>
                   <h4 className="text-sm font-semibold text-foreground">Simulador de optimización</h4>
                   <p className="text-xs text-muted-foreground">Experimenta con diferentes configuraciones sin modificar tus datos</p>
                 </div>
               </div>
               <Button variant="ghost" size="sm" className="gap-2">
                 {isSimulatorExpanded ? (
                   <>
                     <span className="text-sm">Contraer</span>
                     <ChevronUp className="h-4 w-4" />
                   </>
                 ) : (
                   <>
                     <span className="text-sm">Expandir</span>
                     <ChevronDown className="h-4 w-4" />
                   </>
                 )}
               </Button>
             </div>
           </CollapsibleTrigger>
           <CollapsibleContent>
             <div className="p-6 pt-4 bg-muted/10">
               <PaperbackSimulator 
                 data={paperbackData} 
                 globalData={globalData}
                 initialSimState={initialSimulatorState}
                 onStateChange={handleSimStateChange}
                 onApplyAsVersion={onApplySimulatorAsVersion}
                 showApplyButton={!!loadedNicheId}
                 embedded
               />
             </div>
           </CollapsibleContent>
         </Collapsible>
       )}
 
       {/* Save Actions */}
       <div className="flex flex-wrap items-center justify-center gap-3 pt-4 border-t border-border">
         {/* Save as New Analysis */}
         <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
           <DialogTrigger asChild>
             <Button variant="outline">
               <Plus className="h-4 w-4 mr-2" />
               Guardar análisis
             </Button>
           </DialogTrigger>
           <DialogContent>
             <DialogHeader>
               <DialogTitle>Guardar análisis</DialogTitle>
               <DialogDescription>
                 Guarda este análisis para compararlo con otros escenarios.
               </DialogDescription>
             </DialogHeader>
             <Input 
               placeholder="Nombre del análisis (ej: 'Cuadernos yoga ES')" 
               value={newNicheName} 
               onChange={e => setNewNicheName(e.target.value)} 
               onKeyDown={e => e.key === 'Enter' && handleSaveNiche()} 
             />
             <DialogFooter>
               <Button variant="outline" onClick={() => setIsSaveDialogOpen(false)}>
                 Cancelar
               </Button>
               <Button onClick={handleSaveNiche}>Guardar</Button>
             </DialogFooter>
           </DialogContent>
         </Dialog>
 
         {/* Save Version (if niche is loaded) */}
         {loadedNicheId && onQuickSave && (
           <Button 
             onClick={() => {
               onQuickSave();
               toast.success('Nueva versión guardada');
             }} 
             variant="secondary"
           >
             <Save className="h-4 w-4 mr-2" />
             Guardar versión
           </Button>
         )}
       </div>
     </div>
   );
 };