
'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface MainSidebarControlContextType {
  isMainSidebarMinimized: boolean;
  setMinimizeMainSidebar: (minimize: boolean) => void;
}

const MainSidebarControlContext = createContext<MainSidebarControlContextType | undefined>(undefined);

export function MainSidebarControlProvider({ children }: { children: React.ReactNode }) {
  const [isMainSidebarMinimized, setIsMainSidebarMinimized] = useState(false);

  const setMinimizeMainSidebar = useCallback((minimize: boolean) => {
    setIsMainSidebarMinimized(minimize);
  }, []);

  return (
    <MainSidebarControlContext.Provider value={{ isMainSidebarMinimized, setMinimizeMainSidebar }}>
      {children}
    </MainSidebarControlContext.Provider>
  );
}

export function useMainSidebarControl() {
  const context = useContext(MainSidebarControlContext);
  if (context === undefined) {
    throw new Error('useMainSidebarControl must be used within a MainSidebarControlProvider');
  }
  return context;
}
