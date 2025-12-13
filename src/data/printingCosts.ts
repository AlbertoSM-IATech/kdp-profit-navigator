import { InteriorType, BookSize } from '@/types/kdp';

export interface PrintingCostTier {
  interior: InteriorType;
  size: BookSize;
  pageThreshold: number; // Pages <= threshold use this tier
  fixedCost: number;
  perPageCost: number;
}

// Printing cost tiers based on the exact Excel model
export const printingCostTiers: PrintingCostTier[] = [
  // B/N (Blanco y Negro) - Pequeño
  { interior: 'BN', size: 'SMALL', pageThreshold: 108, fixedCost: 2.05, perPageCost: 0 },
  { interior: 'BN', size: 'SMALL', pageThreshold: Infinity, fixedCost: 0.75, perPageCost: 0.012 },
  
  // B/N (Blanco y Negro) - Grande
  { interior: 'BN', size: 'LARGE', pageThreshold: 108, fixedCost: 2.48, perPageCost: 0 },
  { interior: 'BN', size: 'LARGE', pageThreshold: Infinity, fixedCost: 0.75, perPageCost: 0.016 },
  
  // Color Premium - Pequeño
  { interior: 'COLOR_PREMIUM', size: 'SMALL', pageThreshold: 40, fixedCost: 3.03, perPageCost: 0 },
  { interior: 'COLOR_PREMIUM', size: 'SMALL', pageThreshold: Infinity, fixedCost: 0.75, perPageCost: 0.053 },
  
  // Color Premium - Grande
  { interior: 'COLOR_PREMIUM', size: 'LARGE', pageThreshold: 40, fixedCost: 3.63, perPageCost: 0 },
  { interior: 'COLOR_PREMIUM', size: 'LARGE', pageThreshold: Infinity, fixedCost: 0.75, perPageCost: 0.072 },
  
  // Color Estándar - Pequeño (only >72 pages)
  { interior: 'COLOR_STANDARD', size: 'SMALL', pageThreshold: 72, fixedCost: 0, perPageCost: 0 }, // Not valid
  { interior: 'COLOR_STANDARD', size: 'SMALL', pageThreshold: Infinity, fixedCost: 0.75, perPageCost: 0.024 },
  
  // Color Estándar - Grande (only >72 pages)
  { interior: 'COLOR_STANDARD', size: 'LARGE', pageThreshold: 72, fixedCost: 0, perPageCost: 0 }, // Not valid
  { interior: 'COLOR_STANDARD', size: 'LARGE', pageThreshold: Infinity, fixedCost: 0.75, perPageCost: 0.035 },
];

export interface PrintingCostResult {
  fixedCost: number;
  perPageCost: number;
  totalCost: number;
  isValid: boolean;
  errorMessage?: string;
}

/**
 * Calculate printing costs based on interior type, size, and number of pages
 * Following the exact Excel model provided
 */
export const calculatePrintingCost = (
  interior: InteriorType | null,
  size: BookSize | null,
  pages: number | null
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

  // Find the appropriate tier
  const applicableTiers = printingCostTiers.filter(
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
