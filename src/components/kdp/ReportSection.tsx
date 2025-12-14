import { useRef } from 'react';
import {
  GlobalData,
  EbookData,
  EbookResults,
  PaperbackData,
  PaperbackResults,
  PositioningResults,
  TableRow,
  MARKETPLACE_CONFIGS,
} from '@/types/kdp';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, Printer, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

interface ReportSectionProps {
  globalData: GlobalData;
  ebookData: EbookData;
  ebookResults: EbookResults | null;
  paperbackData: PaperbackData;
  paperbackResults: PaperbackResults | null;
  positioningResults: PositioningResults | null;
  tableData: TableRow[];
}

const interiorLabels: Record<string, string> = {
  BN: 'Blanco y Negro',
  COLOR_PREMIUM: 'Color Premium',
  COLOR_STANDARD: 'Color Estándar',
};

const sizeLabels: Record<string, string> = {
  SMALL: 'Pequeño',
  LARGE: 'Grande',
};

export const ReportSection = ({
  globalData,
  ebookData,
  ebookResults,
  paperbackData,
  paperbackResults,
  positioningResults,
  tableData,
}: ReportSectionProps) => {
  const reportRef = useRef<HTMLDivElement>(null);
  const config = globalData.marketplace ? MARKETPLACE_CONFIGS[globalData.marketplace] : null;
  const currencySymbol = config?.currencySymbol || '€';

  const showEbook = globalData.selectedFormat === 'EBOOK' && ebookResults;
  const showPaperback = (globalData.selectedFormat === 'PAPERBACK' || globalData.selectedFormat === 'HARDCOVER') && paperbackResults;
  const hasData = showEbook || showPaperback;

  const getViabilityStatus = () => {
    if (showEbook && ebookResults) return ebookResults.viabilityStatus;
    if (showPaperback && paperbackResults) return paperbackResults.viabilityStatus;
    return null;
  };

  const generateRisks = (): string[] => {
    const risks: string[] = [];

    if (globalData.margenObjetivoPct && globalData.margenObjetivoPct < 30) {
      risks.push('El margen objetivo está por debajo del 30% recomendado.');
    }

    if (showEbook && ebookResults) {
      if (ebookResults.diagnostico === 'bad') {
        risks.push(`eBook: Solo puedes permitir ${ebookResults.clicsMaxPorVenta} clics por venta.`);
      }
      if (ebookResults.regalias < 1) {
        risks.push('eBook: Las regalías por unidad son muy bajas (<1€).');
      }
    }

    if (showPaperback && paperbackResults) {
      if (paperbackResults.diagnostico === 'bad') {
        risks.push(`Paperback: Margen del ${paperbackResults.margenPct.toFixed(1)}% o ${paperbackResults.clicsMaxPorVenta} clics indica riesgo alto.`);
      }
      if (paperbackResults.regalias < 0) {
        risks.push('Paperback: Las regalías son negativas.');
      }
    }

    if (positioningResults?.advertencias) {
      risks.push(...positioningResults.advertencias);
    }

    return risks;
  };

  const generateRecommendations = (): string[] => {
    const recs: string[] = [];
    const viability = getViabilityStatus();

    if (viability === 'viable') {
      recs.push('Tu configuración actual es viable. Mantén la estrategia y monitoriza las métricas.');
    }

    if (viability === 'adjustable') {
      recs.push('Considera ajustar el PVP para mejorar el margen antes de invertir fuertemente en Ads.');
    }

    if (viability === 'not-viable') {
      if (showPaperback && paperbackResults?.precioMinObjetivo) {
        recs.push(`Aumenta el PVP a al menos ${paperbackResults.precioMinObjetivo.toFixed(2)}${currencySymbol}.`);
      } else {
        recs.push('Revisa el pricing o reduce el CPC objetivo.');
      }
    }

    return recs;
  };

  const handlePrint = () => window.print();

  const handleDownloadPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const content = reportRef.current?.innerHTML || '';
    const viability = getViabilityStatus();
    const viabilityText = viability === 'viable' ? '🟢 Viable' : viability === 'adjustable' ? '🟠 Ajustable' : '🔴 No viable';
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Informe KDP - ${new Date().toLocaleDateString('es-ES')}</title>
        <style>
          body { font-family: 'Inter', sans-serif; line-height: 1.6; color: #1F1F1F; max-width: 800px; margin: 0 auto; padding: 40px 20px; }
          h1 { color: #FB923C; font-size: 24px; margin-bottom: 8px; }
          h2 { color: #3B82F6; font-size: 18px; margin-top: 24px; border-bottom: 2px solid #3B82F6; padding-bottom: 4px; }
          .section { margin-bottom: 24px; }
          .data-row { display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid #eee; }
          .viability { font-size: 20px; font-weight: bold; margin: 16px 0; }
          .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #ddd; font-size: 12px; color: #999; }
        </style>
      </head>
      <body>
        <h1>Análisis de Viabilidad KDP — ${globalData.selectedFormat} — ${config?.name || 'N/A'}</h1>
        <p class="viability">Estado: ${viabilityText}</p>
        ${content}
        <div class="footer">Generado con Publify — ${new Date().toLocaleDateString('es-ES')}</div>
      </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.print();
  };

  const risks = generateRisks();
  const recommendations = generateRecommendations();

  return (
    <Card className="animate-fade-in">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="section-header">
            <FileText className="h-5 w-5 text-primary" />
            Informe Final
          </CardTitle>
          {hasData && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                Imprimir
              </Button>
              <Button size="sm" onClick={handleDownloadPDF}>
                <Download className="h-4 w-4 mr-2" />
                Exportar PDF
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <div ref={reportRef} className="space-y-6">
            <div>
              <h1 className="text-2xl font-heading font-bold text-primary">Informe de Análisis KDP</h1>
              <p className="text-sm text-muted-foreground">
                Fecha: {new Date().toLocaleDateString('es-ES')} — Formato: {globalData.selectedFormat}
              </p>
            </div>

            {/* Key Results */}
            {showEbook && ebookResults && (
              <div className="section">
                <h2 className="text-lg font-heading font-semibold text-secondary border-b-2 border-secondary pb-1 mb-3">Resultados eBook</h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="data-row"><span>PVP</span><span>{ebookData.pvp?.toFixed(2)}{currencySymbol}</span></div>
                  <div className="data-row"><span>Regalías</span><span className="font-bold">{ebookResults.regalias.toFixed(2)}{currencySymbol}</span></div>
                  <div className="data-row"><span>Margen</span><span>{ebookResults.margenPct.toFixed(1)}%</span></div>
                  <div className="data-row"><span>Clics máx.</span><span>{ebookResults.clicsMaxPorVenta}</span></div>
                </div>
              </div>
            )}

            {showPaperback && paperbackResults && (
              <div className="section">
                <h2 className="text-lg font-heading font-semibold text-secondary border-b-2 border-secondary pb-1 mb-3">Resultados Paperback</h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="data-row"><span>PVP</span><span>{paperbackData.pvp?.toFixed(2)}{currencySymbol}</span></div>
                  <div className="data-row"><span>Regalías</span><span className="font-bold">{paperbackResults.regalias.toFixed(2)}{currencySymbol}</span></div>
                  <div className="data-row"><span>Margen</span><span>{paperbackResults.margenPct.toFixed(1)}%</span></div>
                  <div className="data-row"><span>Clics máx.</span><span>{paperbackResults.clicsMaxPorVenta}</span></div>
                </div>
              </div>
            )}

            {risks.length > 0 && (
              <div className="section">
                <h2 className="text-lg font-heading font-semibold text-destructive border-b-2 border-destructive pb-1 mb-3 flex items-center gap-2">
                  <XCircle className="h-5 w-5" /> Riesgos
                </h2>
                <ul className="space-y-2">
                  {risks.map((risk, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                      <span>{risk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="section">
              <h2 className="text-lg font-heading font-semibold text-success border-b-2 border-success pb-1 mb-3 flex items-center gap-2">
                <CheckCircle className="h-5 w-5" /> Recomendaciones
              </h2>
              <ul className="space-y-2">
                {recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-success mt-0.5 shrink-0" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-48 bg-muted/30 rounded-lg">
            <FileText className="h-12 w-12 text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground">Selecciona un formato y completa los datos</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
