import { useState, useCallback } from 'react';
import { SavedNiche, NicheVersion, GlobalData, EbookData, PaperbackData, EbookResults, PaperbackResults, ScoreBreakdown } from '@/types/kdp';
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
      versions: (n.versions || []).map((v: any) => ({
        ...v,
        createdAt: new Date(v.createdAt),
      })),
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
    inversionDiaria: number
  ) => SavedNiche;
  deleteNiche: (id: string) => void;
  updateNiche: (id: string, name: string) => void;
  updateNicheWithNewVersion: (
    id: string,
    globalData: GlobalData,
    ebookData: EbookData | null,
    paperbackData: PaperbackData | null,
    ebookResults: EbookResults | null,
    paperbackResults: PaperbackResults | null,
    inversionDiaria: number,
    note?: string
  ) => SavedNiche | null;
  loadNicheData: (id: string) => SavedNiche | null;
  restoreVersion: (nicheId: string, versionId: string) => SavedNiche | null;
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
      pvp: pvp || null,
      precioMinRecomendado,
    }) || createDefaultScoreBreakdown();

    const now = new Date();
    
    // Create initial version
    const initialVersion: NicheVersion = {
      id: generateId(),
      createdAt: now,
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
    };

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
      versions: [initialVersion],
    };

    const updated = [...niches, newNiche];
    setNiches(updated);
    saveNichesToStorage(updated);
    return newNiche;
  }, [niches]);

  const updateNicheWithNewVersion = useCallback((
    id: string,
    globalData: GlobalData,
    ebookData: EbookData | null,
    paperbackData: PaperbackData | null,
    ebookResults: EbookResults | null,
    paperbackResults: PaperbackResults | null,
    inversionDiaria: number,
    note?: string
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
    
    // Create new version
    const newVersion: NicheVersion = {
      id: generateId(),
      createdAt: now,
      note,
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
    };

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
      versions: [...(existingNiche.versions || []), newVersion],
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

  const restoreVersion = useCallback((nicheId: string, versionId: string): SavedNiche | null => {
    const nicheIndex = niches.findIndex(n => n.id === nicheId);
    if (nicheIndex === -1) return null;

    const niche = niches[nicheIndex];
    const version = niche.versions?.find(v => v.id === versionId);
    if (!version) return null;

    const now = new Date();
    
    // Create a new version from the restored one
    const restoredVersion: NicheVersion = {
      id: generateId(),
      createdAt: now,
      note: `Restaurado desde versión del ${version.createdAt.toLocaleDateString('es-ES')}`,
      globalData: { ...version.globalData },
      ebookData: version.ebookData ? { ...version.ebookData } : null,
      paperbackData: version.paperbackData ? { ...version.paperbackData } : null,
      clicsMaxPorVenta: version.clicsMaxPorVenta,
      bacos: version.bacos,
      inversionDiaria: version.inversionDiaria,
      pvp: version.pvp,
      precioMinRecomendado: version.precioMinRecomendado,
      regalias: version.regalias,
      scoreBreakdown: version.scoreBreakdown,
    };

    const updatedNiche: SavedNiche = {
      ...niche,
      updatedAt: now,
      globalData: { ...version.globalData },
      ebookData: version.ebookData ? { ...version.ebookData } : null,
      paperbackData: version.paperbackData ? { ...version.paperbackData } : null,
      clicsMaxPorVenta: version.clicsMaxPorVenta,
      bacos: version.bacos,
      inversionDiaria: version.inversionDiaria,
      pvp: version.pvp,
      precioMinRecomendado: version.precioMinRecomendado,
      regalias: version.regalias,
      scoreBreakdown: version.scoreBreakdown,
      versions: [...(niche.versions || []), restoredVersion],
    };

    const updated = [...niches];
    updated[nicheIndex] = updatedNiche;
    setNiches(updated);
    saveNichesToStorage(updated);
    return updatedNiche;
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
    updateNicheWithNewVersion,
    loadNicheData,
    restoreVersion,
    clearAllNiches,
    getBestNiche,
  };
};
