import { useRef } from 'react';
import {
  GlobalData,
  EbookData,
  EbookResults,
  PaperbackData,
  PaperbackResults,
  PositioningResults,
  TableRow,
  ScoreBreakdown,
  MARKETPLACE_CONFIGS,
} from '@/types/kdp';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, Printer, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { calculatePrintingCost } from '@/data/printingCosts';

interface SavedNicheForPdf {
  name: string;
  scoreBreakdown: ScoreBreakdown;
  clicsMaxPorVenta: number;
  bacos: number;
  pvp: number;
  precioMinRecomendado: number | null;
}

interface ReportSectionProps {
  globalData: GlobalData;
  ebookData: EbookData;
  ebookResults: EbookResults | null;
  paperbackData: PaperbackData;
  paperbackResults: PaperbackResults | null;
  positioningResults: PositioningResults | null;
  tableData: TableRow[];
  scoreBreakdown: ScoreBreakdown | null;
  savedNiches?: SavedNicheForPdf[];
  embedded?: boolean;
}

const interiorLabels: Record<string, string> = {
  BN: 'Blanco y Negro',
  COLOR_PREMIUM: 'Color Premium',
  COLOR_STANDARD: 'Color Estándar',
};

const sizeLabels: Record<string, string> = {
  SMALL: 'Pequeño (≤6x9")',
  LARGE: 'Grande (>6x9")',
};

// Click status labels - NEW THRESHOLDS v5
const getClicksStatus = (clicks: number) => {
  if (clicks >= 14) return { emoji: '🟢', text: 'Excelente', color: '#22C55E' };
  if (clicks >= 13) return { emoji: '🟢', text: 'Bueno', color: '#22C55E' };
  if (clicks >= 11) return { emoji: '🟡', text: 'Aceptable', color: '#EAB308' };
  return { emoji: '🔴', text: 'En riesgo', color: '#EF4444' };
};

// Score status for PDF - Updated thresholds v5
const getScoreStatus = (score: number) => {
  if (score >= 80) return { emoji: '🟢', text: 'Excelente', color: '#22C55E' };
  if (score >= 50) return { emoji: '🟡', text: 'Aceptable', color: '#EAB308' };
  return { emoji: '🔴', text: 'En riesgo', color: '#EF4444' };
};

// Generate SVG gauge for score (0-100)
const generateScoreGaugeSvg = (score: number): string => {
  const radius = 60;
  const strokeWidth = 12;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const progress = Math.min(score, 100) / 100;
  const strokeDashoffset = circumference - progress * circumference;
  
  const getGaugeColor = (s: number) => {
    if (s >= 80) return '#22C55E';
    if (s >= 50) return '#EAB308';
    return '#EF4444';
  };
  
  const color = getGaugeColor(score);
  
  return `
    <svg width="140" height="140" viewBox="0 0 140 140">
      <circle
        stroke="#E5E7EB"
        fill="transparent"
        stroke-width="${strokeWidth}"
        r="${normalizedRadius}"
        cx="70"
        cy="70"
        transform="rotate(-90 70 70)"
      />
      <circle
        stroke="${color}"
        fill="transparent"
        stroke-width="${strokeWidth}"
        stroke-dasharray="${circumference} ${circumference}"
        stroke-dashoffset="${strokeDashoffset}"
        stroke-linecap="round"
        r="${normalizedRadius}"
        cx="70"
        cy="70"
        transform="rotate(-90 70 70)"
      />
      <text x="70" y="70" text-anchor="middle" dominant-baseline="middle" font-size="28" font-weight="bold" fill="${color}">${score}</text>
      <text x="70" y="95" text-anchor="middle" font-size="12" fill="#6B7280">/ 100</text>
    </svg>
  `;
};

// Generate comparison bar chart SVG
const generateComparisonChartSvg = (
  currentName: string,
  currentScore: number,
  otherNiches: { name: string; score: number }[]
): string => {
  const allData = [{ name: currentName + ' (actual)', score: currentScore }, ...otherNiches.slice(0, 4)];
  const maxScore = 100;
  const barHeight = 28;
  const barGap = 12;
  const chartWidth = 350;
  const labelWidth = 120;
  const barMaxWidth = chartWidth - labelWidth - 40;
  const chartHeight = allData.length * (barHeight + barGap) + 20;
  
  const getBarColor = (s: number) => {
    if (s >= 80) return '#22C55E';
    if (s >= 50) return '#EAB308';
    return '#EF4444';
  };
  
  let bars = '';
  allData.forEach((item, index) => {
    const y = index * (barHeight + barGap) + 10;
    const barWidth = (item.score / maxScore) * barMaxWidth;
    const color = getBarColor(item.score);
    const isFirst = index === 0;
    
    bars += `
      <text x="0" y="${y + barHeight / 2 + 4}" font-size="11" fill="${isFirst ? '#1F1F1F' : '#6B7280'}" font-weight="${isFirst ? '600' : '400'}">${item.name.substring(0, 18)}${item.name.length > 18 ? '...' : ''}</text>
      <rect x="${labelWidth}" y="${y}" width="${barWidth}" height="${barHeight}" rx="4" fill="${color}" opacity="${isFirst ? '1' : '0.7'}"/>
      <text x="${labelWidth + barWidth + 8}" y="${y + barHeight / 2 + 4}" font-size="12" fill="${color}" font-weight="600">${item.score}</text>
    `;
  });
  
  return `
    <svg width="${chartWidth}" height="${chartHeight}" viewBox="0 0 ${chartWidth} ${chartHeight}">
      ${bars}
    </svg>
  `;
};

export const ReportSection = ({
  globalData,
  ebookData,
  ebookResults,
  paperbackData,
  paperbackResults,
  positioningResults,
  tableData,
  scoreBreakdown,
  savedNiches = [],
}: ReportSectionProps) => {
  const reportRef = useRef<HTMLDivElement>(null);
  const config = globalData.marketplace ? MARKETPLACE_CONFIGS[globalData.marketplace] : null;
  const currencySymbol = config?.currencySymbol || '€';

  const showEbook = globalData.selectedFormat === 'EBOOK' && ebookResults;
  const showPaperback = globalData.selectedFormat === 'PAPERBACK' && paperbackResults;
  const hasData = showEbook || showPaperback;

  const getViabilityStatus = () => {
    if (showEbook && ebookResults) return ebookResults.viabilityStatus;
    if (showPaperback && paperbackResults) return paperbackResults.viabilityStatus;
    return null;
  };

  const getViabilityDisplay = () => {
    const status = getViabilityStatus();
    switch (status) {
      case 'viable': return { emoji: '🟢', text: 'Excelente', subtext: 'Campaña sana, buen margen de maniobra', color: '#22C55E' };
      case 'adjustable': return { emoji: '🟡', text: 'Aceptable', subtext: 'Funciona, pero hay riesgo si el CPC sube', color: '#EAB308' };
      case 'not-viable': return { emoji: '🔴', text: 'En riesgo', subtext: 'Ajusta precio o costes antes de invertir', color: '#EF4444' };
      default: return { emoji: '⚪', text: 'Sin datos', subtext: '', color: '#9CA3AF' };
    }
  };

  const generateRisks = (): string[] => {
    const risks: string[] = [];

    if (globalData.margenObjetivoPct && globalData.margenObjetivoPct < 30) {
      risks.push('El margen objetivo está por debajo del 30% recomendado.');
    }

    if (showEbook && ebookResults) {
      if (ebookResults.clicsMaxPorVenta < 10) {
        risks.push(`eBook: Solo puedes permitir ${ebookResults.clicsMaxPorVenta} clics por venta (campaña en riesgo).`);
      }
      if (ebookResults.regalias < 1) {
        risks.push('eBook: Las regalías por unidad son muy bajas (<1€).');
      }
    }

      if (showPaperback && paperbackResults) {
        if (paperbackResults.clicsMaxPorVenta < 10) {
          risks.push(`Formato impreso: Solo puedes permitir ${paperbackResults.clicsMaxPorVenta} clics por venta (campaña en riesgo).`);
        }
        if (paperbackResults.margenPct < 30) {
          risks.push(`Formato impreso: Margen del ${paperbackResults.margenPct.toFixed(1)}% está por debajo del 30% recomendado.`);
        }
        if (paperbackResults.regalias < 0) {
          risks.push('Formato impreso: Las regalías son negativas.');
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
      if (showPaperback && paperbackResults?.precioMinObjetivo) {
        recs.push(`El precio mínimo recomendado para tu margen objetivo es ${paperbackResults.precioMinObjetivo.toFixed(2)}${currencySymbol}.`);
      }
    }

    if (viability === 'not-viable') {
      if (showPaperback && paperbackResults?.precioMinObjetivo) {
        recs.push(`Aumenta el PVP a al menos ${paperbackResults.precioMinObjetivo.toFixed(2)}${currencySymbol}.`);
      } else if (showEbook && ebookResults?.precioMinObjetivo) {
        recs.push(`Aumenta el PVP a al menos ${ebookResults.precioMinObjetivo.toFixed(2)}${currencySymbol}.`);
      } else {
        recs.push('Revisa el pricing o reduce el CPC objetivo.');
      }
      recs.push('Busca keywords con menor CPC o reduce costes de producción.');
    }

    return recs;
  };

  const handlePrint = () => window.print();

  // Generate complete PDF with all study data including simulator
  const handleDownloadPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const viability = getViabilityDisplay();
    const risks = generateRisks();
    const recommendations = generateRecommendations();
    
    // Simulator data (current paperback values)
    const simPvp = paperbackData.pvp || 9.99;
    const simPages = paperbackData.pages || 100;
    const simCpc = globalData.cpc || 0.35;
    const simMargenObj = globalData.margenObjetivoPct || 30;
    
    // Recalculate simulator results for PDF
    let simResults = null;
    if (paperbackData.interior && paperbackData.size) {
      const printingResult = calculatePrintingCost(paperbackData.interior, paperbackData.size, simPages);
      const royaltyRate = simPvp < 9.99 ? 0.50 : 0.60;
      const ivaPct = globalData.marketplace === 'ES' ? 4 : 0;
      const precioSinIva = simPvp / (1 + ivaPct / 100);
      const regalias = (precioSinIva * royaltyRate) - printingResult.totalCost;
      const margenBacos = simPvp > 0 ? (regalias / simPvp) * 100 : 0;
      const clicsMax = simCpc > 0 && regalias > 0 ? Math.floor(regalias / simCpc) : 0;
      
      simResults = {
        pvp: simPvp,
        pages: simPages,
        cpc: simCpc,
        regalias,
        margenBacos,
        clicsMax,
        clicksStatus: getClicksStatus(clicsMax),
      };
    }

    // Positioning calculations
    const ventasDiarias = globalData.ventasDiariasCompetencia || 0;
    const clicsDiarios = ventasDiarias > 0 ? Math.ceil(ventasDiarias / 0.10) : 0;
    const inversionDiaria = clicsDiarios * (globalData.cpc || 0);

    // Active results
    const activeResults = showEbook ? ebookResults : paperbackResults;
    const clicksStatus = activeResults ? getClicksStatus(activeResults.clicsMaxPorVenta) : null;
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Informe KDP - ${new Date().toLocaleDateString('es-ES')}</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { 
            font-family: 'Segoe UI', system-ui, sans-serif; 
            line-height: 1.6; 
            color: #1F1F1F; 
            max-width: 800px; 
            margin: 0 auto; 
            padding: 40px 30px;
            background: #fff;
          }
          h1 { color: #FB923C; font-size: 26px; margin-bottom: 8px; font-weight: 700; }
          h2 { 
            color: #3B82F6; 
            font-size: 16px; 
            margin: 28px 0 14px; 
            padding-bottom: 6px; 
            border-bottom: 2px solid #3B82F6;
            font-weight: 600;
          }
          h3 { font-size: 14px; margin: 16px 0 8px; font-weight: 600; color: #374151; }
          .subtitle { color: #6B7280; font-size: 14px; margin-bottom: 20px; }
          .viability-box { 
            background: linear-gradient(135deg, #f8f9fa 0%, #fff 100%);
            border-radius: 12px; 
            padding: 20px; 
            margin: 20px 0;
            border-left: 4px solid ${viability.color};
          }
          .viability-status { font-size: 28px; font-weight: 700; color: ${viability.color}; }
          .viability-sub { color: #6B7280; font-size: 14px; margin-top: 4px; }
          .data-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin: 16px 0; }
          .data-item { 
            background: #f8f9fa; 
            padding: 12px 16px; 
            border-radius: 8px;
            border: 1px solid #e5e7eb;
          }
          .data-label { font-size: 12px; color: #6B7280; margin-bottom: 4px; }
          .data-value { font-size: 18px; font-weight: 600; color: #1F1F1F; }
          .data-value.accent { color: #FB923C; }
          .data-value.success { color: #22C55E; }
          .data-value.warning { color: #EAB308; }
          .data-value.danger { color: #EF4444; }
          .section { margin-bottom: 24px; page-break-inside: avoid; }
          .risk-item, .rec-item { 
            display: flex; 
            align-items: flex-start; 
            gap: 10px; 
            padding: 10px 14px;
            margin: 8px 0;
            border-radius: 8px;
            font-size: 14px;
          }
          .risk-item { background: #FEF2F2; border: 1px solid #FECACA; }
          .rec-item { background: #F0FDF4; border: 1px solid #BBF7D0; }
          .icon { font-size: 16px; flex-shrink: 0; }
          .strategic-box {
            background: linear-gradient(135deg, #EFF6FF 0%, #FFF7ED 100%);
            border-radius: 12px;
            padding: 20px;
            margin: 16px 0;
            border: 1px solid #DBEAFE;
          }
          .strategic-box .highlight { 
            color: #FB923C; 
            font-weight: 700;
          }
          .simulator-note {
            background: #FFFBEB;
            border: 1px solid #FDE68A;
            border-radius: 8px;
            padding: 12px 16px;
            font-size: 13px;
            color: #92400E;
            margin-top: 12px;
          }
          .footer { 
            margin-top: 40px; 
            padding-top: 16px; 
            border-top: 2px solid #e5e7eb; 
            font-size: 12px; 
            color: #9CA3AF;
            text-align: center;
          }
          .status-badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 13px;
            font-weight: 600;
          }
          .legend {
            display: flex;
            gap: 16px;
            font-size: 12px;
            color: #6B7280;
            margin: 12px 0;
            padding: 10px;
            background: #f8f9fa;
            border-radius: 8px;
          }
          .legend-item { display: flex; align-items: center; gap: 4px; }
          .legend-dot { width: 10px; height: 10px; border-radius: 50%; }
          .score-section {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 24px;
            padding: 20px;
            background: linear-gradient(135deg, #f8f9fa 0%, #fff 100%);
            border-radius: 12px;
            border: 1px solid #e5e7eb;
            margin: 20px 0;
          }
          .score-gauge { text-align: center; }
          .score-info { flex: 1; }
          .score-title { font-size: 16px; font-weight: 600; color: #374151; margin-bottom: 8px; }
          .score-breakdown { font-size: 13px; color: #6B7280; }
          .score-breakdown li { margin: 4px 0; }
          .comparison-section {
            margin-top: 20px;
            padding: 16px;
            background: #f8f9fa;
            border-radius: 12px;
            border: 1px solid #e5e7eb;
          }
          .comparison-title { font-size: 14px; font-weight: 600; color: #374151; margin-bottom: 12px; }
          @media print {
            body { padding: 20px; }
            .section { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <!-- PÁGINA 1: RESUMEN EJECUTIVO -->
        <h1>📊 Análisis de Viabilidad KDP</h1>
        <p class="subtitle">
          Formato: ${globalData.selectedFormat === 'EBOOK' ? 'eBook' : 'Formato impreso'} — Marketplace: ${config?.name || 'N/A'} — 
          Fecha: ${new Date().toLocaleDateString('es-ES')}
        </p>
        
        <!-- SCORE GLOBAL CON GRÁFICO -->
        ${scoreBreakdown ? `
          <div class="score-section">
            <div class="score-gauge">
              ${generateScoreGaugeSvg(scoreBreakdown.totalScore)}
              <div style="margin-top: 8px; font-size: 12px; color: ${scoreBreakdown.statusColor}; font-weight: 600;">
                ${scoreBreakdown.statusEmoji} ${scoreBreakdown.statusLabel}
              </div>
            </div>
            <div class="score-info">
              <div class="score-title">Puntuación Global</div>
              <ul class="score-breakdown">
                <li><strong>Clics máx./Venta:</strong> ${scoreBreakdown.clicsScore}/50 pts (≥14=50, 13=35, 12=25, 11=15, ≤10=0)</li>
                <li><strong>BACOS (margen Ads):</strong> ${scoreBreakdown.bacosScore}/40 pts (≥40%=40, ≥35%=25, ≥30%=15, <30%=0)</li>
                <li><strong>PVP vs Mínimo:</strong> ${scoreBreakdown.pvpVsMinScore}/10 pts</li>
              </ul>
            </div>
          </div>
          
          <!-- GRÁFICO COMPARATIVO DE NICHOS -->
          ${savedNiches.length > 0 ? `
            <div class="comparison-section">
              <div class="comparison-title">📊 Comparativa con otros nichos guardados</div>
              ${generateComparisonChartSvg(
                'Este nicho',
                scoreBreakdown.totalScore,
                savedNiches.map(n => ({ name: n.name, score: n.scoreBreakdown.totalScore }))
              )}
            </div>
          ` : ''}
        ` : `
          <div class="viability-box">
            <div class="viability-status">${viability.emoji} ${viability.text}</div>
            <div class="viability-sub">${viability.subtext}</div>
          </div>
        `}

        <!-- Métricas clave -->
        <div class="data-grid">
          ${showEbook && ebookResults ? `
            <div class="data-item">
              <div class="data-label">PVP</div>
              <div class="data-value">${ebookData.pvp?.toFixed(2)}${currencySymbol}</div>
            </div>
            <div class="data-item">
              <div class="data-label">Regalía neta</div>
              <div class="data-value ${ebookResults.regalias > 0 ? 'success' : 'danger'}">${ebookResults.regalias.toFixed(2)}${currencySymbol}</div>
            </div>
            <div class="data-item">
              <div class="data-label">Margen real (BACOS)</div>
              <div class="data-value ${ebookResults.margenPct >= 30 ? 'success' : ebookResults.margenPct >= 20 ? 'warning' : 'danger'}">${ebookResults.margenPct.toFixed(1)}%</div>
            </div>
            <div class="data-item">
              <div class="data-label">Clics máx./Venta</div>
              <div class="data-value" style="color: ${clicksStatus?.color}">${clicksStatus?.emoji} ${ebookResults.clicsMaxPorVenta} (${clicksStatus?.text})</div>
            </div>
          ` : ''}
          ${showPaperback && paperbackResults ? `
            <div class="data-item">
              <div class="data-label">PVP</div>
              <div class="data-value">${paperbackData.pvp?.toFixed(2)}${currencySymbol}</div>
            </div>
            <div class="data-item">
              <div class="data-label">Regalía neta</div>
              <div class="data-value ${paperbackResults.regalias > 0 ? 'success' : 'danger'}">${paperbackResults.regalias.toFixed(2)}${currencySymbol}</div>
            </div>
            <div class="data-item">
              <div class="data-label">Margen real (BACOS)</div>
              <div class="data-value ${paperbackResults.margenPct >= 30 ? 'success' : paperbackResults.margenPct >= 20 ? 'warning' : 'danger'}">${paperbackResults.margenPct.toFixed(1)}%</div>
            </div>
            <div class="data-item">
              <div class="data-label">Clics máx./Venta</div>
              <div class="data-value" style="color: ${clicksStatus?.color}">${clicksStatus?.emoji} ${paperbackResults.clicsMaxPorVenta} (${clicksStatus?.text})</div>
            </div>
          ` : ''}
        </div>

        <div class="legend">
          <div class="legend-item"><span class="legend-dot" style="background: #22C55E"></span> ≥13 clics: Excelente</div>
          <div class="legend-item"><span class="legend-dot" style="background: #EAB308"></span> 10-12 clics: Aceptable</div>
          <div class="legend-item"><span class="legend-dot" style="background: #EF4444"></span> &lt;10 clics: En riesgo</div>
        </div>

        <!-- PÁGINA 2: PARÁMETROS DE ENTRADA -->
        <h2>📝 Parámetros de Entrada</h2>
        <div class="section">
          <h3>Datos Globales</h3>
          <div class="data-grid">
            <div class="data-item">
              <div class="data-label">Marketplace</div>
              <div class="data-value">${config?.name || 'N/A'}</div>
            </div>
            <div class="data-item">
              <div class="data-label">Margen Objetivo</div>
              <div class="data-value">${globalData.margenObjetivoPct || 'No definido'}%</div>
            </div>
            <div class="data-item">
              <div class="data-label">CPC Estimado</div>
              <div class="data-value">${globalData.cpc?.toFixed(2) || 'No definido'}${currencySymbol}</div>
            </div>
            <div class="data-item">
              <div class="data-label">Ventas/día Competencia</div>
              <div class="data-value">${globalData.ventasDiariasCompetencia || 'No definido'}</div>
            </div>
          </div>

          ${showPaperback ? `
            <h3>Datos del Libro (Formato impreso)</h3>
            <div class="data-grid">
              <div class="data-item">
                <div class="data-label">Tipo de Impresión</div>
                <div class="data-value">${paperbackData.interior ? interiorLabels[paperbackData.interior] : 'N/A'}</div>
              </div>
              <div class="data-item">
                <div class="data-label">Tamaño</div>
                <div class="data-value">${paperbackData.size ? sizeLabels[paperbackData.size] : 'N/A'}</div>
              </div>
              <div class="data-item">
                <div class="data-label">Nº Páginas</div>
                <div class="data-value">${paperbackData.pages || 'N/A'}</div>
              </div>
              <div class="data-item">
                <div class="data-label">PVP</div>
                <div class="data-value">${paperbackData.pvp?.toFixed(2) || 'N/A'}${currencySymbol}</div>
              </div>
            </div>
          ` : ''}

          ${showEbook ? `
            <h3>Datos del eBook</h3>
            <div class="data-grid">
              <div class="data-item">
                <div class="data-label">PVP</div>
                <div class="data-value">${ebookData.pvp?.toFixed(2) || 'N/A'}${currencySymbol}</div>
              </div>
              <div class="data-item">
                <div class="data-label">Tasa de Regalía</div>
                <div class="data-value">${ebookData.royaltyRate}%</div>
              </div>
              <div class="data-item">
                <div class="data-label">Tamaño (MB)</div>
                <div class="data-value">${ebookData.tamanoMb || 'N/A'}</div>
              </div>
              <div class="data-item">
                <div class="data-label">IVA Aplicado</div>
                <div class="data-value">${ebookData.ivaType}%</div>
              </div>
            </div>
          ` : ''}
        </div>

        <!-- PÁGINA 3: CÁLCULOS ECONÓMICOS -->
        <h2>💰 Cálculos Económicos</h2>
        <div class="section">
          ${showPaperback && paperbackResults ? `
            <h3>Ingresos</h3>
            <div class="data-grid">
              <div class="data-item">
                <div class="data-label">Precio sin IVA</div>
                <div class="data-value">${paperbackResults.precioSinIva.toFixed(2)}${currencySymbol}</div>
              </div>
              <div class="data-item">
                <div class="data-label">Tasa de Regalía</div>
                <div class="data-value">${(paperbackResults.royaltyRate * 100).toFixed(0)}%</div>
              </div>
            </div>
            
            <h3>Costes</h3>
            <div class="data-grid">
              <div class="data-item">
                <div class="data-label">Coste de Impresión</div>
                <div class="data-value danger">-${paperbackResults.gastosImpresion.toFixed(2)}${currencySymbol}</div>
              </div>
              <div class="data-item">
                <div class="data-label">Coste Fijo</div>
                <div class="data-value">${paperbackResults.fixedCost.toFixed(2)}${currencySymbol}</div>
              </div>
            </div>
            
            <h3>Resultado</h3>
            <div class="data-grid">
              <div class="data-item">
                <div class="data-label">Regalía Neta</div>
                <div class="data-value ${paperbackResults.regalias > 0 ? 'success' : 'danger'}">${paperbackResults.regalias.toFixed(2)}${currencySymbol}</div>
              </div>
              <div class="data-item">
                <div class="data-label">Margen real (BACOS)</div>
                <div class="data-value">${paperbackResults.margenPct.toFixed(1)}%</div>
              </div>
              <div class="data-item">
                <div class="data-label">CPC Máximo Rentable</div>
                <div class="data-value accent">${paperbackResults.cpcMaxRentable.toFixed(2)}${currencySymbol}</div>
              </div>
            </div>
          ` : ''}

          ${showEbook && ebookResults ? `
            <h3>Ingresos</h3>
            <div class="data-grid">
              <div class="data-item">
                <div class="data-label">Precio sin IVA</div>
                <div class="data-value">${ebookResults.precioSinIva.toFixed(2)}${currencySymbol}</div>
              </div>
              <div class="data-item">
                <div class="data-label">Tasa de Regalía</div>
                <div class="data-value">${ebookData.royaltyRate}%</div>
              </div>
            </div>
            
            ${ebookResults.deliveryCost > 0 ? `
              <h3>Costes</h3>
              <div class="data-grid">
                <div class="data-item">
                  <div class="data-label">Tarifa de Entrega</div>
                  <div class="data-value danger">-${ebookResults.deliveryCost.toFixed(2)}${currencySymbol}</div>
                </div>
              </div>
            ` : ''}
            
            <h3>Resultado</h3>
            <div class="data-grid">
              <div class="data-item">
                <div class="data-label">Regalía Neta</div>
                <div class="data-value ${ebookResults.regalias > 0 ? 'success' : 'danger'}">${ebookResults.regalias.toFixed(2)}${currencySymbol}</div>
              </div>
              <div class="data-item">
                <div class="data-label">Margen real (BACOS)</div>
                <div class="data-value">${ebookResults.margenPct.toFixed(1)}%</div>
              </div>
              <div class="data-item">
                <div class="data-label">CPC Máximo Rentable</div>
                <div class="data-value accent">${ebookResults.cpcMaxRentable.toFixed(2)}${currencySymbol}</div>
              </div>
            </div>
          ` : ''}
        </div>

        <!-- PÁGINA 4: ANÁLISIS DE ADS Y COMPETENCIA -->
        <h2>📈 Análisis de Ads y Competencia</h2>
        <div class="section">
          <div class="data-grid">
            <div class="data-item">
              <div class="data-label">Ventas Diarias Objetivo</div>
              <div class="data-value accent">${ventasDiarias}</div>
            </div>
            <div class="data-item">
              <div class="data-label">Clics Diarios Necesarios</div>
              <div class="data-value accent">${clicsDiarios}</div>
            </div>
            <div class="data-item">
              <div class="data-label">Inversión Diaria Estimada</div>
              <div class="data-value accent">${inversionDiaria.toFixed(2)}${currencySymbol}</div>
            </div>
            <div class="data-item">
              <div class="data-label">Conversión de Referencia</div>
              <div class="data-value">10%</div>
            </div>
          </div>

          <div class="strategic-box">
            <h3 style="margin-top: 0;">🎯 Consejo Estratégico de Posicionamiento</h3>
            <p style="margin: 12px 0;">
              Si quieres competir con los mejores autores de tu nicho y tener presencia en primeras posiciones, 
              necesitarás vender una media de <span class="highlight">${ventasDiarias} copias/día</span>.
            </p>
            <p style="margin: 12px 0;">
              Si estás empezando y no tienes canales propios de venta (lista de email, comunidad en RRSS, 
              acuerdos con influencers o tráfico orgánico), asumirás el 100% del posicionamiento vía Ads.
            </p>
            <p style="margin: 12px 0;">
              Con una conversión mínima del 10%, tendrás que generar <span class="highlight">${clicsDiarios} clics/día</span>, 
              lo que implica una inversión aproximada de <span class="highlight">${inversionDiaria.toFixed(2)}${currencySymbol}</span>.
            </p>
            <p style="font-weight: 600; margin-top: 16px; padding-top: 12px; border-top: 1px solid #ddd;">
              Este dato te permite decidir si el nicho es viable antes de producir el libro.
            </p>
          </div>
        </div>

        <!-- RESULTADOS DEL SIMULADOR -->
        ${simResults && showPaperback ? `
          <h2>🎛️ Resultados del Simulador</h2>
          <div class="section">
            <div class="data-grid">
              <div class="data-item">
                <div class="data-label">PVP Simulado</div>
                <div class="data-value">${simResults.pvp.toFixed(2)}${currencySymbol}</div>
              </div>
              <div class="data-item">
                <div class="data-label">Páginas</div>
                <div class="data-value">${simResults.pages}</div>
              </div>
              <div class="data-item">
                <div class="data-label">CPC</div>
                <div class="data-value">${simResults.cpc.toFixed(2)}${currencySymbol}</div>
              </div>
              <div class="data-item">
                <div class="data-label">Regalías</div>
                <div class="data-value ${simResults.regalias > 0 ? 'success' : 'danger'}">${simResults.regalias.toFixed(2)}${currencySymbol}</div>
              </div>
              <div class="data-item">
                <div class="data-label">Margen real (BACOS)</div>
                <div class="data-value">${simResults.margenBacos.toFixed(1)}%</div>
              </div>
              <div class="data-item">
                <div class="data-label">Clics máx./Venta</div>
                <div class="data-value" style="color: ${simResults.clicksStatus.color}">${simResults.clicksStatus.emoji} ${simResults.clicsMax} (${simResults.clicksStatus.text})</div>
              </div>
            </div>
            <div class="simulator-note">
              ⚠️ <strong>Nota:</strong> Estos valores proceden del simulador y no modifican los datos base. 
              Son útiles para explorar escenarios alternativos.
            </div>
          </div>
        ` : ''}

        <!-- PÁGINA 5: PRECIO MÍNIMO RECOMENDADO -->
        ${(showPaperback && paperbackResults?.precioMinObjetivo) || (showEbook && ebookResults?.precioMinObjetivo) ? `
          <h2>💡 Precio Mínimo Recomendado</h2>
          <div class="section">
            <div class="data-item" style="background: linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%); border-color: #FB923C;">
              <div class="data-label">Para alcanzar tu margen objetivo (${globalData.margenObjetivoPct}%)</div>
              <div class="data-value accent" style="font-size: 28px;">
                ${showPaperback && paperbackResults?.precioMinObjetivo ? paperbackResults.precioMinObjetivo.toFixed(2) : ''}${showEbook && ebookResults?.precioMinObjetivo ? ebookResults.precioMinObjetivo.toFixed(2) : ''}${currencySymbol}
              </div>
            </div>
            <p style="margin-top: 12px; font-size: 14px; color: #6B7280;">
              Este es el PVP mínimo necesario para alcanzar tu margen objetivo y poder invertir en Ads sin perder dinero.
              ${showPaperback && paperbackData.pvp && paperbackResults?.precioMinObjetivo && paperbackData.pvp < paperbackResults.precioMinObjetivo ? 
                `<br/><span style="color: #EF4444;">⚠️ Tu PVP actual (${paperbackData.pvp.toFixed(2)}${currencySymbol}) está por debajo del mínimo recomendado.</span>` : ''}
            </p>
          </div>
        ` : ''}

        <!-- PÁGINA 6: RIESGOS Y RECOMENDACIONES -->
        ${risks.length > 0 ? `
          <h2>⚠️ Riesgos Identificados</h2>
          <div class="section">
            ${risks.map(risk => `
              <div class="risk-item">
                <span class="icon">🔴</span>
                <span>${risk}</span>
              </div>
            `).join('')}
          </div>
        ` : ''}

        <h2>✅ Recomendaciones</h2>
        <div class="section">
          ${recommendations.map(rec => `
            <div class="rec-item">
              <span class="icon">✓</span>
              <span>${rec}</span>
            </div>
          `).join('')}
        </div>

        <!-- DECISIÓN FINAL -->
        <h2>🎯 Decisión Final</h2>
        <div class="viability-box" style="text-align: center;">
          <div style="font-size: 48px; margin-bottom: 8px;">${viability.emoji}</div>
          <div class="viability-status">${viability.text}</div>
          <div class="viability-sub">${viability.subtext}</div>
          <p style="margin-top: 16px; font-size: 14px; color: #6B7280;">
            ${viability.text === 'Excelente' ? '✔️ Publicar — La configuración actual es viable para escalar con Ads.' : 
              viability.text === 'Aceptable' ? '⚠️ Ajustar — Revisa precio o costes antes de invertir fuertemente.' : 
              '❌ Descartar o Reformular — No viable en las condiciones actuales.'}
          </p>
        </div>

        <div class="footer">
          <p>Generado con <strong>Publify</strong> — Análisis orientado a toma de decisiones</p>
          <p style="margin-top: 8px; font-size: 11px;">
            Este análisis no garantiza resultados, pero reduce el riesgo de decisiones mal fundamentadas.
          </p>
        </div>
      </body>
      </html>
    `);
    
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 250);
  };

  const risks = generateRisks();
  const recommendations = generateRecommendations();
  const viability = getViabilityDisplay();
  const activeResults = showEbook ? ebookResults : paperbackResults;
  const clicksStatus = activeResults ? getClicksStatus(activeResults.clicsMaxPorVenta) : null;

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
        <p className="text-sm text-muted-foreground">Resumen completo del análisis para guardar o compartir.</p>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <div ref={reportRef} className="space-y-6">
            {/* Viability Status */}
            <div className={`p-5 rounded-xl border-2 text-center ${
              viability.text === 'Excelente' ? 'bg-success/10 border-success' :
              viability.text === 'Aceptable' ? 'bg-warning/10 border-warning' :
              'bg-destructive/10 border-destructive'
            }`}>
              <span className="text-4xl block mb-2">{viability.emoji}</span>
              <span className={`text-2xl font-bold ${
                viability.text === 'Excelente' ? 'text-success' :
                viability.text === 'Aceptable' ? 'text-warning' :
                'text-destructive'
              }`}>{viability.text}</span>
              <p className="text-sm text-muted-foreground mt-1">{viability.subtext}</p>
            </div>

            {/* Key Results */}
            {activeResults && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-card border border-border rounded-lg p-3 text-center">
                  <span className="text-xs text-muted-foreground block mb-1">PVP</span>
                  <span className="text-lg font-bold text-foreground">
                    {showEbook ? ebookData.pvp?.toFixed(2) : paperbackData.pvp?.toFixed(2)}{currencySymbol}
                  </span>
                </div>
                <div className="bg-card border border-border rounded-lg p-3 text-center">
                  <span className="text-xs text-muted-foreground block mb-1">Regalía neta</span>
                  <span className={`text-lg font-bold ${activeResults.regalias > 0 ? 'text-success' : 'text-destructive'}`}>
                    {activeResults.regalias.toFixed(2)}{currencySymbol}
                  </span>
                </div>
                <div className="bg-card border border-border rounded-lg p-3 text-center">
                  <span className="text-xs text-muted-foreground block mb-1">Margen (BACOS)</span>
                  <span className={`text-lg font-bold ${activeResults.margenPct >= 30 ? 'text-success' : activeResults.margenPct >= 20 ? 'text-warning' : 'text-destructive'}`}>
                    {activeResults.margenPct.toFixed(1)}%
                  </span>
                </div>
                <div className={`rounded-lg p-3 text-center ${
                  clicksStatus?.text === 'Excelente' ? 'bg-success/15 border border-success/40' :
                  clicksStatus?.text === 'Aceptable' ? 'bg-warning/15 border border-warning/40' :
                  'bg-destructive/15 border border-destructive/40'
                }`}>
                  <span className="text-xs text-muted-foreground block mb-1">Clics máx./Venta</span>
                  <span className={`text-lg font-bold ${
                    clicksStatus?.text === 'Excelente' ? 'text-success' :
                    clicksStatus?.text === 'Aceptable' ? 'text-warning' :
                    'text-destructive'
                  }`}>
                    {clicksStatus?.emoji} {activeResults.clicsMaxPorVenta}
                  </span>
                </div>
              </div>
            )}

            {/* Legend */}
            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-success"></span>
                <span>≥13 clics: Excelente</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-warning"></span>
                <span>10-12 clics: Aceptable</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-destructive"></span>
                <span>&lt;10 clics: En riesgo</span>
              </div>
            </div>

            {risks.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-destructive flex items-center gap-2">
                  <XCircle className="h-4 w-4" /> Riesgos Identificados
                </h3>
                <div className="space-y-2">
                  {risks.map((risk, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-sm p-2 bg-destructive/10 border border-destructive/30 rounded-lg">
                      <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                      <span className="text-foreground">{risk}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-success flex items-center gap-2">
                <CheckCircle className="h-4 w-4" /> Recomendaciones
              </h3>
              <div className="space-y-2">
                {recommendations.map((rec, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm p-2 bg-success/10 border border-success/30 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-success mt-0.5 shrink-0" />
                    <span className="text-foreground">{rec}</span>
                  </div>
                ))}
              </div>
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
