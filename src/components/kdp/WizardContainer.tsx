import { useState, useCallback } from 'react';
import { GlobalData, EbookData, PaperbackData, EbookResults, PaperbackResults, PositioningResults, ScoreBreakdown, TableRow, FormatType, SimulatorData } from '@/types/kdp';
import { Button } from '@/components/ui/button';
import { WizardProgress } from './wizard/WizardProgress';
import { StepFormat } from './wizard/StepFormat';
import { StepMarket } from './wizard/StepMarket';
import { StepBookData } from './wizard/StepBookData';
import { StepResults } from './wizard/StepResults';
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { WizardIntro } from './WizardIntro';

interface WizardContainerProps {
  // Data
  globalData: GlobalData;
  ebookData: EbookData;
  paperbackData: PaperbackData;
  // Results
  ebookResults: EbookResults | null;
  paperbackResults: PaperbackResults | null;
  positioningResults: PositioningResults | null;
  scoreBreakdown: ScoreBreakdown | null;
  tableData: TableRow[];
  // Handlers
  setGlobalData: (data: GlobalData) => void;
  setEbookData: (data: EbookData) => void;
  setPaperbackData: (data: PaperbackData) => void;
  // Niche management
  loadedNicheId: string | null;
  onQuickSave: (() => void) | undefined;
  onSaveNiche: (name: string, simulatorData?: SimulatorData) => void;
  onStartNew: () => void;
  // Simulator state
  simulatorState?: SimulatorData;
  onSimulatorStateChange?: (state: SimulatorData) => void;
  onApplySimulatorAsVersion?: () => void;
  onApplySimulatorToBase?: (simData: SimulatorData) => void;
}

const STEPS = ['Formato', 'Mercado', 'Libro', 'Resultados'];

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
  const [currentStep, setCurrentStep] = useState(0);

  const activeResults = globalData.selectedFormat === 'EBOOK' ? ebookResults : paperbackResults;

  // Validation for each step
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
        return true;
      default:
        return false;
    }
  }, [globalData, ebookData, paperbackData]);

  // Get completed steps
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
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleReset = () => {
    onStartNew();
    setCurrentStep(0);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <StepFormat
            selectedFormat={globalData.selectedFormat}
            onFormatChange={handleFormatChange}
          />
        );
      case 1:
        return (
          <StepMarket
            globalData={globalData}
            onChange={setGlobalData}
          />
        );
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

  return (
    <div className="space-y-8">
      {/* Intro Card */}
      {currentStep === 0 && <WizardIntro />}

      {/* Progress Indicator */}
      <div className="bg-card border border-border rounded-xl p-6">
        <WizardProgress
          steps={STEPS}
          currentStep={currentStep}
          completedSteps={completedSteps}
        />
      </div>

      {/* Step Content */}
      <div className="bg-card border border-border rounded-xl p-8 min-h-[400px]">
        {renderStep()}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {currentStep > 0 && (
            <Button
              variant="outline"
              onClick={handlePrevious}
              className="gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>
          )}
          {currentStep === STEPS.length - 1 && (
            <Button
              variant="ghost"
              onClick={handleReset}
              className="gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Nuevo análisis
            </Button>
          )}
        </div>

        {currentStep < STEPS.length - 1 && (
          <Button
            onClick={handleNext}
            disabled={!canProceedFromStep(currentStep)}
            className="gap-2 bg-primary hover:bg-primary/90"
          >
            Siguiente
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};
