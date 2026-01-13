import { useState, useCallback } from "react";

export const useNotifications = () => {
  const [engineNotification, setEngineNotification] = useState<string | null>(
    null
  );

  const showEngineAlert = useCallback((msg: string) => {
    setEngineNotification(msg);
    setTimeout(() => {
      setEngineNotification((current) => (current === msg ? null : current));
    }, 3000);
  }, []);

  return { engineNotification, showEngineAlert };
};
