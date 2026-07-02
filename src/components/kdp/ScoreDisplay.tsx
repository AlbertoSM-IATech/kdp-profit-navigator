import { ScoreBreakdown, GlobalData, EbookResults, PaperbackResults, PositioningResults } from '@/types/kdp';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Gauge, MousePointer, TrendingUp, Tag, HelpCircle, Download, Lightbulb } from 'lucide-react';
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
  headerActions?: React.ReactNode;
  hideScoreSummary?: boolean;
}

type Tier = 'success' | 'warning' | 'destructive';

interface TierInfo {
  tier: Tier;
  tierLabel: string;
  explanation: string;
  advice: string;
}

interface ScoreCardProps {
  label: string;
  value: number;
  max: number;
  icon: React.ReactNode;
  definition: string;
  origin: string;
  tier: Tier;
  tierLabel: string;
  explanation: string;
  advice: string;
  realValue?: string;
}

const tierDotClass: Record<Tier, string> = {
  success: 'bg-success',
  warning: 'bg-warning',
  destructive: 'bg-destructive',
};

const tierAccentClass: Record<Tier, string> = {
  success: 'from-success/15 via-transparent to-transparent',
  warning: 'from-warning/15 via-transparent to-transparent',
  destructive: 'from-destructive/15 via-transparent to-transparent',
};

const tierBarClass: Record<Tier, string> = {
  success: 'bg-gradient-to-r from-success/80 to-success',
  warning: 'bg-gradient-to-r from-warning/80 to-warning',
  destructive: 'bg-gradient-to-r from-destructive/80 to-destructive',
};

const ScoreCard = ({
  label,
  value,
  max,
  icon,
  definition,
  origin,
  tier,
  tierLabel,
  explanation,
  advice,
  realValue,
}: ScoreCardProps) => {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-card via-card to-primary/[0.06] shadow-sm h-full flex flex-col transition-shadow hover:shadow-md">
      {/* Accent blur naranja base + tier overlay */}
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-20 -left-16 h-40 w-40 rounded-full bg-primary/15 blur-3xl"
      />
      <div
        aria-hidden
        className={`pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full blur-3xl bg-gradient-to-br ${tierAccentClass[tier]}`}
      />
      <div className="relative p-5 flex flex-col gap-4 flex-1">
        {/* Cabecera */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-1.5 bg-muted rounded-md shrink-0">{icon}</div>
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-sm font-semibold text-foreground flex items-center gap-1 cursor-help">
                    {label}
                    <HelpCircle className="h-3 w-3 text-muted-foreground shrink-0" />
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs space-y-2">
                  <p className="text-xs font-semibold text-foreground">Definición</p>
                  <p className="text-xs text-muted-foreground">{definition}</p>
                  <p className="text-xs font-semibold text-foreground pt-1">Cómo se calcula</p>
                  <p className="text-xs text-muted-foreground">{origin}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="flex items-baseline gap-0.5 shrink-0 tabular-nums">
            <span className="font-heading text-3xl font-extrabold text-foreground leading-none">
              {value}
            </span>
            <span className="text-xs text-muted-foreground">/{max}</span>
          </div>
        </div>

        {/* Barra de progreso interna */}
        <div className="space-y-1.5">
          <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <div
              className={`h-full rounded-full ${tierBarClass[tier]} transition-[width] duration-700 ease-out`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${tierDotClass[tier]}`} />
            <span className="text-xs font-semibold text-foreground">{tierLabel}</span>
            {realValue && (
              <span className="text-xs text-muted-foreground ml-auto tabular-nums">
                {realValue}
              </span>
            )}
          </div>
        </div>

        {/* Explicación */}
        <p className="text-xs text-muted-foreground leading-relaxed">{explanation}</p>

        {/* Divisor */}
        <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

        {/* Consejo accionable */}
        <div className="flex items-start gap-2">
          <Lightbulb className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">
              Recomendación
            </p>
            <p className="text-xs text-foreground/90 leading-relaxed">{advice}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const getClicsInfo = (v: number): TierInfo => {
  if (v >= 50)
    return {
      tier: 'success',
      tierLabel: 'Excelente',
      explanation:
        'Puedes pagar 14 o más clics por cada venta manteniendo la rentabilidad objetivo. Tienes colchón amplio ante subidas de coste por clic o caídas de conversión.',
      advice:
        'Escala presupuesto en las palabras clave con mejor CTR. Prueba pujas agresivas para ganar posiciones sin comprometer margen.',
    };
  if (v >= 35)
    return {
      tier: 'success',
      tierLabel: 'Bueno',
      explanation:
        'Puedes asumir hasta 13 clics por venta. Margen sano para una campaña estable, aunque sin gran holgura si el coste por clic sube de forma sostenida.',
      advice:
        'Mantén pujas controladas y vigila el coste por clic semanalmente. Descarta términos con más de 15 clics sin venta para proteger el margen.',
    };
  if (v >= 25)
    return {
      tier: 'warning',
      tierLabel: 'Aceptable',
      explanation:
        'Solo dispones de 12 clics por venta. La campaña funciona, pero cualquier subida del coste por clic reduce el margen muy rápido.',
      advice:
        'Prioriza concordancia exacta y palabras clave long-tail con menor competencia. Considera subir 1-2 € el precio de venta para ganar respiración.',
    };
  if (v >= 15)
    return {
      tier: 'warning',
      tierLabel: 'Ajustado',
      explanation:
        'Únicamente 11 clics por venta. Estás en el filo: sin optimización previa, escalar presupuesto convertirá la campaña en pérdida.',
      advice:
        'Antes de invertir: sube precio, reduce páginas si es posible o busca un nicho con coste por clic menor. Empieza con presupuestos diarios bajos.',
    };
  if (v >= 8)
    return {
      tier: 'warning',
      tierLabel: 'Al límite',
      explanation:
        'Justo en 10 clics por venta, el umbral mínimo operativo. No hay margen para imprevistos: una décima más de coste por clic ya te lleva a pérdidas.',
      advice:
        'No lances Ads sin optimizar antes. Sube precio, mejora la portada para elevar el CTR y reduce el coste por clic buscando keywords de menor competencia.',
    };
  return {
    tier: 'destructive',
    tierLabel: 'En riesgo',
    explanation:
      'Menos de 10 clics por venta. La estructura de costes actual no permite Amazon Ads: cada venta atribuida a anuncios se paga en pérdidas.',
    advice:
      'Reformula antes de invertir: sube precio de venta, baja páginas o cambia de marketplace / nicho. No actives campañas hasta llegar mínimo a 11-12 clics.',
  };
};

const getBacosInfo = (v: number): TierInfo => {
  if (v >= 40)
    return {
      tier: 'success',
      tierLabel: 'Excelente',
      explanation:
        'Más del 40% del precio de venta queda disponible para publicidad manteniendo rentabilidad. Es el margen ideal para escalar de forma agresiva.',
      advice:
        'Puedes probar campañas Sponsored Brands y Product Targeting. Aprovecha para invertir en visibilidad de marca sin comprometer beneficio.',
    };
  if (v >= 25)
    return {
      tier: 'success',
      tierLabel: 'Bueno',
      explanation:
        'Entre 35% y 40% del precio disponible para Ads. Margen razonable para una campaña sostenible, pero controla que el coste por clic no suba.',
      advice:
        'Mantén el ACoS objetivo por debajo del BACOS. Revisa keywords perdedoras cada 15 días y reasigna presupuesto a las ganadoras.',
    };
  if (v >= 15)
    return {
      tier: 'warning',
      tierLabel: 'Ajustado',
      explanation:
        'Solo entre 30% y 35% del precio queda para publicidad. Margen estrecho: cada euro mal invertido pesa mucho sobre el beneficio final.',
      advice:
        'Usa exclusivamente concordancia exacta y frase. Descarta broad match. Añade negativas de forma proactiva para no quemar presupuesto en clics irrelevantes.',
    };
  return {
    tier: 'destructive',
    tierLabel: 'En riesgo',
    explanation:
      'Menos del 30% del precio disponible para Ads. Prácticamente no queda margen para invertir en publicidad de forma rentable.',
    advice:
      'Sube precio de venta, reduce costes de impresión (menos páginas, blanco y negro) o cambia de formato. Sin ampliar margen, Ads dará pérdidas.',
  };
};

interface PvpCtx {
  currentPvp: number | null;
  minPvp: number | null;
  clicsScore: number; // 0-50
  bacosScore: number; // 0-40
  clicsMaxReal: number;
  bacosReal: number;
  currencySymbol: string;
  isPaperback: boolean;
}

const getPvpInfo = (v: number, ctx: PvpCtx): TierInfo => {
  const {
    currentPvp,
    minPvp,
    clicsScore,
    bacosScore,
    clicsMaxReal,
    bacosReal,
    currencySymbol,
    isPaperback,
  } = ctx;

  const gap =
    currentPvp != null && minPvp != null ? Math.max(0, currentPvp - minPvp) : null;
  const cushion = gap != null ? `${gap.toFixed(2)}${currencySymbol}` : 'holgura';

  if (v >= 8) {
    const clicsHasRoom = clicsScore < 50; // no está en excelente máximo
    const bacosHasRoom = bacosScore < 40;

    // Todo excelente: solo recomendar descuentos de lanzamiento
    if (!clicsHasRoom && !bacosHasRoom) {
      return {
        tier: 'success',
        tierLabel: 'Por encima del mínimo',
        explanation: `Tu precio supera al mínimo viable en ${cushion} y el resto de indicadores están en zona óptima. Configuración muy sólida para escalar campañas.`,
        advice:
          'Puedes plantear descuentos de lanzamiento del 10-20% o cupones de Amazon sin bajar del umbral rentable, y activar Ads con confianza desde el día uno.',
      };
    }

    // Construir consejos accionables ordenados por impacto
    const suggestions: string[] = [];
    suggestions.push(
      `sube 1-2${currencySymbol} el precio de venta para elevar BACOS (${bacosReal.toFixed(1)}%) y clics máximos por venta (${clicsMaxReal})`,
    );
    if (isPaperback) {
      suggestions.push('reduce páginas si el contenido lo permite (bajan costes de impresión y sube la regalía neta)');
    }
    suggestions.push('busca palabras clave con menor coste por clic para ampliar el margen publicitario');

    return {
      tier: 'success',
      tierLabel: 'Por encima del mínimo',
      explanation: `Tu precio supera al mínimo viable en ${cushion}, pero la puntuación global aún tiene margen de mejora: subir precio o recortar costes elevaría el BACOS y los clics máximos por venta, ampliando tu seguridad en Amazon Ads.`,
      advice: `Antes de aplicar descuentos de lanzamiento, optimiza en este orden: ${suggestions.join('; ')}. Después reserva ese colchón adicional para promociones del 10-20% sin comprometer rentabilidad.`,
    };
  }
  if (v >= 4)
    return {
      tier: 'warning',
      tierLabel: 'Cerca del mínimo',
      explanation:
        'Tu precio está muy próximo al mínimo necesario para alcanzar tu margen objetivo. Cualquier descuento o subida de coste te deja por debajo.',
      advice:
        `Evita promociones agresivas. Sube el precio 1-2${currencySymbol} o reduce costes (páginas, interior) para ganar colchón antes de activar campañas o cupones.`,
    };
  return {
    tier: 'destructive',
    tierLabel: 'Por debajo del mínimo',
    explanation:
      'Tu precio actual no cubre el margen objetivo definido. Vendes por debajo del umbral rentable que marcaste al iniciar el análisis.',
    advice:
      'Sube el precio hasta alcanzar el mínimo recomendado o revisa costes (páginas, interior, formato). Lanzar Ads así amplifica las pérdidas.',
  };
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
  onQuickSave,
  headerActions,
  hideScoreSummary = false
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
    const paperbackResults = isPaperback ? activeResults as any : null;

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
            <h1>Análisis de Viabilidad KDP</h1>
            <p>Generado el ${new Date().toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })} a las ${new Date().toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    })}</p>
          </div>

          <div class="content">
            <div class="score-main">
              <div class="score-left">
                <span class="score-number">${score.totalScore}</span>
                <span class="score-max">/100</span>
              </div>
              <div class="score-right">
                <div class="score-label">${score.statusLabel}</div>
              </div>
            </div>
            
            <div class="score-interpretation">
              ${score.status === 'excellent' ? 'Excelente configuración para escalar campañas de Ads. Margen de maniobra amplio.' : ''}
              ${score.status === 'viable' ? 'Configuración viable pero requiere ajustes. Optimiza precio, CPC o busca keywords menos competidas.' : ''}
              ${score.status === 'not-recommended' ? 'No recomendable para Ads en las condiciones actuales. Reformula antes de invertir.' : ''}
            </div>

            <div class="grid" style="margin-top: 24px;">
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
                <div class="metric">
                  <span class="metric-label">Margen objetivo</span>
                  <span class="metric-value">${globalData.margenObjetivoPct || '-'}%</span>
                </div>
              </div>

              <div class="card">
                <h3>Desglose del Score</h3>
                <div class="score-item">
                  <div class="score-item-header">
                    <span class="score-item-label">Clics máx./Venta (CRÍTICO)</span>
                    <span class="score-item-value">${score.clicsScore}/50</span>
                  </div>
                  <div class="progress-bar">
                    <div class="progress-fill primary" style="width: ${score.clicsScore / 50 * 100}%"></div>
                  </div>
                </div>
                <div class="score-item">
                  <div class="score-item-header">
                    <span class="score-item-label">BACOS</span>
                    <span class="score-item-value">${score.bacosScore}/40</span>
                  </div>
                  <div class="progress-bar">
                    <div class="progress-fill success" style="width: ${score.bacosScore / 40 * 100}%"></div>
                  </div>
                </div>
                <div class="score-item">
                  <div class="score-item-header">
                    <span class="score-item-label">PVP vs Mínimo</span>
                    <span class="score-item-value">${score.pvpVsMinScore}/10</span>
                  </div>
                  <div class="progress-bar">
                    <div class="progress-fill secondary" style="width: ${score.pvpVsMinScore / 10 * 100}%"></div>
                  </div>
                </div>
              </div>

              <div class="card">
                <h3>Métricas clave del formato</h3>
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
                <h3>Posicionamiento y Ads</h3>
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
                <h4>Consejo estratégico</h4>
                <p>Para competir con los libros mejor posicionados de tu nicho, necesitarás conseguir aproximadamente <strong>${globalData.ventasDiariasCompetencia || 0} copias vendidas al día</strong>.</p>
                <p>Con una conversión del 10%, esto requiere <strong>${positioningResults?.clicsDiarios?.toFixed(0) || 0} clics diarios</strong> y una inversión de <strong>${currencySymbol}${positioningResults?.inversionDiaria?.toFixed(2) || 0}/día</strong> en Amazon Ads.</p>
                <p>Breakeven publicitario: necesitas <strong>1 pedido cada ${activeResults.clicsMaxPorVenta} clics</strong> para no perder dinero.</p>
              </div>
            </div>

            <div class="legend">
              <div class="legend-item"><span class="legend-dot success"></span> 80-100 Excelente</div>
              <div class="legend-item"><span class="legend-dot warning"></span> 50-79 Aceptable</div>
              <div class="legend-item"><span class="legend-dot danger"></span> &lt;50 En riesgo</div>
            </div>
          </div>

          <div class="footer">
            <p>Puntuaciones orientativas. No sustituyen el análisis profundo de cada nicho.</p>
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
  const statusDot =
    score.status === 'excellent' ? 'bg-success' : score.status === 'viable' ? 'bg-warning' : 'bg-destructive';

  // Compact view for quick mode
  if (compact) {
    return (
      <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card">
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-extrabold text-foreground">{score.totalScore}</span>
          <span className="text-lg text-muted-foreground">/100</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${statusDot}`} />
          <span className="text-base font-semibold text-foreground">{score.statusLabel}</span>
        </div>
      </div>
    );
  }

  const clicsInfo = getClicsInfo(score.clicsScore);
  const bacosInfo = getBacosInfo(score.bacosScore);
  const pvpInfo = getPvpInfo(score.pvpVsMinScore);

  const content = (
    <div className="space-y-6">
      {/* Score number + interpretation */}
      {!hideScoreSummary && (
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-5 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-5">
            <div className="flex items-baseline gap-1">
              <span className="text-5xl font-extrabold text-foreground">{score.totalScore}</span>
              <span className="text-xl text-muted-foreground">/100</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${statusDot}`} />
              <span className="text-base font-semibold text-foreground">{score.statusLabel}</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed md:max-w-md md:text-right">
            {score.status === 'excellent' && 'Excelente configuración para escalar campañas de Amazon Ads. Margen de maniobra amplio.'}
            {score.status === 'viable' && 'Configuración viable pero requiere ajustes. Optimiza precio, coste por clic o busca palabras clave menos competidas.'}
            {score.status === 'not-recommended' && 'No recomendable para Amazon Ads en las condiciones actuales. Reformula antes de invertir.'}
          </p>
        </div>
      )}

      {/* Breakdown — 3 explanatory cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Desglose del Score
          </h4>
          <div className="flex items-center gap-2 flex-wrap">
            {headerActions}
            {globalData && activeResults && (
              <Button onClick={handleExportPDF} variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Exportar PDF
              </Button>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <ScoreCard
            label="Clics máximos por venta"
            value={score.clicsScore}
            max={50}
            icon={<MousePointer className="h-4 w-4 text-foreground" />}
            definition="Indica cuántos clics de anuncio puedes pagar como máximo antes de que cada venta deje de ser rentable."
            origin="Regalía neta / Coste por clic (CPC). Se calcula dividiendo lo que realmente ganas por cada libro vendido entre el coste promedio de cada clic en tu nicho."
            tier={clicsInfo.tier}
            tierLabel={clicsInfo.tierLabel}
            explanation={clicsInfo.explanation}
            advice={clicsInfo.advice}
            realValue={activeResults ? `${activeResults.clicsMaxPorVenta} clics reales` : undefined}
          />
          <ScoreCard
            label="Margen publicitario (BACOS)"
            value={score.bacosScore}
            max={40}
            icon={<TrendingUp className="h-4 w-4 text-foreground" />}
            definition="Porcentaje del precio de venta que puedes destinar a publicidad en Amazon Ads sin perder dinero. También llamado ACoS de equilibrio."
            origin="Regalías netas / Precio sin IVA. Expresa qué fracción del precio del libro representa tu margen real disponible para invertir en anuncios."
            tier={bacosInfo.tier}
            tierLabel={bacosInfo.tierLabel}
            explanation={bacosInfo.explanation}
            advice={bacosInfo.advice}
            realValue={activeResults ? `${activeResults.margenPct.toFixed(1)}% real` : undefined}
          />
          <ScoreCard
            label="Precio vs Mínimo viable"
            value={score.pvpVsMinScore}
            max={10}
            icon={<Tag className="h-4 w-4 text-foreground" />}
            definition="Compara tu precio actual de venta contra el precio mínimo que necesitas para cubrir costes de impresión (si aplica), regalías de plataforma y tu margen objetivo."
            origin="Precio actual - Precio mínimo recomendado. Si tu precio supera el mínimo, tienes colchón. Si está por debajo, el modelo no alcanza la rentabilidad que marcaste como objetivo."
            tier={pvpInfo.tier}
            tierLabel={pvpInfo.tierLabel}
            explanation={pvpInfo.explanation}
            advice={pvpInfo.advice}
            realValue={activeResults && activeResults.precioMinObjetivo ? `Mínimo: ${activeResults.precioMinObjetivo.toFixed(2)}${currencySymbol}` : undefined}
          />
        </div>
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
          Puntuaciones orientativas. No sustituyen el análisis profundo de cada nicho.
        </p>
      </CardHeader>
      <CardContent>
        {content}
      </CardContent>
    </Card>;
};