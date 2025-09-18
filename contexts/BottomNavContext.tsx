import React from 'react';

export type BottomNavKey = 'boom' | 'shop' | 'add' | 'messages' | 'profile';

type BottomNavContextValue = {
  selected: BottomNavKey;
  setSelected: (key: BottomNavKey) => void;
};

const BottomNavContext = React.createContext<BottomNavContextValue | undefined>(undefined);

export const BottomNavProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selected, setSelected] = React.useState<BottomNavKey>('boom');

  const value = React.useMemo(() => ({ selected, setSelected }), [selected]);

  return (
    <BottomNavContext.Provider value={value}>{children}</BottomNavContext.Provider>
  );
};

export function useBottomNav() {
  const context = React.useContext(BottomNavContext);
  if (!context) {
    throw new Error('useBottomNav must be used within a BottomNavProvider');
  }
  return context;
}


