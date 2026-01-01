import { useState, useCallback } from 'react';
import { SavedNiche, GlobalData, EbookData, PaperbackData, EbookResults, PaperbackResults, ScoreBreakdown } from '@/types/kdp';
import { calculateScore } from './useScoring';

const STORAGE_KEY = 'publify_saved_niches';

// Generate a simple unique ID
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// Load niches from localStorage
const loadNiches = (): SavedNiche[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return parsed.map((n: any) => ({
      ...n,
      createdAt: new Date(n.createdAt),
      updatedAt: new Date(n.updatedAt),
    }));
  } catch {
    return [];
  }
};

// Save niches to localStorage
const saveNichesToStorage = (niches: SavedNiche[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(niches));
  } catch (e) {
    console.error('Error saving niches to localStorage:', e);
  }
};

export interface UseNicheComparatorReturn {
  niches: SavedNiche[];
  saveCurrentAsNiche: (
    name: string,
    globalData: GlobalData,
    ebookData: EbookData | null,
    paperbackData: PaperbackData | null,
    ebookResults: EbookResults | null,
    paperbackResults: PaperbackResults | null,
    inversionDiaria: number
  ) => SavedNiche;
  deleteNiche: (id: string) => void;
  updateNiche: (id: string, name: string) => void;
  clearAllNiches: () => void;
  getBestNiche: () => SavedNiche | null;
}

export const useNicheComparator = (): UseNicheComparatorReturn => {
  const [niches, setNiches] = useState<SavedNiche[]>(() => loadNiches());

  const saveCurrentAsNiche = useCallback((
    name: string,
    globalData: GlobalData,
    ebookData: EbookData | null,
    paperbackData: PaperbackData | null,
    ebookResults: EbookResults | null,
    paperbackResults: PaperbackResults | null,
    inversionDiaria: number
  ): SavedNiche => {
    const isEbook = globalData.selectedFormat === 'EBOOK';
    const activeResults = isEbook ? ebookResults : paperbackResults;
    const pvp = isEbook ? ebookData?.pvp : paperbackData?.pvp;
    const precioMinRecomendado = activeResults?.precioMinObjetivo || null;

    const scoreBreakdown = calculateScore({
      activeResults,
      inversionDiaria,
      pvp: pvp || null,
      precioMinRecomendado,
    }) || {
      clicsScore: 0,
      margenScore: 0,
      bacosScore: 0,
      inversionScore: 0,
      pvpVsMinScore: 0,
      totalScore: 0,
      status: 'not-recommended' as const,
      statusLabel: 'Sin datos',
      statusEmoji: '⚪',
      statusColor: '#9CA3AF',
    };

    const newNiche: SavedNiche = {
      id: generateId(),
      name,
      createdAt: new Date(),
      updatedAt: new Date(),
      globalData: { ...globalData },
      ebookData: ebookData ? { ...ebookData } : null,
      paperbackData: paperbackData ? { ...paperbackData } : null,
      clicsMaxPorVenta: activeResults?.clicsMaxPorVenta || 0,
      margenPct: activeResults?.margenPct || 0,
      bacos: activeResults?.margenPct || 0,
      inversionDiaria,
      pvp: pvp || 0,
      precioMinRecomendado,
      regalias: activeResults?.regalias || 0,
      scoreBreakdown,
    };

    const updated = [...niches, newNiche];
    setNiches(updated);
    saveNichesToStorage(updated);
    return newNiche;
  }, [niches]);

  const deleteNiche = useCallback((id: string) => {
    const updated = niches.filter(n => n.id !== id);
    setNiches(updated);
    saveNichesToStorage(updated);
  }, [niches]);

  const updateNiche = useCallback((id: string, name: string) => {
    const updated = niches.map(n => 
      n.id === id ? { ...n, name, updatedAt: new Date() } : n
    );
    setNiches(updated);
    saveNichesToStorage(updated);
  }, [niches]);

  const clearAllNiches = useCallback(() => {
    setNiches([]);
    saveNichesToStorage([]);
  }, []);

  const getBestNiche = useCallback((): SavedNiche | null => {
    if (niches.length === 0) return null;
    return niches.reduce((best, current) => 
      current.scoreBreakdown.totalScore > best.scoreBreakdown.totalScore ? current : best
    );
  }, [niches]);

  return {
    niches,
    saveCurrentAsNiche,
    deleteNiche,
    updateNiche,
    clearAllNiches,
    getBestNiche,
  };
};
