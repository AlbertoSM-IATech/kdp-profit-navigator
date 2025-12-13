export type Marketplace = 'ES' | 'COM';

export type RoyaltyRate = 70 | 35;

export type InteriorType = 'BN' | 'COLOR_PREMIUM' | 'COLOR_STANDARD';

export type BookSize = 'SMALL' | 'LARGE';

export type FormatType = 'EBOOK' | 'PAPERBACK';

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
  audiovisual: boolean;
}

export interface EbookResults {
  iva: number;
  ivaPct: number;
  deliveryCost: number;
  neto: number;
  regalias: number;
  margenAcos: number;
  tasaConvBreakeven: number;
  clicsPorVenta: number;
  diagnostico: 'good' | 'warning' | 'bad';
}

export interface PaperbackData {
  interior: InteriorType | null;
  size: BookSize | null;
  pvp: number | null;
  pages: number | null;
}

export interface PaperbackResults {
  royaltyRate: number;
  fixedCost: number;
  perPageCost: number;
  gastosImpresion: number;
  precioSinIva: number;
  regalias: number;
  margenBacos: number;
  tasaConvBreakeven: number;
  clicsPorVenta: number;
  precioMinObjetivo: number | null;
  precioMinObjetivoError: string | null;
  diagnostico: 'good' | 'warning' | 'bad';
}

export interface PositioningResults {
  tasaConversionReferencia: number;
  clicsDiarios: number;
  inversionDiaria: number;
  advertencias: string[];
}

export interface TableRow {
  tipo: 'eBook' | 'Paperback';
  pvp: number;
  regalias: number;
  margen: number;
  clicsPorVenta: number;
  diagnostico: 'good' | 'warning' | 'bad';
  recomendacion: string;
}
