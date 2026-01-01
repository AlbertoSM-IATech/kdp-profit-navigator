export type Marketplace = 'ES' | 'COM' | 'DE' | 'FR' | 'IT' | 'UK';

export type RoyaltyRate = 70 | 35;

export type InteriorType = 'BN' | 'COLOR_PREMIUM' | 'COLOR_STANDARD';

export type BookSize = 'SMALL' | 'LARGE';

export type FormatType = 'EBOOK' | 'PAPERBACK' | 'HARDCOVER';

export type IvaType = 4 | 21;

export type RiskLevel = 'low' | 'medium' | 'high';

export type ViabilityStatus = 'viable' | 'adjustable' | 'not-viable';

export interface GlobalData {
  marketplace: Marketplace | null;
  margenObjetivoPct: number | null;
  cpc: number | null;
  ventasDiariasCompetencia: number | null;
  selectedFormat: FormatType | null;
}

export interface EbookData {
  pvp: number | null;
  royaltyRate: RoyaltyRate;
  tamanoMb: number | null;
  ivaType: IvaType;
}

export interface EbookResults {
  iva: number;
  ivaPct: number;
  deliveryCost: number;
  precioSinIva: number;
  regalias: number;
  margenPct: number;
  margenAbsoluto: number;
  beneficioNeto: number;
  cpcMaxRentable: number;
  tasaConvBreakeven: number;
  clicsMaxPorVenta: number;
  precioMinObjetivo: number | null;
  precioMinObjetivoError: string | null;
  diagnostico: 'good' | 'warning' | 'bad';
  riskLevel: RiskLevel;
  viabilityStatus: ViabilityStatus;
}

export interface PaperbackData {
  interior: InteriorType | null;
  size: BookSize | null;
  pvp: number | null;
  pages: number | null;
  ivaType: IvaType;
}

export interface PaperbackResults {
  royaltyRate: number;
  fixedCost: number;
  perPageCost: number;
  gastosImpresion: number;
  precioSinIva: number;
  regalias: number;
  margenPct: number;
  margenAbsoluto: number;
  beneficioNeto: number;
  cpcMaxRentable: number;
  tasaConvBreakeven: number;
  clicsMaxPorVenta: number;
  precioMinObjetivo: number | null;
  precioMinObjetivoError: string | null;
  diagnostico: 'good' | 'warning' | 'bad';
  riskLevel: RiskLevel;
  viabilityStatus: ViabilityStatus;
}

export interface PositioningResults {
  tasaConversionReferencia: number;
  clicsDiarios: number;
  inversionDiaria: number;
  ventasDiariasNecesarias: number;
  diasParaBreakeven: number | null;
  advertencias: string[];
  riskLevel: RiskLevel;
}

export interface TableRow {
  tipo: 'eBook' | 'Paperback' | 'Hardcover';
  pvp: number;
  regalias: number;
  margen: number;
  clicsMaxPorVenta: number;
  cpcMaxRentable: number;
  diagnostico: 'good' | 'warning' | 'bad';
  recomendacion: string;
}

// ============================================
// SCORING SYSTEM (0-100)
// ============================================

export interface ScoreBreakdown {
  clicsScore: number;         // Max 30 pts
  margenScore: number;        // Max 25 pts
  bacosScore: number;         // Max 20 pts
  inversionScore: number;     // Max 15 pts
  pvpVsMinScore: number;      // Max 10 pts
  totalScore: number;         // Sum 0-100
  status: 'excellent' | 'viable' | 'risky' | 'not-recommended';
  statusLabel: string;
  statusEmoji: string;
  statusColor: string;
}

// ============================================
// NICHE COMPARATOR
// ============================================

export interface SavedNiche {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  // Data snapshot
  globalData: GlobalData;
  ebookData: EbookData | null;
  paperbackData: PaperbackData | null;
  // Results snapshot
  clicsMaxPorVenta: number;
  margenPct: number;
  bacos: number;
  inversionDiaria: number;
  pvp: number;
  precioMinRecomendado: number | null;
  regalias: number;
  // Score
  scoreBreakdown: ScoreBreakdown;
}

// Helper types for currency and market-specific settings
export interface MarketplaceConfig {
  code: Marketplace;
  name: string;
  currency: string;
  currencySymbol: string;
  ivaDefault: number;
  royaltyThreshold: number;
}

export const MARKETPLACE_CONFIGS: Record<Marketplace, MarketplaceConfig> = {
  ES: { code: 'ES', name: 'Amazon España', currency: 'EUR', currencySymbol: '€', ivaDefault: 4, royaltyThreshold: 9.99 },
  COM: { code: 'COM', name: 'Amazon USA', currency: 'USD', currencySymbol: '$', ivaDefault: 0, royaltyThreshold: 9.99 },
  DE: { code: 'DE', name: 'Amazon Alemania', currency: 'EUR', currencySymbol: '€', ivaDefault: 7, royaltyThreshold: 9.99 },
  FR: { code: 'FR', name: 'Amazon Francia', currency: 'EUR', currencySymbol: '€', ivaDefault: 5.5, royaltyThreshold: 9.99 },
  IT: { code: 'IT', name: 'Amazon Italia', currency: 'EUR', currencySymbol: '€', ivaDefault: 4, royaltyThreshold: 9.99 },
  UK: { code: 'UK', name: 'Amazon UK', currency: 'GBP', currencySymbol: '£', ivaDefault: 0, royaltyThreshold: 9.99 },
};
