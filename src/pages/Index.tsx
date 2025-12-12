import { useKdpCalculator } from '@/hooks/useKdpCalculator';
import { GlobalDataSection } from '@/components/kdp/GlobalDataSection';
import { EbookSection } from '@/components/kdp/EbookSection';
import { PaperbackSection } from '@/components/kdp/PaperbackSection';
import { PositioningSection } from '@/components/kdp/PositioningSection';
import { ResultsTable } from '@/components/kdp/ResultsTable';
import { ReportSection } from '@/components/kdp/ReportSection';
import { ThemeToggle } from '@/components/ThemeToggle';
import { BookOpen, Calculator } from 'lucide-react';

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
    tableData,
  } = useKdpCalculator();

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
                <h1 className="text-xl font-heading font-bold text-foreground">
                  Calculadora KDP
                </h1>
                <p className="text-sm text-muted-foreground">
                  Regalías, Breakeven y Posicionamiento
                </p>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8 space-y-8">
        {/* Info Banner */}
        <div className="bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 rounded-xl p-6 border border-primary/20">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary/20 rounded-lg shrink-0">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="font-heading font-semibold text-foreground mb-1">
                Calcula tus regalías y rentabilidad en Amazon KDP
              </h2>
              <p className="text-sm text-muted-foreground">
                Esta herramienta te ayuda a analizar la viabilidad de tus libros en Amazon KDP, 
                calculando regalías reales, puntos de equilibrio y estrategias de posicionamiento 
                con campañas de publicidad.
              </p>
            </div>
          </div>
        </div>

        {/* Global Data Section */}
        <GlobalDataSection data={globalData} onChange={setGlobalData} />

        {/* eBook & Paperback Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <EbookSection
            data={ebookData}
            results={ebookResults}
            globalData={globalData}
            onChange={setEbookData}
          />
          <PaperbackSection
            data={paperbackData}
            results={paperbackResults}
            globalData={globalData}
            onChange={setPaperbackData}
          />
        </div>

        {/* Positioning Section */}
        <PositioningSection results={positioningResults} globalData={globalData} />

        {/* Results Table */}
        <ResultsTable data={tableData} globalData={globalData} />

        {/* Report Section */}
        <ReportSection
          globalData={globalData}
          ebookData={ebookData}
          ebookResults={ebookResults}
          paperbackData={paperbackData}
          paperbackResults={paperbackResults}
          positioningResults={positioningResults}
          tableData={tableData}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-12">
        <div className="container py-6">
          <p className="text-center text-sm text-muted-foreground">
            Calculadora KDP © {new Date().getFullYear()} — Basada en las tarifas oficiales de Amazon KDP
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
