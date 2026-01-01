import { useKdpCalculator } from '@/hooks/useKdpCalculator';
import { useScoring } from '@/hooks/useScoring';
import { useNicheComparator } from '@/hooks/useNicheComparator';
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
import { Calculator } from 'lucide-react';

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

  const showPhysicalFormat = globalData.selectedFormat === 'PAPERBACK' || globalData.selectedFormat === 'HARDCOVER';
  const activeResults = globalData.selectedFormat === 'EBOOK' ? ebookResults : paperbackResults;
  
  // Calculate investment
  const inversionDiaria = positioningResults?.inversionDiaria || 0;
  
  // Calculate global score
  const scoreBreakdown = useScoring(
    globalData,
    ebookResults,
    paperbackResults,
    ebookData.pvp,
    paperbackData.pvp,
    inversionDiaria
  );

  // Niche comparator
  const { niches, saveCurrentAsNiche, deleteNiche, clearAllNiches, getBestNiche } = useNicheComparator();
  
  const handleSaveNiche = (name: string) => {
    saveCurrentAsNiche(
      name,
      globalData,
      globalData.selectedFormat === 'EBOOK' ? ebookData : null,
      showPhysicalFormat ? paperbackData : null,
      ebookResults,
      paperbackResults,
      inversionDiaria
    );
  };

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
                <h1 className="text-xl font-heading font-bold text-foreground">Calculadora de Viabilidad / Optimización</h1>
                <p className="text-sm text-muted-foreground">
                  Análisis profesional de rentabilidad para publishers
                </p>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8 space-y-6">
        {/* Step 1: Global Data with Format Selector */}
        <GlobalDataSection data={globalData} onChange={setGlobalData} />

        {/* Step 2: Format-specific Section */}
        {globalData.selectedFormat === 'EBOOK' && globalData.marketplace && (
          <EbookSection data={ebookData} results={ebookResults} globalData={globalData} onChange={setEbookData} />
        )}

        {showPhysicalFormat && globalData.marketplace && (
          <>
            <PaperbackSection data={paperbackData} results={paperbackResults} globalData={globalData} onChange={setPaperbackData} />
            {paperbackResults && <PaperbackSimulator data={paperbackData} globalData={globalData} />}
          </>
        )}

        {/* Step 3: Score Global */}
        {globalData.selectedFormat && globalData.marketplace && activeResults && (
          <ScoreDisplay score={scoreBreakdown} currencySymbol={globalData.marketplace === 'COM' ? '$' : '€'} />
        )}

        {/* Step 4: Positioning Analysis */}
        {globalData.selectedFormat && globalData.marketplace && (
          <PositioningSection results={positioningResults} globalData={globalData} activeResults={activeResults} />
        )}

        {/* Step 5: Results Summary */}
        {globalData.selectedFormat && tableData.length > 0 && (
          <ResultsTable data={tableData} globalData={globalData} />
        )}

        {/* Step 6: Niche Comparator */}
        <NicheComparator
          niches={niches}
          onSaveNiche={handleSaveNiche}
          onDeleteNiche={deleteNiche}
          onClearAll={clearAllNiches}
          bestNiche={getBestNiche()}
          hasCurrentData={hasCurrentData}
        />

        {/* Step 7: Final Report */}
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
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-12">
        <div className="container py-6">
          <p className="text-center text-sm text-muted-foreground">
            Publify — Análisis orientado a toma de decisiones © {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
