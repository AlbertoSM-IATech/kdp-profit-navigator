import { useState } from 'react';
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
import { Download, Loader2, FileText, CheckCircle, AlertCircle } from 'lucide-react';
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
  sensitivityChartRef?: React.RefObject<HTMLDivElement>;
  royaltyChartRef?: React.RefObject<HTMLDivElement>;
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
  sensitivityChartRef,
  royaltyChartRef,
}: ExportPdfProps) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const config = globalData.marketplace ? MARKETPLACE_CONFIGS[globalData.marketplace] : null;
  const currencySymbol = config?.currencySymbol || '€';
  const isEbook = globalData.selectedFormat === 'EBOOK';
  const activeResults = isEbook ? ebookResults : paperbackResults;

  const captureChartImage = async (chartRef: React.RefObject<HTMLDivElement> | undefined): Promise<string | null> => {
    if (!chartRef?.current) return null;
    
    try {
      const canvas = await html2canvas(chartRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
        useCORS: true,
      });
      return canvas.toDataURL('image/png');
    } catch (error) {
      console.error('Error capturing chart:', error);
      return null;
    }
  };

  const handleExportPdf = async () => {
    if (!activeResults || !globalData.marketplace) {
      setExportError('No hay datos suficientes para exportar. Configura el análisis primero.');
      setTimeout(() => setExportError(null), 3000);
      return;
    }

    setIsExporting(true);
    setExportSuccess(false);
    setExportError(null);

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
          if (yPos > pageHeight - margin - 10) {
            pdf.addPage();
            yPos = margin;
          }
          pdf.text(line, margin, yPos);
          yPos += size * 0.4;
        });
        yPos += 2;
      };

      const addLine = () => {
        if (yPos > pageHeight - margin - 10) {
          pdf.addPage();
          yPos = margin;
        }
        pdf.setDrawColor(200, 200, 200);
        pdf.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 5;
      };

      const addImage = async (imageData: string | null, maxHeight: number = 80) => {
        if (!imageData) return;
        
        try {
          const img = new Image();
          img.src = imageData;
          await new Promise((resolve) => { img.onload = resolve; });
          
          const aspectRatio = img.width / img.height;
          const imgWidth = pageWidth - 2 * margin;
          let imgHeight = imgWidth / aspectRatio;
          
          if (imgHeight > maxHeight) {
            imgHeight = maxHeight;
          }
          
          if (yPos + imgHeight > pageHeight - margin) {
            pdf.addPage();
            yPos = margin;
          }
          
          pdf.addImage(imageData, 'PNG', margin, yPos, imgWidth, imgHeight);
          yPos += imgHeight + 5;
        } catch (error) {
          console.error('Error adding image to PDF:', error);
        }
      };

      // Header
      addText('Analisis de Viabilidad KDP', 18, 'bold', [59, 130, 246]);
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
      addText('Configuracion Global', 14, 'bold');
      addText(`- Marketplace: ${globalData.marketplace}`, 10);
      addText(`- Formato: ${isEbook ? 'eBook' : 'Formato impreso'}`, 10);
      addText(`- Margen objetivo: ${globalData.margenObjetivoPct}%`, 10);
      addText(`- CPC medio: ${globalData.cpc}${currencySymbol}`, 10);
      addText(`- Ventas diarias competencia: ${globalData.ventasDiariasCompetencia}`, 10);
      yPos += 3;
      addLine();

      // Format specific data
      if (isEbook && ebookResults) {
        addText('Datos del eBook', 14, 'bold');
        addText(`- PVP: ${ebookData.pvp}${currencySymbol}`, 10);
        addText(`- Tasa de regalia: ${ebookData.royaltyRate}%`, 10);
        addText(`- Tamano: ${ebookData.tamanoMb || 0} MB`, 10);
        addText(`- Coste de entrega: ${ebookResults.deliveryCost.toFixed(2)}${currencySymbol}`, 10);
      } else if (paperbackResults) {
        addText('Datos del Libro Fisico', 14, 'bold');
        const interiorLabels: Record<string, string> = { BN: 'Blanco y Negro', COLOR_PREMIUM: 'Color Premium', COLOR_STANDARD: 'Color Estandar' };
        const sizeLabels: Record<string, string> = { SMALL: 'Pequeno (<=6x9")', LARGE: 'Grande (>6x9")' };
        addText(`- Encuadernacion: ${paperbackData.bookFormat === 'HARDCOVER' ? 'Tapa dura' : 'Tapa blanda'}`, 10);
        addText(`- Tipo impresion: ${paperbackData.interior ? interiorLabels[paperbackData.interior] : 'N/A'}`, 10);
        addText(`- Tamano: ${paperbackData.size ? sizeLabels[paperbackData.size] : 'N/A'}`, 10);
        addText(`- Paginas: ${paperbackData.pages}`, 10);
        addText(`- PVP: ${paperbackData.pvp}${currencySymbol}`, 10);
        addText(`- Coste impresion: ${paperbackResults.gastosImpresion.toFixed(2)}${currencySymbol}`, 10);
      }
      yPos += 3;
      addLine();

      // Results
      addText('Resultados del Analisis', 14, 'bold');
      const regaliasColor: [number, number, number] = activeResults.regalias >= 0 ? [34, 197, 94] : [239, 68, 68];
      addText(`- Regalia neta: ${activeResults.regalias.toFixed(2)}${currencySymbol}`, 11, 'bold', regaliasColor);
      addText(`- Margen real (BACOS): ${activeResults.margenPct.toFixed(1)}%`, 10);
      addText(`- Clics max. por venta: ${activeResults.clicsMaxPorVenta}`, 10);
      addText(`- CPC maximo rentable: ${activeResults.cpcMaxRentable.toFixed(3)}${currencySymbol}`, 10);
      addText(`- Tasa conversion breakeven: ${(activeResults.tasaConvBreakeven * 100).toFixed(2)}%`, 10);
      
      if (activeResults.precioMinObjetivo) {
        addText(`- PVP minimo recomendado: ${activeResults.precioMinObjetivo.toFixed(2)}${currencySymbol}`, 10, 'bold', [59, 130, 246]);
      }
      yPos += 3;
      addLine();

      // Score
      if (scoreBreakdown) {
        addText('Puntuacion de Viabilidad', 14, 'bold');
        const scoreColor: [number, number, number] = scoreBreakdown.totalScore >= 70 ? [34, 197, 94] : 
          scoreBreakdown.totalScore >= 50 ? [234, 179, 8] : [239, 68, 68];
        addText(`Puntuacion total: ${scoreBreakdown.totalScore}/100 ${scoreBreakdown.statusEmoji}`, 16, 'bold', scoreColor);
        addText(`Estado: ${scoreBreakdown.status === 'excellent' ? 'Excelente - Publicar' : 
          scoreBreakdown.status === 'viable' ? 'Viable - Ajustar' : 
          scoreBreakdown.status === 'risky' ? 'Riesgoso - Revisar' : 'No recomendable - Descartar'}`, 11);
        yPos += 2;
        addText(`- Clics max./venta: ${scoreBreakdown.clicsScore}/50 pts`, 10);
        addText(`- BACOS (margen): ${scoreBreakdown.bacosScore}/30 pts`, 10);
        addText(`- PVP vs minimo: ${scoreBreakdown.pvpVsMinScore}/20 pts`, 10);
        yPos += 3;
        addLine();
      }

      // Positioning
      if (positioningResults) {
        addText('Posicionamiento', 14, 'bold');
        addText(`- Clics diarios estimados: ${positioningResults.clicsDiarios.toFixed(0)}`, 10);
        addText(`- Inversion diaria: ${positioningResults.inversionDiaria.toFixed(2)}${currencySymbol}`, 10);
        if (positioningResults.diasParaBreakeven) {
          addText(`- Dias para breakeven: ~${positioningResults.diasParaBreakeven}`, 10);
        }
        if (positioningResults.advertencias.length > 0) {
          yPos += 2;
          addText('Advertencias:', 10, 'bold', [234, 179, 8]);
          positioningResults.advertencias.forEach(adv => {
            addText(`  ${adv}`, 9, 'normal', [128, 128, 128]);
          });
        }
        yPos += 3;
        addLine();
      }

      // Capture and add charts
      if (royaltyChartRef?.current || sensitivityChartRef?.current) {
        addText('Graficos de Analisis', 14, 'bold');
        yPos += 3;
        
        const royaltyImage = await captureChartImage(royaltyChartRef);
        if (royaltyImage) {
          addText('Simulacion de Regalias por PVP:', 10, 'normal', [128, 128, 128]);
          await addImage(royaltyImage, 70);
        }
        
        const sensitivityImage = await captureChartImage(sensitivityChartRef);
        if (sensitivityImage) {
          addText('Sensibilidad por Paginas:', 10, 'normal', [128, 128, 128]);
          await addImage(sensitivityImage, 70);
        }
        
        addLine();
      }

      // Recommendation
      if (tableData.length > 0) {
        addText('Recomendacion', 14, 'bold');
        tableData.forEach(row => {
          addText(row.recomendacion, 10);
        });
      }

      // Footer on each page
      const totalPages = pdf.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(128, 128, 128);
        pdf.text('Publify - Analisis de Viabilidad KDP', margin, pageHeight - 10);
        pdf.text(`Pagina ${i} de ${totalPages}`, pageWidth - margin - 20, pageHeight - 10);
      }

      // Save
      const fileName = `analisis-kdp-${globalData.marketplace}-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      setExportError('Error al generar el PDF. Inténtalo de nuevo.');
      setTimeout(() => setExportError(null), 3000);
    } finally {
      setIsExporting(false);
    }
  };

  // Show component even if no data, with a message
  const canExport = activeResults && globalData.marketplace;

  return (
    <Card className="animate-fade-in">
      <CardHeader className="pb-4">
        <CardTitle className="section-header">
          <FileText className="h-5 w-5 text-primary" />
          📄 Exportar Análisis
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Descarga el análisis completo en formato PDF incluyendo gráficos.
        </p>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Button 
            onClick={handleExportPdf} 
            disabled={isExporting || !canExport}
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
          
          {!canExport && (
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Configura el análisis para poder exportar.
            </p>
          )}
          
          {canExport && !exportError && (
            <p className="text-xs text-muted-foreground">
              Incluye: configuración, resultados, puntuación, gráficos y recomendaciones.
            </p>
          )}
          
          {exportError && (
            <p className="text-xs text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {exportError}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};