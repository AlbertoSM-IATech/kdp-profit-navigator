import { useState, useCallback, useEffect } from 'react';
import { GlobalData, EbookData, PaperbackData, EbookResults, PaperbackResults, PositioningResults, ScoreBreakdown, TableRow, FormatType, SimulatorData } from '@/types/kdp';
import { Button } from '@/components/ui/button';
import { StepFormat } from './wizard/StepFormat';
import { StepMarket } from './wizard/StepMarket';
import { StepBookData } from './wizard/StepBookData';
import { StepSummary } from './wizard/StepSummary';
import { StepResults } from './wizard/StepResults';
import { ChevronLeft, ChevronRight, RotateCcw, Check, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';

const STEP_STORAGE_KEY = 'publify-wizard-current-step';

interface WizardContainerProps {
  globalData: GlobalData;
  ebookData: EbookData;
  paperbackData: PaperbackData;
  ebookResults: EbookResults | null;
  paperbackResults: PaperbackResults | null;
  positioningResults: PositioningResults | null;
  scoreBreakdown: ScoreBreakdown | null;
  tableData: TableRow[];
  setGlobalData: (data: GlobalData) => void;
  setEbookData: (data: EbookData) => void;
  setPaperbackData: (data: PaperbackData) => void;
  loadedNicheId: string | null;
  onQuickSave: (() => void) | undefined;
  onSaveNiche: (name: string, simulatorData?: SimulatorData) => void;
  onStartNew: () => void;
  simulatorState?: SimulatorData;
  onSimulatorStateChange?: (state: SimulatorData) => void;
  onApplySimulatorAsVersion?: () => void;
  onApplySimulatorToBase?: (simData: SimulatorData) => void;
}

interface StepDef {
  title: string;
  subtitle: string;
  tip: string;
}

const STEPS: StepDef[] = [
  {
    title: 'Formato',
    subtitle: 'Configuración inicial',
    tip: 'El formato determina la estructura de regalías y los costes de producción aplicables.',
  },
  {
    title: 'Mercado',
    subtitle: 'Marketplace y publicidad',
    tip: 'El CPC del nicho y las ventas de la competencia definen la viabilidad publicitaria real.',
  },
  {
    title: 'Libro',
    subtitle: 'Detalles técnicos',
    tip: 'El PVP determina el tramo de regalías y el margen mínimo viable de tu libro.',
  },
  {
    title: 'Resumen',
    subtitle: 'Confirma los datos',
    tip: 'Revisa los inputs antes de calcular. Puedes editar cualquier sección con un clic.',
  },
  {
    title: 'Resultados',
    subtitle: 'Análisis y optimización',
    tip: 'Usa el simulador para probar variaciones de precio y coste antes de publicar.',
  },
];

export const WizardContainer = ({
  globalData,
  ebookData,
  paperbackData,
  ebookResults,
  paperbackResults,
  positioningResults,
  scoreBreakdown,
  tableData,
  setGlobalData,
  setEbookData,
  setPaperbackData,
  loadedNicheId,
  onQuickSave,
  onSaveNiche,
  onStartNew,
  simulatorState,
  onSimulatorStateChange,
  onApplySimulatorAsVersion,
  onApplySimulatorToBase,
}: WizardContainerProps) => {
  const [currentStep, setCurrentStep] = useState<number>(() => {
    if (typeof window === 'undefined') return 0;
    const raw = window.localStorage.getItem(STEP_STORAGE_KEY);
    const parsed = raw ? parseInt(raw, 10) : 0;
    return Number.isFinite(parsed) && parsed >= 0 && parsed < 5 ? parsed : 0;
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(STEP_STORAGE_KEY, String(currentStep));
    } catch {
      /* ignore quota errors */
    }
  }, [currentStep]);

  const activeResults = globalData.selectedFormat === 'EBOOK' ? ebookResults : paperbackResults;

  const canProceedFromStep = useCallback((step: number): boolean => {
    switch (step) {
      case 0:
        return !!globalData.selectedFormat;
      case 1:
        return !!(
          globalData.marketplace &&
          globalData.cpc !== null &&
          globalData.ventasDiariasCompetencia !== null &&
          globalData.margenObjetivoPct !== null
        );
      case 2:
        if (globalData.selectedFormat === 'EBOOK') {
          return !!(ebookData.pvp !== null);
        } else {
          return !!(
            paperbackData.interior &&
            paperbackData.size &&
            paperbackData.pages !== null &&
            paperbackData.pvp !== null
          );
        }
      case 3:
        // Resumen — válido si los pasos previos están completos
        return canProceedFromStep(0) && canProceedFromStep(1) && canProceedFromStep(2);
      case 4:
        return true;
      default:
        return false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [globalData, ebookData, paperbackData]);

  const completedSteps = STEPS.map((_, index) => canProceedFromStep(index));

  const handleFormatChange = useCallback((format: FormatType) => {
    setGlobalData({ ...globalData, selectedFormat: format });
  }, [globalData, setGlobalData]);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1 && canProceedFromStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const handleReset = () => {
    onStartNew();
    setCurrentStep(0);
  };

  const handleStepClick = (index: number) => {
    // Allow jumping to any previously completed step or the next available step
    if (index < currentStep || completedSteps[index] || completedSteps.slice(0, index).every(Boolean)) {
      setCurrentStep(index);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <StepFormat selectedFormat={globalData.selectedFormat} onFormatChange={handleFormatChange} />;
      case 1:
        return <StepMarket globalData={globalData} onChange={setGlobalData} />;
      case 2:
        return (
          <StepBookData
            globalData={globalData}
            ebookData={ebookData}
            paperbackData={paperbackData}
            onEbookChange={setEbookData}
            onPaperbackChange={setPaperbackData}
          />
        );
      case 3:
        return (
          <StepSummary
            globalData={globalData}
            ebookData={ebookData}
            paperbackData={paperbackData}
            onEditStep={(step) => setCurrentStep(step)}
          />
        );
      case 4:
        return (
          <StepResults
            globalData={globalData}
            activeResults={activeResults}
            positioningResults={positioningResults}
            scoreBreakdown={scoreBreakdown}
            tableData={tableData}
            loadedNicheId={loadedNicheId}
            onQuickSave={onQuickSave}
            onSaveNiche={onSaveNiche}
            paperbackData={paperbackData}
            ebookData={ebookData}
            initialSimulatorState={simulatorState}
            onSimulatorStateChange={onSimulatorStateChange}
            onApplySimulatorAsVersion={onApplySimulatorAsVersion}
            onApplySimulatorToBase={onApplySimulatorToBase}
          />
        );
      default:
        return null;
    }
  };

  const current = STEPS[currentStep];

  const isResults = currentStep === STEPS.length - 1;

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
      <div className="flex flex-col lg:flex-row min-h-[640px]">
        {/* Sidebar — se reduce a un raíl compacto en el paso Resultados para dar más espacio al simulador */}
        <aside
          className={cn(
            'shrink-0 border-b lg:border-b-0 lg:border-r border-border bg-muted/30 flex flex-col transition-[width] duration-300',
            isResults ? 'lg:w-20 p-3' : 'lg:w-72 p-6',
          )}
        >
          <div className={cn('mb-6', isResults && 'lg:hidden')}>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Asistente
            </p>
            <h2 className="font-heading text-base font-bold text-foreground mt-1">
              Análisis de viabilidad
            </h2>
          </div>

          <nav className="flex-1 space-y-1" aria-label="Pasos del análisis">
            {STEPS.map((step, index) => {
              const isCurrent = index === currentStep;
              const isCompleted = completedSteps[index] && index < currentStep;
              const isReachable =
                index <= currentStep ||
                completedSteps[index] ||
                completedSteps.slice(0, index).every(Boolean);
              const isLast = index === STEPS.length - 1;

              return (
                <div key={step.title} className="relative">
                  <button
                    type="button"
                    onClick={() => handleStepClick(index)}
                    disabled={!isReachable}
                    title={isResults ? `${step.title} · ${step.subtitle}` : undefined}
                    className={cn(
                      'w-full flex items-start gap-3 rounded-lg px-2 py-2 text-left transition-colors',
                      isReachable ? 'cursor-pointer hover:bg-muted' : 'cursor-not-allowed opacity-50',
                      isCurrent && 'bg-muted',
                      isResults && 'lg:justify-center lg:px-0',
                    )}
                  >
                    <div
                      className={cn(
                        'relative z-10 mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors',
                        isCurrent && 'border-primary bg-primary/10 text-primary',
                        isCompleted && 'border-primary/40 bg-primary/10 text-primary',
                        !isCurrent && !isCompleted && 'border-border bg-background text-muted-foreground',
                      )}
                    >
                      {isCompleted ? <Check className="h-4 w-4" /> : index + 1}
                    </div>
                    <div className={cn('flex-1 pt-1.5', isResults && 'lg:hidden')}>
                      <p
                        className={cn(
                          'text-sm font-medium leading-tight',
                          isCurrent ? 'text-foreground' : 'text-foreground/80',
                        )}
                      >
                        {step.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">{step.subtitle}</p>
                    </div>
                  </button>
                  {!isLast && (
                    <span
                      aria-hidden
                      className={cn(
                        'absolute top-11 h-6 w-px',
                        isResults ? 'lg:left-1/2 lg:-translate-x-1/2' : 'left-[26px]',
                        isCompleted ? 'bg-primary/30' : 'bg-border',
                      )}
                    />
                  )}
                </div>
              );
            })}
          </nav>

          <div
            className={cn(
              'mt-8 rounded-xl border border-secondary/20 bg-secondary/5 p-4',
              isResults && 'lg:hidden',
            )}
          >
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="h-3.5 w-3.5 text-secondary" />
              <p className="text-[11px] font-bold uppercase tracking-wider text-secondary">
                Tip del editor
              </p>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">{current.tip}</p>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 flex flex-col min-w-0">
          <header className="flex items-center justify-between gap-4 border-b border-border px-8 py-5">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                Paso {currentStep + 1} de {STEPS.length}
              </p>
              <h3 className="font-heading text-lg font-bold text-foreground truncate">
                {current.title}
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  · {current.subtitle}
                </span>
              </h3>
            </div>
          </header>

          <div className="flex-1 px-8 py-10">{renderStep()}</div>

          <footer className="sticky bottom-0 z-10 border-t border-border bg-card/95 backdrop-blur px-8 py-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {currentStep > 0 && (
                  <Button variant="ghost" onClick={handlePrevious} className="gap-2">
                    <ChevronLeft className="h-4 w-4" />
                    Anterior
                  </Button>
                )}
                {currentStep === STEPS.length - 1 && (
                  <Button variant="ghost" onClick={handleReset} className="gap-2 text-muted-foreground">
                    <RotateCcw className="h-4 w-4" />
                    Nuevo análisis
                  </Button>
                )}
              </div>

              {currentStep < STEPS.length - 1 && (
                <Button
                  onClick={handleNext}
                  disabled={!canProceedFromStep(currentStep)}
                  className="gap-2"
                >
                  Siguiente
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
};
