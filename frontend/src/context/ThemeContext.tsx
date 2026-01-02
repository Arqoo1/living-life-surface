import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

const UIContext = createContext<any>(null);

export const UIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [worker, setWorker] = useState<Worker | null>(null);

useEffect(() => {
  const ruleWorker = new Worker(
    new URL("../workers/ruleWorker.ts", import.meta.url),
    { type: "module" } 
  );
  
  ruleWorker.onmessage = (e) => {
    const styles = e.data;
    Object.entries(styles).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value as string);
    });
  };

  setWorker(ruleWorker);
  return () => ruleWorker.terminate();
}, []);

  const executeRules = useCallback((rules: any[], contextOverride?: any) => {
    if (worker) {
      const now = new Date();
      worker.postMessage({
        rules,
        context: contextOverride || { 
          hour: now.getHours(), 
          minute: now.getMinutes(),
          lastMoment: null 
        }
      });
    }
  }, [worker]);

  return (
    <UIContext.Provider value={{ executeRules }}>
      {children}
    </UIContext.Provider>
  );
};

export const useUI = () => useContext(UIContext);