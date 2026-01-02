import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'publify_collapsed_sections';

export type SectionKey = 
  | 'globalData'
  | 'formatData'
  | 'score'
  | 'positioning'
  | 'results'
  | 'simulator'
  | 'comparator'
  | 'report';

interface CollapsedSections {
  [key: string]: boolean;
}

const loadCollapsedState = (): CollapsedSections => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

const saveCollapsedState = (state: CollapsedSections): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Error saving collapsed state:', e);
  }
};

export const useCollapsibleSections = () => {
  const [collapsed, setCollapsed] = useState<CollapsedSections>(() => loadCollapsedState());

  const isCollapsed = useCallback((key: SectionKey): boolean => {
    return collapsed[key] ?? false;
  }, [collapsed]);

  const toggleSection = useCallback((key: SectionKey) => {
    setCollapsed(prev => {
      const next = { ...prev, [key]: !prev[key] };
      saveCollapsedState(next);
      return next;
    });
  }, []);

  const setSection = useCallback((key: SectionKey, isCollapsed: boolean) => {
    setCollapsed(prev => {
      const next = { ...prev, [key]: isCollapsed };
      saveCollapsedState(next);
      return next;
    });
  }, []);

  const expandAll = useCallback(() => {
    const next: CollapsedSections = {};
    saveCollapsedState(next);
    setCollapsed(next);
  }, []);

  const collapseAll = useCallback(() => {
    const allSections: SectionKey[] = [
      'globalData', 'formatData', 'score', 'positioning', 
      'results', 'simulator', 'comparator', 'report'
    ];
    const next: CollapsedSections = {};
    allSections.forEach(key => { next[key] = true; });
    saveCollapsedState(next);
    setCollapsed(next);
  }, []);

  return {
    isCollapsed,
    toggleSection,
    setSection,
    expandAll,
    collapseAll,
  };
};
