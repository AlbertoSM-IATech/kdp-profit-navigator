import { InteriorType, BookSize, Marketplace } from '@/types/kdp';

export interface PrintingCostTier {
  interior: InteriorType;
  size: BookSize;
  pageThreshold: number; // Pages <= threshold use this tier
  fixedCost: number;
  perPageCost: number;
}

// ============================================
// FUENTE OFICIAL: https://kdp.amazon.com/es_ES/help/topic/G201834340
// Última actualización: Enero 2025
// ============================================

// Printing cost tiers for European marketplaces (EUR) - Amazon.de/es/fr/it/nl/ie/com.be
export const printingCostTiersEU: PrintingCostTier[] = [
  // B/N - Tamaño normal: 24-108 páginas
  { interior: 'BN', size: 'SMALL', pageThreshold: 108, fixedCost: 2.05, perPageCost: 0 },
  // B/N - Tamaño normal: 110-828 páginas
  { interior: 'BN', size: 'SMALL', pageThreshold: Infinity, fixedCost: 0.75, perPageCost: 0.012 },
  // B/N - Tamaño grande: 24-108 páginas
  { interior: 'BN', size: 'LARGE', pageThreshold: 108, fixedCost: 2.48, perPageCost: 0 },
  // B/N - Tamaño grande: 110-828 páginas
  { interior: 'BN', size: 'LARGE', pageThreshold: Infinity, fixedCost: 0.75, perPageCost: 0.016 },
  // Color Premium - Tamaño normal: 24-40 páginas
  { interior: 'COLOR_PREMIUM', size: 'SMALL', pageThreshold: 40, fixedCost: 2.85, perPageCost: 0 },
  // Color Premium - Tamaño normal: 42-828 páginas
  { interior: 'COLOR_PREMIUM', size: 'SMALL', pageThreshold: Infinity, fixedCost: 0.75, perPageCost: 0.0525 },
  // Color Premium - Tamaño grande: 24-40 páginas
  { interior: 'COLOR_PREMIUM', size: 'LARGE', pageThreshold: 40, fixedCost: 3.61, perPageCost: 0 },
  // Color Premium - Tamaño grande: 42-828 páginas
  { interior: 'COLOR_PREMIUM', size: 'LARGE', pageThreshold: Infinity, fixedCost: 0.75, perPageCost: 0.0715 },
  // Color Estándar - Tamaño normal: 72-600 páginas
  { interior: 'COLOR_STANDARD', size: 'SMALL', pageThreshold: 71, fixedCost: 0, perPageCost: 0 },
  { interior: 'COLOR_STANDARD', size: 'SMALL', pageThreshold: Infinity, fixedCost: 0.75, perPageCost: 0.024 },
  // Color Estándar - Tamaño grande: 72-600 páginas
  { interior: 'COLOR_STANDARD', size: 'LARGE', pageThreshold: 71, fixedCost: 0, perPageCost: 0 },
  { interior: 'COLOR_STANDARD', size: 'LARGE', pageThreshold: Infinity, fixedCost: 0.75, perPageCost: 0.035 },
];

// Printing cost tiers for US marketplace (USD) - Amazon.com
export const printingCostTiersUS: PrintingCostTier[] = [
  // B/N - Tamaño normal: 24-108 páginas
  { interior: 'BN', size: 'SMALL', pageThreshold: 108, fixedCost: 2.30, perPageCost: 0 },
  // B/N - Tamaño normal: 110-828 páginas
  { interior: 'BN', size: 'SMALL', pageThreshold: Infinity, fixedCost: 1.00, perPageCost: 0.012 },
  // B/N - Tamaño grande: 24-108 páginas
  { interior: 'BN', size: 'LARGE', pageThreshold: 108, fixedCost: 2.84, perPageCost: 0 },
  // B/N - Tamaño grande: 110-828 páginas
  { interior: 'BN', size: 'LARGE', pageThreshold: Infinity, fixedCost: 1.00, perPageCost: 0.017 },
  // Color Premium - Tamaño normal: 24-40 páginas
  { interior: 'COLOR_PREMIUM', size: 'SMALL', pageThreshold: 40, fixedCost: 3.60, perPageCost: 0 },
  // Color Premium - Tamaño normal: 42-828 páginas
  { interior: 'COLOR_PREMIUM', size: 'SMALL', pageThreshold: Infinity, fixedCost: 1.00, perPageCost: 0.065 },
  // Color Premium - Tamaño grande: 24-40 páginas
  { interior: 'COLOR_PREMIUM', size: 'LARGE', pageThreshold: 40, fixedCost: 4.20, perPageCost: 0 },
  // Color Premium - Tamaño grande: 42-828 páginas
  { interior: 'COLOR_PREMIUM', size: 'LARGE', pageThreshold: Infinity, fixedCost: 1.00, perPageCost: 0.080 },
  // Color Standard - Tamaño normal: 72-600 páginas
  { interior: 'COLOR_STANDARD', size: 'SMALL', pageThreshold: 71, fixedCost: 0, perPageCost: 0 },
  { interior: 'COLOR_STANDARD', size: 'SMALL', pageThreshold: Infinity, fixedCost: 1.00, perPageCost: 0.0255 },
  // Color Standard - Tamaño grande: 72-600 páginas
  { interior: 'COLOR_STANDARD', size: 'LARGE', pageThreshold: 71, fixedCost: 0, perPageCost: 0 },
  { interior: 'COLOR_STANDARD', size: 'LARGE', pageThreshold: Infinity, fixedCost: 1.00, perPageCost: 0.0402 },
];

// Printing cost tiers for UK marketplace (GBP) - Amazon.co.uk
export const printingCostTiersUK: PrintingCostTier[] = [
  // B/N - Tamaño normal: 24-108 páginas
  { interior: 'BN', size: 'SMALL', pageThreshold: 108, fixedCost: 1.93, perPageCost: 0 },
  // B/N - Tamaño normal: 110-828 páginas
  { interior: 'BN', size: 'SMALL', pageThreshold: Infinity, fixedCost: 0.85, perPageCost: 0.010 },
  // B/N - Tamaño grande: 24-108 páginas
  { interior: 'BN', size: 'LARGE', pageThreshold: 108, fixedCost: 2.15, perPageCost: 0 },
  // B/N - Tamaño grande: 110-828 páginas
  { interior: 'BN', size: 'LARGE', pageThreshold: Infinity, fixedCost: 0.85, perPageCost: 0.012 },
  // Color Premium - Tamaño normal: 24-40 páginas
  { interior: 'COLOR_PREMIUM', size: 'SMALL', pageThreshold: 40, fixedCost: 2.59, perPageCost: 0 },
  // Color Premium - Tamaño normal: 42-828 páginas
  { interior: 'COLOR_PREMIUM', size: 'SMALL', pageThreshold: Infinity, fixedCost: 0.85, perPageCost: 0.0435 },
  // Color Premium - Tamaño grande: 24-40 páginas
  { interior: 'COLOR_PREMIUM', size: 'LARGE', pageThreshold: 40, fixedCost: 3.24, perPageCost: 0 },
  // Color Premium - Tamaño grande: 42-828 páginas
  { interior: 'COLOR_PREMIUM', size: 'LARGE', pageThreshold: Infinity, fixedCost: 0.85, perPageCost: 0.0598 },
  // Color Estándar - Tamaño normal: 72-600 páginas
  { interior: 'COLOR_STANDARD', size: 'SMALL', pageThreshold: 71, fixedCost: 0, perPageCost: 0 },
  { interior: 'COLOR_STANDARD', size: 'SMALL', pageThreshold: Infinity, fixedCost: 0.85, perPageCost: 0.020 },
  // Color Estándar - Tamaño grande: 72-600 páginas
  { interior: 'COLOR_STANDARD', size: 'LARGE', pageThreshold: 71, fixedCost: 0, perPageCost: 0 },
  { interior: 'COLOR_STANDARD', size: 'LARGE', pageThreshold: Infinity, fixedCost: 0.85, perPageCost: 0.027 },
];

// Printing cost tiers for CA marketplace (CAD) - Amazon.ca
export const printingCostTiersCA: PrintingCostTier[] = [
  // B/N - Tamaño normal: 24-108 páginas
  { interior: 'BN', size: 'SMALL', pageThreshold: 108, fixedCost: 2.99, perPageCost: 0 },
  // B/N - Tamaño normal: 110-828 páginas
  { interior: 'BN', size: 'SMALL', pageThreshold: Infinity, fixedCost: 1.26, perPageCost: 0.016 },
  // B/N - Tamaño grande: 24-108 páginas
  { interior: 'BN', size: 'LARGE', pageThreshold: 108, fixedCost: 3.53, perPageCost: 0 },
  // B/N - Tamaño grande: 110-828 páginas
  { interior: 'BN', size: 'LARGE', pageThreshold: Infinity, fixedCost: 1.26, perPageCost: 0.021 },
  // Color Premium - Tamaño normal: 24-40 páginas
  { interior: 'COLOR_PREMIUM', size: 'SMALL', pageThreshold: 40, fixedCost: 4.66, perPageCost: 0 },
  // Color Premium - Tamaño normal: 42-828 páginas
  { interior: 'COLOR_PREMIUM', size: 'SMALL', pageThreshold: Infinity, fixedCost: 1.26, perPageCost: 0.085 },
  // Color Premium - Tamaño grande: 24-40 páginas
  { interior: 'COLOR_PREMIUM', size: 'LARGE', pageThreshold: 40, fixedCost: 5.26, perPageCost: 0 },
  // Color Premium - Tamaño grande: 42-828 páginas
  { interior: 'COLOR_PREMIUM', size: 'LARGE', pageThreshold: Infinity, fixedCost: 1.26, perPageCost: 0.10 },
  // Color Estándar - Tamaño normal: 72-600 páginas
  { interior: 'COLOR_STANDARD', size: 'SMALL', pageThreshold: 71, fixedCost: 0, perPageCost: 0 },
  { interior: 'COLOR_STANDARD', size: 'SMALL', pageThreshold: Infinity, fixedCost: 1.26, perPageCost: 0.037 },
  // Color Estándar - Tamaño grande: 72-600 páginas
  { interior: 'COLOR_STANDARD', size: 'LARGE', pageThreshold: 71, fixedCost: 0, perPageCost: 0 },
  { interior: 'COLOR_STANDARD', size: 'LARGE', pageThreshold: Infinity, fixedCost: 1.26, perPageCost: 0.052 },
];

// Printing cost tiers for AU marketplace (AUD) - Amazon.com.au
export const printingCostTiersAU: PrintingCostTier[] = [
  // B/N - Tamaño normal: 24-108 páginas
  { interior: 'BN', size: 'SMALL', pageThreshold: 108, fixedCost: 4.74, perPageCost: 0 },
  // B/N - Tamaño normal: 110-828 páginas
  { interior: 'BN', size: 'SMALL', pageThreshold: Infinity, fixedCost: 2.42, perPageCost: 0.022 },
  // B/N - Tamaño grande: 24-108 páginas
  { interior: 'BN', size: 'LARGE', pageThreshold: 108, fixedCost: 5.28, perPageCost: 0 },
  // B/N - Tamaño grande: 110-828 páginas
  { interior: 'BN', size: 'LARGE', pageThreshold: Infinity, fixedCost: 2.42, perPageCost: 0.027 },
  // Color Premium - Tamaño normal: 24-40 páginas
  { interior: 'COLOR_PREMIUM', size: 'SMALL', pageThreshold: 40, fixedCost: 5.82, perPageCost: 0 },
  // Color Premium - Tamaño normal: 42-828 páginas
  { interior: 'COLOR_PREMIUM', size: 'SMALL', pageThreshold: Infinity, fixedCost: 2.42, perPageCost: 0.085 },
  // Color Premium - Tamaño grande: 24-40 páginas
  { interior: 'COLOR_PREMIUM', size: 'LARGE', pageThreshold: 40, fixedCost: 6.42, perPageCost: 0 },
  // Color Premium - Tamaño grande: 42-828 páginas
  { interior: 'COLOR_PREMIUM', size: 'LARGE', pageThreshold: Infinity, fixedCost: 2.42, perPageCost: 0.100 },
  // NOTA: Australia NO tiene Color Estándar disponible
  { interior: 'COLOR_STANDARD', size: 'SMALL', pageThreshold: Infinity, fixedCost: 0, perPageCost: 0 },
  { interior: 'COLOR_STANDARD', size: 'LARGE', pageThreshold: Infinity, fixedCost: 0, perPageCost: 0 },
];

// Printing cost tiers for JP marketplace (JPY) - Amazon.co.jp
export const printingCostTiersJP: PrintingCostTier[] = [
  // B/N - Tamaño normal: 24-108 páginas
  { interior: 'BN', size: 'SMALL', pageThreshold: 108, fixedCost: 422, perPageCost: 0 },
  // B/N - Tamaño normal: 110-828 páginas
  { interior: 'BN', size: 'SMALL', pageThreshold: Infinity, fixedCost: 206, perPageCost: 2 },
  // B/N - Tamaño grande: 24-108 páginas
  { interior: 'BN', size: 'LARGE', pageThreshold: 108, fixedCost: 530, perPageCost: 0 },
  // B/N - Tamaño grande: 110-828 páginas
  { interior: 'BN', size: 'LARGE', pageThreshold: Infinity, fixedCost: 206, perPageCost: 3 },
  // Color Premium - Tamaño normal: 24-40 páginas
  { interior: 'COLOR_PREMIUM', size: 'SMALL', pageThreshold: 40, fixedCost: 475, perPageCost: 0 },
  // Color Premium - Tamaño normal: 42-828 páginas
  { interior: 'COLOR_PREMIUM', size: 'SMALL', pageThreshold: Infinity, fixedCost: 206, perPageCost: 4 },
  // Color Premium - Tamaño grande: 24-40 páginas (NOTA: mismo precio que normal en JP)
  { interior: 'COLOR_PREMIUM', size: 'LARGE', pageThreshold: 40, fixedCost: 475, perPageCost: 0 },
  // Color Premium - Tamaño grande: 42-828 páginas
  { interior: 'COLOR_PREMIUM', size: 'LARGE', pageThreshold: Infinity, fixedCost: 206, perPageCost: 5 },
  // NOTA: Japón NO tiene Color Estándar disponible
  { interior: 'COLOR_STANDARD', size: 'SMALL', pageThreshold: Infinity, fixedCost: 0, perPageCost: 0 },
  { interior: 'COLOR_STANDARD', size: 'LARGE', pageThreshold: Infinity, fixedCost: 0, perPageCost: 0 },
];

// Keep legacy export for backward compatibility
export const printingCostTiers = printingCostTiersEU;

// Map marketplaces to their tier lists
export const marketplaceTiers: Record<Marketplace, PrintingCostTier[]> = {
  ES: printingCostTiersEU,
  DE: printingCostTiersEU,
  FR: printingCostTiersEU,
  IT: printingCostTiersEU,
  COM: printingCostTiersUS,
  UK: printingCostTiersUK,
  CA: printingCostTiersCA,
  AU: printingCostTiersAU,
  JP: printingCostTiersJP,
};

export interface PrintingCostResult {
  fixedCost: number;
  perPageCost: number;
  totalCost: number;
  isValid: boolean;
  errorMessage?: string;
}

/**
 * Calculate printing costs based on interior type, size, number of pages, and marketplace
 */
export const calculatePrintingCost = (
  interior: InteriorType | null,
  size: BookSize | null,
  pages: number | null,
  marketplace?: Marketplace | null
): PrintingCostResult => {
  if (!interior || !size || pages === null || pages <= 0) {
    return { fixedCost: 0, perPageCost: 0, totalCost: 0, isValid: false };
  }

  // For Color Estándar, minimum is 72 pages (except AU and JP which don't support it)
  if (interior === 'COLOR_STANDARD') {
    if (marketplace === 'AU' || marketplace === 'JP') {
      return {
        fixedCost: 0,
        perPageCost: 0,
        totalCost: 0,
        isValid: false,
        errorMessage: 'Color Estándar no disponible en este marketplace',
      };
    }
    if (pages < 72) {
      return {
        fixedCost: 0,
        perPageCost: 0,
        totalCost: 0,
        isValid: false,
        errorMessage: 'Color Estándar requiere mínimo 72 páginas',
      };
    }
  }

  // Select the appropriate tier list based on marketplace
  const tierList = marketplaceTiers[marketplace || 'ES'];

  // Find the appropriate tier
  const applicableTiers = tierList.filter(
    (tier) => tier.interior === interior && tier.size === size
  );

  // Sort by threshold and find the first tier where pages <= threshold
  applicableTiers.sort((a, b) => a.pageThreshold - b.pageThreshold);
  
  const tier = applicableTiers.find((t) => pages <= t.pageThreshold);

  if (!tier || (tier.fixedCost === 0 && tier.perPageCost === 0)) {
    return { fixedCost: 0, perPageCost: 0, totalCost: 0, isValid: false };
  }

  // Calculate total cost: (pages × perPageCost) + fixedCost
  const totalCost = (pages * tier.perPageCost) + tier.fixedCost;

  return {
    fixedCost: tier.fixedCost,
    perPageCost: tier.perPageCost,
    totalCost,
    isValid: true,
  };
};

/**
 * Get the minimum pages allowed for a given interior type
 */
export const getMinPages = (interior: InteriorType | null): number => {
  if (interior === 'COLOR_STANDARD') return 72;
  return 24; // Default minimum for B/N and Color Premium
};

/**
 * Get descriptive info about printing costs for display
 */
export const getPrintingCostInfo = (
  interior: InteriorType,
  size: BookSize,
  pages: number,
  marketplace?: Marketplace | null
): { tier: string; fixedCost: number; perPageCost: number } => {
  const result = calculatePrintingCost(interior, size, pages, marketplace);
  
  let tierDescription = '';
  if (interior === 'BN') {
    tierDescription = pages <= 108 ? '24-108 pág' : '110-828 pág';
  } else if (interior === 'COLOR_PREMIUM') {
    tierDescription = pages <= 40 ? '24-40 pág' : '42-828 pág';
  } else {
    tierDescription = '72-600 pág';
  }

  return {
    tier: tierDescription,
    fixedCost: result.fixedCost,
    perPageCost: result.perPageCost,
  };
};

// ============================================
// TABLA RESUMEN DE PRECIOS OFICIALES
// ============================================

export interface PricingTableRow {
  marketplace: string;
  currency: string;
  // B/N
  bnSmallFixed24_108: number;
  bnSmallFixed110_828: number;
  bnSmallPerPage: number;
  bnLargeFixed24_108: number;
  bnLargeFixed110_828: number;
  bnLargePerPage: number;
  // Color Premium
  cpSmallFixed24_40: number;
  cpSmallFixed42_828: number;
  cpSmallPerPage: number;
  cpLargeFixed24_40: number;
  cpLargeFixed42_828: number;
  cpLargePerPage: number;
  // Color Estándar
  csSmallFixed: number;
  csSmallPerPage: number;
  csLargeFixed: number;
  csLargePerPage: number;
  csAvailable: boolean;
}

export const PRICING_TABLE: PricingTableRow[] = [
  {
    marketplace: 'Amazon.de/es/fr/it (EU)',
    currency: 'EUR',
    bnSmallFixed24_108: 2.05, bnSmallFixed110_828: 0.75, bnSmallPerPage: 0.012,
    bnLargeFixed24_108: 2.48, bnLargeFixed110_828: 0.75, bnLargePerPage: 0.016,
    cpSmallFixed24_40: 2.85, cpSmallFixed42_828: 0.75, cpSmallPerPage: 0.0525,
    cpLargeFixed24_40: 3.61, cpLargeFixed42_828: 0.75, cpLargePerPage: 0.0715,
    csSmallFixed: 0.75, csSmallPerPage: 0.024,
    csLargeFixed: 0.75, csLargePerPage: 0.035,
    csAvailable: true,
  },
  {
    marketplace: 'Amazon.com (USA)',
    currency: 'USD',
    bnSmallFixed24_108: 2.30, bnSmallFixed110_828: 1.00, bnSmallPerPage: 0.012,
    bnLargeFixed24_108: 2.84, bnLargeFixed110_828: 1.00, bnLargePerPage: 0.017,
    cpSmallFixed24_40: 3.60, cpSmallFixed42_828: 1.00, cpSmallPerPage: 0.065,
    cpLargeFixed24_40: 4.20, cpLargeFixed42_828: 1.00, cpLargePerPage: 0.080,
    csSmallFixed: 1.00, csSmallPerPage: 0.0255,
    csLargeFixed: 1.00, csLargePerPage: 0.0402,
    csAvailable: true,
  },
  {
    marketplace: 'Amazon.co.uk (UK)',
    currency: 'GBP',
    bnSmallFixed24_108: 1.93, bnSmallFixed110_828: 0.85, bnSmallPerPage: 0.010,
    bnLargeFixed24_108: 2.15, bnLargeFixed110_828: 0.85, bnLargePerPage: 0.012,
    cpSmallFixed24_40: 2.59, cpSmallFixed42_828: 0.85, cpSmallPerPage: 0.0435,
    cpLargeFixed24_40: 3.24, cpLargeFixed42_828: 0.85, cpLargePerPage: 0.0598,
    csSmallFixed: 0.85, csSmallPerPage: 0.020,
    csLargeFixed: 0.85, csLargePerPage: 0.027,
    csAvailable: true,
  },
  {
    marketplace: 'Amazon.ca (Canadá)',
    currency: 'CAD',
    bnSmallFixed24_108: 2.99, bnSmallFixed110_828: 1.26, bnSmallPerPage: 0.016,
    bnLargeFixed24_108: 3.53, bnLargeFixed110_828: 1.26, bnLargePerPage: 0.021,
    cpSmallFixed24_40: 4.66, cpSmallFixed42_828: 1.26, cpSmallPerPage: 0.085,
    cpLargeFixed24_40: 5.26, cpLargeFixed42_828: 1.26, cpLargePerPage: 0.10,
    csSmallFixed: 1.26, csSmallPerPage: 0.037,
    csLargeFixed: 1.26, csLargePerPage: 0.052,
    csAvailable: true,
  },
  {
    marketplace: 'Amazon.com.au (Australia)',
    currency: 'AUD',
    bnSmallFixed24_108: 4.74, bnSmallFixed110_828: 2.42, bnSmallPerPage: 0.022,
    bnLargeFixed24_108: 5.28, bnLargeFixed110_828: 2.42, bnLargePerPage: 0.027,
    cpSmallFixed24_40: 5.82, cpSmallFixed42_828: 2.42, cpSmallPerPage: 0.085,
    cpLargeFixed24_40: 6.42, cpLargeFixed42_828: 2.42, cpLargePerPage: 0.100,
    csSmallFixed: 0, csSmallPerPage: 0,
    csLargeFixed: 0, csLargePerPage: 0,
    csAvailable: false,
  },
  {
    marketplace: 'Amazon.co.jp (Japón)',
    currency: 'JPY',
    bnSmallFixed24_108: 422, bnSmallFixed110_828: 206, bnSmallPerPage: 2,
    bnLargeFixed24_108: 530, bnLargeFixed110_828: 206, bnLargePerPage: 3,
    cpSmallFixed24_40: 475, cpSmallFixed42_828: 206, cpSmallPerPage: 4,
    cpLargeFixed24_40: 475, cpLargeFixed42_828: 206, cpLargePerPage: 5,
    csSmallFixed: 0, csSmallPerPage: 0,
    csLargeFixed: 0, csLargePerPage: 0,
    csAvailable: false,
  },
];
