import { useState, useEffect } from "react";

export const useBattery = (onBatteryChange?: (level: number) => void) => {
  const [battery, setBattery] = useState<number>(100);

  useEffect(() => {
    let navBattery: any = null;

    const updateBattery = () => {
      const level = navBattery.level * 100;
      setBattery(level);
      if (onBatteryChange) onBatteryChange(level);
    };

    const initBattery = async () => {
      if ("getBattery" in navigator) {
        navBattery = await (navigator as any).getBattery();
        updateBattery();
        navBattery.addEventListener("levelchange", updateBattery);
      }
    };

    initBattery();

    return () => {
      if (navBattery) {
        navBattery.removeEventListener("levelchange", updateBattery);
      }
    };
  }, []);

  return battery;
};
