import { useState, useCallback } from 'react';

interface UseHelpCenterReturn {
  isOpen: boolean;
  openHelp: (tab?: string) => void;
  closeHelp: () => void;
  currentTab: string;
}

export const useHelpCenter = (): UseHelpCenterReturn => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState('gettingStarted');

  const openHelp = useCallback((tab: string = 'gettingStarted') => {
    setCurrentTab(tab);
    setIsOpen(true);
  }, []);

  const closeHelp = useCallback(() => {
    setIsOpen(false);
  }, []);

  return {
    isOpen,
    openHelp,
    closeHelp,
    currentTab
  };
};