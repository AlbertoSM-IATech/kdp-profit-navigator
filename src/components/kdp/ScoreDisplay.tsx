import { ScoreBreakdown, GlobalData, EbookResults, PaperbackResults, PositioningResults } from '@/types/kdp';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Gauge, MousePointer, TrendingUp, Tag, HelpCircle, Download } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';

interface ScoreDisplayProps {
  score: ScoreBreakdown | null;
  currencySymbol?: string;
  compact?: boolean;
  embedded?: boolean;
  globalData?: GlobalData;
  activeResults?: EbookResults | PaperbackResults | null;
  positioningResults?: PositioningResults | null;
  onExportPdf?: () => void;
}
interface ScoreItemProps {
  label: string;
  value: number;
  max: number;
  icon: React.ReactNode;
  tooltip: string;
}
const ScoreItem = ({
  label,
  value,
  max,
  icon,
  tooltip
}: ScoreItemProps) => {
  const percentage = value / max * 100;
  return <div className="flex items-center gap-3">
      <div className="p-2 bg-muted rounded-lg shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-xs text-muted-foreground flex items-center gap-1 cursor-help">
                  {label}
                  <HelpCircle className="h-3 w-3" />
                </span>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                <p className="text-xs">{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <span className="text-sm font-semibold text-foreground">{value}/{max}</span>
        </div>
        <Progress value={percentage} className="h-1.5" />
      </div>
    </div>;
};
export const ScoreDisplay = ({
  score,
  currencySymbol = '€',
  compact = false,
  embedded = false,
  globalData,
  activeResults,
  positioningResults
}: ScoreDisplayProps) => {
  
  const handleExportPDF = () => {
    if (!score || !globalData || !activeResults) {
      toast.error('No hay datos suficientes para exportar');
      return;
    }

    const marketplaceLabels: Record<string, string> = {
      'ES': 'Amazon España',
      'COM': 'Amazon USA',
      'MX': 'Amazon México',
      'UK': 'Amazon UK',
      'DE': 'Amazon Alemania',
      'FR': 'Amazon Francia',
      'IT': 'Amazon Italia',
    };

    const formatLabels: Record<string, string> = {
      'EBOOK': 'eBook',
      'PAPERBACK': 'Tapa blanda',
      'HARDCOVER': 'Tapa dura',
    };

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('No se pudo abrir la ventana de impresión');
      return;
    }

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Score de Viabilidad - ${new Date().toLocaleDateString('es-ES')}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; color: #1a1a1a; line-height: 1.6; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #e5e5e5; padding-bottom: 20px; }
          .header h1 { font-size: 24px; color: #1a1a1a; margin-bottom: 5px; }
          .header p { color: #666; font-size: 14px; }
          .score-main { display: flex; justify-content: center; align-items: center; gap: 20px; padding: 30px; background: ${score.status === 'excellent' ? '#f0fdf4' : score.status === 'viable' ? '#fefce8' : '#fef2f2'}; border-radius: 12px; margin-bottom: 30px; }
          .score-number { font-size: 72px; font-weight: 800; color: ${score.statusColor}; }
          .score-max { font-size: 24px; color: #666; }
          .score-status { text-align: center; }
          .score-emoji { font-size: 48px; }
          .score-label { font-size: 18px; font-weight: 600; color: ${score.statusColor}; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
          .card { border: 1px solid #e5e5e5; border-radius: 8px; padding: 20px; }
          .card h3 { font-size: 14px; text-transform: uppercase; color: #666; margin-bottom: 15px; letter-spacing: 0.5px; }
          .metric { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f0f0f0; }
          .metric:last-child { border-bottom: none; }
          .metric-label { color: #666; }
          .metric-value { font-weight: 600; }
          .metric-value.success { color: #16a34a; }
          .metric-value.warning { color: #ca8a04; }
          .metric-value.danger { color: #dc2626; }
          .legend { display: flex; gap: 20px; justify-content: center; margin-top: 20px; }
          .legend-item { display: flex; align-items: center; gap: 8px; font-size: 12px; }
          .legend-dot { width: 10px; height: 10px; border-radius: 50%; }
          .legend-dot.success { background: #16a34a; }
          .legend-dot.warning { background: #ca8a04; }
          .legend-dot.danger { background: #dc2626; }
          .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e5e5; color: #999; font-size: 12px; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📊 Score de Viabilidad KDP</h1>
          <p>Generado el ${new Date().toLocaleDateString('es-ES')} a las ${new Date().toLocaleTimeString('es-ES')}</p>
        </div>

        <div class="score-main">
          <div>
            <span class="score-number">${score.totalScore}</span>
            <span class="score-max">/100</span>
          </div>
          <div class="score-status">
            <div class="score-emoji">${score.statusEmoji}</div>
            <div class="score-label">${score.statusLabel}</div>
          </div>
        </div>

        <div class="grid">
          <div class="card">
            <h3>Configuración del análisis</h3>
            <div class="metric">
              <span class="metric-label">Marketplace</span>
              <span class="metric-value">${marketplaceLabels[globalData.marketplace || ''] || globalData.marketplace}</span>
            </div>
            <div class="metric">
              <span class="metric-label">Formato</span>
              <span class="metric-value">${formatLabels[globalData.selectedFormat || ''] || globalData.selectedFormat}</span>
            </div>
            <div class="metric">
              <span class="metric-label">CPC</span>
              <span class="metric-value">${currencySymbol}${globalData.cpc?.toFixed(2) || '-'}</span>
            </div>
            <div class="metric">
              <span class="metric-label">Ventas diarias competencia</span>
              <span class="metric-value">${globalData.ventasDiariasCompetencia || '-'}</span>
            </div>
          </div>

          <div class="card">
            <h3>Desglose del Score</h3>
            <div class="metric">
              <span class="metric-label">Clics máx./Venta (50pts)</span>
              <span class="metric-value">${score.clicsScore}/50</span>
            </div>
            <div class="metric">
              <span class="metric-label">BACOS (40pts)</span>
              <span class="metric-value">${score.bacosScore}/40</span>
            </div>
            <div class="metric">
              <span class="metric-label">PVP vs Mínimo (10pts)</span>
              <span class="metric-value">${score.pvpVsMinScore}/10</span>
            </div>
          </div>

          <div class="card">
            <h3>Métricas clave</h3>
            <div class="metric">
              <span class="metric-label">Regalía</span>
              <span class="metric-value">${currencySymbol}${activeResults.regalias?.toFixed(2) || '-'}</span>
            </div>
            <div class="metric">
              <span class="metric-label">Clics máx./Venta</span>
              <span class="metric-value ${activeResults.clicsMaxPorVenta >= 14 ? 'success' : activeResults.clicsMaxPorVenta >= 11 ? 'warning' : 'danger'}">${activeResults.clicsMaxPorVenta}</span>
            </div>
            <div class="metric">
              <span class="metric-label">Margen BACOS</span>
              <span class="metric-value ${activeResults.margenPct >= 40 ? 'success' : activeResults.margenPct >= 30 ? 'warning' : 'danger'}">${activeResults.margenPct?.toFixed(1)}%</span>
            </div>
          </div>

          <div class="card">
            <h3>Posicionamiento</h3>
            <div class="metric">
              <span class="metric-label">Inversión diaria</span>
              <span class="metric-value">${currencySymbol}${positioningResults?.inversionDiaria?.toFixed(2) || '-'}</span>
            </div>
            <div class="metric">
              <span class="metric-label">Clics diarios</span>
              <span class="metric-value">${positioningResults?.clicsDiarios?.toFixed(0) || '-'}</span>
            </div>
            <div class="metric">
              <span class="metric-label">Ventas necesarias/día</span>
              <span class="metric-value">${positioningResults?.ventasDiariasNecesarias?.toFixed(1) || '-'}</span>
            </div>
            <div class="metric">
              <span class="metric-label">Días para breakeven</span>
              <span class="metric-value">${positioningResults?.diasParaBreakeven || '-'}</span>
            </div>
          </div>
        </div>

        <div class="legend">
          <div class="legend-item"><span class="legend-dot success"></span> 80-100 Excelente</div>
          <div class="legend-item"><span class="legend-dot warning"></span> 50-79 Aceptable</div>
          <div class="legend-item"><span class="legend-dot danger"></span> &lt;50 En riesgo</div>
        </div>

        <div class="footer">
          <p>⚠️ Puntuaciones orientativas. No sustituyen el análisis profundo de cada nicho.</p>
          <p>Calculadora de Viabilidad KDP</p>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };

    toast.success('PDF generado correctamente');
  };

  if (!score) {
    if (embedded) {
      return (
        <div className="flex items-center justify-center h-32 bg-muted/30 rounded-lg">
          <p className="text-sm text-muted-foreground">
            Completa los datos para ver el score global
          </p>
        </div>
      );
    }
    return <Card className="animate-fade-in">
        <CardHeader className="pb-4">
          <CardTitle className="section-header">
            <Gauge className="h-5 w-5 text-primary" />
            Score Global
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32 bg-muted/30 rounded-lg">
            <p className="text-sm text-muted-foreground">
              Completa los datos para ver el score global
            </p>
          </div>
        </CardContent>
      </Card>;
  }
  const scoreColor = score.status === 'excellent' ? 'text-foreground' : score.status === 'viable' ? 'text-muted-foreground' : 'text-destructive';
  const scoreBg = score.status === 'excellent' ? 'bg-muted/40 border-border' : score.status === 'viable' ? 'bg-muted/30 border-border' : 'bg-destructive/5 border-destructive/20';

  // Compact view for quick mode
  if (compact) {
    return <div className={`flex items-center justify-between p-4 rounded-xl border-2 ${scoreBg}`}>
        <div className="flex items-center gap-4">
          <span className="text-4xl font-extrabold" style={{
          color: score.statusColor
        }}>
            {score.totalScore}
          </span>
          <span className="text-lg text-muted-foreground">/100</span>
        </div>
        <div className="text-right">
          <span className="text-2xl block mb-1">{score.statusEmoji}</span>
          <span className={`text-sm font-bold ${scoreColor}`}>{score.statusLabel}</span>
        </div>
      </div>;
  }
  const content = (
    <div className="space-y-5">
      {/* Multi-column layout for reduced vertical scroll */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: Main Score + Interpretation */}
        <div className="space-y-4">
          {/* Main Score Display */}
          <div className={`flex items-center justify-between p-5 rounded-xl border-2 ${scoreBg}`}>
            <div className="text-center">
              <span className="text-5xl font-extrabold" style={{ color: score.statusColor }}>
                {score.totalScore}
              </span>
              <span className="text-xl text-muted-foreground">/100</span>
            </div>
            <div className="text-right">
              <span className="text-2xl block mb-1">{score.statusEmoji}</span>
              <span className={`text-base font-bold ${scoreColor}`}>{score.statusLabel}</span>
            </div>
          </div>
          
          {/* Interpretation */}
          <div className={`p-3 rounded-lg border ${scoreBg}`}>
            <p className="text-sm text-foreground">
              {score.status === 'excellent' && 'Excelente configuración para escalar campañas de Ads. Margen de maniobra amplio.'}
              {score.status === 'viable' && 'Configuración viable pero requiere ajustes. Optimiza precio, CPC o busca keywords menos competidas.'}
              {score.status === 'not-recommended' && 'No recomendable para Ads en las condiciones actuales. Reformula antes de invertir.'}
            </p>
          </div>

          {/* Score Legend */}
          <div className="grid grid-cols-1 gap-2 text-xs">
            <div className="flex items-center gap-1 p-2 rounded-lg bg-success/10">
              <span className="w-2 h-2 rounded-full bg-success"></span>
              <span className="text-muted-foreground">80-100 Excelente</span>
            </div>
            <div className="flex items-center gap-1 p-2 rounded-lg bg-warning/10">
              <span className="w-2 h-2 rounded-full bg-warning"></span>
              <span className="text-muted-foreground">50-79 Aceptable</span>
            </div>
            <div className="flex items-center gap-1 p-2 rounded-lg bg-destructive/10">
              <span className="w-2 h-2 rounded-full bg-destructive"></span>
              <span className="text-muted-foreground">&lt;50 En riesgo</span>
            </div>
          </div>
        </div>

        {/* Column 2: Score Breakdown */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Desglose del Score
          </h4>
          
          <div className="space-y-3">
            <ScoreItem label="Clics máx./Venta (CRÍTICO)" value={score.clicsScore} max={50} icon={<MousePointer className="h-4 w-4 text-primary" />} tooltip="≥14 clics = 50pts, 13 = 35pts, 12 = 25pts, 11 = 15pts, ≤10 = 0pts" />
            
            <ScoreItem label="BACOS" value={score.bacosScore} max={40} icon={<TrendingUp className="h-4 w-4 text-success" />} tooltip="≥40% = 40pts, ≥35% = 25pts, ≥30% = 15pts, <30% = 0pts" />
            
            <ScoreItem label="PVP vs Mínimo" value={score.pvpVsMinScore} max={10} icon={<Tag className="h-4 w-4 text-secondary" />} tooltip="PVP > rec. = 10pts, PVP = rec. = 5pts, PVP < rec. = 0pts" />
          </div>
        </div>

        {/* Column 3: Action Guide */}
        <div className="space-y-4">
          <div className="p-4 rounded-lg border bg-muted/20 border-border h-full">
            <h5 className="text-sm font-semibold text-foreground mb-3">📋 Guía de acción según rango</h5>
            <ul className="text-sm text-muted-foreground space-y-3">
              <li className="flex items-start gap-2">
                <span className="text-success mt-0.5">●</span>
                <div>
                  <strong className="text-foreground">80-100:</strong>
                  <p className="text-xs mt-0.5">Lanza campaña, escala gradualmente, monitoriza ACoS</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-warning mt-0.5">●</span>
                <div>
                  <strong className="text-foreground">50-79:</strong>
                  <p className="text-xs mt-0.5">Sube PVP, baja CPC objetivo o busca keywords long-tail</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-destructive mt-0.5">●</span>
                <div>
                  <strong className="text-foreground">&lt;50:</strong>
                  <p className="text-xs mt-0.5">Reformula nicho, reduce páginas/costes o descarta para Ads</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Export Button + Disclaimer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground/70 italic">
          ⚠️ Puntuaciones orientativas. No sustituyen el análisis profundo de cada nicho.
        </p>
        {globalData && activeResults && (
          <Button variant="outline" size="sm" onClick={handleExportPDF} className="shrink-0">
            <Download className="h-4 w-4 mr-2" />
            Exportar PDF
          </Button>
        )}
      </div>
    </div>
  );

  if (embedded) {
    return content;
  }

  return <Card className="animate-fade-in h-full">
      <CardHeader className="pb-4">
        <CardTitle className="section-header">
          <Gauge className="h-5 w-5 text-primary" />
          Score Global de Viabilidad
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Indicador sintético (0-100). Los clics por venta determinan la viabilidad en Ads.
        </p>
        <p className="text-xs text-muted-foreground/70 italic mt-1">
          ⚠️ Puntuaciones orientativas. No sustituyen el análisis profundo de cada nicho.
        </p>
      </CardHeader>
      <CardContent>
        {content}
      </CardContent>
    </Card>;
};