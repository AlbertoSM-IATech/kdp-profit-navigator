import { useState, useCallback } from 'react';
import { SavedNiche, GlobalData, EbookData, PaperbackData, EbookResults, PaperbackResults, ScoreBreakdown, SimulatorData } from '@/types/kdp';
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

// Create default score breakdown
const createDefaultScoreBreakdown = (): ScoreBreakdown => ({
  clicsScore: 0,
  bacosScore: 0,
  pvpVsMinScore: 0,
  totalScore: 0,
  clicsCapped: false,
  status: 'not-recommended' as const,
  statusLabel: 'Sin datos',
  statusEmoji: '⚪',
  statusColor: '#9CA3AF',
});

export interface UseNicheComparatorReturn {
  niches: SavedNiche[];
  saveCurrentAsNiche: (
    name: string,
    globalData: GlobalData,
    ebookData: EbookData | null,
    paperbackData: PaperbackData | null,
    ebookResults: EbookResults | null,
    paperbackResults: PaperbackResults | null,
    inversionDiaria: number,
    simulatorData?: SimulatorData
  ) => SavedNiche;
  deleteNiche: (id: string) => void;
  updateNiche: (id: string, name: string) => void;
  updateSavedNiche: (
    id: string,
    globalData: GlobalData,
    ebookData: EbookData | null,
    paperbackData: PaperbackData | null,
    ebookResults: EbookResults | null,
    paperbackResults: PaperbackResults | null,
    inversionDiaria: number,
    simulatorData?: SimulatorData
  ) => SavedNiche | null;
  loadNicheData: (id: string) => SavedNiche | null;
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
    inversionDiaria: number,
    simulatorData?: SimulatorData
  ): SavedNiche => {
    const isEbook = globalData.selectedFormat === 'EBOOK';
    const activeResults = isEbook ? ebookResults : paperbackResults;
    const pvp = isEbook ? ebookData?.pvp : paperbackData?.pvp;
    const precioMinRecomendado = activeResults?.precioMinObjetivo || null;

    const scoreBreakdown = calculateScore({
      activeResults,
      pvp: pvp || null,
      precioMinRecomendado,
    }) || createDefaultScoreBreakdown();

    const now = new Date();
    
    const newNiche: SavedNiche = {
      id: generateId(),
      name,
      createdAt: now,
      updatedAt: now,
      globalData: { ...globalData },
      ebookData: ebookData ? { ...ebookData } : null,
      paperbackData: paperbackData ? { ...paperbackData } : null,
      clicsMaxPorVenta: activeResults?.clicsMaxPorVenta || 0,
      bacos: activeResults?.margenPct || 0,
      inversionDiaria,
      pvp: pvp || 0,
      precioMinRecomendado,
      regalias: activeResults?.regalias || 0,
      scoreBreakdown,
      simulatorData,
    };

    const updated = [...niches, newNiche];
    setNiches(updated);
    saveNichesToStorage(updated);
    return newNiche;
  }, [niches]);

  const updateSavedNiche = useCallback((
    id: string,
    globalData: GlobalData,
    ebookData: EbookData | null,
    paperbackData: PaperbackData | null,
    ebookResults: EbookResults | null,
    paperbackResults: PaperbackResults | null,
    inversionDiaria: number,
    simulatorData?: SimulatorData
  ): SavedNiche | null => {
    const nicheIndex = niches.findIndex(n => n.id === id);
    if (nicheIndex === -1) return null;

    const isEbook = globalData.selectedFormat === 'EBOOK';
    const activeResults = isEbook ? ebookResults : paperbackResults;
    const pvp = isEbook ? ebookData?.pvp : paperbackData?.pvp;
    const precioMinRecomendado = activeResults?.precioMinObjetivo || null;

    const scoreBreakdown = calculateScore({
      activeResults,
      pvp: pvp || null,
      precioMinRecomendado,
    }) || createDefaultScoreBreakdown();

    const now = new Date();
    
    const existingNiche = niches[nicheIndex];
    const updatedNiche: SavedNiche = {
      ...existingNiche,
      updatedAt: now,
      globalData: { ...globalData },
      ebookData: ebookData ? { ...ebookData } : null,
      paperbackData: paperbackData ? { ...paperbackData } : null,
      clicsMaxPorVenta: activeResults?.clicsMaxPorVenta || 0,
      bacos: activeResults?.margenPct || 0,
      inversionDiaria,
      pvp: pvp || 0,
      precioMinRecomendado,
      regalias: activeResults?.regalias || 0,
      scoreBreakdown,
      simulatorData,
    };

    const updated = [...niches];
    updated[nicheIndex] = updatedNiche;
    setNiches(updated);
    saveNichesToStorage(updated);
    return updatedNiche;
  }, [niches]);

  const loadNicheData = useCallback((id: string): SavedNiche | null => {
    return niches.find(n => n.id === id) || null;
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
    updateSavedNiche,
    loadNicheData,
    clearAllNiches,
    getBestNiche,
  };
};
