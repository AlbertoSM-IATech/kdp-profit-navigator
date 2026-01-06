import { InteriorType, BookSize, Marketplace } from '@/types/kdp';

export interface PrintingCostTier {
  interior: InteriorType;
  size: BookSize;
  pageThreshold: number; // Pages <= threshold use this tier
  fixedCost: number;
  perPageCost: number;
}

// Printing cost tiers for European marketplaces (EUR) - Amazon .es
// Fuente: Calculadora de nichos actualizada
export const printingCostTiersEU: PrintingCostTier[] = [
  // B/N (Blanco y Negro) - Pequeño
  // <6x9 y 24-108 pág: Fijo 2.05€, por página 0€
  { interior: 'BN', size: 'SMALL', pageThreshold: 108, fixedCost: 2.05, perPageCost: 0 },
  // <6x9 y >108 pág: Fijo 0.75€, por página 0.012€
  { interior: 'BN', size: 'SMALL', pageThreshold: Infinity, fixedCost: 0.75, perPageCost: 0.012 },
  
  // B/N (Blanco y Negro) - Grande
  // >6x9 y 24-108 pág: Fijo 2.48€, por página 0€
  { interior: 'BN', size: 'LARGE', pageThreshold: 108, fixedCost: 2.48, perPageCost: 0 },
  // >6x9 y >108 pág: Fijo 0.75€, por página 0.016€
  { interior: 'BN', size: 'LARGE', pageThreshold: Infinity, fixedCost: 0.75, perPageCost: 0.016 },
  
  // Color Premium - Pequeño
  // <6x9 y 24-40 pág: Fijo 3.03€, por página 0€
  { interior: 'COLOR_PREMIUM', size: 'SMALL', pageThreshold: 40, fixedCost: 3.03, perPageCost: 0 },
  // <6x9 y >40 pág: Fijo 0.75€, por página 0.053€
  { interior: 'COLOR_PREMIUM', size: 'SMALL', pageThreshold: Infinity, fixedCost: 0.75, perPageCost: 0.053 },
  
  // Color Premium - Grande
  // >6x9 y 24-40 pág: Fijo 3.63€, por página 0€
  { interior: 'COLOR_PREMIUM', size: 'LARGE', pageThreshold: 40, fixedCost: 3.63, perPageCost: 0 },
  // >6x9 y >40 pág: Fijo 0.75€, por página 0.072€
  { interior: 'COLOR_PREMIUM', size: 'LARGE', pageThreshold: Infinity, fixedCost: 0.75, perPageCost: 0.072 },
  
  // Color Estándar - Pequeño (only >72 pages)
  // <6x9 y >72 pág: Fijo 0.75€, por página 0.024€
  { interior: 'COLOR_STANDARD', size: 'SMALL', pageThreshold: 72, fixedCost: 0, perPageCost: 0 }, // Not valid
  { interior: 'COLOR_STANDARD', size: 'SMALL', pageThreshold: Infinity, fixedCost: 0.75, perPageCost: 0.024 },
  
  // Color Estándar - Grande (only >72 pages)
  // >6x9 y >72 pág: Fijo 0.75€, por página 0.035€
  { interior: 'COLOR_STANDARD', size: 'LARGE', pageThreshold: 72, fixedCost: 0, perPageCost: 0 }, // Not valid
  { interior: 'COLOR_STANDARD', size: 'LARGE', pageThreshold: Infinity, fixedCost: 0.75, perPageCost: 0.035 },
];

// Printing cost tiers for US marketplace (USD) - Amazon .com
// Fuente: Calculadora de nichos actualizada
export const printingCostTiersUS: PrintingCostTier[] = [
  // B/N (Black & White) - Small
  // <6x9 y 24-108 pág: Fijo $2.30, por página $0.000
  { interior: 'BN', size: 'SMALL', pageThreshold: 108, fixedCost: 2.30, perPageCost: 0 },
  // <6x9 y >108 pág: Fijo $1.00, por página $0.012
  { interior: 'BN', size: 'SMALL', pageThreshold: Infinity, fixedCost: 1.00, perPageCost: 0.012 },
  
  // B/N (Black & White) - Large
  // >6x9 y 24-108 pág: Fijo $2.84, por página $0.000
  { interior: 'BN', size: 'LARGE', pageThreshold: 108, fixedCost: 2.84, perPageCost: 0 },
  // >6x9 y >108 pág: Fijo $1.00, por página $0.017
  { interior: 'BN', size: 'LARGE', pageThreshold: Infinity, fixedCost: 1.00, perPageCost: 0.017 },
  
  // Color Premium - Small
  // <6x9 y 24-40 pág: Fijo $3.60, por página $0.000
  { interior: 'COLOR_PREMIUM', size: 'SMALL', pageThreshold: 40, fixedCost: 3.60, perPageCost: 0 },
  // <6x9 y >40 pág: Fijo $1.00, por página $0.065
  { interior: 'COLOR_PREMIUM', size: 'SMALL', pageThreshold: Infinity, fixedCost: 1.00, perPageCost: 0.065 },
  
  // Color Premium - Large
  // >6x9 y 24-40 pág: Fijo $4.20, por página $0.000
  { interior: 'COLOR_PREMIUM', size: 'LARGE', pageThreshold: 40, fixedCost: 4.20, perPageCost: 0 },
  // >6x9 y >40 pág: Fijo $1.00, por página $0.080
  { interior: 'COLOR_PREMIUM', size: 'LARGE', pageThreshold: Infinity, fixedCost: 1.00, perPageCost: 0.080 },
  
  // Color Standard - Small (only >72 pages)
  // <6x9 y >72 pág: Fijo $1.00, por página $0.026
  { interior: 'COLOR_STANDARD', size: 'SMALL', pageThreshold: 72, fixedCost: 0, perPageCost: 0 }, // Not valid
  { interior: 'COLOR_STANDARD', size: 'SMALL', pageThreshold: Infinity, fixedCost: 1.00, perPageCost: 0.026 },
  
  // Color Standard - Large (only >72 pages)
  // >6x9 y >72 pág: Fijo $1.00, por página $0.040
  { interior: 'COLOR_STANDARD', size: 'LARGE', pageThreshold: 72, fixedCost: 0, perPageCost: 0 }, // Not valid
  { interior: 'COLOR_STANDARD', size: 'LARGE', pageThreshold: Infinity, fixedCost: 1.00, perPageCost: 0.040 },
];

// Keep legacy export for backward compatibility
export const printingCostTiers = printingCostTiersEU;

export interface PrintingCostResult {
  fixedCost: number;
  perPageCost: number;
  totalCost: number;
  isValid: boolean;
  errorMessage?: string;
}

/**
 * Calculate printing costs based on interior type, size, number of pages, and marketplace
 * Uses US-specific costs for COM marketplace, EU costs for others
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

  // For Color Estándar, minimum is 73 pages
  if (interior === 'COLOR_STANDARD' && pages <= 72) {
    return {
      fixedCost: 0,
      perPageCost: 0,
      totalCost: 0,
      isValid: false,
      errorMessage: 'Color Estándar requiere más de 72 páginas',
    };
  }

  // Select the appropriate tier list based on marketplace
  const tierList = marketplace === 'COM' ? printingCostTiersUS : printingCostTiersEU;

  // Find the appropriate tier
  const applicableTiers = tierList.filter(
    (tier) => tier.interior === interior && tier.size === size
  );

  // Sort by threshold and find the first tier where pages <= threshold
  applicableTiers.sort((a, b) => a.pageThreshold - b.pageThreshold);
  
  const tier = applicableTiers.find((t) => pages <= t.pageThreshold);

  if (!tier) {
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
  if (interior === 'COLOR_STANDARD') return 73;
  return 24; // Default minimum for B/N and Color Premium
};

/**
 * Get descriptive info about printing costs for display
 */
export const getPrintingCostInfo = (
  interior: InteriorType,
  size: BookSize,
  pages: number
): { tier: string; fixedCost: number; perPageCost: number } => {
  const result = calculatePrintingCost(interior, size, pages);
  
  let tierDescription = '';
  if (interior === 'BN') {
    tierDescription = pages <= 108 ? '≤108 páginas' : '>108 páginas';
  } else if (interior === 'COLOR_PREMIUM') {
    tierDescription = pages <= 40 ? '≤40 páginas' : '>40 páginas';
  } else {
    tierDescription = '>72 páginas';
  }

  return {
    tier: tierDescription,
    fixedCost: result.fixedCost,
    perPageCost: result.perPageCost,
  };
};
