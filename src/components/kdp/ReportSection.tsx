import { useRef } from 'react';
import {
  GlobalData,
  EbookData,
  EbookResults,
  PaperbackData,
  PaperbackResults,
  PositioningResults,
  TableRow,
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
  const currencySymbol = globalData.marketplace === 'COM' ? '$' : '€';

  const showEbook = globalData.selectedFormat === 'EBOOK' && ebookResults;
  const showPaperback = globalData.selectedFormat === 'PAPERBACK' && paperbackResults;
  const hasData = showEbook || showPaperback;

  const generateRisks = (): string[] => {
    const risks: string[] = [];

    if (globalData.margenObjetivoPct && globalData.margenObjetivoPct < 30) {
      risks.push('El margen objetivo está por debajo del 30% recomendado.');
    }

    if (showEbook && ebookResults) {
      if (ebookResults.diagnostico === 'bad') {
        risks.push(`eBook: Solo puedes permitir ${ebookResults.clicsPorVenta} clics por venta, lo que indica una campaña no rentable.`);
      }
      if (ebookResults.regalias < 1) {
        risks.push('eBook: Las regalías por unidad son muy bajas (<1€). Considera aumentar el PVP.');
      }
    }

    if (showPaperback && paperbackResults) {
      if (paperbackResults.diagnostico === 'bad') {
        risks.push(`Paperback: Margen del ${(paperbackResults.margenBacos * 100).toFixed(1)}% o ${paperbackResults.clicsPorVenta} clics indica riesgo alto.`);
      }
      if (paperbackResults.regalias < 0) {
        risks.push('Paperback: Las regalías son negativas. El precio actual no cubre los costes de impresión.');
      }
    }

    if (positioningResults?.advertencias) {
      risks.push(...positioningResults.advertencias);
    }

    return risks;
  };

  const generateRecommendations = (): string[] => {
    const recs: string[] = [];

    if (showEbook && ebookResults?.diagnostico === 'bad') {
      recs.push('Considera aumentar el PVP del eBook o reducir el CPC de tus campañas.');
    }

    if (showPaperback && paperbackResults?.diagnostico === 'bad' && paperbackResults.precioMinObjetivo) {
      recs.push(`Aumenta el PVP del Paperback a al menos ${paperbackResults.precioMinObjetivo.toFixed(2)}${currencySymbol} para alcanzar el margen objetivo.`);
    }

    if ((showEbook && ebookResults?.diagnostico === 'good') || (showPaperback && paperbackResults?.diagnostico === 'good')) {
      recs.push('Tu configuración actual es óptima. Mantén la estrategia y monitoriza las métricas semanalmente.');
    }

    if (positioningResults && positioningResults.inversionDiaria > 50) {
      recs.push('La inversión diaria estimada es alta. Considera empezar con un presupuesto reducido y escalar gradualmente.');
    }

    if (tableData.some(r => r.margen < 30)) {
      recs.push('Revisa los productos con margen inferior al 30% antes de lanzar campañas agresivas.');
    }

    return recs;
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const content = reportRef.current?.innerHTML || '';
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Informe KDP - ${new Date().toLocaleDateString('es-ES')}</title>
        <style>
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            line-height: 1.6;
            color: #1F1F1F;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px;
          }
          h1 { color: #FB923C; font-size: 24px; margin-bottom: 8px; }
          h2 { color: #3B82F6; font-size: 18px; margin-top: 24px; border-bottom: 2px solid #3B82F6; padding-bottom: 4px; }
          h3 { font-size: 14px; margin-top: 16px; }
          .section { margin-bottom: 24px; }
          .data-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
          .data-item { display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid #eee; }
          .data-label { color: #666; }
          .data-value { font-weight: 600; }
          .risk { color: #EF4444; }
          .success { color: #22C55E; }
          .warning { color: #F59E0B; }
          ul { margin: 8px 0; padding-left: 20px; }
          li { margin: 4px 0; }
          .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #ddd; font-size: 12px; color: #999; }
        </style>
      </head>
      <body>
        ${content}
        <div class="footer">
          Generado con Calculadora KDP - ${new Date().toLocaleDateString('es-ES')} ${new Date().toLocaleTimeString('es-ES')}
        </div>
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
            {/* Header */}
            <div>
              <h1 className="text-2xl font-heading font-bold text-primary">Informe de Análisis KDP</h1>
              <p className="text-sm text-muted-foreground">
                Fecha: {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
              <p className="text-sm text-muted-foreground">
                Formato analizado: {globalData.selectedFormat === 'EBOOK' ? 'eBook' : 'Paperback'}
              </p>
            </div>

            {/* Datos Globales */}
            <div className="section">
              <h2 className="text-lg font-heading font-semibold text-secondary border-b-2 border-secondary pb-1 mb-3">
                Configuración General
              </h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="data-row">
                  <span className="data-label">Marketplace</span>
                  <span className="data-value">{globalData.marketplace === 'ES' ? 'Amazon España' : 'Amazon USA'}</span>
                </div>
                <div className="data-row">
                  <span className="data-label">Margen Objetivo</span>
                  <span className="data-value">{globalData.margenObjetivoPct ?? '-'}%</span>
                </div>
                <div className="data-row">
                  <span className="data-label">CPC</span>
                  <span className="data-value">{globalData.cpc?.toFixed(2) ?? '-'}{currencySymbol}</span>
                </div>
                <div className="data-row">
                  <span className="data-label">Ventas Diarias Competencia</span>
                  <span className="data-value">{globalData.ventasDiariasCompetencia ?? '-'}</span>
                </div>
              </div>
            </div>

            {/* eBook Results */}
            {showEbook && ebookResults && (
              <div className="section">
                <h2 className="text-lg font-heading font-semibold text-secondary border-b-2 border-secondary pb-1 mb-3">
                  Resultados eBook
                </h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="data-row">
                    <span className="data-label">PVP</span>
                    <span className="data-value">{ebookData.pvp?.toFixed(2)}{currencySymbol}</span>
                  </div>
                  <div className="data-row">
                    <span className="data-label">Tasa de Regalías</span>
                    <span className="data-value">{ebookData.royaltyRate}%</span>
                  </div>
                  <div className="data-row">
                    <span className="data-label">Regalías por Venta</span>
                    <span className="data-value font-bold text-secondary">{ebookResults.regalias.toFixed(2)}{currencySymbol}</span>
                  </div>
                  <div className="data-row">
                    <span className="data-label">Margen ACOS</span>
                    <span className="data-value">{(ebookResults.margenAcos * 100).toFixed(1)}%</span>
                  </div>
                  <div className="data-row">
                    <span className="data-label">Clics máx. por Venta</span>
                    <span className={`data-value font-bold ${ebookResults.diagnostico === 'bad' ? 'text-destructive' : 'text-success'}`}>
                      {ebookResults.clicsPorVenta}
                    </span>
                  </div>
                  <div className="data-row">
                    <span className="data-label">Diagnóstico</span>
                    <span className={`data-value font-bold ${
                      ebookResults.diagnostico === 'good' ? 'text-success' :
                      ebookResults.diagnostico === 'warning' ? 'text-warning' : 'text-destructive'
                    }`}>
                      {ebookResults.diagnostico === 'good' ? 'Campaña buena' :
                       ebookResults.diagnostico === 'warning' ? 'Límite aceptable' : 'Mala campaña'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Paperback Results */}
            {showPaperback && paperbackResults && (
              <div className="section">
                <h2 className="text-lg font-heading font-semibold text-secondary border-b-2 border-secondary pb-1 mb-3">
                  Resultados Paperback
                </h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="data-row">
                    <span className="data-label">PVP</span>
                    <span className="data-value">{paperbackData.pvp?.toFixed(2)}{currencySymbol}</span>
                  </div>
                  <div className="data-row">
                    <span className="data-label">Páginas</span>
                    <span className="data-value">{paperbackData.pages}</span>
                  </div>
                  <div className="data-row">
                    <span className="data-label">Interior</span>
                    <span className="data-value">{paperbackData.interior ? interiorLabels[paperbackData.interior] : '-'}</span>
                  </div>
                  <div className="data-row">
                    <span className="data-label">Tamaño</span>
                    <span className="data-value">{paperbackData.size ? sizeLabels[paperbackData.size] : '-'}</span>
                  </div>
                  <div className="data-row">
                    <span className="data-label">Gastos Impresión</span>
                    <span className="data-value">{paperbackResults.gastosImpresion.toFixed(2)}{currencySymbol}</span>
                  </div>
                  <div className="data-row">
                    <span className="data-label">Regalías por Venta</span>
                    <span className={`data-value font-bold ${paperbackResults.regalias > 0 ? 'text-primary' : 'text-destructive'}`}>
                      {paperbackResults.regalias.toFixed(2)}{currencySymbol}
                    </span>
                  </div>
                  <div className="data-row">
                    <span className="data-label">Margen BACOS</span>
                    <span className="data-value">{(paperbackResults.margenBacos * 100).toFixed(1)}%</span>
                  </div>
                  <div className="data-row">
                    <span className="data-label">Clics máx. por Venta</span>
                    <span className="data-value font-bold">{paperbackResults.clicsPorVenta}</span>
                  </div>
                  {paperbackResults.precioMinObjetivo && (
                    <div className="data-row col-span-2 bg-primary/10 p-2 rounded">
                      <span className="data-label font-semibold">Precio Mínimo Objetivo</span>
                      <span className="data-value font-bold text-primary">{paperbackResults.precioMinObjetivo.toFixed(2)}{currencySymbol}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Positioning */}
            {positioningResults && (
              <div className="section">
                <h2 className="text-lg font-heading font-semibold text-secondary border-b-2 border-secondary pb-1 mb-3">
                  Análisis de Ads
                </h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="data-row">
                    <span className="data-label">Clics Diarios Estimados</span>
                    <span className="data-value">{Math.ceil(positioningResults.clicsDiarios)}</span>
                  </div>
                  <div className="data-row">
                    <span className="data-label">Inversión Diaria</span>
                    <span className="data-value font-bold">{positioningResults.inversionDiaria.toFixed(2)}{currencySymbol}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Risks */}
            {risks.length > 0 && (
              <div className="section">
                <h2 className="text-lg font-heading font-semibold text-destructive border-b-2 border-destructive pb-1 mb-3 flex items-center gap-2">
                  <XCircle className="h-5 w-5" />
                  Riesgos Detectados
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

            {/* Recommendations */}
            <div className="section">
              <h2 className="text-lg font-heading font-semibold text-success border-b-2 border-success pb-1 mb-3 flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Recomendaciones
              </h2>
              <ul className="space-y-2">
                {recommendations.length > 0 ? (
                  recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-success mt-0.5 shrink-0" />
                      <span>{rec}</span>
                    </li>
                  ))
                ) : (
                  <li className="flex items-start gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-success mt-0.5 shrink-0" />
                    <span>Completa más datos para obtener recomendaciones personalizadas.</span>
                  </li>
                )}
              </ul>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-48 bg-muted/30 rounded-lg">
            <FileText className="h-12 w-12 text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground text-center">
              Selecciona un formato y completa los datos para generar el informe final
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
