import { GlobalData, EbookResults, PaperbackResults, PositioningResults, ScoreBreakdown, TableRow } from '@/types/kdp';
import { ScoreDisplay } from '@/components/kdp/ScoreDisplay';
import { ResultsTable } from '@/components/kdp/ResultsTable';
import { PositioningSection } from '@/components/kdp/PositioningSection';
import { AlertTriangle } from 'lucide-react';

interface StepResultsProps {
  globalData: GlobalData;
  activeResults: EbookResults | PaperbackResults | null;
  positioningResults: PositioningResults | null;
  scoreBreakdown: ScoreBreakdown | null;
  tableData: TableRow[];
  loadedNicheId: string | null;
  onQuickSave: (() => void) | undefined;
}

const DISCLAIMER_TEXT = `Aviso importante: Los valores mostrados son estimaciones orientativas basadas en los datos introducidos y en tasas de referencia del sector. No constituyen predicciones exactas de resultados. El rendimiento real de tus campañas dependerá de múltiples factores como la calidad creativa, la competencia del momento, las tendencias del mercado y la ejecución de la estrategia.`;

export const StepResults = ({
  globalData,
  activeResults,
  positioningResults,
  scoreBreakdown,
  tableData,
  loadedNicheId,
  onQuickSave,
}: StepResultsProps) => {
  const currencySymbol = globalData.marketplace === 'COM' ? '$' : '€';

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

      {/* Disclaimer */}
      <div className="p-4 bg-muted/30 border border-border rounded-xl">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground leading-relaxed">
            {DISCLAIMER_TEXT}
          </p>
        </div>
      </div>
    </div>
  );
};
