import { createContext, useContext, ReactNode } from 'react';
import { useHelpCenter } from '@/hooks/useHelpCenter';
import { HelpCenter } from '@/components/help/HelpCenter';

interface HelpCenterContextType {
  openHelp: (tab?: string) => void;
  closeHelp: () => void;
  isOpen: boolean;
}

const HelpCenterContext = createContext<HelpCenterContextType | undefined>(undefined);

interface HelpCenterProviderProps {
  children: ReactNode;
}

export const HelpCenterProvider = ({ children }: HelpCenterProviderProps) => {
  const { isOpen, openHelp, closeHelp, currentTab } = useHelpCenter();

  return (
    <HelpCenterContext.Provider value={{ openHelp, closeHelp, isOpen }}>
      {children}
      <HelpCenter 
        open={isOpen} 
        onOpenChange={closeHelp}
        initialTab={currentTab}
      />
    </HelpCenterContext.Provider>
  );
};

export const useHelpCenterContext = () => {
  const context = useContext(HelpCenterContext);
  if (!context) {
    throw new Error('useHelpCenterContext must be used within a HelpCenterProvider');
  }
  return context;
};