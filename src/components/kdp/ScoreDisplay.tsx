import { ScoreBreakdown, GlobalData, EbookResults, PaperbackResults, PositioningResults } from '@/types/kdp';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Gauge, MousePointer, TrendingUp, Tag, HelpCircle, Download, Save } from 'lucide-react';
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
  loadedNicheId?: string | null;
  onQuickSave?: () => void;
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
  positioningResults,
  loadedNicheId,
  onQuickSave
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
      'IT': 'Amazon Italia'
    };
    const formatLabels: Record<string, string> = {
      'EBOOK': 'eBook',
      'PAPERBACK': 'Tapa blanda',
      'HARDCOVER': 'Tapa dura'
    };
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('No se pudo abrir la ventana de impresión');
      return;
    }
    // Get paperback-specific data if available
    const isPaperback = globalData.selectedFormat === 'PAPERBACK';
    const paperbackResults = isPaperback ? (activeResults as any) : null;
    
    // Enhanced PDF styling matching the app's design system
    const scoreBgColor = score.status === 'excellent' ? '#f0fdf4' : score.status === 'viable' ? '#fef9c3' : '#fef2f2';
    const scoreBorderColor = score.status === 'excellent' ? '#22c55e' : score.status === 'viable' ? '#eab308' : '#ef4444';
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Análisis de Viabilidad KDP - ${new Date().toLocaleDateString('es-ES')}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
          
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
            padding: 32px; 
            color: #0f172a; 
            line-height: 1.5;
            background: #fafafa;
          }
          
          .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 16px;
            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
            overflow: hidden;
          }
          
          .header { 
            background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
            color: white;
            padding: 24px 32px;
            text-align: center;
          }
          .header h1 { 
            font-size: 22px; 
            font-weight: 700;
            margin-bottom: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
          }
          .header p { 
            color: #94a3b8; 
            font-size: 13px; 
            font-weight: 400;
          }
          
          .content {
            padding: 24px 32px;
          }
          
          .score-main { 
            display: flex; 
            justify-content: space-between;
            align-items: center; 
            padding: 24px; 
            background: ${scoreBgColor}; 
            border: 2px solid ${scoreBorderColor}20;
            border-radius: 16px; 
            margin-bottom: 24px; 
          }
          .score-left {
            display: flex;
            align-items: baseline;
            gap: 4px;
          }
          .score-number { 
            font-size: 64px; 
            font-weight: 800; 
            color: ${score.statusColor}; 
            line-height: 1;
          }
          .score-max { font-size: 20px; color: #64748b; font-weight: 500; }
          .score-right { text-align: right; }
          .score-emoji { font-size: 40px; margin-bottom: 4px; }
          .score-label { 
            font-size: 16px; 
            font-weight: 700; 
            color: ${score.statusColor}; 
          }
          .score-interpretation {
            font-size: 13px;
            color: #475569;
            margin-top: 8px;
            padding: 12px 16px;
            background: white;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
          }
          
          .grid { 
            display: grid; 
            grid-template-columns: 1fr 1fr; 
            gap: 16px; 
            margin-bottom: 24px; 
          }
          
          .card { 
            background: #f8fafc;
            border: 1px solid #e2e8f0; 
            border-radius: 12px; 
            padding: 20px; 
          }
          .card.full-width { grid-column: 1 / -1; }
          .card h3 { 
            font-size: 11px; 
            text-transform: uppercase; 
            color: #64748b; 
            margin-bottom: 16px; 
            letter-spacing: 0.5px;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 6px;
          }
          .card h3 .icon { font-size: 14px; }
          
          .metric { 
            display: flex; 
            justify-content: space-between; 
            align-items: center;
            padding: 10px 0; 
            border-bottom: 1px solid #e2e8f0; 
          }
          .metric:last-child { border-bottom: none; }
          .metric-label { color: #475569; font-size: 13px; }
          .metric-value { font-weight: 600; font-size: 14px; color: #0f172a; }
          .metric-value.success { color: #16a34a; }
          .metric-value.warning { color: #ca8a04; }
          .metric-value.danger { color: #dc2626; }
          
          .progress-bar {
            height: 6px;
            background: #e2e8f0;
            border-radius: 3px;
            overflow: hidden;
            margin-top: 6px;
          }
          .progress-fill {
            height: 100%;
            border-radius: 3px;
          }
          .progress-fill.primary { background: linear-gradient(90deg, #3b82f6, #60a5fa); }
          .progress-fill.success { background: linear-gradient(90deg, #22c55e, #4ade80); }
          .progress-fill.secondary { background: linear-gradient(90deg, #8b5cf6, #a78bfa); }
          
          .score-item {
            padding: 12px 0;
            border-bottom: 1px solid #e2e8f0;
          }
          .score-item:last-child { border-bottom: none; }
          .score-item-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 6px;
          }
          .score-item-label {
            font-size: 12px;
            color: #64748b;
            font-weight: 500;
          }
          .score-item-value {
            font-size: 13px;
            font-weight: 600;
            color: #0f172a;
          }
          
          .advice-box { 
            background: linear-gradient(135deg, #f0f9ff 0%, #ecfdf5 100%); 
            border: 1px solid #86efac; 
            border-radius: 12px; 
            padding: 20px;
          }
          .advice-box h4 { 
            color: #166534; 
            margin-bottom: 12px; 
            font-size: 15px;
            font-weight: 700;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          .advice-box p { 
            color: #374151; 
            font-size: 13px; 
            margin-bottom: 8px;
            line-height: 1.6;
          }
          .advice-box p:last-child { margin-bottom: 0; }
          .advice-box strong { color: #0f172a; font-weight: 600; }
          
          .legend { 
            display: flex; 
            gap: 24px; 
            justify-content: center; 
            padding: 16px;
            background: #f8fafc;
            border-radius: 8px;
            margin-top: 16px;
          }
          .legend-item { 
            display: flex; 
            align-items: center; 
            gap: 6px; 
            font-size: 12px;
            color: #64748b;
            font-weight: 500;
          }
          .legend-dot { 
            width: 10px; 
            height: 10px; 
            border-radius: 50%; 
          }
          .legend-dot.success { background: #22c55e; }
          .legend-dot.warning { background: #eab308; }
          .legend-dot.danger { background: #ef4444; }
          
          .footer { 
            text-align: center; 
            padding: 20px 32px;
            background: #f1f5f9;
            border-top: 1px solid #e2e8f0;
          }
          .footer p { 
            color: #64748b; 
            font-size: 11px;
            margin-bottom: 4px;
          }
          .footer p:last-child { margin-bottom: 0; }
          .footer .brand {
            font-weight: 600;
            color: #475569;
          }
          
          @media print { 
            body { padding: 0; background: white; }
            .container { box-shadow: none; border-radius: 0; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📊 Análisis de Viabilidad KDP</h1>
            <p>Generado el ${new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} a las ${new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</p>
          </div>

          <div class="content">
            <div class="score-main">
              <div class="score-left">
                <span class="score-number">${score.totalScore}</span>
                <span class="score-max">/100</span>
              </div>
              <div class="score-right">
                <div class="score-emoji">${score.statusEmoji}</div>
                <div class="score-label">${score.statusLabel}</div>
              </div>
            </div>
            
            <div class="score-interpretation">
              ${score.status === 'excellent' ? '✅ Excelente configuración para escalar campañas de Ads. Margen de maniobra amplio.' : ''}
              ${score.status === 'viable' ? '⚠️ Configuración viable pero requiere ajustes. Optimiza precio, CPC o busca keywords menos competidas.' : ''}
              ${score.status === 'not-recommended' ? '❌ No recomendable para Ads en las condiciones actuales. Reformula antes de invertir.' : ''}
            </div>

            <div class="grid" style="margin-top: 24px;">
              <div class="card">
                <h3><span class="icon">⚙️</span> Configuración del análisis</h3>
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
                <div class="metric">
                  <span class="metric-label">Margen objetivo</span>
                  <span class="metric-value">${globalData.margenObjetivoPct || '-'}%</span>
                </div>
              </div>

              <div class="card">
                <h3><span class="icon">📊</span> Desglose del Score</h3>
                <div class="score-item">
                  <div class="score-item-header">
                    <span class="score-item-label">🖱️ Clics máx./Venta (CRÍTICO)</span>
                    <span class="score-item-value">${score.clicsScore}/50</span>
                  </div>
                  <div class="progress-bar">
                    <div class="progress-fill primary" style="width: ${(score.clicsScore / 50) * 100}%"></div>
                  </div>
                </div>
                <div class="score-item">
                  <div class="score-item-header">
                    <span class="score-item-label">📈 BACOS</span>
                    <span class="score-item-value">${score.bacosScore}/40</span>
                  </div>
                  <div class="progress-bar">
                    <div class="progress-fill success" style="width: ${(score.bacosScore / 40) * 100}%"></div>
                  </div>
                </div>
                <div class="score-item">
                  <div class="score-item-header">
                    <span class="score-item-label">🏷️ PVP vs Mínimo</span>
                    <span class="score-item-value">${score.pvpVsMinScore}/10</span>
                  </div>
                  <div class="progress-bar">
                    <div class="progress-fill secondary" style="width: ${(score.pvpVsMinScore / 10) * 100}%"></div>
                  </div>
                </div>
              </div>

              <div class="card">
                <h3><span class="icon">💰</span> Métricas clave del formato</h3>
                <div class="metric">
                  <span class="metric-label">Regalía neta</span>
                  <span class="metric-value success">${currencySymbol}${activeResults.regalias?.toFixed(2) || '-'}</span>
                </div>
                <div class="metric">
                  <span class="metric-label">Clics máx./Venta</span>
                  <span class="metric-value ${activeResults.clicsMaxPorVenta >= 14 ? 'success' : activeResults.clicsMaxPorVenta >= 11 ? 'warning' : 'danger'}">${activeResults.clicsMaxPorVenta}</span>
                </div>
                <div class="metric">
                  <span class="metric-label">Margen BACOS</span>
                  <span class="metric-value ${activeResults.margenPct >= 40 ? 'success' : activeResults.margenPct >= 30 ? 'warning' : 'danger'}">${activeResults.margenPct?.toFixed(1)}%</span>
                </div>
                <div class="metric">
                  <span class="metric-label">CPC máx. rentable</span>
                  <span class="metric-value">${currencySymbol}${activeResults.cpcMaxRentable?.toFixed(2) || '-'}</span>
                </div>
                ${isPaperback && paperbackResults?.gastosImpresion ? `
                <div class="metric">
                  <span class="metric-label">Coste de impresión</span>
                  <span class="metric-value">${currencySymbol}${paperbackResults.gastosImpresion?.toFixed(2) || '-'}</span>
                </div>
                ` : ''}
              </div>

              <div class="card">
                <h3><span class="icon">📍</span> Posicionamiento y Ads</h3>
                <div class="metric">
                  <span class="metric-label">Clics diarios necesarios</span>
                  <span class="metric-value">${positioningResults?.clicsDiarios?.toFixed(0) || '-'}</span>
                </div>
                <div class="metric">
                  <span class="metric-label">Inversión diaria estimada</span>
                  <span class="metric-value">${currencySymbol}${positioningResults?.inversionDiaria?.toFixed(2) || '-'}</span>
                </div>
                <div class="metric">
                  <span class="metric-label">Ventas necesarias/día</span>
                  <span class="metric-value">${positioningResults?.ventasDiariasNecesarias?.toFixed(1) || '-'}</span>
                </div>
                <div class="metric">
                  <span class="metric-label">Tasa de conversión ref.</span>
                  <span class="metric-value">10%</span>
                </div>
              </div>

              <div class="card full-width advice-box">
                <h4>💡 Consejo estratégico</h4>
                <p>Para competir con los libros mejor posicionados de tu nicho, necesitarás conseguir aproximadamente <strong>${globalData.ventasDiariasCompetencia || 0} copias vendidas al día</strong>.</p>
                <p>Con una conversión del 10%, esto requiere <strong>${positioningResults?.clicsDiarios?.toFixed(0) || 0} clics diarios</strong> y una inversión de <strong>${currencySymbol}${positioningResults?.inversionDiaria?.toFixed(2) || 0}/día</strong> en Amazon Ads.</p>
                <p>📊 Breakeven publicitario: necesitas <strong>1 pedido cada ${activeResults.clicsMaxPorVenta} clics</strong> para no perder dinero.</p>
              </div>
            </div>

            <div class="legend">
              <div class="legend-item"><span class="legend-dot success"></span> 80-100 Excelente</div>
              <div class="legend-item"><span class="legend-dot warning"></span> 50-79 Aceptable</div>
              <div class="legend-item"><span class="legend-dot danger"></span> &lt;50 En riesgo</div>
            </div>
          </div>

          <div class="footer">
            <p>⚠️ Puntuaciones orientativas. No sustituyen el análisis profundo de cada nicho.</p>
            <p class="brand">Calculadora de Viabilidad KDP - Publify</p>
          </div>
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
      return <div className="flex items-center justify-center h-32 bg-muted/30 rounded-lg">
          <p className="text-sm text-muted-foreground">
            Completa los datos para ver el score global
          </p>
        </div>;
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
  const content = <div className="space-y-5">
      
      {/* 2-column layout for compact Score */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Column 1: Main Score + Interpretation + Legend */}
        <div className="space-y-4">
          {/* Main Score Display */}
          <div className={`flex items-center justify-between p-5 rounded-xl border-2 ${scoreBg}`}>
            <div className="text-center">
              <span className="text-5xl font-extrabold" style={{
              color: score.statusColor
            }}>
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
          <div className="grid grid-cols-3 gap-2 text-xs">
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

        {/* Column 2: Score Breakdown + Action Guide */}
        <div className="space-y-4">
          {/* Score Breakdown */}
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Desglose del Score
            </h4>
            
            <div className="space-y-3">
              <ScoreItem label="Clics máx./Venta (CRÍTICO)" value={score.clicsScore} max={50} icon={<MousePointer className="h-4 w-4 text-primary" />} tooltip="≥14 clics = 50pts, 13 = 35pts, 12 = 25pts, 11 = 15pts, ≤10 = 0pts" />
              
              <ScoreItem label="BACOS" value={score.bacosScore} max={40} icon={<TrendingUp className="h-4 w-4 text-success" />} tooltip="≥40% = 40pts, ≥35% = 25pts, ≥30% = 15pts, <30% = 0pts" />
              
              <ScoreItem label="PVP vs Mínimo" value={score.pvpVsMinScore} max={10} icon={<Tag className="h-4 w-4 text-secondary" />} tooltip="PVP > rec. = 10pts, PVP = rec. = 5pts, PVP < rec. = 0pts" />
            </div>
          </div>

          {/* Action Guide - Compact */}
          <div className="p-4 rounded-lg border bg-muted/20 border-border">
            <h5 className="text-sm font-semibold text-foreground mb-2">Guía de acción</h5>
            <ul className="text-xs text-muted-foreground space-y-1.5">
              <li className="flex items-start gap-2">
                <span className="text-success mt-0.5">●</span>
                <span><strong className="text-foreground">80-100:</strong> Lanza campaña y escala</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-warning mt-0.5">●</span>
                <span><strong className="text-foreground">50-79:</strong> Ajusta PVP o CPC</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-destructive mt-0.5">●</span>
                <span><strong className="text-foreground">&lt;50:</strong> Reformula o descarta</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Export Button (highlighted) + Quick Save + Disclaimer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border">
        <div className="flex items-center gap-2">
          {globalData && activeResults && (
            <Button onClick={handleExportPDF} className="shrink-0 bg-orange-500 hover:bg-orange-600 text-white">
              <Download className="h-4 w-4 mr-2" />
              Exportar PDF
            </Button>
          )}
          {loadedNicheId && onQuickSave && (
            <Button 
              onClick={() => { 
                onQuickSave(); 
                toast.success('Nueva versión guardada', {
                  description: 'El historial de versiones se ha actualizado',
                });
              }} 
              variant="outline" 
              className="shrink-0"
            >
              <Save className="h-4 w-4 mr-2" />
              Guardar versión
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground/70 italic">
          Puntuaciones orientativas. No sustituyen el análisis profundo de cada nicho.
        </p>
      </div>
    </div>;
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