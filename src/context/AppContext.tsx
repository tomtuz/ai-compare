import React, { createContext, useContext, useEffect, useState } from "react";

interface AppContextType {
  apiCallCount?: number;
  incrementApiCallCount?: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [apiCallCount, setApiCallCount] = useState(0);

  useEffect(() => {
    const storedCount = localStorage.getItem("apiCallCount");
    if (storedCount) {
      setApiCallCount(Number.parseInt(storedCount, 10));
    }
  }, []);

  const incrementApiCallCount = () => {
    setApiCallCount((prevCount) => {
      const newCount = prevCount + 1;
      localStorage.setItem("apiCallCount", newCount.toString());
      return newCount;
    });
  };

  return (
    <AppContext.Provider value={{ apiCallCount, incrementApiCallCount }}>
      {children}
    </AppContext.Provider>
  );
}

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};
