/**
 * App Context - Global application state management
 */

import { createContext, useContext, useState, ReactNode } from 'react';

interface AppContextType {
  isOnline: boolean;
  setIsOnline: (online: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  return (
    <AppContext.Provider value={{ isOnline, setIsOnline }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
