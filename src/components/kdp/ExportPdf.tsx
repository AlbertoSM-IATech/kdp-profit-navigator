import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  GlobalData, 
  EbookData, 
  EbookResults, 
  PaperbackData, 
  PaperbackResults, 
  PositioningResults,
  TableRow,
  ScoreBreakdown,
  MARKETPLACE_CONFIGS
} from '@/types/kdp';
import { Download, Loader2, FileText, CheckCircle } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface ExportPdfProps {
  globalData: GlobalData;
  ebookData: EbookData;
  ebookResults: EbookResults | null;
  paperbackData: PaperbackData;
  paperbackResults: PaperbackResults | null;
  positioningResults: PositioningResults | null;
  tableData: TableRow[];
  scoreBreakdown: ScoreBreakdown | null;
  chartRef?: React.RefObject<HTMLDivElement>;
}

export const ExportPdf = ({
  globalData,
  ebookData,
  ebookResults,
  paperbackData,
  paperbackResults,
  positioningResults,
  tableData,
  scoreBreakdown,
}: ExportPdfProps) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const config = globalData.marketplace ? MARKETPLACE_CONFIGS[globalData.marketplace] : null;
  const currencySymbol = config?.currencySymbol || '€';
  const isEbook = globalData.selectedFormat === 'EBOOK';
  const activeResults = isEbook ? ebookResults : paperbackResults;

  const handleExportPdf = async () => {
    if (!activeResults || !globalData.marketplace) return;

    setIsExporting(true);
    setExportSuccess(false);

    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      let yPos = margin;

      // Helper function
      const addText = (text: string, size: number, style: 'normal' | 'bold' = 'normal', color: [number, number, number] = [0, 0, 0]) => {
        pdf.setFontSize(size);
        pdf.setFont('helvetica', style);
        pdf.setTextColor(...color);
        const lines = pdf.splitTextToSize(text, pageWidth - 2 * margin);
        lines.forEach((line: string) => {
          if (yPos > pageHeight - margin) {
            pdf.addPage();
            yPos = margin;
          }
          pdf.text(line, margin, yPos);
          yPos += size * 0.4;
        });
        yPos += 2;
      };

      const addLine = () => {
        if (yPos > pageHeight - margin) {
          pdf.addPage();
          yPos = margin;
        }
        pdf.setDrawColor(200, 200, 200);
        pdf.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 5;
      };

      // Header
      addText('📊 Análisis de Viabilidad KDP', 18, 'bold', [59, 130, 246]);
      addText(`Generado: ${new Date().toLocaleDateString('es-ES', { 
        day: '2-digit', 
        month: 'long', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}`, 10, 'normal', [128, 128, 128]);
      yPos += 5;
      addLine();

      // Global Data
      addText('📌 Configuración Global', 14, 'bold');
      addText(`• Marketplace: ${globalData.marketplace}`, 10);
      addText(`• Formato: ${isEbook ? 'eBook' : 'Formato impreso'}`, 10);
      addText(`• Margen objetivo: ${globalData.margenObjetivoPct}%`, 10);
      addText(`• CPC medio: ${globalData.cpc}${currencySymbol}`, 10);
      addText(`• Ventas diarias competencia: ${globalData.ventasDiariasCompetencia}`, 10);
      yPos += 3;
      addLine();

      // Format specific data
      if (isEbook && ebookResults) {
        addText('📚 Datos del eBook', 14, 'bold');
        addText(`• PVP: ${ebookData.pvp}${currencySymbol}`, 10);
        addText(`• Tasa de regalía: ${ebookData.royaltyRate}%`, 10);
        addText(`• Tamaño: ${ebookData.tamanoMb || 0} MB`, 10);
        addText(`• Coste de entrega: ${ebookResults.deliveryCost.toFixed(2)}${currencySymbol}`, 10);
      } else if (paperbackResults) {
        addText('📖 Datos del Libro Físico', 14, 'bold');
        const interiorLabels = { BN: 'Blanco y Negro', COLOR_PREMIUM: 'Color Premium', COLOR_STANDARD: 'Color Estándar' };
        const sizeLabels = { SMALL: 'Pequeño (≤6x9")', LARGE: 'Grande (>6x9")' };
        addText(`• Encuadernación: ${paperbackData.bookFormat === 'HARDCOVER' ? 'Tapa dura' : 'Tapa blanda'}`, 10);
        addText(`• Tipo impresión: ${interiorLabels[paperbackData.interior!]}`, 10);
        addText(`• Tamaño: ${sizeLabels[paperbackData.size!]}`, 10);
        addText(`• Páginas: ${paperbackData.pages}`, 10);
        addText(`• PVP: ${paperbackData.pvp}${currencySymbol}`, 10);
        addText(`• Coste impresión: ${paperbackResults.gastosImpresion.toFixed(2)}${currencySymbol}`, 10);
      }
      yPos += 3;
      addLine();

      // Results
      addText('📈 Resultados del Análisis', 14, 'bold');
      const regaliasColor: [number, number, number] = activeResults.regalias >= 0 ? [34, 197, 94] : [239, 68, 68];
      addText(`• Regalía neta: ${activeResults.regalias.toFixed(2)}${currencySymbol}`, 11, 'bold', regaliasColor);
      addText(`• Margen real (BACOS): ${activeResults.margenPct.toFixed(1)}%`, 10);
      addText(`• Clics máx. por venta: ${activeResults.clicsMaxPorVenta}`, 10);
      addText(`• CPC máximo rentable: ${activeResults.cpcMaxRentable.toFixed(3)}${currencySymbol}`, 10);
      addText(`• Tasa conversión breakeven: ${(activeResults.tasaConvBreakeven * 100).toFixed(2)}%`, 10);
      
      if (activeResults.precioMinObjetivo) {
        addText(`• PVP mínimo recomendado: ${activeResults.precioMinObjetivo.toFixed(2)}${currencySymbol}`, 10, 'bold', [59, 130, 246]);
      }
      yPos += 3;
      addLine();

      // Score
      if (scoreBreakdown) {
        addText('🎯 Puntuación de Viabilidad', 14, 'bold');
        const scoreColor: [number, number, number] = scoreBreakdown.totalScore >= 70 ? [34, 197, 94] : 
          scoreBreakdown.totalScore >= 50 ? [234, 179, 8] : [239, 68, 68];
        addText(`Puntuación total: ${scoreBreakdown.totalScore}/100 ${scoreBreakdown.statusEmoji}`, 16, 'bold', scoreColor);
        addText(`Estado: ${scoreBreakdown.status === 'excellent' ? 'Excelente - Publicar' : 
          scoreBreakdown.status === 'viable' ? 'Viable - Ajustar' : 
          scoreBreakdown.status === 'risky' ? 'Riesgoso - Revisar' : 'No recomendable - Descartar'}`, 11);
        yPos += 2;
        addText(`• Clics máx./venta: ${scoreBreakdown.clicsScore}/50 pts`, 10);
        addText(`• BACOS (margen): ${scoreBreakdown.bacosScore}/30 pts`, 10);
        addText(`• PVP vs mínimo: ${scoreBreakdown.pvpVsMinScore}/20 pts`, 10);
        yPos += 3;
        addLine();
      }

      // Positioning
      if (positioningResults) {
        addText('🎯 Posicionamiento', 14, 'bold');
        addText(`• Clics diarios estimados: ${positioningResults.clicsDiarios.toFixed(0)}`, 10);
        addText(`• Inversión diaria: ${positioningResults.inversionDiaria.toFixed(2)}${currencySymbol}`, 10);
        if (positioningResults.diasParaBreakeven) {
          addText(`• Días para breakeven: ~${positioningResults.diasParaBreakeven}`, 10);
        }
        if (positioningResults.advertencias.length > 0) {
          yPos += 2;
          addText('⚠️ Advertencias:', 10, 'bold', [234, 179, 8]);
          positioningResults.advertencias.forEach(adv => {
            addText(`  ${adv}`, 9, 'normal', [128, 128, 128]);
          });
        }
        yPos += 3;
        addLine();
      }

      // Recommendation
      if (tableData.length > 0) {
        addText('💡 Recomendación', 14, 'bold');
        tableData.forEach(row => {
          addText(row.recomendacion, 10);
        });
      }

      // Footer
      yPos = pageHeight - 15;
      pdf.setFontSize(8);
      pdf.setTextColor(128, 128, 128);
      pdf.text('Publify — Análisis de Viabilidad KDP', margin, yPos);
      pdf.text(`Página 1`, pageWidth - margin - 15, yPos);

      // Save
      const fileName = `analisis-kdp-${globalData.marketplace}-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (error) {
      console.error('Error exporting PDF:', error);
    } finally {
      setIsExporting(false);
    }
  };

  if (!activeResults || !globalData.marketplace) {
    return null;
  }

  return (
    <Card className="animate-fade-in">
      <CardHeader className="pb-4">
        <CardTitle className="section-header">
          <FileText className="h-5 w-5 text-primary" />
          📄 Exportar Análisis
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Descarga el análisis completo en formato PDF.
        </p>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Button 
            onClick={handleExportPdf} 
            disabled={isExporting}
            className="w-full sm:w-auto"
          >
            {isExporting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generando PDF...
              </>
            ) : exportSuccess ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                ¡Descargado!
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Exportar a PDF
              </>
            )}
          </Button>
          <p className="text-xs text-muted-foreground">
            Incluye: configuración, resultados, puntuación y recomendaciones.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};