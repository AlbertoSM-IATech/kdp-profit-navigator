import { useKdpCalculator } from '@/hooks/useKdpCalculator';
import { GlobalDataSection } from '@/components/kdp/GlobalDataSection';
import { EbookSection } from '@/components/kdp/EbookSection';
import { PaperbackSection } from '@/components/kdp/PaperbackSection';
import { PositioningSection } from '@/components/kdp/PositioningSection';
import { ResultsTable } from '@/components/kdp/ResultsTable';
import { ReportSection } from '@/components/kdp/ReportSection';
import { PaperbackSimulator } from '@/components/kdp/PaperbackSimulator';
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
  return <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Calculator className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-heading font-bold text-foreground">
                  Calculadora de Viabilidad                  
                </h1>
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
        {globalData.selectedFormat === 'EBOOK' && globalData.marketplace && <EbookSection data={ebookData} results={ebookResults} globalData={globalData} onChange={setEbookData} />}

        {showPhysicalFormat && globalData.marketplace && <>
            <PaperbackSection data={paperbackData} results={paperbackResults} globalData={globalData} onChange={setPaperbackData} />
            {paperbackResults && <PaperbackSimulator data={paperbackData} globalData={globalData} onChange={setPaperbackData} onGlobalChange={setGlobalData} />}
          </>}

        {/* Step 3: Positioning Analysis */}
        {globalData.selectedFormat && globalData.marketplace && <PositioningSection results={positioningResults} globalData={globalData} />}

        {/* Step 4: Results Summary */}
        {globalData.selectedFormat && tableData.length > 0 && <ResultsTable data={tableData} globalData={globalData} />}

        {/* Step 5: Final Report */}
        <ReportSection globalData={globalData} ebookData={ebookData} ebookResults={ebookResults} paperbackData={paperbackData} paperbackResults={paperbackResults} positioningResults={positioningResults} tableData={tableData} />
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-12">
        <div className="container py-6">
          <p className="text-center text-sm text-muted-foreground">
            Publify — Análisis orientado a toma de decisiones © {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>;
};
export default Index;